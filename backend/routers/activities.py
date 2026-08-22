from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import models, schemas
from database import get_db

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("", response_model=List[schemas.ActivityOut])
def list_activities(
    city_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Activity)
    if city_id is not None:
        q = q.filter(models.Activity.city_id == city_id)
    if category:
        q = q.filter(models.Activity.category == category)
    return q.all()


@router.get("/{activity_id}", response_model=schemas.ActivityOut)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity
