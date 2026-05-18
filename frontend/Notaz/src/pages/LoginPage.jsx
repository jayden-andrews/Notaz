import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Invalid email or password.');
        return;
      }

      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      {/* Background staff lines */}
      <div className="staff-bg" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="staff-line" style={{ top: `${30 + i * 12}%` }} />
        ))}
      </div>

      <div className="auth__card">
        {/* Brand */}
        <div className="auth__brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <span className="auth__brand-icon">𝄞</span>
          <span className="auth__brand-name">Notaz</span>
        </div>

        <h1 className="auth__title">Welcome back</h1>
        <p className="auth__sub">Sign in to continue your practice.</p>

        <form className="auth__form" onSubmit={handleSubmit}>
          <div className="auth__field">
            <label className="auth__label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth__field">
            <label className="auth__label" htmlFor="password">Password</label>
            <input
              id="password"
              className="auth__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth__error">{error}</p>}

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth__switch">
          Don't have an account?{' '}
          <Link className="auth__link" to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}