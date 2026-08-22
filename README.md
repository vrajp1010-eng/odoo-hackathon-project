# GlobeTrotter - Hackathon Project

GlobeTrotter is a full-stack multi-city travel itinerary planner built for a hackathon.

## Tech Stack
* **Frontend**: React, Vite, React Router, Recharts
* **Backend**: Python, FastAPI, SQLAlchemy, SQLite
* **Auth**: Custom JWT-based Authentication

## Features
* Secure signup and login.
* Dashboard to view your trips.
* Create and manage trips.
* Interactive drag-and-drop itinerary builder (using `@dnd-kit`).
* Attach specific activities to each city stop with expected costs.
* Beautiful interactive budget pie charts and bar charts.
* A read-only chronological timeline and presentation view.
* Shareable public links for your itineraries.

## Getting Started

### Backend
```bash
cd backend
python -m venv .venv
# Activate venv: .venv\Scripts\activate (Windows) or source .venv/bin/activate (Mac/Linux)
pip install "fastapi[standard]" sqlalchemy passlib bcrypt python-jose
python seed.py # Optional, generates sample data
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities recharts react-router-dom axios jwt-decode
npm run dev
```

Enjoy planning your trips!
