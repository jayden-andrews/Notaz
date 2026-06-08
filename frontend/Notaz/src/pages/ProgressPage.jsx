import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './ProgressPage.css';

function computeStats(sessions, clef) {
  const filtered = sessions.filter(s => s.clef === clef);
  if (filtered.length === 0) return null;

  const allAttempts = filtered.flatMap(s => s.results);
  const correct = allAttempts.filter(r => r.correct).length;
  const total = allAttempts.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const sessionsCount = filtered.length;
  const lastSession = filtered[filtered.length - 1];
  const lastDate = new Date(lastSession.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Best session accuracy
  const bestAccuracy = Math.max(...filtered.map(s => {
    const c = s.results.filter(r => r.correct).length;
    return Math.round((c / s.results.length) * 100);
  }));

  return { accuracy, sessionsCount, correct, total, lastDate, bestAccuracy };
}

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span className="stat-row__label">{label}</span>
      <span className="stat-row__value">{value}</span>
    </div>
  );
}

function ClefCard({ clef, symbol, stats, locked }) {
  const navigate = useNavigate();

  if (locked) {
    return (
      <div className="clef-progress-card clef-progress-card--locked">
        <div className="clef-progress-card__header">
          <span className="clef-progress-card__symbol">{symbol}</span>
          <div>
            <h2 className="clef-progress-card__name">{clef} Clef</h2>
            <p className="clef-progress-card__lock-msg">🔒 Complete Learn → Treble to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="clef-progress-card clef-progress-card--empty">
        <div className="clef-progress-card__header">
          <span className="clef-progress-card__symbol">{symbol}</span>
          <div>
            <h2 className="clef-progress-card__name">{clef} Clef</h2>
            <p className="clef-progress-card__empty-msg">No sessions yet — start practicing!</p>
          </div>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/practice')}
        >
          Start Practicing
        </button>
      </div>
    );
  }

  const accuracyColor = stats.accuracy >= 80
    ? 'var(--color-correct)'
    : stats.accuracy >= 50
    ? 'var(--color-ink)'
    : 'var(--color-incorrect)';

  return (
    <div className="clef-progress-card">
      <div className="clef-progress-card__header">
        <span className="clef-progress-card__symbol">{symbol}</span>
        <div>
          <h2 className="clef-progress-card__name">{clef} Clef</h2>
          <p className="clef-progress-card__last">Last practiced {stats.lastDate}</p>
        </div>
        <div className="clef-progress-card__accuracy" style={{ color: accuracyColor }}>
          {stats.accuracy}%
        </div>
      </div>

      <div className="clef-progress-card__divider" />

      <div className="clef-progress-card__stats">
        <StatRow label="Sessions completed"    value={stats.sessionsCount} />
        <StatRow label="Total exercises"       value={stats.total} />
        <StatRow label="Correct answers"       value={stats.correct} />
        <StatRow label="Overall accuracy"      value={`${stats.accuracy}%`} />
        <StatRow label="Best session"          value={`${stats.bestAccuracy}%`} />
      </div>

      {/* Accuracy bar */}
      <div className="clef-progress-card__bar-wrap">
        <div className="clef-progress-card__bar">
          <div
            className="clef-progress-card__bar-fill"
            style={{ width: `${stats.accuracy}%`, background: accuracyColor }}
          />
        </div>
        <span className="clef-progress-card__bar-label">Overall accuracy</span>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const bassUnlocked = localStorage.getItem('notaz_bass_unlocked') === 'true';
  const sessions = useMemo(() => {
    return JSON.parse(localStorage.getItem('notaz_sessions') || '[]');
  }, []);

  const trebleStats = useMemo(() => computeStats(sessions, 'TREBLE'), [sessions]);
  const bassStats   = useMemo(() => computeStats(sessions, 'BASS'),   [sessions]);
  const totalSessions = sessions.length;

  return (
    <div className="progress-page">
      <NavBar />

      <main className="progress">
        {/* Header */}
        <div className="progress__header">
          <h1 className="progress__title">Progress</h1>
          <p className="progress__sub">Your performance broken down by clef.</p>
        </div>

        {/* Summary strip */}
        {totalSessions > 0 && (
          <div className="progress__summary">
            <div className="summary-stat">
              <span className="summary-stat__value">{totalSessions}</span>
              <span className="summary-stat__label">Total Sessions</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat__value">
                {sessions.flatMap(s => s.results).length}
              </span>
              <span className="summary-stat__label">Total Exercises</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat__value">
                {(() => {
                  const all = sessions.flatMap(s => s.results);
                  const c = all.filter(r => r.correct).length;
                  return all.length > 0 ? `${Math.round((c / all.length) * 100)}%` : '—';
                })()}
              </span>
              <span className="summary-stat__label">Overall Accuracy</span>
            </div>
          </div>
        )}

        {/* Per-clef cards */}
        <div className="progress__cards">
          <ClefCard
            clef="Treble"
            symbol="𝄞"
            stats={trebleStats}
            locked={false}
          />
          <ClefCard
            clef="Bass"
            symbol="𝄢"
            stats={bassStats}
            locked={!bassUnlocked}
          />
        </div>

        {/* Empty state */}
        {totalSessions === 0 && (
          <div className="progress__empty">
            <span className="progress__empty-clef">𝄞</span>
            <p className="progress__empty-text">
              No practice sessions yet. Complete a session to see your progress here.
            </p>
            <button className="btn btn--primary" onClick={() => navigate('/practice')}>
              Start Practicing
            </button>
          </div>
        )}
      </main>
    </div>
  );
}