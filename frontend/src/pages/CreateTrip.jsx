import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

/* ── Validation ─────────────────────────────────────────────────────────── */
function validate(form) {
  const errors = {};
  if (!form.name.trim())       errors.name       = 'Trip name is required';
  if (!form.start_date)        errors.start_date = 'Start date is required';
  if (form.start_date && form.end_date && form.end_date < form.start_date)
    errors.end_date = 'End date must be after start date';
  return errors;
}

export default function CreateTrip() {
  const [form, setForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    cover_photo_url: '',
    is_public: false,
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    setLoading(true);
    setApiError('');
    try {
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date:   form.end_date   || null,
        cover_photo_url: form.cover_photo_url.trim() || null,
      };
      const { data } = await api.post('/trips', payload);
      navigate(`/trips/${data.id}/build`);
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to create trip — please try again');
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 760 }}>

        {/* Header */}
        <div className="page-header-row" style={{ marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Plan a New Trip</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Fill in the basics — you'll add cities and activities next
            </p>
          </div>
          <Link to="/trips" className="btn btn-ghost btn-sm">← Back to My Trips</Link>
        </div>

        <div className="card">
          <div className="card-body" style={{ padding: '32px 36px' }}>

            {apiError && <div className="auth-error" role="alert">{apiError}</div>}

            <form onSubmit={handleSubmit} noValidate>

              {/* Trip name */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-name">
                  Trip name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="trip-name"
                  className={`form-input${errors.name ? ' input-error' : ''}`}
                  type="text"
                  placeholder="e.g. Western Europe Summer 2024"
                  value={form.name}
                  onChange={set('name')}
                  maxLength={120}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              {/* Date row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="trip-start">
                    Start date <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="trip-start"
                    className={`form-input${errors.start_date ? ' input-error' : ''}`}
                    type="date"
                    value={form.start_date}
                    onChange={set('start_date')}
                  />
                  {errors.start_date && <span className="field-error">{errors.start_date}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="trip-end">End date</label>
                  <input
                    id="trip-end"
                    className={`form-input${errors.end_date ? ' input-error' : ''}`}
                    type="date"
                    value={form.end_date}
                    min={form.start_date}
                    onChange={set('end_date')}
                  />
                  {errors.end_date && <span className="field-error">{errors.end_date}</span>}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-desc">Description</label>
                <textarea
                  id="trip-desc"
                  className="form-input"
                  placeholder="A short summary of the trip — will appear on the share page"
                  value={form.description}
                  onChange={set('description')}
                  rows={3}
                />
              </div>

              {/* Cover photo URL */}
              <div className="form-group">
                <label className="form-label" htmlFor="trip-cover">
                  Cover photo URL
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                    (optional)
                  </span>
                </label>
                <input
                  id="trip-cover"
                  className="form-input"
                  type="url"
                  placeholder="https://picsum.photos/seed/mytrip/1200/600"
                  value={form.cover_photo_url}
                  onChange={set('cover_photo_url')}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Leave blank for a default image. Try picsum.photos for free placeholders.
                </span>
              </div>

              {/* Cover preview */}
              {form.cover_photo_url && (
                <div style={{ marginBottom: 20 }}>
                  <img
                    src={form.cover_photo_url}
                    alt="Cover preview"
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Make public toggle */}
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <input
                  id="trip-public"
                  type="checkbox"
                  checked={form.is_public}
                  onChange={set('is_public')}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
                <label htmlFor="trip-public" style={{ cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                  Make this trip public (shareable via link)
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Link to="/trips" className="btn btn-outline">Cancel</Link>
                <button
                  id="create-trip-submit"
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? 'Creating…' : 'Create Trip & Add Cities →'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
