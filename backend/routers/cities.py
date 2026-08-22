from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import models, schemas
from database import get_db

router = APIRouter(prefix="/cities", tags=["cities"])


@router.get("", response_model=List[schemas.CityOut])
def list_cities(
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.City)
    if search:
        q = q.filter(models.City.name.ilike(f"%{search}%"))
    if country:
        q = q.filter(models.City.country == country)
    return q.order_by(models.City.popularity.desc()).all()


@router.get("/{city_id}", response_model=schemas.CityOut)
def get_city(city_id: int, db: Session = Depends(get_db)):
    city = db.query(models.City).filter(models.City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.get("/{city_id}/activities", response_model=List[schemas.ActivityOut])
def get_city_activities(
    city_id: int,
    category: Optional[str] = Query(None),
    max_cost: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    """Activities for a specific city, optionally filtered by category and max cost."""
    city = db.query(models.City).filter(models.City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    q = db.query(models.Activity).filter(models.Activity.city_id == city_id)
    if category:
        q = q.filter(models.Activity.category == category)
    if max_cost is not None:
        q = q.filter(models.Activity.cost <= max_cost)
    return q.all()
