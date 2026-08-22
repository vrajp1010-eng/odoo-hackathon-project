export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// Deterministic 3-letter "airport style" code from a city name, for the
// boarding-pass visual treatment on stop cards. Purely decorative.
export function cityCode(cityName) {
  if (!cityName) return "???";
  const cleaned = cityName.trim().toUpperCase().replace(/[^A-Z ]/g, "");
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0] + (words[0][1] || words[1][1] || "X")).slice(0, 3);
  }
  return (cleaned.slice(0, 3) || "???").padEnd(3, "X");
}

export const ACTIVITY_CATEGORIES = [
  "Sightseeing",
  "Food",
  "Adventure",
  "Entertainment",
  "Transport",
  "Other",
];

export const CATEGORY_COLORS = {
  Sightseeing: "#1f8a7a",
  Food: "#ec6b4d",
  Adventure: "#e2a63b",
  Entertainment: "#7c6fd6",
  Transport: "#3b7de2",
  Other: "#5b6b72",
};
