import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDateRange(start, end) {
  if (!start) return 'No dates set';
  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function costLabel(index) {
  if (index >= 75) return { text: '$$$', color: '#f6ad55' };
  if (index >= 50) return { text: '$$',  color: '#68d391' };
  return              { text: '$',   color: '#90cdf4' };
}

/* ── Trip card (horizontal scroll) ──────────────────────────────────────── */
function TripScrollCard({ trip }) {
  return (
    <Link
      to={`/trips/${trip.id}`}
      style={{ textDecoration: 'none', flexShrink: 0, width: 260 }}
    >
      <div className="card trip-scroll-card">
        <img
          className="trip-card-img"
          style={{ height: 150 }}
          src={trip.cover_photo_url || `https://picsum.photos/seed/trip${trip.id}/520/300`}
          alt={trip.name}
        />
        <div className="trip-card-body">
          <div className="trip-card-title" style={{ fontSize: 15 }}>{trip.name}</div>
          <div className="trip-card-dates">{formatDateRange(trip.start_date, trip.end_date)}</div>
          {trip.is_public && (
            <span className="badge" style={{ background: 'rgba(0,180,216,.15)', color: 'var(--accent)', fontSize: 11 }}>
              Public
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── City recommendation card ────────────────────────────────────────────── */
function CityCard({ city }) {
  const cost = costLabel(city.cost_index);
  return (
    <div className="card city-rec-card">
      <div className="city-rec-img-wrap">
        <img
          src={city.image_url || `https://picsum.photos/seed/${city.name}Travel/400/250`}
          alt={city.name}
          className="city-rec-img"
        />
        <div className="city-rec-overlay">
          <span className="city-rec-country">{city.country}</span>
        </div>
      </div>
      <div className="card-body" style={{ padding: '14px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{city.name}</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: cost.color }}>{cost.text}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PopularityBar value={city.popularity} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(city.popularity)}% popular</span>
        </div>
      </div>
    </div>
  );
}

function PopularityBar({ value }) {
  return (
    <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
    </div>
  );
}

/* ── Empty state for trips ───────────────────────────────────────────────── */
function NoTrips() {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px dashed var(--border)',
      borderRadius: 'var(--radius)', padding: '32px 24px', textAlign: 'center',
      width: 260, flexShrink: 0,
    }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}></div>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>No trips yet</p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Start planning your first adventure
      </p>
      <Link to="/trips/new" className="btn btn-primary btn-sm">Plan a trip</Link>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────────────── */
function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
      {action}
    </div>
  );
}

/* ── Skeleton loader ─────────────────────────────────────────────────────── */
function Skeleton({ width = '100%', height = 20, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'var(--bg-surface)',
      ...style,
    }} />
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Dashboard
   ════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard({ user }) {
  const [trips, setTrips]   = useState([]);
  const [cities, setCities] = useState([]);
  const [tripsLoading, setTripsLoading]   = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' : 'Good evening';

  // Fetch trips
  useEffect(() => {
    api.get('/trips')
      .then(({ data }) => setTrips(Array.isArray(data) ? data.slice(-3).reverse() : []))
      .catch(() => setTrips([]))
      .finally(() => setTripsLoading(false));
  }, []);

  // Fetch top 4 cities by popularity
  useEffect(() => {
    api.get('/cities')
      .then(({ data }) => {
        const sorted = [...(data || [])].sort((a, b) => b.popularity - a.popularity);
        setCities(sorted.slice(0, 4));
      })
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, []);

  return (
    <main className="page">
      <div className="container">

        {/* ── Hero greeting ────────────────────────────────────────────────── */}
        <div className="dashboard-hero">
          <div>
            <h1 className="dashboard-greeting">
              {greeting},{' '}
              <span style={{ color: 'var(--accent)' }}>
                {user?.name?.split(' ')[0] ?? 'Traveller'}
              </span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 15 }}>
              Where are you headed next?
            </p>
          </div>
          <Link id="plan-new-trip-btn" to="/trips/new" className="btn btn-primary btn-lg">
            Plan New Trip
          </Link>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="stats-row">
          {[
            { label: 'Trips planned', value: tripsLoading ? '–' : trips.length },
            { label: 'Cities visited', value: tripsLoading ? '–' : trips.reduce((acc, t) => acc + (t.stops?.length ?? 0), 0) },
            { label: 'Destinations available', value: citiesLoading ? '–' : cities.length + '+' },
          ].map(({ label, value }) => (
            <div key={label} className="stat-card">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* ── Recent Trips ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          <SectionHeader
            title="Recent Trips"
            action={
              <Link to="/trips" className="btn btn-ghost btn-sm" style={{ fontSize: 13 }}>
                View all →
              </Link>
            }
          />

          <div className="scroll-row" id="recent-trips-scroll">
            {tripsLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="card" style={{ flexShrink: 0, width: 260, overflow: 'hidden' }}>
                  <Skeleton height={150} radius={0} />
                  <div style={{ padding: '14px 16px' }}>
                    <Skeleton height={16} width="70%" style={{ marginBottom: 8 }} />
                    <Skeleton height={12} width="50%" />
                  </div>
                </div>
              ))
            ) : trips.length === 0 ? (
              <NoTrips />
            ) : (
              trips.map((trip) => <TripScrollCard key={trip.id} trip={trip} />)
            )}
          </div>
        </section>

        {/* ── Recommended Destinations ─────────────────────────────────────── */}
        <section>
          <SectionHeader title="Popular Destinations" />

          <div className="grid-4" id="destinations-grid">
            {citiesLoading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="card" style={{ overflow: 'hidden' }}>
                  <Skeleton height={160} radius={0} />
                  <div style={{ padding: '14px 16px' }}>
                    <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
                    <Skeleton height={8} />
                  </div>
                </div>
              ))
            ) : (
              cities.map((city) => <CityCard key={city.id} city={city} />)
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
