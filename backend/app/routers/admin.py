from collections import Counter

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Activity, Stop, Trip, User
from ..schemas import AdminAnalytics

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics", response_model=AdminAnalytics)
def analytics(user_id: int, session: Session = Depends(get_session)):
    requester = session.get(User, user_id)
    if not requester or not requester.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    users = session.exec(select(User)).all()
    trips = session.exec(select(Trip)).all()
    stops = session.exec(select(Stop)).all()
    activities = session.exec(select(Activity)).all()
    cities = Counter(stop.city_name for stop in stops)
    return AdminAnalytics(
        users=len(users),
        trips=len(trips),
        stops=len(stops),
        activities=len(activities),
        total_activity_cost=sum(activity.cost for activity in activities),
        popular_cities=dict(cities.most_common(8)),
    )