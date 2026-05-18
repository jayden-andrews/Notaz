import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Background staff lines */}
      <div className="staff-bg" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="staff-line" style={{ top: `${30 + i * 12}%` }} />
        ))}
      </div>

      {/* Floating note decorations */}
      <div className="note-decor note-decor--1" aria-hidden="true">♩</div>
      <div className="note-decor note-decor--2" aria-hidden="true">♪</div>
      <div className="note-decor note-decor--3" aria-hidden="true">♫</div>
      <div className="note-decor note-decor--4" aria-hidden="true">♬</div>

      <main className="home__content">
        {/* Logo / Brand */}
        <div className="home__brand">
          <span className="home__brand-icon">𝄞</span>
          <h1 className="home__title">Notaz</h1>
        </div>

        <p className="home__tagline">
          Learn to read sheet music.<br />
          <em>One note at a time.</em>
        </p>

        <div className="home__divider" aria-hidden="true" />

        <p className="home__sub">
          Interactive exercises for beginners. Build confidence and fluency in reading music — no prior experience needed.
        </p>

        {/* CTAs */}
        <div className="home__actions">
          <button
            className="btn btn--primary"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
          <button
            className="btn btn--ghost"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
        </div>

        {/* Feature pills */}
        <div className="home__features">
          {['Treble & Bass Clef', 'Instant Feedback', 'Track Your Progress'].map((f) => (
            <span key={f} className="home__feature-pill">{f}</span>
          ))}
        </div>
      </main>
    </div>
  );
}