import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../api';

const COLORS = ['#63b3ed', '#48bb78', '#f6ad55', '#a0aec0'];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ItineraryView() {
  const { id: tripId } = useParams();
  const [trip, setTrip]     = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('itinerary'); // 'itinerary' | 'timeline'
  const [sharing, setSharing] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/trips/${tripId}`),
      api.get(`/trips/${tripId}/budget`)
    ])
    .then(([tripRes, budgetRes]) => {
      const t = tripRes.data;
      t.stops.sort((a, b) => a.order_index - b.order_index);
      setTrip(t);
      setBudget(budgetRes.data);
      if (t.is_public && t.share_slug) {
        setShareLink(`${window.location.origin}/share/${t.share_slug}`);
      }
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, [tripId]);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const { data } = await api.put(`/trips/${tripId}/publish`);
      setTrip(data);
      const link = `${window.location.origin}/share/${data.share_slug}`;
      setShareLink(link);
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Loading trip details…</p>
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="page">
        <div className="container">
          <p style={{ color: 'var(--danger)' }}>Trip not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page" style={{ paddingBottom: 80 }}>
      <div className="container">
        {/* Header */}
        <div className="page-header-row" style={{ alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <Link to="/trips" className="builder-breadcrumb">← My Trips</Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{trip.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {fmtDate(trip.start_date)} {trip.end_date ? `→ ${fmtDate(trip.end_date)}` : ''}
              <span style={{ margin: '0 8px' }}>•</span>
              {trip.stops.length} cities
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {shareLink ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{shareLink}</span>
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => { navigator.clipboard.writeText(shareLink); alert('Copied!'); }}
                >
                  Copy
                </button>
              </div>
            ) : (
              <button className="btn btn-outline" onClick={handleShare} disabled={sharing}>
                {sharing ? 'Publishing…' : '🌍 Publish & Share'}
              </button>
            )}
            <Link to={`/trips/${trip.id}/build`} className="btn btn-primary">Edit Itinerary</Link>
          </div>
        </div>

        {/* Cover */}
        {trip.cover_photo_url && (
          <img
            src={trip.cover_photo_url}
            alt="Cover"
            style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 40 }}
          />
        )}

        <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
          
          {/* Left: View Toggle & Content */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Trip Details</h2>
              
              {/* Toggle Switch */}
              <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
                <button
                  className={`btn btn-sm ${viewMode === 'itinerary' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setViewMode('itinerary')}
                  style={{ borderRadius: 6, padding: '4px 12px' }}
                >
                  Itinerary
                </button>
                <button
                  className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setViewMode('timeline')}
                  style={{ borderRadius: 6, padding: '4px 12px' }}
                >
                  Timeline
                </button>
              </div>
            </div>
            
            {trip.stops.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No cities added yet.</p>
            ) : viewMode === 'itinerary' ? (
              /* --- Itinerary View (City-grouped) --- */
              <div className="itinerary-view" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {trip.stops.map((stop) => (
                  <div key={stop.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{stop.city?.name}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {fmtDate(stop.arrival_date)} – {fmtDate(stop.departure_date)}
                        </p>
                      </div>
                      <div className="badge badge-other" style={{ fontSize: 12 }}>
                        {stop.trip_activities.length} activities
                      </div>
                    </div>
                    
                    {stop.trip_activities.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {stop.trip_activities.map(ta => (
                          <div key={ta.id} style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{ta.activity?.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                {ta.scheduled_date ? fmtDate(ta.scheduled_date) : 'Unscheduled'}
                                {ta.activity?.duration_hours && ` • ${ta.activity.duration_hours}h`}
                              </div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>${ta.activity?.cost}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No activities planned.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* --- Timeline View (Day-by-Day vertical line) --- */
              <div className="timeline-view" style={{ marginTop: 8 }}>
                {(() => {
                  // Generate an array of dates from start_date to end_date
                  if (!trip.start_date || !trip.end_date) {
                    return <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Please set trip start and end dates to view the day-by-day timeline.</p>;
                  }
                  
                  const days = [];
                  let curr = new Date(trip.start_date + 'T00:00:00');
                  const end = new Date(trip.end_date + 'T00:00:00');
                  
                  while (curr <= end) {
                    days.push(new Date(curr));
                    curr.setDate(curr.getDate() + 1);
                  }
                  
                  return days.map((date, idx) => {
                    // Find which stop this date falls under
                    const dateStr = date.toISOString().split('T')[0];
                    const activeStop = trip.stops.find(s => s.arrival_date <= dateStr && s.departure_date >= dateStr);
                    
                    // Count activities on this specific date
                    let actsToday = 0;
                    if (activeStop) {
                      actsToday = activeStop.trip_activities.filter(ta => ta.scheduled_date === dateStr).length;
                    }
                    
                    return (
                      <div key={dateStr} style={{ position: 'relative', paddingLeft: 28, paddingBottom: 24 }}>
                        {idx !== days.length - 1 && (
                          <div style={{ position: 'absolute', left: 7, top: 24, bottom: 0, width: 2, background: 'var(--border)' }} />
                        )}
                        <div style={{ position: 'absolute', left: 0, top: 4, width: 16, height: 16, borderRadius: '50%', background: activeStop ? 'var(--accent)' : 'var(--border)', border: '3px solid var(--bg-body)' }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>Day {idx + 1}</span>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>{fmtDate(dateStr)}</span>
                          </div>
                        </div>
                        
                        <div style={{ marginTop: 6, padding: '10px 14px', background: activeStop ? 'var(--bg-card)' : 'transparent', border: activeStop ? '1px solid var(--border)' : 'none', borderRadius: 8 }}>
                          {activeStop ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, fontSize: 15 }}>{activeStop.city?.name}</span>
                              {actsToday > 0 && <span className="badge badge-sightseeing" style={{ fontSize: 11 }}>{actsToday} activities</span>}
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Transit / Free Day</span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Right: Budget */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Budget Breakdown</h2>
            
            {budget && (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, marginBottom: 4 }}>Total Estimated Cost</p>
                  <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)' }}>
                    ${budget.total_cost.toFixed(0)}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                    ~${budget.cost_per_day.toFixed(0)} / day
                  </p>
                </div>

                <div className="divider" style={{ margin: '20px 0' }} />

                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>By Category</h3>
                <div style={{ height: 180, marginBottom: 24 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budget.category_breakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        stroke="var(--bg-card)"
                        strokeWidth={2}
                      >
                        {budget.category_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `$${value.toFixed(0)}`}
                        contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Category Legend */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {budget.category_breakdown.map((cat, i) => (
                    <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      <div style={{ flex: 1 }}>{cat.category}</div>
                      <div style={{ fontWeight: 600 }}>${cat.amount.toFixed(0)}</div>
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ margin: '20px 0' }} />

                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Cost per City</h3>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budget.cost_per_city} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="city_name" width={80} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => `$${value.toFixed(0)}`}
                        contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="activities_cost" name="Activities" stackId="a" fill="#63b3ed" radius={[0,0,0,0]} barSize={12} />
                      <Bar dataKey="accommodation_cost" name="Accommodation" stackId="a" fill="#48bb78" radius={[0,2,2,0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
