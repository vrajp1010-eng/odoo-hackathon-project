import { useNavigate } from "react-router-dom";
import { MapPin, Trash2 } from "lucide-react";
import { formatDateRange } from "../../utils/formatDate";
import { getCityImage } from "../../utils/travelImages";

export default function TripCard({ trip, cityCount, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
      <img
        src={trip.cover_photo || getCityImage(trip.name)}
        alt={`${trip.name} travel destination`}
        className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="p-5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(trip);
        }}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-muted opacity-0 transition-opacity hover:bg-coral-light hover:text-coral group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={`Delete ${trip.name}`}
        title="Delete trip"
      >
        <Trash2 size={16} />
      </button>

      <button
        onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
        className="block w-full text-left"
      >
        <h3 className="pr-8 font-display text-lg font-semibold text-ink">
          {trip.name}
        </h3>
        <p className="mt-1 font-mono-data text-sm text-muted">
          {formatDateRange(trip.start_date, trip.end_date)}
        </p>
        {trip.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{trip.description}</p>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-teal-dark">
          <MapPin size={14} />
          {cityCount === undefined
            ? "—"
            : `${cityCount} ${cityCount === 1 ? "city" : "cities"}`}
        </div>
      </button>
      </div>
    </div>
  );
}
