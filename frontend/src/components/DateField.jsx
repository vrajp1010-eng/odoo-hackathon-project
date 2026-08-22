import { CalendarDays } from "lucide-react";
import { useRef } from "react";

export default function DateField({ label, value, onChange, required = false }) {
  const pickerRef = useRef(null);

  function handlePickerChange(event) {
    if (event.target.value) onChange(event.target.value);
  }

  function normalizeKeyboardDate(event) {
    const input = event.target.value.trim();
    const dayFirstMatch = input.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dayFirstMatch) {
      const [, day, month, year] = dayFirstMatch;
      onChange(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    }
  }

  function openPicker() {
    if (pickerRef.current?.showPicker) {
      pickerRef.current.showPicker();
    } else {
      pickerRef.current?.click();
    }
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <span className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={normalizeKeyboardDate}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          required={required}
          className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal font-mono-data"
        />
        <button type="button" onClick={openPicker} className="flex w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper text-teal-dark hover:border-teal" title="Open calendar" aria-label={`Choose ${label.toLowerCase()}`}>
          <CalendarDays size={18} aria-hidden="true" />
        </button>
        <input ref={pickerRef} type="date" value={value} onChange={handlePickerChange} className="pointer-events-none absolute h-px w-px opacity-0" tabIndex={-1} aria-hidden="true" />
      </span>
    </label>
  );
}