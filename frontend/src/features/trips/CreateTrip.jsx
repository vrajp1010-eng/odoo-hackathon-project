import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createTrip } from "../../api/tripApi";
import { createStop } from "../../api/stopApi";
import Button from "../../components/Button";
import DateField from "../../components/DateField";
import { getTravelImage } from "../../utils/travelImages";

export default function CreateTrip({ user }) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !destination.trim() || !startDate || !endDate) {
      setError("Trip name, first destination, and both dates are required.");
      return;
    }
    if (endDate < startDate) {
      setError("End date can't be before the start date.");
      return;
    }

    setLoading(true);
    try {
      const trip = await createTrip({
        user_id: user.id,
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        description: description.trim() || null,
      });
      await createStop(trip.id, {
        city_name: destination.trim(),
        order_index: 0,
        start_date: startDate,
        end_date: endDate,
      });
      // Straight into the builder, per the intended flow.
      navigate(`/trips/${trip.id}/builder`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-7 max-w-xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-saffron">New expedition</p>
        <h1 className="mb-2 font-display text-3xl font-bold text-ink sm:text-4xl">Give your next trip a beginning.</h1>
        <p className="text-sm leading-6 text-muted">Set the broad strokes now. You can add cities, activities, and costs once your route has a name.</p>
      </div>

      <div className="grid overflow-hidden rounded-3xl border border-line bg-card shadow-sm lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative min-h-56 overflow-hidden bg-navy lg:min-h-full">
          <img src={getTravelImage()} alt="A traveler walking toward a mountain landscape" className="absolute inset-0 h-full w-full object-cover opacity-75" />
          <div className="photo-wash absolute inset-0" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="font-mono-data text-xs uppercase tracking-[0.16em] text-white/70">The best stories</p>
            <p className="mt-2 font-display text-2xl font-bold leading-tight">are usually<br />somewhere else.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        {error && (
          <p className="mb-4 rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">
            {error}
          </p>
        )}

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Trip name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Europe Adventure"
            className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">First destination</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Mumbai"
            required
            className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
          />
          <span className="mt-1 block text-xs text-muted">This city will already be waiting in Builder.</span>
        </label>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <DateField label="Start date" value={startDate} onChange={setStartDate} required />
          <DateField label="End date" value={endDate} onChange={setEndDate} required />
        </div>

        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium text-ink">
            Description <span className="text-muted font-normal">(optional)</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Backpacking through Paris and Amsterdam"
            rows={3}
            className="w-full resize-none rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
          />
        </label>

        <Button type="submit" loading={loading} className="w-full">
          Create trip &amp; start building
        </Button>
        </form>
      </div>
    </div>
  );
}
