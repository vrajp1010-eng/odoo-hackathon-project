import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT on every call ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: clear auth on 401 ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — wipe local storage so the app re-directs
      localStorage.removeItem('gt_token');
      localStorage.removeItem('gt_user');
    }
    return Promise.reject(error);
  },
);

export default api;
