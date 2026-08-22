import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDateRange(start, end) {
  if (!start) return 'No dates set';
  const fmt = (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

/* ════════════════════════════════════════════════════════════════════════════
   TripCard
   ════════════════════════════════════════════════════════════════════════════ */
export default function TripCard({ trip, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${trip.name}"?\n\nThis will permanently remove the trip and all its activities. This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/trips/${trip.id}`);
      onDelete(trip.id);
    } catch {
      alert('Failed to delete trip. Please try again.');
      setDeleting(false);
    }
  };

  const stopLabel = trip.stop_count === 1 ? '1 city' : `${trip.stop_count ?? 0} cities`;
  const fallbackImg = `https://picsum.photos/seed/trip${trip.id}/600/400`;

  return (
    <div className="card trip-card-full" id={`trip-card-${trip.id}`}>
      {/* Cover image */}
      <div className="trip-card-cover-wrap">
        <img
          className="trip-card-cover"
          src={trip.cover_photo_url || fallbackImg}
          alt={trip.name}
        />
        {/* Public badge overlay */}
        {trip.is_public && (
          <span className="trip-card-public-badge">🌐 Public</span>
        )}
      </div>

      {/* Body */}
      <div className="trip-card-full-body">
        <div style={{ flex: 1 }}>
          <h3 className="trip-card-full-title">{trip.name}</h3>

          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <span className="trip-meta-item">
              📅 {formatDateRange(trip.start_date, trip.end_date)}
            </span>
            <span className="trip-meta-item">
              📍 {stopLabel}
            </span>
          </div>

          {trip.description && (
            <p className="trip-card-desc">{trip.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="trip-card-full-actions">
          <Link
            to={`/trips/${trip.id}`}
            id={`view-trip-${trip.id}`}
            className="btn btn-outline btn-sm"
          >
            View
          </Link>
          <Link
            to={`/trips/${trip.id}/build`}
            id={`edit-trip-${trip.id}`}
            className="btn btn-primary btn-sm"
          >
            Edit
          </Link>
          <button
            id={`delete-trip-${trip.id}`}
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
