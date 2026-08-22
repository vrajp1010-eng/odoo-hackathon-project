import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import TripCard from '../components/TripCard';

export default function MyTrips() {
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/trips')
      .then(({ data }) => setTrips(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load trips. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  // Remove deleted trip from local state (no refetch needed)
  const handleDelete = (deletedId) => {
    setTrips((prev) => prev.filter((t) => t.id !== deletedId));
  };

  /* ── Loading skeleton ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <main className="page">
        <div className="container">
          <div className="page-header-row">
            <div className="page-header" style={{ margin: 0 }}>
              <h1>My Trips</h1>
            </div>
          </div>
          <div className="grid-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ height: 180, background: 'var(--bg-surface)' }} />
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ height: 18, width: '70%', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 10 }} />
                  <div style={{ height: 13, width: '50%', background: 'var(--bg-surface)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* ── Error state ─────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <main className="page">
        <div className="container">
          <div className="placeholder-page">
            <div className="icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  /* ── Empty state ─────────────────────────────────────────────────────────── */
  if (trips.length === 0) {
    return (
      <main className="page">
        <div className="container">
          <div className="page-header-row">
            <div className="page-header" style={{ margin: 0 }}>
              <h1>My Trips</h1>
              <p>You haven't planned any trips yet</p>
            </div>
            <Link to="/trips/new" className="btn btn-primary" id="new-trip-empty-btn">
              + Plan New Trip
            </Link>
          </div>

          <div style={{
            border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
            padding: '64px 24px', textAlign: 'center', marginTop: 32,
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}></div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No trips yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
              Start planning your first multi-city adventure. Add cities, pick activities, and share with friends.
            </p>
            <Link to="/trips/new" className="btn btn-primary btn-lg">
              ✈️ Create your first trip
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ── Trips grid ──────────────────────────────────────────────────────────── */
  return (
    <main className="page">
      <div className="container">

        {/* Header row */}
        <div className="page-header-row">
          <div className="page-header" style={{ margin: 0 }}>
            <h1>My Trips</h1>
            <p>
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
            </p>
          </div>
          <Link to="/trips/new" className="btn btn-primary" id="new-trip-btn">
            + New Trip
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
          ))}
        </div>

      </div>
    </main>
  );
}
