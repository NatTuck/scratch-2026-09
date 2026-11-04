import { useEffect, useState } from 'react';
import { ANGLES } from '../lib/cards';
import { nearestAngleIndex, normalizeAngle } from '../lib/unitCircle';
import CircleSvg from './CircleSvg';
import Quiz from './Quiz';
import Readout from './Readout';
import WaveStrip from './WaveStrip';

type Mode = 'explore' | 'quiz';

function Explore() {
  const [theta, setTheta] = useState(ANGLES[2].radians);
  const [snap, setSnap] = useState(true);
  const snapped = snap ? ANGLES[nearestAngleIndex(theta)] : null;

  function handleAngle(raw: number) {
    setTheta(snap ? ANGLES[nearestAngleIndex(raw)].radians : raw);
  }

  function toggleSnap() {
    const next = !snap;
    if (next) setTheta(ANGLES[nearestAngleIndex(theta)].radians);
    setSnap(next);
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'BUTTON' || tag === 'INPUT') return;

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        setTheta((current) => {
          if (!snap) return normalizeAngle(current + (direction * Math.PI) / 36);
          const index = nearestAngleIndex(current);
          return ANGLES[(index + direction + ANGLES.length) % ANGLES.length].radians;
        });
      }

      if (event.key === 's' || event.key === 'S') {
        if (!snap) setTheta((current) => ANGLES[nearestAngleIndex(current)].radians);
        setSnap(!snap);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [snap]);

  return (
    <>
      <div className="circle-layout">
        <div className="circle-stage">
          <CircleSvg theta={theta} snapped={snapped} onAngle={handleAngle} />
        </div>
        <Readout theta={theta} snapped={snapped} />
      </div>

      <div className="controls-row">
        <button
          type="button"
          className={snap ? 'btn toggle on' : 'btn toggle'}
          aria-pressed={snap}
          onClick={toggleSnap}
        >
          Snap to special angles <kbd>S</kbd>
        </button>
        <span className="muted small">
          Drag the point, or use <kbd>←</kbd> <kbd>→</kbd>.
        </span>
      </div>

      <WaveStrip theta={theta} />
    </>
  );
}

export default function UnitCircle() {
  const [mode, setMode] = useState<Mode>('explore');

  return (
    <div className="stack">
      <div className="segmented" role="group" aria-label="Unit circle mode">
        <button
          type="button"
          className={mode === 'explore' ? 'seg active' : 'seg'}
          aria-pressed={mode === 'explore'}
          onClick={() => setMode('explore')}
        >
          <span className="seg-title">Explore</span>
          <span className="seg-sub">Drag the point and read exact values</span>
        </button>
        <button
          type="button"
          className={mode === 'quiz' ? 'seg active' : 'seg'}
          aria-pressed={mode === 'quiz'}
          onClick={() => setMode('quiz')}
        >
          <span className="seg-title">Reverse quiz</span>
          <span className="seg-sub">Match a value, choose any angle</span>
        </button>
      </div>

      {mode === 'explore' ? <Explore /> : <Quiz />}
    </div>
  );
}
