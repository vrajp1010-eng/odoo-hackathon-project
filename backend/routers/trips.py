import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session, joinedload

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/trips", tags=["trips"])


def _resolve_user(authorization: Optional[str], db: Session) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    return get_current_user(token, db)


def _load_trip_full(trip_id: int, db: Session):
    return (
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


# ─── List my trips ────────────────────────────────────────────────────────────

@router.get("", response_model=List[schemas.TripSummary])
def list_my_trips(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trips = (
        db.query(models.Trip)
        .options(joinedload(models.Trip.stops).joinedload(models.TripStop.city))
        .filter(models.Trip.user_id == user.id)
        .order_by(models.Trip.created_at.desc())
        .all()
    )
    result = []
    for trip in trips:
        data = schemas.TripSummary.model_validate(trip).model_dump()
        data["stop_count"] = len(trip.stops)
        if trip.stops and trip.stops[0].city:
            data["first_city_image_url"] = trip.stops[0].city.image_url
        result.append(data)
    return result


# ─── Create trip ──────────────────────────────────────────────────────────────

@router.post("", response_model=schemas.TripOut, status_code=201)
def create_trip(
    payload: schemas.TripCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = models.Trip(
        **payload.model_dump(),
        user_id=user.id,
        share_slug=str(uuid.uuid4())[:8],
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


# ─── Public trip by slug — MUST be before /{trip_id} ─────────────────────────

@router.get("/share/{slug}", response_model=schemas.TripOut)
def get_public_trip(slug: str, db: Session = Depends(get_db)):
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
    return trip


@router.post("/share/{slug}/copy", response_model=schemas.TripOut)
def copy_public_trip(
    slug: str, 
    authorization: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    user = _resolve_user(authorization, db)
    
    # 1. Fetch original public trip
    original_trip = (
        db.query(models.Trip)
        .options(
            joinedload(models.Trip.stops).joinedload(models.TripStop.trip_activities)
        )
        .filter(models.Trip.share_slug == slug, models.Trip.is_public == True)
        .first()
    )
    if not original_trip:
        raise HTTPException(status_code=404, detail="Public trip not found")
        
    # 2. Create the new Trip
    new_trip = models.Trip(
        user_id=user.id,
        name=f"{original_trip.name} (Copy)",
        start_date=original_trip.start_date,
        end_date=original_trip.end_date,
        description=original_trip.description,
        cover_photo_url=original_trip.cover_photo_url,
        budget_limit=original_trip.budget_limit,
        is_public=False,
        share_slug=str(uuid.uuid4())[:8],
    )
    db.add(new_trip)
    db.flush() # get new_trip.id
    
    # 3. Clone stops and activities
    for original_stop in original_trip.stops:
        new_stop = models.TripStop(
            trip_id=new_trip.id,
            city_id=original_stop.city_id,
            arrival_date=original_stop.arrival_date,
            departure_date=original_stop.departure_date,
            order_index=original_stop.order_index,
        )
        db.add(new_stop)
        db.flush() # get new_stop.id
        
        for original_activity in original_stop.trip_activities:
            new_activity = models.TripActivity(
                trip_stop_id=new_stop.id,
                activity_id=original_activity.activity_id,
                scheduled_date=original_activity.scheduled_date,
                notes=original_activity.notes,
            )
            db.add(new_activity)
            
    db.commit()
    db.refresh(new_trip)
    
    # We must load the full relations to match the schema
    return _load_trip_full(new_trip.id, db)


# ─── Publish trip ─────────────────────────────────────────────────────────────

@router.put("/{trip_id}/publish", response_model=schemas.TripOut)
def publish_trip(
    trip_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.is_public = True
    db.commit()
    db.refresh(trip)
    return trip


# ─── Get single trip ──────────────────────────────────────────────────────────

@router.get("/{trip_id}", response_model=schemas.TripOut)
def get_trip(
    trip_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    trip = _load_trip_full(trip_id, db)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not trip.is_public:
        user = _resolve_user(authorization, db)
        if trip.user_id != user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    return trip


# ─── Update trip ──────────────────────────────────────────────────────────────

@router.put("/{trip_id}", response_model=schemas.TripOut)
def update_trip(
    trip_id: int,
    payload: schemas.TripUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip


# ─── Delete trip ──────────────────────────────────────────────────────────────

@router.delete("/{trip_id}", status_code=204)
def delete_trip(
    trip_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()


# ─── Add stop ─────────────────────────────────────────────────────────────────

@router.post("/{trip_id}/stops", response_model=schemas.TripStopOut, status_code=201)
def add_stop(
    trip_id: int,
    payload: schemas.TripStopCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    stop = models.TripStop(**payload.model_dump(), trip_id=trip_id)
    db.add(stop)
    db.commit()
    db.refresh(stop)
    # Return with city loaded
    return db.query(models.TripStop).options(
        joinedload(models.TripStop.city)
    ).filter(models.TripStop.id == stop.id).first()


# ─── Reorder stops — literal "reorder" must come before /{stop_id: int} ──────

@router.put("/{trip_id}/stops/reorder", status_code=200)
def reorder_stops(
    trip_id: int,
    payload: schemas.StopReorder,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Accepts an ordered list of stop IDs; updates each stop's order_index."""
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    for idx, stop_id in enumerate(payload.stop_ids):
        db.query(models.TripStop).filter(
            models.TripStop.id == stop_id,
            models.TripStop.trip_id == trip_id,
        ).update({"order_index": idx})
    db.commit()
    return {"ok": True}


# ─── Update stop (dates / order) ──────────────────────────────────────────────

@router.put("/{trip_id}/stops/{stop_id}", response_model=schemas.TripStopOut)
def update_stop(
    trip_id: int,
    stop_id: int,
    payload: schemas.TripStopUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    stop = db.query(models.TripStop).filter(
        models.TripStop.id == stop_id,
        models.TripStop.trip_id == trip_id,
    ).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(stop, field, value)
    db.commit()
    return db.query(models.TripStop).options(
        joinedload(models.TripStop.city),
        joinedload(models.TripStop.trip_activities).joinedload(models.TripActivity.activity),
    ).filter(models.TripStop.id == stop_id).first()


# ─── Delete stop ──────────────────────────────────────────────────────────────

@router.delete("/{trip_id}/stops/{stop_id}", status_code=204)
def delete_stop(
    trip_id: int,
    stop_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    stop = db.query(models.TripStop).filter(
        models.TripStop.id == stop_id,
        models.TripStop.trip_id == trip_id,
    ).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    db.delete(stop)
    db.commit()


# ─── Add activity to stop ─────────────────────────────────────────────────────

@router.post("/{trip_id}/stops/{stop_id}/activities",
             response_model=schemas.TripActivityOut, status_code=201)
def add_activity_to_stop(
    trip_id: int,
    stop_id: int,
    payload: schemas.TripActivityCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    stop = db.query(models.TripStop).filter(
        models.TripStop.id == stop_id, models.TripStop.trip_id == trip_id
    ).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    ta = models.TripActivity(**payload.model_dump(), trip_stop_id=stop_id)
    db.add(ta)
    db.commit()
    db.refresh(ta)
    return db.query(models.TripActivity).options(
        joinedload(models.TripActivity.activity)
    ).filter(models.TripActivity.id == ta.id).first()


# ─── Delete activity from stop ────────────────────────────────────────────────

@router.delete("/{trip_id}/stops/{stop_id}/activities/{activity_id}", status_code=204)
def delete_trip_activity(
    trip_id: int,
    stop_id: int,
    activity_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(authorization, db)
    trip = db.query(models.Trip).filter(
        models.Trip.id == trip_id, models.Trip.user_id == user.id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    ta = db.query(models.TripActivity).filter(
        models.TripActivity.id == activity_id,
        models.TripActivity.trip_stop_id == stop_id,
    ).first()
    if not ta:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(ta)
    db.commit()
