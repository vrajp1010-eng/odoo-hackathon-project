import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout, apiStatus }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/login'} className="navbar-brand">
          GLOBETROTTER
        </Link>

        {/* Center/Nav Links */}
        {user && (
          <div className="navbar-links" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
            <Link to="/trips" className={`nav-link ${isActive('/trips')}`}>My Trips</Link>
          </div>
        )}

        {/* Right side actions */}
        <div className="navbar-links" style={{ gap: '16px' }}>
          {user ? (
            <>
              <Link to="/trips/new" className="btn btn-primary btn-sm">Plan a Trip</Link>
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm" style={{ padding: '8px 24px' }}>Get Started</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
