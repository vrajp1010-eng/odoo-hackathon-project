from __future__ import annotations
import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ─── Budget ───────────────────────────────────────────────────────────────────

class CityCostBreakdown(BaseModel):
    city_name: str
    activities_cost: float
    accommodation_cost: float


class CategoryBreakdown(BaseModel):
    category: str
    amount: float


class BudgetOut(BaseModel):
    total_activities_cost: float
    estimated_accommodation: float
    estimated_transport: float
    estimated_meals: float
    total_cost: float
    cost_per_day: float
    cost_per_city: List[CityCostBreakdown]
    category_breakdown: List[CategoryBreakdown]
    budget_limit: Optional[float] = None
    is_over_budget: Optional[bool] = None

class TripBudgetLimitUpdate(BaseModel):
    budget_limit: Optional[float] = None

# ─── City ────────────────────────────────────────────────────────────────────

class CityBase(BaseModel):
    name: str
    country: str
    cost_index: Optional[float] = None
    popularity: Optional[float] = None
    image_url: Optional[str] = None


class CityCreate(CityBase):
    pass


class CityOut(CityBase):
    id: int

    model_config = {"from_attributes": True}


# ─── Activity ─────────────────────────────────────────────────────────────────

class ActivityBase(BaseModel):
    city_id: int
    name: str
    category: Optional[str] = None
    cost: Optional[float] = None
    duration_hours: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityOut(ActivityBase):
    id: int

    model_config = {"from_attributes": True}


# ─── TripActivity ─────────────────────────────────────────────────────────────

class TripActivityBase(BaseModel):
    activity_id: int
    scheduled_date: Optional[datetime.date] = None
    notes: Optional[str] = None


class TripActivityCreate(TripActivityBase):
    pass


class TripActivityOut(TripActivityBase):
    id: int
    trip_stop_id: int
    activity: Optional[ActivityOut] = None

    model_config = {"from_attributes": True}


# ─── TripStop ─────────────────────────────────────────────────────────────────

class TripStopBase(BaseModel):
    city_id: int
    arrival_date: Optional[datetime.date] = None
    departure_date: Optional[datetime.date] = None
    order_index: int = 0


class TripStopCreate(TripStopBase):
    pass


class TripStopUpdate(BaseModel):
    """Partial update for a stop — dates and/or order_index."""
    arrival_date: Optional[datetime.date] = None
    departure_date: Optional[datetime.date] = None
    order_index: Optional[int] = None


class StopReorder(BaseModel):
    """Ordered list of stop IDs reflecting the new sequence."""
    stop_ids: List[int]


class TripStopOut(TripStopBase):
    id: int
    trip_id: int
    city: Optional[CityOut] = None
    trip_activities: List[TripActivityOut] = []

    model_config = {"from_attributes": True}


# ─── Trip ─────────────────────────────────────────────────────────────────────

class TripBase(BaseModel):
    name: str
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    description: Optional[str] = None
    cover_photo_url: Optional[str] = None
    is_public: bool = False
    budget_limit: Optional[float] = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""
    name: Optional[str] = None
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    description: Optional[str] = None
    cover_photo_url: Optional[str] = None
    is_public: Optional[bool] = None
    budget_limit: Optional[float] = None


class TripOut(TripBase):
    id: int
    user_id: int
    share_slug: Optional[str] = None
    created_at: datetime.datetime
    stops: List[TripStopOut] = []

    model_config = {"from_attributes": True}


class TripSummary(BaseModel):
    """Lightweight version for list views — includes stop_count but no nested objects."""
    id: int
    user_id: int
    name: str
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    description: Optional[str] = None
    cover_photo_url: Optional[str] = None
    is_public: bool
    budget_limit: Optional[float] = None
    share_slug: Optional[str] = None
    created_at: datetime.datetime
    stop_count: int = 0

    model_config = {"from_attributes": True}


# ─── User ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
