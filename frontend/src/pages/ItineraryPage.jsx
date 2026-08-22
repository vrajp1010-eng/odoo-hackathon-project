import { useEffect, useState, useCallback } from "react";
import { NavLink, useParams } from "react-router-dom";
import { CalendarDays, List } from "lucide-react";
import { getItinerary } from "../api/itineraryApi";
import TripSummaryHeader from "../components/TripSummaryHeader";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import { addDays, formatDate } from "../utils/formatDate";
import { formatCurrency, CATEGORY_COLORS } from "../utils/currency";

// Flattens stops -> activities into { date, city_name, activity } rows,
// each activity's real calendar date computed from stop.start_date + day_offset,
// then groups by that date so "Day N" reflects the whole trip, not just one stop.
function buildDayGroups(trip) {
  const rows = [];
  for (const stop of trip.stops) {
    for (const activity of stop.activities) {
      rows.push({
        date: addDays(stop.start_date, activity.day_offset),
        city_name: stop.city_name,
        activity,
      });
    }
  }
  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const dateOrder = [...new Set(rows.map((r) => r.date))];
  const groups = dateOrder.map((date, index) => ({
    dayNumber: index + 1,
    date,
    entries: rows.filter((r) => r.date === date),
  }));
  return groups;
}

export default function ItineraryPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("timeline");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getItinerary(Number(tripId));
      setTrip(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading fullscreen label="Putting your itinerary together…" />;
  if (error) {
    return (
      <p className="rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">{error}</p>
    );
  }

  const activityCount = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);
  const dayGroups = buildDayGroups(trip);

  return (
    <div>
      <TripSummaryHeader
        trip={trip}
        stats={{ cities: trip.stops.length, activities: activityCount }}
      />

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Day by day</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">Your route, in moments</h2>
      </div>

      {dayGroups.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white">
          <EmptyState
            icon={CalendarDays}
            title="Your itinerary starts here"
            description="Add a city and its activities in the Builder. They will appear here as a day-by-day plan."
            action={
              <NavLink
                to={`/trips/${trip.id}/builder`}
                className="inline-flex items-center rounded-xl bg-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-dark"
              >
                Open Builder
              </NavLink>
            }
          />
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <div className="inline-flex rounded-xl border border-line bg-white p-1">
              <button onClick={() => setViewMode("timeline")} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${viewMode === "timeline" ? "bg-navy text-white" : "text-muted hover:text-ink"}`}>
                <List size={15} /> Timeline
              </button>
              <button onClick={() => setViewMode("calendar")} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${viewMode === "calendar" ? "bg-navy text-white" : "text-muted hover:text-ink"}`}>
                <CalendarDays size={15} /> Calendar
              </button>
            </div>
          </div>
          <div className={viewMode === "timeline" ? "relative space-y-6 pl-6" : "grid gap-4 sm:grid-cols-2"}>
          {/* Dotted flight-path connector running down the whole timeline */}
          {viewMode === "timeline" && <div className="flight-path absolute bottom-2 left-[7px] top-2" />}

          {dayGroups.map((group) => (
            <div key={group.date} className="relative">
              <div className={`relative ${viewMode === "calendar" ? "rounded-2xl border border-line bg-white p-4" : ""}`}>
                {viewMode === "timeline" && <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-teal bg-white" />}
              <div className="mb-2 flex items-baseline gap-2">
                <h3 className="font-display text-lg font-semibold text-ink">
                  Day {group.dayNumber}
                </h3>
                <span className="font-mono-data text-xs text-muted">
                  {formatDate(group.date, { withYear: true })}
                </span>
              </div>

              <div className="space-y-2">
                {group.entries.map(({ activity, city_name }) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.Other,
                        }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {activity.name}
                        </p>
                        <p className="text-xs text-muted">
                          {city_name} · {activity.category}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono-data text-sm font-semibold text-navy">
                      {formatCurrency(activity.cost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
