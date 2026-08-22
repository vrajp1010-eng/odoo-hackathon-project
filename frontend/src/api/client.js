import axios from "axios";

// Single source of truth for the backend URL — set in .env as VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Surface a clean, readable error message everywhere we call the API,
// so components don't each need to parse axios error shapes themselves.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "Something went wrong talking to the server.";
    return Promise.reject(new Error(message));
  }
);

export default client;
