from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_db_and_tables
from .routers import users, trips, stops, activities, itinerary, budget, admin

app = FastAPI(title="GlobeTrotter API")

# CORS wide open — fine for an 8-hour hackathon MVP talking to a local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


app.include_router(users.router)
app.include_router(trips.router)
app.include_router(stops.router)
app.include_router(activities.router)
app.include_router(itinerary.router)
app.include_router(budget.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "GlobeTrotter API is running"}
