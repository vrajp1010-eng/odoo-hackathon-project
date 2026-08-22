import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
    if (!password)     return 'Password is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data.user, data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (idx) => {
    setEmail(`${'alice bob carol'.split(' ')[idx]}@example.com`);
    setPassword(`Password${idx + 1}!`);
    setError('');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>GlobeTrotter</h1>
          <p>Sign in to plan your next adventure</p>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="alice@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            id="login-submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          No account?&nbsp;<Link to="/signup">Create one free</Link>
        </div>

        <div className="divider" />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>
          Demo accounts
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Alice (alice@example.com)', 'Bob (bob@example.com)', 'Carol (carol@example.com)'].map((label, i) => (
            <button
              key={label}
              id={`demo-user-${i}`}
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'center' }}
              type="button"
              onClick={() => fillDemo(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
