# GlobeTrotter Frontend

React + Vite + Tailwind v4 frontend for the GlobeTrotter hackathon app.

## Setup

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. Make sure your FastAPI backend is running at
http://localhost:8000 (see .env — VITE_API_URL controls this).

## Structure

- `src/api/` — one file per backend resource, all calls go through `client.js`
- `src/components/` — shared UI (Button, Modal, Navbar, Sidebar, Layout, etc.)
- `src/features/` — screen logic grouped by domain (auth, trips, itinerary, budget)
- `src/pages/` — thin route-level wrappers that pull URL params and render a feature
- `src/hooks/useAuth.js` — fake-auth session persisted to localStorage
- `src/utils/` — date and currency formatting helpers

## Routes

- `/login`, `/signup`
- `/dashboard`
- `/trips/new`
- `/trips/:tripId/builder` — add/remove cities and activities
- `/trips/:tripId/itinerary` — read-only day-by-day view
- `/trips/:tripId/budget` — cost breakdown + chart

## Design notes

Boarding-pass visual language: perforated dividers and airport-style city
codes on stop cards, dotted "flight path" connecting the day-by-day timeline.
Fraunces (headings), Inter (body), IBM Plex Mono (dates/prices/codes).
Mobile gets a bottom tab bar; desktop gets a left sidebar — same routes, `Sidebar.jsx`.
