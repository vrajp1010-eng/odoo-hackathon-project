# GlobeTrotter

GlobeTrotter is a full-stack travel planning application built for the Odoo X L.D.C.E Hackathon 2026. Users can create trips, map multi-city routes, add activities, review estimated costs, and share a read-only itinerary.

## Technology

- Frontend: React 19, Vite, Tailwind CSS 4, React Router, Axios, and Recharts
- Backend: FastAPI, SQLModel, Uvicorn, and SQLite
- Database: A local `globetrotter.db` file created automatically in `backend/`

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer and npm

## Run Locally

Open two PowerShell terminals from the repository root.

### 1. Start the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. On the first startup, the database tables are created automatically. Interactive API documentation is available at `http://localhost:8000/docs`.

If PowerShell blocks virtual-environment activation, run PowerShell as your normal user and use this once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 2. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in a browser. The frontend uses `http://localhost:8000` by default for API requests.

To use another backend URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Restart Vite after changing `.env` values.

## How to Use

1. Open the frontend and select **Create an account**.
2. Sign up with a name, email, and password of at least 8 characters. You are taken to the dashboard after signup.
3. Select **Create trip**, enter the trip name, first destination, date range, and optional description.
4. In **Builder**, add or remove stops and add activities to each stop. Stop dates and order can be adjusted there.
5. Open **Itinerary** for the day-by-day read-only view.
6. Open **Budget** to see activity costs by category and by city.
7. Use **Share** to open a public read-only itinerary page and copy its URL.
8. Use **Profile** to update account details or **Log out** to end the local session.

The first user created in a fresh database is automatically marked as an administrator. That user can open **Admin** to view platform totals, popular cities, and total planned activity spend.

## Application Routes

- `/login` - Sign in
- `/signup` - Create an account
- `/forgot-password` - Create a local demo password-reset token
- `/dashboard` - View saved trips
- `/trips/new` - Create a trip
- `/trips/:tripId/builder` - Manage stops and activities
- `/trips/:tripId/itinerary` - View the itinerary
- `/trips/:tripId/budget` - View the budget breakdown and chart
- `/trips/:tripId/share` - Public read-only itinerary view
- `/profile` - Update the current user's profile
- `/admin` - Administrator analytics

## Backend API

The FastAPI server groups endpoints under these resources:

- `/users` - Signup, login, profile updates, and password reset
- `/trips` - Create, list, update, and delete trips
- `/trips/{trip_id}/stops` - Manage trip stops
- `/stops/{stop_id}/activities` - Manage activities
- `/trips/{trip_id}/itinerary` - Get a nested itinerary
- `/trips/{trip_id}/budget` - Get calculated budget totals
- `/admin/analytics` - Get administrator statistics

Use `/docs` for the exact request and response schemas.

## Useful Commands

From `frontend/`:

```powershell
npm run build    # Create a production build
npm run lint     # Run Oxlint
npm run preview  # Preview the production build locally
```

From `backend/`, with the virtual environment activated:

```powershell
python -m uvicorn app.main:app --reload
```

## Data and Troubleshooting

- Stop the backend with `Ctrl+C` in its terminal. Stop the frontend the same way.
- The SQLite database is stored at `backend/globetrotter.db` and is intentionally local. Delete that file while the backend is stopped to start with a fresh database.
- If the frontend reports a network error, confirm that the backend is running at the URL in `VITE_API_URL` and that the frontend was restarted after changing `.env`.
- Password reset is a local demo flow: the API returns a reset token instead of sending email. Treat that token as temporary development data.
- The app currently stores the signed-in user in browser local storage; this is suitable for the local hackathon demo, not production authentication.
