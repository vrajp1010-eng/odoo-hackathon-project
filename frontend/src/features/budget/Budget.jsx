import { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { Wallet } from "lucide-react";
import { getBudget } from "../../api/budgetApi";
import { getTrip } from "../../api/tripApi";
import TripSummaryHeader from "../../components/TripSummaryHeader";
import BudgetChart from "./BudgetChart";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { formatCurrency } from "../../utils/currency";

export default function Budget({ tripId }) {
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [budgetLimit, setBudgetLimit] = useState(() => localStorage.getItem(`budget-limit-${tripId}`) || "");

  const load = useCallback(async () => {
    setError("");
    try {
      const [tripData, budgetData] = await Promise.all([
        getTrip(tripId),
        getBudget(tripId),
      ]);
      setTrip(tripData);
      setBudget(budgetData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading fullscreen label="Adding up the costs…" />;
  if (error) {
    return (
      <p className="rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">{error}</p>
    );
  }

  const hasCosts = budget.total_cost > 0;
  const limit = Number(budgetLimit) || 0;
  const isOverBudget = limit > 0 && budget.total_cost > limit;

  function updateBudgetLimit(value) {
    setBudgetLimit(value);
    if (value) localStorage.setItem(`budget-limit-${tripId}`, value);
    else localStorage.removeItem(`budget-limit-${tripId}`);
  }

  return (
    <div>
      <TripSummaryHeader
        trip={trip}
        stats={{
          cities: Object.keys(budget.by_stop).length,
          activities: undefined,
          totalCost: budget.total_cost,
        }}
      />

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Trip economics</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">Spend with intention</h2>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold text-ink">Set a trip budget</p><p className="text-xs text-muted">Your limit stays saved on this device.</p></div>
        <label className="flex items-center gap-2 text-sm text-muted"><span>₹</span><input type="number" min="0" value={budgetLimit} onChange={(event) => updateBudgetLimit(event.target.value)} placeholder="e.g. 25000" className="w-36 rounded-xl border border-line px-3 py-2 font-mono-data text-sm outline-none focus:border-teal" /></label>
      </div>

      {isOverBudget && <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-coral/30 bg-coral-light px-4 py-3 text-sm text-coral"><span><strong>Over budget:</strong> planned activities exceed your limit by {formatCurrency(budget.total_cost - limit)}.</span><span aria-hidden="true">!</span></div>}

      {!hasCosts ? (
        <div className="rounded-2xl border border-line bg-white">
          <EmptyState
            icon={Wallet}
            title="Your budget starts here"
            description="Add activities with costs in the Builder and your spending breakdown will appear here."
            action={
              <NavLink
                to={`/trips/${trip.id}/builder`}
                className="inline-flex items-center rounded-xl bg-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-dark"
              >
                Add activities
              </NavLink>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="text-sm text-muted">Total activity cost</p>
            <p className="mt-1 font-mono-data text-3xl font-semibold text-navy">
              {formatCurrency(budget.total_cost)}
            </p>

            <div className="mt-6 space-y-2">
              {Object.entries(budget.by_category).map(([category, cost]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{category}</span>
                  <span className="font-mono-data font-medium text-navy">
                    {formatCurrency(cost)}
                  </span>
                </div>
              ))}
            </div>

            {Object.keys(budget.by_stop).length > 0 && (
              <div className="mt-6 border-t border-line pt-4">
                <p className="mb-2 text-sm font-medium text-ink">By city</p>
                <div className="space-y-2">
                  {Object.entries(budget.by_stop).map(([city, cost]) => (
                    <div key={city} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{city}</span>
                      <span className="font-mono-data font-medium text-navy">
                        {formatCurrency(cost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {budget.by_activity?.length > 0 && <div className="mt-6 border-t border-line pt-4"><p className="mb-2 text-sm font-medium text-ink">Activity-wise budget</p><div className="space-y-2">{budget.by_activity.map((activity) => <div key={activity.id} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate text-muted">{activity.name} <span className="text-xs">· {activity.city_name}</span></span><span className="shrink-0 font-mono-data font-medium text-navy">{formatCurrency(activity.cost)}</span></div>)}</div></div>}
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="mb-2 text-sm font-medium text-ink">Cost by category</p>
            <BudgetChart byCategory={budget.by_category} />
          </div>
        </div>
      )}
    </div>
  );
}
