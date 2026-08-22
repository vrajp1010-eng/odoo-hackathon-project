import { Trash2 } from "lucide-react";
import { formatCurrency, CATEGORY_COLORS } from "../../utils/currency";

export default function ActivityCard({ activity, onDelete }) {
  const dotColor = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.Other;

  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-paper/60 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{activity.name}</p>
          <p className="text-xs text-muted">
            {activity.category} · Day {activity.day_offset + 1}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono-data text-sm font-semibold text-navy">
          {formatCurrency(activity.cost)}
        </span>
        <button
          onClick={() => onDelete(activity)}
          className="rounded-lg p-1.5 text-muted opacity-0 transition-opacity hover:bg-coral-light hover:text-coral group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Delete ${activity.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
