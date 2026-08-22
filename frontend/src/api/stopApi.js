import client from "./client";

export async function createStop(tripId, { city_name, order_index, start_date, end_date }) {
  const { data } = await client.post(`/trips/${tripId}/stops/`, {
    city_name,
    order_index,
    start_date,
    end_date,
  });
  return data;
}

export async function listStops(tripId) {
  const { data } = await client.get(`/trips/${tripId}/stops/`);
  return data;
}

export async function deleteStop(tripId, stopId) {
  const { data } = await client.delete(`/trips/${tripId}/stops/${stopId}`);
  return data;
}

export async function reorderStops(tripId, stopIds) {
  const { data } = await client.patch(`/trips/${tripId}/stops/reorder`, { stop_ids: stopIds });
  return data;
}
