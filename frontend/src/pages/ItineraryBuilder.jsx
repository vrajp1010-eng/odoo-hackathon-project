import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api';

/* ══════════════════════════════════════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════════════════════════════════════ */
const CATEGORIES = ['all', 'sightseeing', 'food', 'adventure'];
const CAT_EMOJI  = { sightseeing: '', food: '', adventure: '', all: '' };

function fmt(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ══════════════════════════════════════════════════════════════════════════════
   ActivitySection — shown when a stop is expanded
══════════════════════════════════════════════════════════════════════════════ */
function ActivitySection({ stop, tripId, onRefresh }) {
  const [available, setAvailable]   = useState([]);
  const [catFilter, setCatFilter]   = useState('all');
  const [schedDate, setSchedDate]   = useState(stop.arrival_date || '');
  const [loadingActs, setLoadingActs] = useState(true);
  const [adding, setAdding]         = useState(null); // activity id being added

  useEffect(() => {
    setLoadingActs(true);
    api.get(`/cities/${stop.city_id}/activities`)
      .then(({ data }) => setAvailable(data))
      .catch(() => {})
      .finally(() => setLoadingActs(false));
  }, [stop.city_id]);

  const attached    = stop.trip_activities || [];
  const attachedIds = new Set(attached.map(ta => ta.activity_id));
  const filtered    = catFilter === 'all' ? available : available.filter(a => a.category === catFilter);

  const handleAdd = async (activity) => {
    setAdding(activity.id);
    try {
      await api.post(`/trips/${tripId}/stops/${stop.id}/activities`, {
        activity_id:    activity.id,
        scheduled_date: schedDate || stop.arrival_date || null,
        notes: '',
      });
      await onRefresh();
    } catch { /* silent */ }
    setAdding(null);
  };

  const handleRemove = async (taId) => {
    try {
      await api.delete(`/trips/${tripId}/stops/${stop.id}/activities/${taId}`);
      await onRefresh();
    } catch { /* silent */ }
  };

  return (
    <div className="activity-section">

      {/* ── Attached activities ── */}
      {attached.length > 0 && (
        <div className="attached-list">
          <p className="section-sub-label">Planned ({attached.length})</p>
          {attached.map(ta => (
            <div key={ta.id} className="attached-item">
              <span className={`badge badge-${ta.activity?.category}`}>
                {CAT_EMOJI[ta.activity?.category]} {ta.activity?.category}
              </span>
              <span className="attached-name">{ta.activity?.name}</span>
              <span className="attached-meta">
                {ta.scheduled_date ? fmt(ta.scheduled_date) : '—'} · ${ta.activity?.cost}
              </span>
              <button
                className="btn btn-ghost btn-sm remove-btn"
                onClick={() => handleRemove(ta.id)}
                title="Remove activity"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Activity picker ── */}
      <div className="picker-header">
        <p className="section-sub-label">Add activities in {stop.city?.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Date:</span>
          <input
            type="date"
            className="form-input"
            style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
            value={schedDate}
            onChange={e => setSchedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`btn btn-sm cat-tab ${catFilter === cat ? 'active' : ''}`}
            onClick={() => setCatFilter(cat)}
          >
            {CAT_EMOJI[cat]} {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity cards */}
      {loadingActs ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '8px 0' }}>Loading activities…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '8px 0' }}>No activities in this category.</p>
      ) : (
        <div className="activity-pick-grid">
          {filtered.map(act => {
            const isAdded = attachedIds.has(act.id);
            return (
              <div key={act.id} className={`activity-pick-card${isAdded ? ' is-added' : ''}`}>
                <div className="ap-info">
                  <span className={`badge badge-${act.category}`} style={{ marginBottom: 4 }}>
                    {CAT_EMOJI[act.category]} {act.category}
                  </span>
                  <div className="ap-name">{act.name}</div>
                  <div className="ap-meta">${act.cost} · {act.duration_hours}h</div>
                </div>
                <button
                  className={`btn btn-sm ${isAdded ? 'btn-ghost' : 'btn-primary'}`}
                  disabled={isAdded || adding === act.id}
                  onClick={() => !isAdded && handleAdd(act)}
                >
                  {adding === act.id ? '…' : isAdded ? '✓ Added' : '+ Add'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SortableStopCard
══════════════════════════════════════════════════════════════════════════════ */
function SortableStopCard({ stop, index, tripId, onDelete, onRefresh }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex:  isDragging ? 10 : 'auto',
  };

  const [expanded, setExpanded]     = useState(false);
  const [arrival, setArrival]       = useState(stop.arrival_date   || '');
  const [departure, setDeparture]   = useState(stop.departure_date || '');
  const [dateSaving, setDateSaving] = useState(false);

  const saveDates = async () => {
    if (dateSaving) return;
    setDateSaving(true);
    try {
      await api.put(`/trips/${tripId}/stops/${stop.id}`, {
        arrival_date:   arrival   || null,
        departure_date: departure || null,
      });
    } catch { /* silent — dates are optional */ }
    setDateSaving(false);
  };

  const actCount = stop.trip_activities?.length ?? 0;

  return (
    <div ref={setNodeRef} style={style} className={`stop-card${isDragging ? ' is-dragging' : ''}`}>
      <div className="stop-header">

        {/* Drag handle */}
        <div className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
          ⠿
        </div>

        {/* Order badge + city */}
        <div className="stop-city-block">
          <span className="stop-order-num">{index + 1}</span>
          <div>
            <div className="stop-city-name">{stop.city?.name}</div>
            <div className="stop-city-country">{stop.city?.country}</div>
          </div>
        </div>

        {/* Inline date inputs */}
        <div className="stop-dates-row">
          <input
            type="date"
            className="form-input stop-date-input"
            value={arrival}
            onChange={e => setArrival(e.target.value)}
            onBlur={saveDates}
            title="Arrival date"
          />
          <span className="date-arrow">→</span>
          <input
            type="date"
            className="form-input stop-date-input"
            value={departure}
            min={arrival}
            onChange={e => setDeparture(e.target.value)}
            onBlur={saveDates}
            title="Departure date"
          />
          {dateSaving && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>saving…</span>}
        </div>

        {/* Actions */}
        <div className="stop-actions">
          <button
            className={`btn btn-sm ${expanded ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Hide' : `🎯 Activities${actCount > 0 ? ` (${actCount})` : ''}`}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(stop.id)}
            title="Remove city"
          >✕</button>
        </div>
      </div>

      {expanded && (
        <ActivitySection stop={stop} tripId={tripId} onRefresh={onRefresh} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   AddCityModal
══════════════════════════════════════════════════════════════════════════════ */
function AddCityModal({ tripId, stopCount, onAdded, onClose }) {
  const [search, setSearch]       = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [arrival, setArrival]     = useState('');
  const [departure, setDeparture] = useState('');
  const [adding, setAdding]       = useState(false);

  // Debounced city search
  useEffect(() => {
    setSearching(true);
    const timer = setTimeout(() => {
      api.get('/cities', { params: search ? { search } : {} })
        .then(({ data }) => setResults(data))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = async () => {
    if (!selected || adding) return;
    setAdding(true);
    try {
      const { data } = await api.post(`/trips/${tripId}/stops`, {
        city_id:        selected.id,
        arrival_date:   arrival   || null,
        departure_date: departure || null,
        order_index:    stopCount,
      });
      onAdded(data);
      onClose();
    } catch {
      setAdding(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        <div className="modal-header">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add a City Stop</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {!selected ? (
          <>
            <input
              id="city-search-input"
              className="form-input"
              placeholder="Search cities — Paris, Rome, Berlin…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{ marginBottom: 12 }}
            />
            <div className="city-search-results">
              {searching && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Searching…</p>}
              {!searching && results.map(city => (
                <div
                  key={city.id}
                  className="city-search-result"
                  onClick={() => setSelected(city)}
                  id={`city-result-${city.id}`}
                >
                  <img
                    src={city.image_url || `https://picsum.photos/seed/${city.name}/80/60`}
                    alt={city.name}
                    className="city-result-thumb"
                  />
                  <div style={{ flex: 1 }}>
                    <div className="city-result-name">{city.name}</div>
                    <div className="city-result-country">{city.country}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12 }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Cost index</div>
                    <div style={{ fontWeight: 700 }}>{city.cost_index}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                    Select →
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            {/* Selected city banner */}
            <div className="selected-city-banner">
              <img
                src={selected.image_url || `https://picsum.photos/seed/${selected.name}/120/80`}
                alt={selected.name}
                style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{selected.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selected.country}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                Change
              </button>
            </div>

            {/* Date inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="modal-arrival">Arrival date</label>
                <input
                  id="modal-arrival"
                  type="date"
                  className="form-input"
                  value={arrival}
                  onChange={e => setArrival(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="modal-departure">Departure date</label>
                <input
                  id="modal-departure"
                  type="date"
                  className="form-input"
                  value={departure}
                  min={arrival}
                  onChange={e => setDeparture(e.target.value)}
                />
              </div>
            </div>

            <button
              id="confirm-add-city"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? 'Adding…' : `Add ${selected.name} to Trip`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ItineraryBuilder — main page
══════════════════════════════════════════════════════════════════════════════ */
export default function ItineraryBuilder() {
  const { id: tripId } = useParams();
  const [trip, setTrip]           = useState(null);
  const [stops, setStops]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  // ── Fetch / refresh trip ─────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const { data } = await api.get(`/trips/${tripId}`);
    setTrip(data);
    setStops(
      [...(data.stops || [])].sort((a, b) => a.order_index - b.order_index)
    );
  }, [tripId]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // ── Drag-end: reorder optimistically then persist ────────────────────────
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx  = stops.findIndex(s => s.id === active.id);
    const newIdx  = stops.findIndex(s => s.id === over.id);
    const reordered = arrayMove(stops, oldIdx, newIdx);
    setStops(reordered); // optimistic
    await api.put(`/trips/${tripId}/stops/reorder`, {
      stop_ids: reordered.map(s => s.id),
    });
  };

  // ── Delete stop ──────────────────────────────────────────────────────────
  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Remove this city from the trip?')) return;
    setStops(prev => prev.filter(s => s.id !== stopId)); // optimistic
    await api.delete(`/trips/${tripId}/stops/${stopId}`);
  };

  // ── Add stop from modal ──────────────────────────────────────────────────
  const handleStopAdded = (newStop) => {
    setStops(prev => [...prev, newStop]);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="page">
        <div className="container builder-container">
          <div className="builder-loading">
            <div className="builder-loading-spinner" />
            <p>Loading itinerary…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="page">
        <div className="container">
          <p style={{ color: 'var(--danger)' }}>Trip not found.</p>
          <Link to="/trips" className="btn btn-primary" style={{ marginTop: 16 }}>← My Trips</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page" style={{ paddingBottom: 80 }}>
      <div className="container builder-container">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="builder-topbar">
          <div>
            <Link to="/trips" className="builder-breadcrumb">← My Trips</Link>
            <h1 className="builder-title">{trip.name}</h1>
            {(trip.start_date || trip.end_date) && (
              <p className="builder-dates">
                {fmt(trip.start_date)} {trip.end_date ? `→ ${fmt(trip.end_date)}` : ''}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Link to={`/trips/${tripId}`} className="btn btn-outline btn-sm">View Itinerary →</Link>
          </div>
        </div>

        <div className="divider" />

        {/* ── Stop list ────────────────────────────────────────────────────── */}
        {stops.length === 0 ? (
          <div className="builder-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}></div>
            <h2>No cities yet</h2>
            <p>Add your first city stop to start building the itinerary.</p>
            <button
              id="add-first-city-btn"
              className="btn btn-primary btn-lg"
              onClick={() => setShowModal(true)}
            >
              + Add First City
            </button>
          </div>
        ) : (
          <>
            <div className="stop-list-header">
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {stops.length} {stops.length === 1 ? 'city' : 'cities'} — drag to reorder
              </span>
              <button
                id="add-city-btn"
                className="btn btn-primary btn-sm"
                onClick={() => setShowModal(true)}
              >
                + Add City
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stops.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="stop-list">
                  {stops.map((stop, idx) => (
                    <SortableStopCard
                      key={stop.id}
                      stop={stop}
                      index={idx}
                      tripId={tripId}
                      onDelete={handleDeleteStop}
                      onRefresh={refresh}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              className="btn btn-outline add-stop-bottom-btn"
              onClick={() => setShowModal(true)}
            >
              + Add Another City
            </button>
          </>
        )}
      </div>

      {/* ── Add City Modal ───────────────────────────────────────────────── */}
      {showModal && (
        <AddCityModal
          tripId={tripId}
          stopCount={stops.length}
          onAdded={handleStopAdded}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
