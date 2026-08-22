import client from "./client";

export async function createActivity(stopId, { name, category, cost, day_offset }) {
  const { data } = await client.post(`/stops/${stopId}/activities/`, {
    name,
    category,
    cost,
    day_offset,
  });
  return data;
}

export async function listActivities(stopId) {
  const { data } = await client.get(`/stops/${stopId}/activities/`);
  return data;
}

export async function deleteActivity(stopId, activityId) {
  const { data } = await client.delete(`/stops/${stopId}/activities/${activityId}`);
  return data;
}
