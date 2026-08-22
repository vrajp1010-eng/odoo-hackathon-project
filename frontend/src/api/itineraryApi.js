import client from "./client";

// Returns the full trip with nested stops -> activities, per TripItinerary schema.
export async function getItinerary(tripId) {
  const { data } = await client.get(`/trips/${tripId}/itinerary/`);
  return data;
}
