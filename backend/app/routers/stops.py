from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Stop, Trip
from ..schemas import StopCreate, StopRead, StopReorder

router = APIRouter(prefix="/trips/{trip_id}/stops", tags=["stops"])


@router.post("/", response_model=StopRead)
def create_stop(trip_id: int, payload: StopCreate, session: Session = Depends(get_session)):
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    stop = Stop(trip_id=trip_id, **payload.dict())
    session.add(stop)
    session.commit()
    session.refresh(stop)
    return stop


@router.get("/", response_model=List[StopRead])
def list_stops(trip_id: int, session: Session = Depends(get_session)):
    stops = session.exec(
        select(Stop).where(Stop.trip_id == trip_id).order_by(Stop.order_index)
    ).all()
    return stops


@router.patch("/reorder")
def reorder_stops(trip_id: int, payload: StopReorder, session: Session = Depends(get_session)):
    stops = session.exec(select(Stop).where(Stop.trip_id == trip_id)).all()
    by_id = {stop.id: stop for stop in stops}
    if len(payload.stop_ids) != len(stops) or set(payload.stop_ids) != set(by_id):
        raise HTTPException(status_code=400, detail="The reorder list must include every stop")
    for order_index, stop_id in enumerate(payload.stop_ids):
        by_id[stop_id].order_index = order_index
        session.add(by_id[stop_id])
    session.commit()
    return {"ok": True}


@router.delete("/{stop_id}")
def delete_stop(trip_id: int, stop_id: int, session: Session = Depends(get_session)):
    stop = session.get(Stop, stop_id)
    if not stop or stop.trip_id != trip_id:
        raise HTTPException(status_code=404, detail="Stop not found")

    session.delete(stop)
    session.commit()
    return {"ok": True}
