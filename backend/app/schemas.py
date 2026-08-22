from typing import Optional, List, Dict
from sqlmodel import SQLModel


# ---------- User ----------
class UserAuth(SQLModel):
    name: Optional[str] = None
    email: str
    password: Optional[str] = None


class UserSignup(SQLModel):
    name: str
    email: str
    password: str


class UserLogin(SQLModel):
    email: str
    password: str


class PasswordResetRequest(SQLModel):
    email: str


class PasswordResetConfirm(SQLModel):
    token: str
    password: str


class UserRead(SQLModel):
    id: int
    name: str
    email: str
    is_admin: bool = False


class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None


# ---------- Trip ----------
class TripCreate(SQLModel):
    user_id: int
    name: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    cover_photo: Optional[str] = None


class TripUpdate(SQLModel):
    name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    cover_photo: Optional[str] = None


class TripRead(SQLModel):
    id: int
    user_id: int
    name: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    cover_photo: Optional[str] = None


class StopReorder(SQLModel):
    stop_ids: List[int]


class AdminAnalytics(SQLModel):
    users: int
    trips: int
    stops: int
    activities: int
    total_activity_cost: float
    popular_cities: Dict[str, int]


# ---------- Stop ----------
class StopCreate(SQLModel):
    city_name: str
    order_index: int
    start_date: str
    end_date: str


class StopRead(SQLModel):
    id: int
    trip_id: int
    city_name: str
    order_index: int
    start_date: str
    end_date: str


# ---------- Activity ----------
class ActivityCreate(SQLModel):
    name: str
    category: str
    cost: float
    day_offset: int


class ActivityRead(SQLModel):
    id: int
    stop_id: int
    name: str
    category: str
    cost: float
    day_offset: int


# ---------- Itinerary (nested read-only view) ----------
class ActivityNested(SQLModel):
    id: int
    name: str
    category: str
    cost: float
    day_offset: int


class StopNested(SQLModel):
    id: int
    city_name: str
    order_index: int
    start_date: str
    end_date: str
    activities: List[ActivityNested] = []


class TripItinerary(SQLModel):
    id: int
    name: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    stops: List[StopNested] = []


# ---------- Budget ----------
class BudgetResponse(SQLModel):
    total_cost: float
    by_category: Dict[str, float]
    by_stop: Dict[str, float]
    by_activity: List[Dict[str, object]] = []
