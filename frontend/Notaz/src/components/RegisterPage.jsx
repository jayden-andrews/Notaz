import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passwordHash: password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || 'Registration failed. That email may already be in use.');
        return;
      }

      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/clef-select');
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

        <h1 className="auth__title">Create account</h1>
        <p className="auth__sub">Start learning to read music today.</p>

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
              autoComplete="new-password"
            />
          </div>

          <div className="auth__field">
            <label className="auth__label" htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              className="auth__input"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="auth__error">{error}</p>}

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth__switch">
          Already have an account?{' '}
          <Link className="auth__link" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}