import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './LearnPage.css';

// ── Exact same Y maps as PracticePage ───────────────────────────
const TREBLE_Y = {
  'E6': -24, 'D6': -16, 'C6': -8,
  'B5': 0,   'A5': 8,   'G5': 16,
  'F5': 24,  'E5': 32,  'D5': 40,
  'C5': 48,  'B4': 56,  'A4': 64,
  'G4': 72,  'F4': 80,  'E4': 88,
  'D4': 96,  'C4': 104,
};

const BASS_Y = {
  'A4b': -32, 'G4b': -24, 'F4b': -16,
  'E4b': -8,  'D4b': 0,   'C4':  8,
  'B3':  16,  'A3':  24,  'G3':  32,
  'F3':  40,  'E3':  48,  'D3':  56,
  'C3':  64,  'B2':  72,  'A2':  80,
  'G2':  88,  'F2':  96,  'E2':  104,
};

const LINE_Y = [24, 40, 56, 72, 88];
const getStemDown = (noteY) => noteY <= 56;

function getLegerLines(noteY) {
  const lines = [];
  const TOP_LINE = 24;
  const BOTTOM_LINE = 88;
  const STEP = 16;
  if (noteY < TOP_LINE) {
    for (let y = TOP_LINE - STEP; y >= noteY; y -= STEP) lines.push(y);
  }
  if (noteY > BOTTOM_LINE) {
    for (let y = BOTTOM_LINE + STEP; y <= noteY; y += STEP) lines.push(y);
  }
  return lines;
}

// ── Note data ───────────────────────────────────────────────────
const TREBLE_NOTES = [
  { name: 'C4', position: 'Ledger line below staff', mnemonic: 'Middle C', hint: 'Middle C sits just below the staff on its own ledger line — the most important landmark in all of music.' },
  { name: 'D4', position: 'Space below staff',       mnemonic: 'Down',     hint: 'Just above middle C, floating in the space below the bottom staff line.' },
  { name: 'E4', position: 'Line 1 (bottom)',          mnemonic: 'Every',    hint: 'The very first line at the bottom of the treble clef staff.' },
  { name: 'F4', position: 'Space 1',                  mnemonic: 'Good',     hint: 'First space, just above the bottom line.' },
  { name: 'G4', position: 'Line 2',                   mnemonic: 'Boy',      hint: 'Second line — the treble clef symbol curls around this line.' },
  { name: 'A4', position: 'Space 2',                  mnemonic: 'Does',     hint: 'Second space, in the middle of the lower half of the staff.' },
  { name: 'B4', position: 'Line 3 (middle)',           mnemonic: 'Fine',     hint: 'The middle line of the staff — a useful anchor point.' },
  { name: 'C5', position: 'Space 3',                  mnemonic: 'Always',   hint: 'Third space, right above the middle line.' },
  { name: 'D5', position: 'Line 4',                   mnemonic: 'Good',     hint: 'Fourth line, entering the upper half of the staff.' },
  { name: 'E5', position: 'Space 4',                  mnemonic: 'Boy',      hint: 'Fourth space, near the top of the staff.' },
  { name: 'F5', position: 'Line 5 (top)',              mnemonic: 'Does',     hint: 'The very top line of the treble clef staff.' },
  { name: 'G5', position: 'Space above line 5',       mnemonic: 'Fine',     hint: 'First space above the staff — no ledger line needed yet.' },
  { name: 'A5', position: 'Ledger line 1 above',      mnemonic: 'Always',   hint: 'Sits on the first ledger line above the staff.' },
  { name: 'B5', position: 'Space above ledger 1',     mnemonic: 'Good',     hint: 'Just above the first ledger line above the staff.' },
  { name: 'C6', position: 'Ledger line 2 above',      mnemonic: 'Boy',      hint: 'Second ledger line above the staff.' },
  { name: 'D6', position: 'Space above ledger 2',     mnemonic: 'Does',     hint: 'Just above the second ledger line.' },
  { name: 'E6', position: 'Ledger line 3 above',      mnemonic: 'Fine',     hint: 'Third ledger line above the staff — the top of the treble range.' },
];

const BASS_NOTES = [
  { name: 'E2', position: 'Ledger line 2 below',     mnemonic: 'Good',     hint: 'Second ledger line below the bass clef staff.' },
  { name: 'F2', position: 'Space below ledger 2',    mnemonic: 'Boys',     hint: 'Just above the second ledger line below the staff.' },
  { name: 'G2', position: 'Line 1 (bottom)',          mnemonic: 'Good',     hint: 'The bottom line of the bass clef staff.' },
  { name: 'A2', position: 'Space 1',                  mnemonic: 'Boys',     hint: 'First space, just above the bottom line.' },
  { name: 'B2', position: 'Line 2',                   mnemonic: 'Do',       hint: 'Second line of the bass clef.' },
  { name: 'C3', position: 'Space 2',                  mnemonic: 'Fine',     hint: 'Second space.' },
  { name: 'D3', position: 'Line 3 (middle)',           mnemonic: 'Always',   hint: 'The middle line of the bass clef staff.' },
  { name: 'E3', position: 'Space 3',                  mnemonic: 'Good',     hint: 'Third space, above the middle line.' },
  { name: 'F3', position: 'Line 4',                   mnemonic: 'Boys',     hint: 'Fourth line of the bass clef.' },
  { name: 'G3', position: 'Space 4',                  mnemonic: 'Do',       hint: 'Fourth space, near the top of the staff.' },
  { name: 'A3', position: 'Line 5 (top)',              mnemonic: 'Fine',     hint: 'The top line of the bass clef staff.' },
  { name: 'B3', position: 'Space above line 5',       mnemonic: 'Always',   hint: 'First space above the staff.' },
  { name: 'C4', position: 'Ledger line 1 above',      mnemonic: 'Good',     hint: 'Middle C — first ledger line above the bass clef staff.' },
  { name: 'D4', position: 'Space above ledger 1',     mnemonic: 'Boys',     hint: 'Just above middle C.' },
  { name: 'E4', position: 'Ledger line 2 above',      mnemonic: 'Do',       hint: 'Second ledger line above the bass clef staff.' },
  { name: 'F4', position: 'Space above ledger 2',     mnemonic: 'Fine',     hint: 'Just above the second ledger line.' },
  { name: 'G4', position: 'Ledger line 3 above',      mnemonic: 'Always',   hint: 'Third ledger line above the bass clef staff.' },
  { name: 'A4', position: 'Space above ledger 3',     mnemonic: 'Good',     hint: 'Just above the third ledger line — top of the bass range.' },
];

const TREBLE_MNEMONICS = {
  lines:  { notes: 'E G B D F', phrase: 'Every Good Boy Does Fine' },
  spaces: { notes: 'F A C E',   phrase: 'FACE (spells itself!)' },
};

const BASS_MNEMONICS = {
  lines:  { notes: 'G B D F A', phrase: 'Good Boys Do Fine Always' },
  spaces: { notes: 'A C E G',   phrase: 'All Cows Eat Grass' },
};

// ── Staff SVG ───────────────────────────────────────────────────
function StaffDisplay({ noteName, clef }) {
  const yMap = clef === 'treble' ? TREBLE_Y : BASS_Y;
  const rawName = clef === 'bass'
    ? (noteName + 'b' in BASS_Y ? noteName + 'b' : noteName)
    : noteName;
  const noteY = yMap[rawName] ?? yMap[noteName] ?? 56;
  const stemDown = getStemDown(noteY);
  const legerLines = getLegerLines(noteY);

  const stemX = stemDown ? 111 : 129;
  const stemY2 = stemDown ? noteY + 40 : noteY - 40;

  return (
    <svg className="staff-svg" viewBox="0 -40 220 190" xmlns="http://www.w3.org/2000/svg">
      {LINE_Y.map((y, i) => (
        <line key={i} x1="10" y1={y} x2="210" y2={y}
          stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}
      <text x="12" y={clef === 'treble' ? 108 : 92}
        fontSize={clef === 'treble' ? '72' : '52'}
        fill="var(--color-ink)" fontFamily="serif" opacity="0.15">
        {clef === 'treble' ? '𝄞' : '𝄢'}
      </text>
      {legerLines.map((ly, i) => (
        <line key={`leger-${i}`} x1="104" y1={ly} x2="136" y2={ly}
          stroke="var(--color-ink)" strokeWidth="1.2" />
      ))}
      <ellipse cx="120" cy={noteY} rx="10" ry="7.5"
        fill="var(--color-ink)"
        transform={`rotate(-15, 120, ${noteY})`} />
      <line x1={stemX} y1={noteY} x2={stemX} y2={stemY2}
        stroke="var(--color-ink)" strokeWidth="1.5" />
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────
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
    if (currentIndex < notes.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
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
        <div className="learn__header">
          <h1 className="learn__title">Learn</h1>
          <p className="learn__sub">Step through each note on the staff. Master treble clef to unlock bass.</p>
        </div>

        {/* Clef tabs */}
        <div className="learn__clef-tabs">
          <button
            className={`clef-tab ${activeClef === 'treble' ? 'clef-tab--active' : ''}`}
            onClick={() => handleClefSwitch('treble')}>
            <span className="clef-tab__symbol">𝄞</span>
            Treble Clef
          </button>
          <button
            className={`clef-tab ${activeClef === 'bass' ? 'clef-tab--active' : ''} ${!bassUnlocked ? 'clef-tab--locked' : ''}`}
            onClick={() => handleClefSwitch('bass')}
            title={!bassUnlocked ? 'Complete all treble clef notes to unlock' : ''}>
            <span className="clef-tab__symbol">𝄢</span>
            Bass Clef
            {!bassUnlocked && <span className="clef-tab__lock">🔒</span>}
          </button>
        </div>

        {/* Progress bar */}
        <div className="learn__progress-bar" aria-label="Progress">
          <div className="learn__progress-fill"
            style={{ width: `${activeClef === 'treble'
              ? (seenNotes.length / TREBLE_NOTES.length) * 100
              : ((currentIndex + 1) / BASS_NOTES.length) * 100}%` }} />
        </div>
        <p className="learn__progress-label">
          {activeClef === 'treble'
            ? `${seenNotes.length} / ${TREBLE_NOTES.length} notes seen`
            : `${currentIndex + 1} / ${BASS_NOTES.length} notes`}
        </p>

        {/* Note card */}
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

        {/* Navigation */}
        <div className="learn__nav">
          <button className="btn btn--ghost" onClick={handlePrev} disabled={isFirstNote}>
            ← Previous
          </button>
          <span className="learn__nav-count">{currentIndex + 1} / {notes.length}</span>
          {isLastNote && activeClef === 'treble' && bassUnlocked ? (
            <button className="btn btn--primary" onClick={() => handleClefSwitch('bass')}>
              Bass Clef →
            </button>
          ) : isLastNote && activeClef === 'bass' ? (
            <button className="btn btn--primary" onClick={() => navigate('/practice')}>
              Practice →
            </button>
          ) : (
            <button className="btn btn--primary" onClick={handleNext}>
              Next →
            </button>
          )}
        </div>

        {/* Mnemonics reference */}
        <div className="learn__mnemonics-section">
          <button className="learn__mnemonics-toggle"
            onClick={() => setShowMnemonics(!showMnemonics)}>
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