from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: Optional[str] = None
    is_admin: bool = False

    trips: List["Trip"] = Relationship(back_populates="user")


class Trip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    cover_photo: Optional[str] = None

    user: Optional[User] = Relationship(back_populates="trips")
    stops: List["Stop"] = Relationship(
        back_populates="trip",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class Stop(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trip_id: int = Field(foreign_key="trip.id")
    city_name: str
    order_index: int
    start_date: str
    end_date: str

    trip: Optional[Trip] = Relationship(back_populates="stops")
    activities: List["Activity"] = Relationship(
        back_populates="stop",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    stop_id: int = Field(foreign_key="stop.id")
    name: str
    category: str
    cost: float
    day_offset: int

    stop: Optional[Stop] = Relationship(back_populates="activities")


class PasswordReset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token_hash: str = Field(index=True)
    expires_at: datetime
    used: bool = False
