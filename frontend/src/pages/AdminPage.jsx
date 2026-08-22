import { useCallback, useEffect, useState } from "react";
import { BarChart3, IndianRupee, MapPinned, Plane, Users } from "lucide-react";
import { getAdminAnalytics } from "../api/adminApi";
import Loading from "../components/Loading";
import { formatCurrency } from "../utils/currency";

export default function AdminPage({ user }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setStats(await getAdminAnalytics(user.id)); } catch (err) { setError(err.message); }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);
  if (error) return <p className="rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">{error}</p>;
  if (!stats) return <Loading label="Loading platform analytics…" />;

  const cards = [
    [Users, "Registered users", stats.users],
    [Plane, "Trips created", stats.trips],
    [MapPinned, "Cities mapped", stats.stops],
    [BarChart3, "Activities planned", stats.activities],
  ];
  return (
    <div>
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Admin workspace</p><h1 className="mt-2 font-display text-4xl font-bold text-ink">Platform pulse</h1><p className="mt-2 text-sm text-muted">A quick view of how the travel planner is being used.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([Icon, label, value]) => <div key={label} className="rounded-2xl border border-line bg-white p-5"><Icon size={20} className="text-teal" /><p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</p><p className="mt-1 font-mono-data text-3xl font-semibold text-ink">{value}</p></div>)}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-line bg-white p-6"><h2 className="font-display text-xl font-bold text-ink">Popular cities</h2><div className="mt-5 space-y-4">{Object.entries(stats.popular_cities).length === 0 ? <p className="text-sm text-muted">City trends will appear after the first itinerary is added.</p> : Object.entries(stats.popular_cities).map(([city, count], index) => <div key={city}><div className="flex justify-between text-sm"><span className="font-medium text-ink">{index + 1}. {city}</span><span className="font-mono-data text-muted">{count} stops</span></div><div className="mt-2 h-2 rounded-full bg-paper"><div className="h-2 rounded-full bg-teal" style={{ width: `${Math.max(12, (count / Math.max(...Object.values(stats.popular_cities))) * 100)}%` }} /></div></div>)}</div></section>
        <section className="rounded-2xl bg-navy p-6 text-white"><IndianRupee size={22} className="text-saffron-light" /><p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Total planned activity spend</p><p className="mt-2 font-mono-data text-3xl font-semibold">{formatCurrency(stats.total_activity_cost)}</p><p className="mt-3 text-sm leading-6 text-white/65">Combined estimate across all activities currently stored in the platform.</p></section>
      </div>
    </div>
  );
}
