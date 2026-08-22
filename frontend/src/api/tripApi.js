import client from "./client";

export async function createTrip({ user_id, name, start_date, end_date, description, cover_photo }) {
  const { data } = await client.post("/trips/", {
    user_id,
    name,
    start_date,
    end_date,
    description,
    cover_photo,
  });
  return data;
}

export async function listTrips(userId) {
  const { data } = await client.get("/trips/", { params: { user_id: userId } });
  return data;
}

export async function getTrip(tripId) {
  const { data } = await client.get(`/trips/${tripId}`);
  return data;
}

export async function updateTrip(tripId, updates) {
  const { data } = await client.patch(`/trips/${tripId}`, updates);
  return data;
}

export async function deleteTrip(tripId) {
  const { data } = await client.delete(`/trips/${tripId}`);
  return data;
}
