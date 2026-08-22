import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import PublicTrip from './pages/PublicTrip';

const API_BASE = 'http://localhost:8000';

export { API_BASE };

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('gt_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [apiStatus, setApiStatus] = useState('checking');

  // Health-check the API on mount
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(data => setApiStatus(data.status === 'ok' ? 'ok' : 'error'))
      .catch(() => setApiStatus('error'));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('gt_user', JSON.stringify(userData));
    localStorage.setItem('gt_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gt_user');
    localStorage.removeItem('gt_token');
    setUser(null);
  };

  const Protected = ({ children }) =>
    user ? children : <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={logout} apiStatus={apiStatus} />
      <Routes>
        {/* Public */}
        <Route path="/login"  element={<Login  onLogin={login} />} />
        <Route path="/signup" element={<Signup onLogin={login} />} />
        <Route path="/share/:slug" element={<PublicTrip />} />

        {/* Protected */}
        <Route path="/dashboard"        element={<Protected><Dashboard user={user} /></Protected>} />
        <Route path="/trips"            element={<Protected><MyTrips /></Protected>} />
        <Route path="/trips/new"        element={<Protected><CreateTrip user={user} /></Protected>} />
        <Route path="/trips/:id/build"  element={<Protected><ItineraryBuilder /></Protected>} />
        <Route path="/trips/:id"        element={<Protected><ItineraryView /></Protected>} />

        {/* Default */}
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
