import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import DateField from "../../components/DateField";
import { CITY_CATALOG } from "../../data/travelCatalog";

export default function AddStopModal({ open, onClose, onSubmit, defaultOrderIndex = 0 }) {
  const [cityName, setCityName] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setCityName("");
    setCityQuery("");
    setStartDate("");
    setEndDate("");
    setError("");
  }

  const cityOptions = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    return CITY_CATALOG.filter((city) =>
      `${city.name} ${city.country} ${city.region}`.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [cityQuery]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName.trim() || !startDate || !endDate) {
      setError("City name and both dates are required.");
      return;
    }
    if (endDate < startDate) {
      setError("End date can't be before the start date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        city_name: cityName.trim(),
        order_index: defaultOrderIndex,
        start_date: startDate,
        end_date: endDate,
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
      title="Add a city"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Add city
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

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">City name</span>
          <input
            autoFocus
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="Paris"
            className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal"
          />
        </label>

        <div>
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <span className="sr-only">Search destination suggestions</span>
            <input
              value={cityQuery}
              onChange={(event) => setCityQuery(event.target.value)}
              placeholder="Search Indian and global cities"
              className="w-full rounded-xl border border-line bg-paper py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal"
            />
          </label>
          {cityQuery && cityOptions.length > 0 && (
            <div className="mt-2 grid gap-2">
              {cityOptions.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    setCityName(city.name);
                    setCityQuery("");
                  }}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white p-2 text-left hover:border-teal hover:bg-teal-light"
                >
                  <img src={city.image} alt="" className="h-10 w-12 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{city.name}</span>
                    <span className="block text-xs text-muted">{city.country} · {city.costIndex}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DateField label="Arrival" value={startDate} onChange={setStartDate} required />
          <DateField label="Departure" value={endDate} onChange={setEndDate} required />
        </div>
      </form>
    </Modal>
  );
}
