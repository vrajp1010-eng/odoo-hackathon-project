import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, Copy, MapPin } from "lucide-react";
import { getItinerary } from "../api/itineraryApi";
import Loading from "../components/Loading";
import { formatCurrency } from "../utils/currency";
import { formatDateRange } from "../utils/formatDate";
import { getCityImage } from "../utils/travelImages";

export default function SharePage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      setTrip(await getItinerary(Number(tripId)));
    } catch (err) {
      setError(err.message);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (error) return <p className="p-6 text-sm text-coral">{error}</p>;
  if (!trip) return <Loading fullscreen label="Preparing shared itinerary…" />;

  const activityCount = trip.stops.reduce((total, stop) => total + stop.activities.length, 0);

  return (
    <main className="min-h-screen bg-paper px-4 py-6 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft size={16} /> GlobeTrotter
          </Link>
          <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-navy hover:border-teal">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy trip link"}
          </button>
        </div>

        <header className="mb-8 rounded-3xl bg-navy p-6 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron-light">Shared itinerary</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold sm:text-6xl">{trip.name}</h1>
          <p className="mt-3 text-sm text-white/70">{formatDateRange(trip.start_date, trip.end_date)}</p>
          <div className="mt-6 flex flex-wrap gap-5 font-mono-data text-sm text-white/80">
            <span>{trip.stops.length} cities</span>
            <span>{activityCount} activities</span>
          </div>
        </header>

        <div className="space-y-6">
          {trip.stops.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">This trip is still being planned.</div>
          ) : trip.stops.map((stop) => (
            <section key={stop.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              <img src={getCityImage(stop.city_name)} alt={`${stop.city_name} destination`} className="h-48 w-full object-cover" />
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-ink">{stop.city_name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={15} /> {formatDateRange(stop.start_date, stop.end_date)}</p>
                  </div>
                  <span className="rounded-full bg-teal-light px-3 py-1.5 text-xs font-semibold text-teal-dark">{stop.activities.length} plans</span>
                </div>
                {stop.activities.length > 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {stop.activities.map((activity) => (
                      <div key={activity.id} className="rounded-xl border border-line bg-paper p-4">
                        <p className="font-semibold text-ink">{activity.name}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><CalendarDays size={13} /> Day {activity.day_offset + 1} · {activity.category}</p>
                        <p className="mt-3 font-mono-data text-sm font-semibold text-navy">{formatCurrency(activity.cost)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
