import { useState } from "react";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { formatDateRange, daySpan } from "../../utils/formatDate";
import { cityCode } from "../../utils/currency";
import { getCityImage } from "../../utils/travelImages";
import ActivityCard from "./ActivityCard";
import AddActivity from "./AddActivity";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function StopCard({ stop, onDeleteStop, onAddActivity, onDeleteActivity, onDragStart, onDrop }) {
  const [addOpen, setAddOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const span = daySpan(stop.start_date, stop.end_date);

  async function handleConfirmDeleteActivity() {
    setDeleting(true);
    try {
      await onDeleteActivity(stop.id, activityToDelete.id);
      setActivityToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div draggable onDragStart={() => onDragStart(stop.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => onDrop(stop.id)} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <img
        src={getCityImage(stop.city_name)}
        alt={`${stop.city_name} travel destination`}
        className="h-32 w-full object-cover"
      />
      {/* Ticket header: city name + airport-style code */}
      <div className="flex items-start justify-between bg-navy px-5 py-4 text-white">
        <div>
          <p className="font-display text-xl font-semibold">{stop.city_name}</p>
          <p className="font-mono-data text-xs text-white/70">
            {formatDateRange(stop.start_date, stop.end_date)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="cursor-grab text-white/50" aria-label="Drag to reorder city" />
          <span className="font-mono-data text-2xl font-semibold tracking-widest text-teal-light/90">
            {cityCode(stop.city_name)}
          </span>
          <button
            onClick={() => onDeleteStop(stop)}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-coral"
            aria-label={`Remove ${stop.city_name}`}
            title="Remove city"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Perforated divider, boarding-pass style */}
      <div className="perforation mx-5" />

      <div className="space-y-2 px-5 py-4">
        {stop.activities.length === 0 ? (
          <p className="py-2 text-sm text-muted">No activities added for {stop.city_name} yet.</p>
        ) : (
          stop.activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onDelete={setActivityToDelete}
            />
          ))
        )}

        <button
          onClick={() => setAddOpen(true)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-sm font-medium text-teal-dark hover:border-teal hover:bg-teal-light"
        >
          <Plus size={16} />
          Add Activity
        </button>
      </div>

      <AddActivity
        open={addOpen}
        onClose={() => setAddOpen(false)}
        stopDaySpan={span}
        onSubmit={(payload) => onAddActivity(stop.id, payload)}
      />

      <ConfirmDialog
        open={!!activityToDelete}
        onCancel={() => setActivityToDelete(null)}
        onConfirm={handleConfirmDeleteActivity}
        loading={deleting}
        title="Remove this activity?"
        message={`"${activityToDelete?.name}" will be removed from ${stop.city_name}.`}
      />
    </div>
  );
}
