import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, Date, ForeignKey,
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    description = Column(String)
    cover_photo_url = Column(String)
    is_public = Column(Boolean, default=False)
    share_slug = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="trips")
    stops = relationship("TripStop", back_populates="trip", cascade="all, delete-orphan",
                         order_by="TripStop.order_index")


class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    arrival_date = Column(Date)
    departure_date = Column(Date)
    order_index = Column(Integer, nullable=False, default=0)

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", back_populates="stops")
    trip_activities = relationship("TripActivity", back_populates="trip_stop",
                                   cascade="all, delete-orphan")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    cost_index = Column(Float)      # 0-100, higher = more expensive
    popularity = Column(Float)      # 0-100
    image_url = Column(String)

    stops = relationship("TripStop", back_populates="city")
    activities = relationship("Activity", back_populates="city", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String)           # sightseeing | food | adventure
    cost = Column(Float)                # USD
    duration_hours = Column(Float)
    description = Column(String)
    image_url = Column(String)

    city = relationship("City", back_populates="activities")
    trip_activities = relationship("TripActivity", back_populates="activity")


class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(Integer, primary_key=True, index=True)
    trip_stop_id = Column(Integer, ForeignKey("trip_stops.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    scheduled_date = Column(Date)
    notes = Column(String)

    trip_stop = relationship("TripStop", back_populates="trip_activities")
    activity = relationship("Activity", back_populates="trip_activities")
