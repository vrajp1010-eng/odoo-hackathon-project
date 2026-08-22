from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 — ensures all models are registered before create_all

from routers import auth, trips, cities, activities, budget

# ─── Create tables ────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="GlobeTrotter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["meta"])
def health_check():
    return {"status": "ok", "service": "GlobeTrotter API"}


# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(cities.router)
app.include_router(activities.router)
app.include_router(budget.router)
