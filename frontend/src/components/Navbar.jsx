import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout, apiStatus }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={user ? '/dashboard' : '/login'} className="navbar-brand">
          GlobeTrotter
        </Link>

        <div className="navbar-links">
          {/* API status dot */}
          <span className={`api-status ${apiStatus === 'ok' ? 'ok' : 'err'}`}>
            <span className="api-status-dot" />
            {apiStatus === 'ok' ? 'API online' : apiStatus === 'checking' ? 'Connecting…' : 'API offline'}
          </span>

          {user ? (
            <>
              <Link to="/trips"     className="btn btn-ghost btn-sm">My Trips</Link>
              <Link to="/trips/new" className="btn btn-outline btn-sm">+ New Trip</Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
