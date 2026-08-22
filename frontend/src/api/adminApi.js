import client from "./client";

export async function getAdminAnalytics(userId) {
  const { data } = await client.get("/admin/analytics", { params: { user_id: userId } });
  return data;
}
