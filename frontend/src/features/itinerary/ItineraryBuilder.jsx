import { useCallback, useEffect, useState } from "react";
import { Plus, MapPinned } from "lucide-react";
import { getItinerary } from "../../api/itineraryApi";
import { createStop, deleteStop as apiDeleteStop, reorderStops } from "../../api/stopApi";
import { createActivity, deleteActivity as apiDeleteActivity } from "../../api/activityApi";
import TripSummaryHeader from "../../components/TripSummaryHeader";
import StopCard from "./StopCard";
import AddStopModal from "./AddStopModal";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function ItineraryBuilder({ tripId }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [stopToDelete, setStopToDelete] = useState(null);
  const [deletingStop, setDeletingStop] = useState(false);
  const [draggedStopId, setDraggedStopId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getItinerary(tripId);
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

  async function handleAddStop(payload) {
    await createStop(tripId, { ...payload, order_index: trip?.stops.length || 0 });
    await load();
  }

  async function handleDeleteStop() {
    if (!stopToDelete) return;
    setDeletingStop(true);
    try {
      await apiDeleteStop(tripId, stopToDelete.id);
      setStopToDelete(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingStop(false);
    }
  }

  async function handleAddActivity(stopId, payload) {
    await createActivity(stopId, payload);
    await load();
  }

  async function handleDrop(targetStopId) {
    if (!draggedStopId || draggedStopId === targetStopId) return;
    const currentStops = [...trip.stops];
    const fromIndex = currentStops.findIndex((stop) => stop.id === draggedStopId);
    const targetIndex = currentStops.findIndex((stop) => stop.id === targetStopId);
    const [movedStop] = currentStops.splice(fromIndex, 1);
    currentStops.splice(targetIndex, 0, movedStop);
    setTrip((current) => ({ ...current, stops: currentStops }));
    setDraggedStopId(null);
    try {
      await reorderStops(tripId, currentStops.map((stop) => stop.id));
    } catch (err) {
      setError(err.message);
      await load();
    }
  }

  async function handleDeleteActivity(stopId, activityId) {
    await apiDeleteActivity(stopId, activityId);
    await load();
  }

  if (loading) return <Loading fullscreen label="Loading your itinerary…" />;
  if (error && !trip) {
    return (
      <p className="rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">{error}</p>
    );
  }

  const activityCount = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);

  return (
    <div>
      <TripSummaryHeader
        trip={trip}
        stats={{ cities: trip.stops.length, activities: activityCount }}
      />

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Route planner</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">Shape the journey</h2>
        </div>
        {trip.stops.length > 0 && (
          <Button size="sm" onClick={() => setAddStopOpen(true)}>
            <Plus size={16} /> Add city
          </Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      {trip.stops.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title="No cities yet"
          description="Add the first city on this trip to start building your day-by-day plan."
          action={
            <Button onClick={() => setAddStopOpen(true)}>
              <Plus size={18} />
              Add City
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {trip.stops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              onDeleteStop={setStopToDelete}
              onAddActivity={handleAddActivity}
              onDeleteActivity={handleDeleteActivity}
              onDragStart={setDraggedStopId}
              onDrop={handleDrop}
            />
          ))}

          <button
            onClick={() => setAddStopOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line bg-white py-4 text-sm font-medium text-teal-dark hover:border-teal hover:bg-teal-light"
          >
            <Plus size={18} />
            Add City
          </button>
        </div>
      )}

      <AddStopModal
        open={addStopOpen}
        onClose={() => setAddStopOpen(false)}
        onSubmit={handleAddStop}
        defaultOrderIndex={trip.stops.length}
      />

      <ConfirmDialog
        open={!!stopToDelete}
        onCancel={() => setStopToDelete(null)}
        onConfirm={handleDeleteStop}
        loading={deletingStop}
        title="Remove this city?"
        message={`"${stopToDelete?.city_name}" and all of its activities will be removed from the trip.`}
      />
    </div>
  );
}
