import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Compass, MapPinned, Search, X } from "lucide-react";
import { listTrips, deleteTrip } from "../../api/tripApi";
import { listStops } from "../../api/stopApi";
import TripCard from "./TripCard";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDate } from "../../utils/formatDate";

export default function Dashboard({ user }) {
  const [trips, setTrips] = useState([]);
  const [cityCounts, setCityCounts] = useState({});
  const [cityNames, setCityNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tripToDelete, setTripToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listTrips(user.id);
      setTrips(data);
      // Fetch city counts in parallel — fine at hackathon scale.
      const counts = {};
      const names = {};
      await Promise.all(
        data.map(async (trip) => {
          try {
            const stops = await listStops(trip.id);
            counts[trip.id] = stops.length;
            names[trip.id] = stops.map((stop) => stop.city_name);
          } catch {
            counts[trip.id] = undefined;
            names[trip.id] = [];
          }
        })
      );
      setCityCounts(counts);
      setCityNames(names);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  async function handleConfirmDelete() {
    if (!tripToDelete) return;
    setDeleting(true);
    try {
      await deleteTrip(tripToDelete.id);
      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setTripToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const normalizedQuery = query.trim().toLowerCase();
  const visibleTrips = normalizedQuery
    ? trips.filter((trip) =>
        `${trip.name} ${trip.description || ""}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : trips;
  const plannedCities = Object.values(cityCounts).reduce(
    (total, count) => total + (count || 0),
    0
  );
  const firstName = user.name?.split(" ")[0] || "traveler";
  const nextTrip = [...trips]
    .filter((trip) => trip.start_date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];
  const visitedCities = [...new Set(Object.values(cityNames).flat())];

  return (
    <div>
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-[0.16em] text-teal-dark">
            Your travel desk
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Where to next, {firstName}?
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted">
            Keep every route, stop, and plan in one place.
          </p>
        </div>
        <Button className="self-start sm:self-auto" onClick={() => navigate("/trips/new")}>
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Plan New Trip</span>
        </Button>
      </div>

      {!loading && trips.length > 0 && (
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Trips planned</p>
            <p className="mt-2 font-mono-data text-2xl font-semibold text-ink">{trips.length}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Cities mapped</p>
            <p className="mt-2 font-mono-data text-2xl font-semibold text-ink">{plannedCities}</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-teal/20 bg-teal-light p-4 sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-teal-dark">Ready to explore</p>
            <p className="mt-2 flex items-center gap-2 font-display text-lg font-semibold text-teal-dark">
              <MapPinned size={19} /> Build your next route
            </p>
          </div>
        </div>
      )}

      {!loading && trips.length > 0 && (
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl bg-navy p-5 text-white sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-saffron-light">Next departure</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  {nextTrip ? nextTrip.name : "Your next route"}
                </h2>
                <p className="mt-1 text-sm text-white/65">
                  {nextTrip ? `Leaving ${formatDate(nextTrip.start_date, { withYear: true })}` : "Add dates to see your travel countdown."}
                </p>
              </div>
              <Compass className="text-saffron-light" size={28} strokeWidth={1.5} />
            </div>
            {nextTrip && (
              <button
                onClick={() => navigate(`/trips/${nextTrip.id}/builder`)}
                className="mt-5 text-sm font-semibold text-saffron-light hover:text-white"
              >
                Continue planning <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Your route map</p>
            {visitedCities.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {visitedCities.slice(0, 8).map((city) => (
                  <span key={city} className="rounded-full bg-teal-light px-3 py-1.5 text-sm font-medium text-teal-dark">
                    {city}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">Your city trail will appear here after you add the first stop.</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      {loading ? (
        <Loading label="Fetching your trips…" />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No trips yet"
          description="Your next adventure starts with a single trip. Create one to begin building your itinerary."
          action={
            <Button onClick={() => navigate("/trips/new")}>
              <PlusCircle size={18} />
              Plan your first trip
            </Button>
          }
        />
      ) : (
        <section aria-labelledby="trips-heading">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="trips-heading" className="font-display text-xl font-semibold text-ink">Your trips</h2>
              <p className="mt-1 text-sm text-muted">Open a trip to shape its itinerary.</p>
            </div>
            <label className="relative block sm:w-64">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <span className="sr-only">Search trips</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search trips"
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-muted focus:border-teal focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-paper hover:text-ink"
                  aria-label="Clear trip search"
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>
          {visibleTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  cityCount={cityCounts[trip.id]}
                  onDelete={setTripToDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No matching trips"
              description={`Nothing matches “${query}”. Try another name or clear the search.`}
            />
          )}
        </section>
      )}

      <ConfirmDialog
        open={!!tripToDelete}
        onCancel={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete this trip?"
        message={`"${tripToDelete?.name}" and all of its cities and activities will be permanently removed. This can't be undone.`}
      />
    </div>
  );
}
