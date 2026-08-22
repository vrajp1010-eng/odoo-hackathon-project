import { NavLink } from "react-router-dom";
import { Share2 } from "lucide-react";
import { formatDateRange } from "../utils/formatDate";
import { formatCurrency } from "../utils/currency";
import { getCityImage } from "../utils/travelImages";

export default function TripSummaryHeader({ trip, stats }) {
  if (!trip) return null;

  const tabClasses = ({ isActive }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-navy text-white"
        : "bg-white text-navy border border-line hover:border-navy/40"
    }`;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-white">
      <img
        src={trip.cover_photo || getCityImage(trip.stops?.[0]?.city_name || trip.name)}
        alt={`${trip.stops?.[0]?.city_name || trip.name} destination`}
        className="h-28 w-full object-cover sm:h-36"
      />
      <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-ink">{trip.name}</h1>
        <p className="font-mono-data text-sm text-muted">
          {formatDateRange(trip.start_date, trip.end_date)}
        </p>
      </div>

      {stats && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono-data text-sm text-navy">
          <span>
            <strong>{stats.cities}</strong> {stats.cities === 1 ? "City" : "Cities"}
          </span>
          <span>
            <strong>{stats.activities}</strong>{" "}
            {stats.activities === 1 ? "Activity" : "Activities"}
          </span>
          {stats.totalCost !== undefined && (
            <span>
              <strong>{formatCurrency(stats.totalCost)}</strong> total
            </span>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <NavLink to={`/trips/${trip.id}/builder`} className={tabClasses}>
          <span>Builder</span>
        </NavLink>
        <NavLink to={`/trips/${trip.id}/itinerary`} className={tabClasses}>
          Itinerary
        </NavLink>
        <NavLink to={`/trips/${trip.id}/budget`} className={tabClasses}>
          Budget
        </NavLink>
        <NavLink to={`/trips/${trip.id}/share`} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-saffron/40 px-3 py-1.5 text-sm font-medium text-saffron-dark hover:bg-saffron-light">
          <Share2 size={15} /> Share
        </NavLink>
      </div>
      </div>
    </div>
  );
}
