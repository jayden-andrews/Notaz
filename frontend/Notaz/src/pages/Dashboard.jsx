import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  // Pull user from localStorage — replace with auth context later
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Placeholder stats — wire to /api/progress once backend is ready
  const stats = [
    { label: 'Lessons Completed', value: '0' },
    { label: 'Avg. Accuracy',     value: '—' },
    { label: 'Clefs Practiced',   value: '0' },
  ];

  const cards = [
    {
      id: 'learn',
      clef: '𝄞',
      title: 'Learn',
      description: 'Study note positions on the staff. Reference guides for treble and bass clef with mnemonics.',
      action: 'Go to Learn',
      path: '/learn',
    },
    {
      id: 'practice',
      clef: '𝄢',
      title: 'Practice',
      description: 'Test your knowledge with interactive exercises. Pick a clef and identify notes on the staff.',
      action: 'Start Practicing',
      path: '/practice',
    },
  ];

  return (
    <div className="dashboard-page">
      <NavBar />

      <main className="dashboard">
        {/* ── Greeting ── */}
        <section className="dashboard__greeting">
          <div className="staff-bg" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="staff-line" style={{ top: `${20 + i * 15}%` }} />
            ))}
          </div>
          <div className="dashboard__greeting-content">
            <p className="dashboard__greeting-sub">Welcome back</p>
            <h1 className="dashboard__greeting-name">{user.email || 'Musician'}</h1>
          </div>
        </section>

        {/* ── Stats row ── */}
        <section className="dashboard__stats" aria-label="Progress summary">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-card__value">{s.value}</span>
              <span className="stat-card__label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* ── Learn + Practice cards ── */}
        <section className="dashboard__cards" aria-label="Main actions">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="action-card"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <span className="action-card__clef" aria-hidden="true">{card.clef}</span>
              <h2 className="action-card__title">{card.title}</h2>
              <p className="action-card__desc">{card.description}</p>
              <button
                className="btn btn--primary"
                onClick={() => navigate(card.path)}
              >
                {card.action}
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}