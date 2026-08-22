import { useState } from "react";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import { ACTIVITY_CATEGORIES } from "../../utils/currency";
import { ACTIVITY_CATALOG } from "../../data/travelCatalog";

export default function AddActivity({ open, onClose, onSubmit, stopDaySpan = 1 }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(ACTIVITY_CATEGORIES[0]);
  const [cost, setCost] = useState("");
  const [dayOffset, setDayOffset] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setCategory(ACTIVITY_CATEGORIES[0]);
    setCost("");
    setDayOffset(0);
    setError("");
  }

  function chooseSuggestion(suggestion) {
    setName(suggestion.name);
    setCategory(suggestion.category);
    setCost(String(suggestion.cost));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the activity a name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim(),
        category,
        cost: Number(cost) || 0,
        day_offset: Number(dayOffset),
      });
      reset();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add activity"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Add activity
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-coral-light px-3 py-2 text-sm text-coral">
            {error}
          </p>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Quick ideas</p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_CATALOG.map((suggestion) => (
              <button
                key={suggestion.name}
                type="button"
                onClick={() => chooseSuggestion(suggestion)}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-teal-dark hover:border-teal hover:bg-teal-light"
              >
                {suggestion.name}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Activity name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Eiffel Tower Visit"
            className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
            >
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Cost (₹)</span>
            <input
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="2500"
              className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal font-mono-data"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Day</span>
          <select
            value={dayOffset}
            onChange={(e) => setDayOffset(e.target.value)}
            className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
          >
            {Array.from({ length: Math.max(stopDaySpan, 1) }, (_, i) => (
              <option key={i} value={i}>
                Day {i + 1}
              </option>
            ))}
          </select>
        </label>
      </form>
    </Modal>
  );
}
