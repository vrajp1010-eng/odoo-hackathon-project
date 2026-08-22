from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Trip, Stop
from ..schemas import BudgetResponse

router = APIRouter(prefix="/trips/{trip_id}/budget", tags=["budget"])


@router.get("/", response_model=BudgetResponse)
def get_budget(trip_id: int, session: Session = Depends(get_session)):
    """Backend is the source of truth for all budget math — sums costs across activities."""
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    stops = session.exec(select(Stop).where(Stop.trip_id == trip_id)).all()

    total_cost = 0.0
    by_category: dict = defaultdict(float)
    by_stop: dict = defaultdict(float)
    by_activity = []

    for stop in stops:
        for activity in stop.activities:
            total_cost += activity.cost
            by_category[activity.category] += activity.cost
            by_stop[stop.city_name] += activity.cost
            by_activity.append({
                "id": activity.id,
                "name": activity.name,
                "category": activity.category,
                "cost": activity.cost,
                "city_name": stop.city_name,
            })

    return BudgetResponse(
        total_cost=total_cost,
        by_category=dict(by_category),
        by_stop=dict(by_stop),
        by_activity=by_activity,
    )
