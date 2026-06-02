import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './PracticePage.css';

const SESSION_LENGTH = 10;

// ── Staff Y positions (top of SVG = lowest y value) ────────────
const TREBLE_Y = {
  'E6': -24, 'D6': -16, 'C6': -8,
  'B5': 0,   'A5': 8,   'G5': 16,
  'F5': 24,  'E5': 32,  'D5': 40,
  'C5': 48,  'B4': 56,  'A4': 64,
  'G4': 72,  'F4': 80,  'E4': 88,
};

const BASS_Y = {
  'A4b': -24, 'G4b': -16, 'F4b': -8,
  'E4b': 0,   'D4b': 8,   'C4':  16,
  'B3':  24,  'A3':  32,  'G3':  40,
  'F3':  48,  'E3':  56,  'D3':  64,
  'C3':  72,  'B2':  80,  'A2':  88,
};

// Staff lines sit at these y values
const LINE_Y = [24, 40, 56, 72, 88];

// For treble clef, notes on/above middle line (B4 = y64) get stem down
// For bass clef, notes on/above middle line (D3 = y72) get stem down
const getStemDown = (noteY) => noteY <= 56;

const TREBLE_POSITIONS = Object.entries(TREBLE_Y)
  .sort((a, b) => a[1] - b[1])
  .map(([name, y]) => ({ name, y }));

const BASS_POSITIONS = Object.entries(BASS_Y)
  .sort((a, b) => a[1] - b[1])
  .map(([name, y]) => ({ name, y }));

// ── Octave explanation map ──────────────────────────────────────
const OCTAVE_HINT = {
  2: 'Octave 2 — very low register',
  3: 'Octave 3 — low register',
  4: 'Octave 4 — middle register',
  5: 'Octave 5 — upper register',
  6: 'Octave 6 — high register',
};

function getOctave(noteName) {
  const match = noteName.match(/\d/);
  return match ? parseInt(match[0]) : null;
}

// ── Leger line helper ───────────────────────────────────────────
// Staff lines at 40, 56, 72, 88, 104
// Above staff: first leger line at 24, then 8, -8, -24...
// Below staff: first leger line at 120, then 136...
function getLegerLines(noteY) {
  const lines = [];
  if (noteY <= 8) {
    for (let y = 8; y >= noteY - 4; y -= 16) lines.push(y);
  }
  if (noteY >= 104) {
    for (let y = 104; y <= noteY + 4; y += 16) lines.push(y);
  }
  return lines;
}

// ── Note component ──────────────────────────────────────────────
function NoteHead({ cx, cy, fill, stroke, strokeWidth, opacity, stemDown, showStem, stemColor }) {
  const stemX1 = stemDown ? cx - 9 : cx + 9;
  const stemX2 = stemX1;
  const stemY2 = stemDown ? cy + 40 : cy - 40;

  return (
    <g>
      <ellipse
        cx={cx} cy={cy}
        rx="10" ry="7.5"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth ?? 0}
        transform={`rotate(-15, ${cx}, ${cy})`}
        opacity={opacity ?? 1}
      />
      {showStem && (
        <line
          x1={stemX1} y1={cy}
          x2={stemX2} y2={stemY2}
          stroke={stemColor ?? fill}
          strokeWidth="1.5"
        />
      )}
    </g>
  );
}

// ── Staff SVG for multiple choice ──────────────────────────────
function StaffWithNote({ noteName, clef }) {
  const yMap = clef === 'TREBLE' ? TREBLE_Y : BASS_Y;
  const noteY = yMap[noteName] ?? 72;
  const stemDown = getStemDown(noteY);
  const legerLines = getLegerLines(noteY);

  return (
    <svg className="practice-staff-svg" viewBox="0 -40 240 190" xmlns="http://www.w3.org/2000/svg">
      {LINE_Y.map((y, i) => (
        <line key={i} x1="20" y1={y} x2="220" y2={y}
          stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}
      <text x="22" y={clef === 'TREBLE' ? 108 : 92}
        fontSize={clef === 'TREBLE' ? '72' : '52'}
        fill="var(--color-ink)" fontFamily="serif" opacity="0.2">
        {clef === 'TREBLE' ? '𝄞' : '𝄢'}
      </text>
      {legerLines.map((ly, i) => (
        <line key={`leger-${i}`} x1="108" y1={ly} x2="140" y2={ly}
          stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}
      <NoteHead
        cx={124} cy={noteY}
        fill="var(--color-ink)"
        showStem={true}
        stemDown={stemDown}
        stemColor="var(--color-ink)"
      />
    </svg>
  );
}

// ── Interactive staff for place-the-note ───────────────────────
function InteractiveStaff({ clef, onPlace, placedNote, correctNote, submitted }) {
  const positions = clef === 'TREBLE' ? TREBLE_POSITIONS : BASS_POSITIONS;

  const getFill = (name) => {
    if (!submitted) return placedNote === name ? 'var(--color-ink)' : 'transparent';
    if (name === correctNote) return 'var(--color-correct)';
    if (name === placedNote && placedNote !== correctNote) return 'var(--color-incorrect)';
    return 'transparent';
  };

  const getStroke = (name) => {
    if (!submitted && placedNote === name) return 'var(--color-ink)';
    if (submitted && name === correctNote) return 'var(--color-correct)';
    if (submitted && name === placedNote && placedNote !== correctNote) return 'var(--color-incorrect)';
    return 'rgba(14,14,14,0.15)';
  };

  const getStemColor = (name) => {
    if (!submitted) return 'var(--color-ink)';
    if (name === correctNote) return 'var(--color-correct)';
    if (name === placedNote) return 'var(--color-incorrect)';
    return 'var(--color-ink)';
  };

  const placedPos = positions.find(p => p.name === placedNote);
  const correctPos = positions.find(p => p.name === correctNote);

  return (
    <svg className="practice-staff-svg practice-staff-svg--interactive"
      viewBox="0 -40 240 190" xmlns="http://www.w3.org/2000/svg">

      {LINE_Y.map((y, i) => (
        <line key={i} x1="20" y1={y} x2="220" y2={y}
          stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}
      <text x="22" y={clef === 'TREBLE' ? 108 : 92}
        fontSize={clef === 'TREBLE' ? '72' : '52'}
        fill="var(--color-ink)" fontFamily="serif" opacity="0.2">
        {clef === 'TREBLE' ? '𝄞' : '𝄢'}
      </text>

      {/* Leger lines for placed note */}
      {placedPos && getLegerLines(placedPos.y).map((ly, i) => (
        <line key={`lp-${i}`} x1="108" y1={ly} x2="140" y2={ly}
          stroke={submitted
            ? (placedNote === correctNote ? 'var(--color-correct)' : 'var(--color-incorrect)')
            : 'var(--color-ink)'}
          strokeWidth="1.2" />
      ))}

      {/* Leger lines for correct note after wrong answer */}
      {submitted && correctNote !== placedNote && correctPos &&
        getLegerLines(correctPos.y).map((ly, i) => (
          <line key={`lc-${i}`} x1="108" y1={ly} x2="140" y2={ly}
            stroke="var(--color-correct)" strokeWidth="1.2" />
        ))
      }

      {positions.map((pos) => {
        const isPlaced = placedNote === pos.name;
        const isCorrectPos = submitted && pos.name === correctNote;
        const showNote = isPlaced || isCorrectPos;
        const stemDown = getStemDown(pos.y);

        return (
          <g key={pos.name}
            onClick={() => !submitted && onPlace(pos.name)}
            style={{ cursor: submitted ? 'default' : 'pointer' }}>
            <rect x="80" y={pos.y - 8} width="80" height="16" fill="transparent" />
            <NoteHead
              cx={124} cy={pos.y}
              fill={getFill(pos.name)}
              stroke={getStroke(pos.name)}
              strokeWidth={1.2}
              opacity={showNote ? 1 : 0.2}
              showStem={isPlaced || isCorrectPos}
              stemDown={stemDown}
              stemColor={getStemColor(pos.name)}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ── Results screen ──────────────────────────────────────────────
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

// ── Main component ──────────────────────────────────────────────
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

  const currentExercise = sessionQueue[currentIdx];
  const mode = currentExercise?.mode ?? 'choice';

  // Fix: depend on exercise id so shuffle is stable per exercise
  const shuffledChoices = useMemo(() => {
    if (!currentExercise?.choices?.length) return [];
    return [...currentExercise.choices].sort(() => Math.random() - 0.5);
  }, [currentExercise?.id]);

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
      if (!res.ok) throw new Error('Failed to fetch');
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
    setResults(prev => [...prev, { noteName: currentExercise.targetNote.name, mode, correct }]);

    try {
      await fetch('http://localhost:8080/api/exercises/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: currentExercise.id, userAnswer: answer }),
      });
    } catch (_) {}
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

  // ── Clef selection ──────────────────────────────────────────
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
              <span className="clef-card__desc">E4 – E6</span>
            </button>
            <button
              className={`clef-card ${!bassUnlocked ? 'clef-card--locked' : ''}`}
              onClick={() => bassUnlocked && handleClefSelect('BASS')}
              disabled={!bassUnlocked}
            >
              <span className="clef-card__symbol">𝄢</span>
              <span className="clef-card__name">Bass Clef</span>
              <span className="clef-card__desc">
                {bassUnlocked ? 'A2 – A4' : '🔒 Complete Learn → Treble first'}
              </span>
            </button>
          </div>
        </main>
      </div>
    );
  }

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

  if (sessionDone) {
    return (
      <div className="practice-page">
        <NavBar />
        <main className="practice">
          <div className="practice__header">
            <h1 className="practice__title">Session Complete</h1>
          </div>
          <ResultsScreen results={results} onRestart={handleRestart} onChangeClef={handleChangeClef} />
        </main>
      </div>
    );
  }

  if (!currentExercise) return null;

  const noteName = currentExercise.targetNote.name;
  const octave = getOctave(noteName);
  const octaveHint = octave ? OCTAVE_HINT[octave] : null;

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
            <div className="practice__progress-fill"
              style={{ width: `${(currentIdx / SESSION_LENGTH) * 100}%` }} />
          </div>
          <p className="practice__progress-label">Exercise {currentIdx + 1} of {SESSION_LENGTH}</p>
        </div>

        <div className="practice__card" key={currentIdx}>
          {mode === 'choice' ? (
            <>
              <p className="practice__prompt">What note is this?</p>
              <div className="practice__staff-wrap">
                <StaffWithNote noteName={noteName} clef={clef} />
              </div>
              <div className="practice__choices">
                {shuffledChoices.map((note) => {
                  let cls = 'choice-btn';
                  if (submitted) {
                    if (note.name === noteName) cls += ' choice-btn--correct';
                    else if (note.name === selectedAnswer) cls += ' choice-btn--wrong';
                    else cls += ' choice-btn--dim';
                  } else if (selectedAnswer === note.name) {
                    cls += ' choice-btn--selected';
                  }
                  return (
                    <button key={note.name} className={cls}
                      onClick={() => handleChoiceSelect(note.name)}
                      disabled={submitted}>
                      {note.name}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="practice__place-header">
                <p className="practice__prompt">
                  Place <strong>{noteName}</strong> on the staff
                </p>
                {octaveHint && (
                  <p className="practice__octave-hint">{octaveHint}</p>
                )}
              </div>
              <div className="practice__staff-wrap">
                <InteractiveStaff
                  clef={clef}
                  onPlace={setPlacedNote}
                  placedNote={placedNote}
                  correctNote={noteName}
                  submitted={submitted}
                />
              </div>
              <p className="practice__place-hint">
                {submitted ? '' : placedNote
                  ? `Selected: ${placedNote} — tap Submit to confirm`
                  : 'Tap a position on the staff to place the note'}
              </p>
            </>
          )}

          {/* Octave hint for multiple choice too */}
          {mode === 'choice' && submitted && octaveHint && (
            <p className="practice__octave-hint practice__octave-hint--reveal">{octaveHint}</p>
          )}

          {submitted && (
            <div className={`practice__feedback ${isCorrect ? 'practice__feedback--correct' : 'practice__feedback--wrong'}`}>
              {isCorrect
                ? `✓ Correct! That's ${noteName}.`
                : `✗ Not quite. The correct answer was ${noteName}.`}
            </div>
          )}

          <div className="practice__actions">
            {!submitted ? (
              <button className="btn btn--primary" onClick={handleSubmit}
                disabled={mode === 'choice' ? !selectedAnswer : !placedNote}>
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