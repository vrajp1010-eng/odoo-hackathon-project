# Globetrotter Trip Planner

A full-stack web application for planning travel itineraries, built with React (Vite) on the frontend and FastAPI (Python) on the backend.

## Prerequisites

Before running the project, make sure you have the following installed on your machine:
- **Node.js** (v16 or higher)
- **Python** (v3.10 or higher)

## 🚀 How to Run the Project Locally

You will need to open **two separate terminal windows** (one for the backend, one for the frontend).

### Step 1: Start the Backend (FastAPI)

1. Open your first terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. *(Optional but recommended)* Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Uvicorn server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Your backend is now running at `http://localhost:8000`*

---

### Step 2: Start the Frontend (React / Vite)

1. Open your second terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Your frontend is now running at `http://localhost:5173`*

### Step 3: View the App
Open your web browser and navigate to **[http://localhost:5173](http://localhost:5173)**!

## Database

The project uses SQLite (`globetrotter.db`) by default. The database is automatically initialized and seeded with default cities and users when you start the backend server for the first time.

## 🌟 New Features (Added in Hackathon)
- **Budget Tracking & Limits**: Set a maximum budget limit for your trips, automatically track expenses, and view visual "over budget" or "under budget" warnings.
- **Trip Duplication**: Instantly copy any public trip with a single click to duplicate its itinerary and activities to your own account.
- **Enhanced Search Filters**: Quickly filter destinations by country and activities by category or max cost.
- **Global & Local Expansion**: The database now contains 39 stunning cities (including 8 localized Indian destinations like Jaipur, Kochi, and Agra) and over 150 unique activities.
- **Dynamic Imagery**: Realistic photos automatically fetch from Wikimedia Commons and dynamically adapt as your trip's cover photo.
