from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session, joinedload
from typing import Optional
import datetime

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/trips", tags=["budget"])

def _resolve_user(authorization: Optional[str], db: Session) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    return get_current_user(token, db)

def _calculate_budget(trip: models.Trip) -> dict:
    # 1. Activities Cost
    total_activities_cost = 0.0
    cost_per_city = []
    
    # 2. Accommodation & Trips
    estimated_accommodation = 0.0
    stops_count = len(trip.stops)
    estimated_transport = max(0, (stops_count - 1) * 60.0)
    
    trip_duration_days = 0
    if trip.start_date and trip.end_date:
        trip_duration_days = (trip.end_date - trip.start_date).days + 1
    elif stops_count > 0:
        trip_duration_days = sum(
            ((s.departure_date - s.arrival_date).days if s.departure_date and s.arrival_date else 1)
            for s in trip.stops
        )
    if trip_duration_days <= 0:
        trip_duration_days = 1

    estimated_meals = trip_duration_days * 45.0

    for stop in trip.stops:
        city = stop.city
        city_activities_cost = sum(ta.activity.cost for ta in stop.trip_activities if ta.activity)
        total_activities_cost += city_activities_cost
        
        nights = 1
        if stop.arrival_date and stop.departure_date:
            nights = max(1, (stop.departure_date - stop.arrival_date).days)
        
        city_acc_cost = nights * 80.0 * (city.cost_index / 100.0)
        estimated_accommodation += city_acc_cost
        
        cost_per_city.append({
            "city_name": city.name,
            "activities_cost": city_activities_cost,
            "accommodation_cost": city_acc_cost
        })

    total_cost = total_activities_cost + estimated_accommodation + estimated_transport + estimated_meals
    cost_per_day = total_cost / trip_duration_days if trip_duration_days > 0 else total_cost

    category_breakdown = [
        {"category": "Activities", "amount": total_activities_cost},
        {"category": "Accommodation", "amount": estimated_accommodation},
        {"category": "Transport", "amount": estimated_transport},
        {"category": "Meals", "amount": estimated_meals},
    ]

    return {
        "total_activities_cost": total_activities_cost,
        "estimated_accommodation": estimated_accommodation,
        "estimated_transport": estimated_transport,
        "estimated_meals": estimated_meals,
        "total_cost": total_cost,
        "cost_per_day": cost_per_day,
        "cost_per_city": cost_per_city,
        "category_breakdown": category_breakdown
    }


@router.get("/share/{slug}/budget", response_model=schemas.BudgetOut)
def get_public_trip_budget(slug: str, db: Session = Depends(get_db)):
    trip = (
        db.query(models.Trip)
        .options(
            joinedload(models.Trip.stops).joinedload(models.TripStop.city),
            joinedload(models.Trip.stops)
            .joinedload(models.TripStop.trip_activities)
            .joinedload(models.TripActivity.activity),
        )
        .filter(models.Trip.share_slug == slug, models.Trip.is_public == True)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or not public")
    return _calculate_budget(trip)


@router.get("/{trip_id}/budget", response_model=schemas.BudgetOut)
def get_trip_budget(
    trip_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    trip = (
        db.query(models.Trip)
        .options(
            joinedload(models.Trip.stops).joinedload(models.TripStop.city),
            joinedload(models.Trip.stops)
            .joinedload(models.TripStop.trip_activities)
            .joinedload(models.TripActivity.activity),
        )
        .filter(models.Trip.id == trip_id)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not trip.is_public:
        user = _resolve_user(authorization, db)
        if trip.user_id != user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return _calculate_budget(trip)
