import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CreateTripPage from "./pages/CreateTripPage";
import BuilderPage from "./pages/BuilderPage";
import ItineraryPage from "./pages/ItineraryPage";
import BudgetPage from "./pages/BudgetPage";
import SharePage from "./pages/SharePage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminPage from "./pages/AdminPage";

// Wraps authenticated routes in the shared Layout (navbar + responsive nav).
// Redirects to /login if there's no user in local state.
function ProtectedLayout({ user, onLogout, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout user={user} onLogout={onLogout}>
      {children}
    </Layout>
  );
}

export default function App() {
  const { user, saveUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <LoginPage onAuthenticated={saveUser} />
        }
      />
      <Route
        path="/signup"
        element={
          user ? <Navigate to="/dashboard" replace /> : <SignupPage onAuthenticated={saveUser} />
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout user={user} onLogout={handleLogout}>
            <DashboardPage user={user} />
          </ProtectedLayout>
        }
      />
      <Route
        path="/trips/new"
        element={
          <ProtectedLayout user={user} onLogout={handleLogout}>
            <CreateTripPage user={user} />
          </ProtectedLayout>
        }
      />
      <Route
        path="/trips/:tripId/builder"
        element={
          <ProtectedLayout user={user} onLogout={handleLogout}>
            <BuilderPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/trips/:tripId/itinerary"
        element={
          <ProtectedLayout user={user} onLogout={handleLogout}>
            <ItineraryPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/trips/:tripId/budget"
        element={
          <ProtectedLayout user={user} onLogout={handleLogout}>
            <BudgetPage />
          </ProtectedLayout>
        }
      />
      <Route path="/trips/:tripId/share" element={<SharePage />} />
      <Route
        path="/profile"
        element={
          <ProtectedLayout user={user} onLogout={handleLogout}>
            <ProfilePage user={user} onUserUpdated={saveUser} />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedLayout user={user} onLogout={handleLogout}>
            {user?.is_admin ? <AdminPage user={user} /> : <Navigate to="/dashboard" replace />}
          </ProtectedLayout>
        }
      />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
