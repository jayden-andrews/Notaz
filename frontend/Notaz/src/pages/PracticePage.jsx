import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './PracticePage.css';

const SESSION_LENGTH = 10;

// ── Staff positions for rendering ───────────────────────────────
const TREBLE_Y = {
  'C6': 8,
  'B5': 16,
  'A5': 24,
  'G5': 32,
  'F5': 40,
  'E5': 48,
  'D5': 56,
  'C5': 64,
  'B4': 72,
  'A4': 80,
  'G4': 88,
  'F4': 96,
  'E4': 104,
  'D6': 0,
  'E6': -8,
  'F6': -16,
};

const BASS_Y = {
  'A3': 40, 'G3': 48, 'F3': 56, 'E3': 64,
  'D3': 72, 'C3': 80, 'B2': 88, 'A2': 96, 'G2': 104,
};

// All clickable positions on the staff for place-the-note mode
const TREBLE_POSITIONS = [
  { name: 'F6', y: -16 }, { name: 'E6', y: -8 }, { name: 'D6', y: 0 },
  { name: 'C6', y: 8 },   { name: 'B5', y: 16 },  { name: 'A5', y: 24 },
  { name: 'G5', y: 32 },  { name: 'F5', y: 40 },  { name: 'E5', y: 48 },
  { name: 'D5', y: 56 },  { name: 'C5', y: 64 },  { name: 'B4', y: 72 },
  { name: 'A4', y: 80 },  { name: 'G4', y: 88 },  { name: 'F4', y: 96 },
  { name: 'E4', y: 104 },
];

const BASS_POSITIONS = [
  { name: 'A3', y: 40 }, { name: 'G3', y: 48 }, { name: 'F3', y: 56 },
  { name: 'E3', y: 64 }, { name: 'D3', y: 72 }, { name: 'C3', y: 80 },
  { name: 'B2', y: 88 }, { name: 'A2', y: 96 }, { name: 'G2', y: 104 },
];

// ── Staff SVG for multiple choice ──────────────────────────────
function StaffWithNote({ noteName, clef }) {
  const positions = clef === 'TREBLE' ? TREBLE_Y : BASS_Y;
  const noteY = positions[noteName] ?? 72;
  const lineY = [40, 56, 72, 88, 104];
  const needsLedger = noteName === 'E4' || noteName === 'G2';

  return (
    <svg className="practice-staff-svg" viewBox="0 -30 240 180" xmlns="http://www.w3.org/2000/svg">
      {lineY.map((y, i) => (
        <line key={i} x1="20" y1={y} x2="220" y2={y}
          stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}
      <text x="22" y={clef === 'TREBLE' ? 108 : 92}
        fontSize={clef === 'TREBLE' ? "72" : "52"}
        fill="var(--color-ink)" fontFamily="serif" opacity="0.2">
        {clef === 'TREBLE' ? '𝄞' : '𝄢'}
      </text>
      {needsLedger && (
        <line x1="108" y1="104" x2="140" y2="104"
          stroke="var(--color-ink)" strokeWidth="1.2" />
      )}
      <ellipse cx="124" cy={noteY} rx="10" ry="7.5"
        fill="var(--color-ink)"
        transform={`rotate(-15, 124, ${noteY})`} />
      <line x1="133" y1={noteY} x2="133" y2={noteY - 40}
        stroke="var(--color-ink)" strokeWidth="1.5" />
    </svg>
  );
}

// ── Interactive staff for place-the-note mode ──────────────────
function InteractiveStaff({ clef, onPlace, placedNote, correctNote, submitted }) {
  const positions = clef === 'TREBLE' ? TREBLE_POSITIONS : BASS_POSITIONS;
  const lineY = [40, 56, 72, 88, 104];

  const getNoteColor = (name) => {
    if (!submitted) return placedNote === name ? 'var(--color-ink)' : 'transparent';
    if (name === correctNote) return 'var(--color-correct)';
    if (name === placedNote && placedNote !== correctNote) return 'var(--color-incorrect)';
    return 'transparent';
  };

  const getStrokeColor = (name) => {
    if (!submitted && placedNote === name) return 'var(--color-ink)';
    if (submitted && name === correctNote) return 'var(--color-correct)';
    if (submitted && name === placedNote && placedNote !== correctNote) return 'var(--color-incorrect)';
    return 'rgba(14,14,14,0.15)';
  };

  return (
    <svg className="practice-staff-svg practice-staff-svg--interactive"
      viewBox="0 -30 240 180" xmlns="http://www.w3.org/2000/svg">
      {lineY.map((y, i) => (
        <line key={i} x1="20" y1={y} x2="220" y2={y}
          stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}
      <text x="22" y={clef === 'TREBLE' ? 108 : 92}
        fontSize={clef === 'TREBLE' ? "72" : "52"}
        fill="var(--color-ink)" fontFamily="serif" opacity="0.2">
        {clef === 'TREBLE' ? '𝄞' : '𝄢'}
      </text>
      {positions.map((pos) => (
        <g key={pos.name} onClick={() => !submitted && onPlace(pos.name)}
          style={{ cursor: submitted ? 'default' : 'pointer' }}>
          <rect x="80" y={pos.y - 8} width="80" height="16" fill="transparent" />
          <ellipse cx="124" cy={pos.y} rx="10" ry="7.5"
            fill={getNoteColor(pos.name)}
            stroke={getStrokeColor(pos.name)}
            strokeWidth="1.2"
            transform={`rotate(-15, 124, ${pos.y})`}
            opacity={placedNote === pos.name || (submitted && pos.name === correctNote) ? 1 : 0.3}
          />
          {placedNote === pos.name && (
            <line x1="133" y1={pos.y} x2="133" y2={pos.y - 40}
              stroke={submitted
                ? (placedNote === correctNote ? 'var(--color-correct)' : 'var(--color-incorrect)')
                : 'var(--color-ink)'}
              strokeWidth="1.5" />
          )}
        </g>
      ))}
      {(placedNote === 'E4' || placedNote === 'G2' ||
        (submitted && (correctNote === 'E4' || correctNote === 'G2'))) && (
        <line x1="108" y1="104" x2="140" y2="104"
          stroke="var(--color-ink)" strokeWidth="1.2" />
      )}
    </svg>
  );
}

// ── Results screen ───────────────────────────────────────────────
function ResultsScreen({ results, onRestart, onChangeClef }) {
  const correct = results.filter(r => r.correct).length;
  const accuracy = Math.round((correct / results.length) * 100);

  return (
    <div className="results">
      <div className="results__score">
        <span className="results__score-num">{accuracy}%</span>
        <span className="results__score-label">Accuracy</span>
      </div>
      <p className="results__summary">{correct} out of {results.length} correct</p>
      <div className="results__breakdown">
        {results.map((r, i) => (
          <div key={i} className={`results__item ${r.correct ? 'results__item--correct' : 'results__item--wrong'}`}>
            <span className="results__item-num">{i + 1}</span>
            <span className="results__item-note">{r.noteName}</span>
            <span className="results__item-mode">{r.mode === 'choice' ? 'Multiple Choice' : 'Place Note'}</span>
            <span className="results__item-icon">{r.correct ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>
      <div className="results__actions">
        <button className="btn btn--primary" onClick={onRestart}>Practice Again</button>
        <button className="btn btn--ghost" onClick={onChangeClef}>Change Clef</button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function PracticePage() {
  const navigate = useNavigate();
  const bassUnlocked = localStorage.getItem('notaz_bass_unlocked') === 'true';

  const [clef, setClef] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [placedNote, setPlacedNote] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionDone, setSessionDone] = useState(false);

  // Derive mode directly from the queue — never store as separate state
  const currentExercise = sessionQueue[currentIdx];
  const mode = currentExercise?.mode ?? 'choice';

  // Shuffle choices once per exercise index
  const shuffledChoices = useMemo(() => {
    if (!currentExercise) return [];
    return [...currentExercise.choices].sort(() => Math.random() - 0.5);
  }, [currentIdx]);

  console.log('currentIdx:', currentIdx);
    console.log('sessionQueue length:', sessionQueue.length);
    console.log('currentExercise:', currentExercise);
    console.log('mode:', mode);

  const buildSession = (data) => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const queue = shuffled.slice(0, SESSION_LENGTH).map((ex) => ({
      ...ex,
      mode: Math.random() > 0.5 ? 'choice' : 'place',
    }));
    setSessionQueue(queue);
    setCurrentIdx(0);
    setResults([]);
    setSessionDone(false);
    setSelectedAnswer(null);
    setPlacedNote(null);
    setSubmitted(false);
    setIsCorrect(null);
  };

  const fetchExercises = useCallback(async (selectedClef) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8080/api/exercises?clef=${selectedClef}`);
      if (!res.ok) throw new Error('Failed to fetch exercises');
      const data = await res.json();
      setExercises(data);
      buildSession(data);
    } catch (err) {
      setError('Could not load exercises. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClefSelect = (selectedClef) => {
    setClef(selectedClef);
    fetchExercises(selectedClef);
  };

  const handleChoiceSelect = (noteName) => {
    if (submitted) return;
    setSelectedAnswer(noteName);
  };

  const handleSubmit = async () => {
    if (submitted) return;
    const answer = mode === 'choice' ? selectedAnswer : placedNote;
    if (!answer) return;

    const correct = answer === currentExercise.targetNote.name;
    setIsCorrect(correct);
    setSubmitted(true);

    setResults((prev) => [...prev, {
      noteName: currentExercise.targetNote.name,
      mode,
      correct,
    }]);

    try {
      await fetch('http://localhost:8080/api/exercises/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: currentExercise.id,
          userAnswer: answer,
        }),
      });
    } catch (err) {
      // Non-blocking
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= SESSION_LENGTH) {
      setSessionDone(true);
      return;
    }
    setCurrentIdx(currentIdx + 1);
    setSelectedAnswer(null);
    setPlacedNote(null);
    setSubmitted(false);
    setIsCorrect(null);
  };

  const handleRestart = () => buildSession(exercises);

  const handleChangeClef = () => {
    setClef(null);
    setExercises([]);
    setSessionQueue([]);
  };

  // ── Clef selection ─────────────────────────────────────────────
  if (!clef) {
    return (
      <div className="practice-page">
        <NavBar />
        <main className="practice practice--select">
          <div className="practice__header">
            <h1 className="practice__title">Practice</h1>
            <p className="practice__sub">Choose a clef to start your 10-exercise session.</p>
          </div>
          <div className="practice__clef-cards">
            <button className="clef-card" onClick={() => handleClefSelect('TREBLE')}>
              <span className="clef-card__symbol">𝄞</span>
              <span className="clef-card__name">Treble Clef</span>
              <span className="clef-card__desc">E4 – F5</span>
            </button>
            <button
              className={`clef-card ${!bassUnlocked ? 'clef-card--locked' : ''}`}
              onClick={() => bassUnlocked && handleClefSelect('BASS')}
              disabled={!bassUnlocked}
            >
              <span className="clef-card__symbol">𝄢</span>
              <span className="clef-card__name">Bass Clef</span>
              <span className="clef-card__desc">
                {bassUnlocked ? 'G2 – A3' : '🔒 Complete Learn → Treble first'}
              </span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="practice-page">
        <NavBar />
        <main className="practice practice--center">
          <div className="practice__loading">
            <span className="practice__loading-clef">𝄞</span>
            <p>Loading exercises…</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="practice-page">
        <NavBar />
        <main className="practice practice--center">
          <p className="practice__error">{error}</p>
          <button className="btn btn--ghost" onClick={() => fetchExercises(clef)}>Retry</button>
        </main>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────
  if (sessionDone) {
    return (
      <div className="practice-page">
        <NavBar />
        <main className="practice">
          <div className="practice__header">
            <h1 className="practice__title">Session Complete</h1>
          </div>
          <ResultsScreen
            results={results}
            onRestart={handleRestart}
            onChangeClef={handleChangeClef}
          />
        </main>
      </div>
    );
  }

  if (!currentExercise) return null;

  // ── Exercise ───────────────────────────────────────────────────
  return (
    <div className="practice-page">
      <NavBar />
      <main className="practice">
        <div className="practice__header">
          <div className="practice__meta">
            <span className="practice__clef-badge">
              {clef === 'TREBLE' ? '𝄞 Treble' : '𝄢 Bass'}
            </span>
            <span className="practice__mode-badge">
              {mode === 'choice' ? 'Identify the Note' : 'Place the Note'}
            </span>
          </div>
          <div className="practice__progress-bar">
            <div
              className="practice__progress-fill"
              style={{ width: `${(currentIdx / SESSION_LENGTH) * 100}%` }}
            />
          </div>
          <p className="practice__progress-label">
            Exercise {currentIdx + 1} of {SESSION_LENGTH}
          </p>
        </div>

        <div className="practice__card" key={currentIdx}>
          {mode === 'choice' ? (
            <>
              <p className="practice__prompt">What note is this?</p>
              <div className="practice__staff-wrap">
                <StaffWithNote noteName={currentExercise.targetNote.name} clef={clef} />
              </div>
              <div className="practice__choices">
                {shuffledChoices.map((note) => {
                  let cls = 'choice-btn';
                  if (submitted) {
                    if (note.name === currentExercise.targetNote.name) cls += ' choice-btn--correct';
                    else if (note.name === selectedAnswer) cls += ' choice-btn--wrong';
                    else cls += ' choice-btn--dim';
                  } else if (selectedAnswer === note.name) {
                    cls += ' choice-btn--selected';
                  }
                  return (
                    <button
                      key={note.name}
                      className={cls}
                      onClick={() => handleChoiceSelect(note.name)}
                      disabled={submitted}
                    >
                      {note.name}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="practice__prompt">
                Place <strong>{currentExercise.targetNote.name}</strong> on the staff
              </p>
              <div className="practice__staff-wrap">
                <InteractiveStaff
                  clef={clef}
                  onPlace={setPlacedNote}
                  placedNote={placedNote}
                  correctNote={currentExercise.targetNote.name}
                  submitted={submitted}
                />
              </div>
              <p className="practice__place-hint">
                {submitted
                  ? ''
                  : placedNote
                  ? `Selected: ${placedNote} — tap Submit to confirm`
                  : 'Tap a position on the staff to place the note'}
              </p>
            </>
          )}

          {submitted && (
            <div className={`practice__feedback ${isCorrect ? 'practice__feedback--correct' : 'practice__feedback--wrong'}`}>
              {isCorrect
                ? `✓ Correct! That's ${currentExercise.targetNote.name}.`
                : `✗ Not quite. The correct answer was ${currentExercise.targetNote.name}.`}
            </div>
          )}

          <div className="practice__actions">
            {!submitted ? (
              <button
                className="btn btn--primary"
                onClick={handleSubmit}
                disabled={mode === 'choice' ? !selectedAnswer : !placedNote}
              >
                Submit
              </button>
            ) : (
              <button className="btn btn--primary" onClick={handleNext}>
                {currentIdx + 1 >= SESSION_LENGTH ? 'See Results →' : 'Next →'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}