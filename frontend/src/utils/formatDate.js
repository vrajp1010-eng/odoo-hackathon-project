// Backend stores dates as plain "YYYY-MM-DD" strings, no timezone math needed.

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: opts.withYear ? "numeric" : undefined,
  });
}

export function formatDateRange(startStr, endStr) {
  return `${formatDate(startStr)} – ${formatDate(endStr)}`;
}

// Adds `offset` days to a "YYYY-MM-DD" string and returns a new "YYYY-MM-DD" string.
export function addDays(dateStr, offset) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// Whole-day span between two "YYYY-MM-DD" strings, inclusive.
export function daySpan(startStr, endStr) {
  const [y1, m1, d1] = startStr.split("-").map(Number);
  const [y2, m2, d2] = endStr.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1;
}
