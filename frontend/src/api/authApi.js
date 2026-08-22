import client from "./client";

// Fake auth by design: signup collects a name, while login only needs an email.
export async function signup({ name, email, password }) {
  const { data } = await client.post("/users/signup", { name, email, password });
  return data;
}

export async function login(email, password) {
  const { data } = await client.post("/users/login", { email, password });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await client.post("/users/forgot-password", { email });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await client.post("/users/reset-password", { token, password });
  return data;
}

export async function updateUser(userId, updates) {
  const { data } = await client.patch(`/users/${userId}`, updates);
  return data;
}
