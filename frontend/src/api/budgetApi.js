import client from "./client";

// Backend returns { total_cost, by_category: {cat: cost}, by_stop: {city: cost} }
// per BudgetResponse schema — the backend is the source of truth for this math.
export async function getBudget(tripId) {
  const { data } = await client.get(`/trips/${tripId}/budget/`);
  return data;
}
