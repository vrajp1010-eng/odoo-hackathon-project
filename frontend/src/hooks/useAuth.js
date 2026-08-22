import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "globetrotter_user";

// Fake auth by design (no passwords) — we just persist {id, name, email}
// from the backend's signup/login response in localStorage.
export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const saveUser = useCallback((u) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  return { user, saveUser, logout, isAuthenticated: !!user };
}
