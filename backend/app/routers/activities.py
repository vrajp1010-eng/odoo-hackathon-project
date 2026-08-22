from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Activity, Stop
from ..schemas import ActivityCreate, ActivityRead

router = APIRouter(prefix="/stops/{stop_id}/activities", tags=["activities"])


@router.post("/", response_model=ActivityRead)
def create_activity(stop_id: int, payload: ActivityCreate, session: Session = Depends(get_session)):
    stop = session.get(Stop, stop_id)
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")

    activity = Activity(stop_id=stop_id, **payload.dict())
    session.add(activity)
    session.commit()
    session.refresh(activity)
    return activity


@router.get("/", response_model=List[ActivityRead])
def list_activities(stop_id: int, session: Session = Depends(get_session)):
    activities = session.exec(select(Activity).where(Activity.stop_id == stop_id)).all()
    return activities


@router.delete("/{id}")
def delete_activity(stop_id: int, id: int, session: Session = Depends(get_session)):
    activity = session.get(Activity, id)
    if not activity or activity.stop_id != stop_id:
        raise HTTPException(status_code=404, detail="Activity not found")

    session.delete(activity)
    session.commit()
    return {"ok": True}
