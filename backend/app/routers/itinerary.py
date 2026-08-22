from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Trip, Stop
from ..schemas import TripItinerary, StopNested, ActivityNested

router = APIRouter(prefix="/trips/{trip_id}/itinerary", tags=["itinerary"])


@router.get("/", response_model=TripItinerary)
def get_itinerary(trip_id: int, session: Session = Depends(get_session)):
    """Returns the full trip with nested stops and activities, sorted for display."""
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    stops = session.exec(
        select(Stop).where(Stop.trip_id == trip_id).order_by(Stop.order_index)
    ).all()

    stop_list = []
    for stop in stops:
        sorted_activities = sorted(stop.activities, key=lambda a: a.day_offset)
        stop_list.append(
            StopNested(
                id=stop.id,
                city_name=stop.city_name,
                order_index=stop.order_index,
                start_date=stop.start_date,
                end_date=stop.end_date,
                activities=[
                    ActivityNested(
                        id=a.id,
                        name=a.name,
                        category=a.category,
                        cost=a.cost,
                        day_offset=a.day_offset,
                    )
                    for a in sorted_activities
                ],
            )
        )

    return TripItinerary(
        id=trip.id,
        name=trip.name,
        start_date=trip.start_date,
        end_date=trip.end_date,
        description=trip.description,
        stops=stop_list,
    )
