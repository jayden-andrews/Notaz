import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './LearnPage.css';

const TREBLE_NOTES = [
  { name: 'E4', position: 'Line 1 (bottom)',  mnemonic: 'Every',   hint: 'The very first line at the bottom of the staff.' },
  { name: 'F4', position: 'Space 1',          mnemonic: 'Fine',    hint: 'Sits in the first space, just above the bottom line.' },
  { name: 'G4', position: 'Line 2',           mnemonic: 'Good',    hint: 'Second line up — this is where the treble clef curls around.' },
  { name: 'A4', position: 'Space 2',          mnemonic: 'Boys',    hint: 'Second space. Middle of the lower half of the staff.' },
  { name: 'B4', position: 'Line 3 (middle)',  mnemonic: 'Do',      hint: 'The middle line of the staff.' },
  { name: 'C5', position: 'Space 3',          mnemonic: 'Fine',    hint: 'Third space — right above the middle line.' },
  { name: 'D5', position: 'Line 4',           mnemonic: 'Always',  hint: 'Fourth line up, entering the upper half.' },
  { name: 'E5', position: 'Space 4',          mnemonic: 'Good',    hint: 'Fourth space, near the top of the staff.' },
  { name: 'F5', position: 'Line 5 (top)',     mnemonic: 'Boys',    hint: 'The very top line of the staff.' },
];

const BASS_NOTES = [
  { name: 'G2', position: 'Line 1 (bottom)',  mnemonic: 'Good',    hint: 'The bottom line of the bass clef staff.' },
  { name: 'A2', position: 'Space 1',          mnemonic: 'Boys',    hint: 'First space, just above the bottom line.' },
  { name: 'B2', position: 'Line 2',           mnemonic: 'Do',      hint: 'Second line of the bass clef.' },
  { name: 'C3', position: 'Space 2',          mnemonic: 'Fine',    hint: 'Second space — this is middle C one octave down.' },
  { name: 'D3', position: 'Line 3 (middle)',  mnemonic: 'Always',  hint: 'The middle line of the bass clef staff.' },
  { name: 'E3', position: 'Space 3',          mnemonic: 'Good',    hint: 'Third space, above the middle line.' },
  { name: 'F3', position: 'Line 4',           mnemonic: 'Boys',    hint: 'Fourth line — the bass clef dots point to this line.' },
  { name: 'G3', position: 'Space 4',          mnemonic: 'Do',      hint: 'Fourth space, near the top.' },
  { name: 'A3', position: 'Line 5 (top)',     mnemonic: 'Fine',    hint: 'The top line of the bass clef staff.' },
];

const TREBLE_MNEMONICS = {
  lines:  { notes: 'E G B D F', phrase: 'Every Good Boy Does Fine' },
  spaces: { notes: 'F A C E',   phrase: 'FACE (spells itself!)' },
};

const BASS_MNEMONICS = {
  lines:  { notes: 'G B D F A', phrase: 'Good Boys Do Fine Always' },
  spaces: { notes: 'A C E G',   phrase: 'All Cows Eat Grass' },
};

// Staff SVG renderer
function StaffDisplay({ noteName, clef }) {
  const isTreeble = clef === 'treble';

  // Staff positions: index 0 = top line (line 5), going down
  // Lines at y: 40, 56, 72, 88, 104  (spacing 16px)
  const lineY = [40, 56, 72, 88, 104];

  // Map note name to y position on staff
  const treblePositions = {
    'F5': 40, 'E5': 48, 'D5': 56, 'C5': 64,
    'B4': 72, 'A4': 80, 'G4': 88, 'F4': 96, 'E4': 104,
  };
  const bassPositions = {
    'A3': 40, 'G3': 48, 'F3': 56, 'E3': 64,
    'D3': 72, 'C3': 80, 'B2': 88, 'A2': 96, 'G2': 104,
  };

  const positions = isTreeble ? treblePositions : bassPositions;
  const noteY = positions[noteName] ?? 72;
  const needsLedger = noteName === 'E4' || noteName === 'G2';

  return (
    <svg className="staff-svg" viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg">
      {/* Staff lines */}
      {lineY.map((y, i) => (
        <line key={i} x1="20" y1={y} x2="200" y2={y}
          stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}

      {/* Clef symbol */}
      <text x="22" y={isTreeble ? 108 : 92}
        fontSize={isTreeble ? "72" : "52"}
        fill="var(--color-ink)"
        fontFamily="serif"
        opacity="0.15"
      >
        {isTreeble ? '𝄞' : '𝄢'}
      </text>

      {/* Ledger line for bottom E (treble) or G (bass) */}
      {needsLedger && (
        <line x1="100" y1="104" x2="130" y2="104"
          stroke="var(--color-ink)" strokeWidth="1.2" />
      )}

      {/* Note head */}
      <ellipse
        cx="115" cy={noteY}
        rx="10" ry="7.5"
        fill="var(--color-ink)"
        transform={`rotate(-15, 115, ${noteY})`}
      />

      {/* Stem */}
      <line
        x1="124" y1={noteY}
        x2="124" y2={noteY - 40}
        stroke="var(--color-ink)" strokeWidth="1.5"
      />

      {/* Note label below staff */}
      <text x="115" y="138" textAnchor="middle"
        fontSize="13" fontFamily="var(--font-display)"
        fill="var(--color-ink)" fontWeight="600"
      >
        {noteName}
      </text>
    </svg>
  );
}

export default function LearnPage() {
  const navigate = useNavigate();
  const [activeClef, setActiveClef] = useState('treble');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seenNotes, setSeenNotes] = useState(() => {
    const saved = localStorage.getItem('notaz_treble_seen');
    return saved ? JSON.parse(saved) : [];
  });
  const [bassUnlocked, setBassUnlocked] = useState(() => {
    return localStorage.getItem('notaz_bass_unlocked') === 'true';
  });
  const [showMnemonics, setShowMnemonics] = useState(false);

  const notes = activeClef === 'treble' ? TREBLE_NOTES : BASS_NOTES;
  const mnemonics = activeClef === 'treble' ? TREBLE_MNEMONICS : BASS_MNEMONICS;
  const currentNote = notes[currentIndex];
  const progress = activeClef === 'treble'
    ? (seenNotes.length / TREBLE_NOTES.length) * 100
    : (currentIndex / BASS_NOTES.length) * 100;

  // Mark note as seen and check for bass unlock
  useEffect(() => {
    if (activeClef === 'treble') {
      const noteName = currentNote.name;
      setSeenNotes((prev) => {
        if (prev.includes(noteName)) return prev;
        const updated = [...prev, noteName];
        localStorage.setItem('notaz_treble_seen', JSON.stringify(updated));

        if (updated.length === TREBLE_NOTES.length) {
          localStorage.setItem('notaz_bass_unlocked', 'true');
          setBassUnlocked(true);
        }
        return updated;
      });
    }
  }, [currentIndex, activeClef]);

  const handleNext = () => {
    if (currentIndex < notes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClefSwitch = (clef) => {
    if (clef === 'bass' && !bassUnlocked) return;
    setActiveClef(clef);
    setCurrentIndex(0);
    setShowMnemonics(false);
  };

  const isLastNote = currentIndex === notes.length - 1;
  const isFirstNote = currentIndex === 0;

  return (
    <div className="learn-page">
      <NavBar />

      <main className="learn">
        {/* ── Header ── */}
        <div className="learn__header">
          <h1 className="learn__title">Learn</h1>
          <p className="learn__sub">Step through each note on the staff. Master treble clef to unlock bass.</p>
        </div>

        {/* ── Clef selector ── */}
        <div className="learn__clef-tabs">
          <button
            className={`clef-tab ${activeClef === 'treble' ? 'clef-tab--active' : ''}`}
            onClick={() => handleClefSwitch('treble')}
          >
            <span className="clef-tab__symbol">𝄞</span>
            Treble Clef
          </button>
          <button
            className={`clef-tab ${activeClef === 'bass' ? 'clef-tab--active' : ''} ${!bassUnlocked ? 'clef-tab--locked' : ''}`}
            onClick={() => handleClefSwitch('bass')}
            title={!bassUnlocked ? 'Complete all treble clef notes to unlock' : ''}
          >
            <span className="clef-tab__symbol">𝄢</span>
            Bass Clef
            {!bassUnlocked && <span className="clef-tab__lock">🔒</span>}
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div className="learn__progress-bar" aria-label="Progress">
          <div
            className="learn__progress-fill"
            style={{ width: `${activeClef === 'treble' ? (seenNotes.length / TREBLE_NOTES.length) * 100 : progress}%` }}
          />
        </div>
        <p className="learn__progress-label">
          {activeClef === 'treble'
            ? `${seenNotes.length} / ${TREBLE_NOTES.length} notes seen`
            : `${currentIndex + 1} / ${BASS_NOTES.length} notes`
          }
        </p>

        {/* ── Main note card ── */}
        <div className="learn__card" key={`${activeClef}-${currentIndex}`}>
          <div className="learn__staff-wrap">
            <StaffDisplay noteName={currentNote.name} clef={activeClef} />
          </div>

          <div className="learn__note-info">
            <div className="learn__note-name">{currentNote.name}</div>
            <div className="learn__note-position">{currentNote.position}</div>
            <p className="learn__note-hint">{currentNote.hint}</p>

            <div className="learn__mnemonic-pill">
              <span className="learn__mnemonic-label">Mnemonic</span>
              <span className="learn__mnemonic-word">"{currentNote.mnemonic}"</span>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="learn__nav">
          <button
            className="btn btn--ghost"
            onClick={handlePrev}
            disabled={isFirstNote}
          >
            ← Previous
          </button>

          <span className="learn__nav-count">
            {currentIndex + 1} / {notes.length}
          </span>

          {isLastNote && activeClef === 'treble' && bassUnlocked ? (
            <button
              className="btn btn--primary"
              onClick={() => handleClefSwitch('bass')}
            >
              Bass Clef →
            </button>
          ) : isLastNote && activeClef === 'bass' ? (
            <button
              className="btn btn--primary"
              onClick={() => navigate('/practice')}
            >
              Practice →
            </button>
          ) : (
            <button
              className="btn btn--primary"
              onClick={handleNext}
            >
              Next →
            </button>
          )}
        </div>

        {/* ── Mnemonics reference ── */}
        <div className="learn__mnemonics-section">
          <button
            className="learn__mnemonics-toggle"
            onClick={() => setShowMnemonics(!showMnemonics)}
          >
            {showMnemonics ? '▲' : '▼'} {activeClef === 'treble' ? 'Treble' : 'Bass'} Clef Mnemonics
          </button>

          {showMnemonics && (
            <div className="learn__mnemonics-grid">
              <div className="mnemonic-card">
                <div className="mnemonic-card__label">Lines</div>
                <div className="mnemonic-card__notes">{mnemonics.lines.notes}</div>
                <div className="mnemonic-card__phrase">"{mnemonics.lines.phrase}"</div>
              </div>
              <div className="mnemonic-card">
                <div className="mnemonic-card__label">Spaces</div>
                <div className="mnemonic-card__notes">{mnemonics.spaces.notes}</div>
                <div className="mnemonic-card__phrase">"{mnemonics.spaces.phrase}"</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}