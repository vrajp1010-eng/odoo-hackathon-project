from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Trip
from ..schemas import TripCreate, TripUpdate, TripRead

router = APIRouter(prefix="/trips", tags=["trips"])


@router.post("/", response_model=TripRead)
def create_trip(payload: TripCreate, session: Session = Depends(get_session)):
    trip = Trip(**payload.dict())
    session.add(trip)
    session.commit()
    session.refresh(trip)
    return trip


@router.get("/", response_model=List[TripRead])
def list_trips(user_id: int, session: Session = Depends(get_session)):
    trips = session.exec(select(Trip).where(Trip.user_id == user_id)).all()
    return trips


@router.get("/{trip_id}", response_model=TripRead)
def get_trip(trip_id: int, session: Session = Depends(get_session)):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.patch("/{trip_id}", response_model=TripRead)
def update_trip(trip_id: int, payload: TripUpdate, session: Session = Depends(get_session)):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(trip, key, value)

    session.add(trip)
    session.commit()
    session.refresh(trip)
    return trip


@router.delete("/{trip_id}")
def delete_trip(trip_id: int, session: Session = Depends(get_session)):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    session.delete(trip)
    session.commit()
    return {"ok": True}
