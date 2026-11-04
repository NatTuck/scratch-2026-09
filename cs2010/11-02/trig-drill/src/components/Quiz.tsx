import { useEffect, useState } from 'react';
import { ANGLES, shuffle } from '../lib/cards';
import {
  QUIZ_TARGETS,
  displayValue,
  isCorrectAnswer,
  nearestAngleIndex,
  promptTex,
  solutionsFor,
  wrongStartAngle,
  type QuizTarget,
} from '../lib/unitCircle';
import CircleSvg from './CircleSvg';
import Readout from './Readout';
import Tex from './Tex';

const ROUNDS = 5;

function pickTargets(): QuizTarget[] {
  return shuffle(QUIZ_TARGETS).slice(0, ROUNDS);
}

export default function Quiz() {
  const [targets, setTargets] = useState<QuizTarget[]>(pickTargets);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [theta, setTheta] = useState(() => wrongStartAngle(targets[0]));
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);

  const target = targets[round];
  const snapped = ANGLES[nearestAngleIndex(theta)];

  function handleAngle(raw: number) {
    if (answered) return;
    setTheta(ANGLES[nearestAngleIndex(raw)].radians);
  }

  function submit() {
    if (answered) return;
    const ok = isCorrectAnswer(target.fn, target.answer, theta);
    setCorrect(ok);
    setAnswered(true);
    if (ok) setScore((value) => value + 1);
  }

  function nextRound() {
    if (round + 1 >= targets.length) {
      setDone(true);
      return;
    }
    setRound((value) => value + 1);
    setTheta(wrongStartAngle(targets[round + 1]));
    setAnswered(false);
    setCorrect(false);
  }

  function restart() {
    const nextTargets = pickTargets();
    setTargets(nextTargets);
    setRound(0);
    setScore(0);
    setTheta(wrongStartAngle(nextTargets[0]));
    setAnswered(false);
    setCorrect(false);
    setDone(false);
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (done) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'BUTTON' || tag === 'INPUT') return;

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (answered) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        setTheta((current) => {
          const index = nearestAngleIndex(current);
          return ANGLES[(index + direction + ANGLES.length) % ANGLES.length].radians;
        });
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (answered) nextRound();
        else submit();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  if (done) {
    const pct = Math.round((score / targets.length) * 100);
    return (
      <section className="panel quiz-done">
        <p className="muted small">Quiz complete</p>
        <h2 className="score">
          {score} / {targets.length}
        </h2>
        <p className="muted">{pct}% correct</p>
        <div className="meter">
          <span className="meter-mastered" style={{ width: `${pct}%` }} />
        </div>
        <div className="quiz-actions">
          <button type="button" className="btn primary wide" onClick={restart}>
            Play again
          </button>
        </div>
      </section>
    );
  }

  const solutions = solutionsFor(target.fn, target.answer);
  const actual = displayValue(target.fn, theta, snapped);

  return (
    <div className="stack">
      <section
        className="panel"
        data-target={`${target.fn}:${target.answer}`}
        data-solutions={solutionsFor(target.fn, target.answer)
          .map((angle) => angle.id)
          .join(',')}
      >
        <div className="quiz-meta">
          <span className="muted small">
            Round {round + 1} of {targets.length}
          </span>
          <span className="muted small">Score {score}</span>
        </div>
        <p className="muted small quiz-instruction">Drag the point to an angle where</p>
        <Tex tex={promptTex(target)} display className="quiz-equation" />
      </section>

      <div className="circle-layout">
        <div className="circle-stage">
          <CircleSvg theta={theta} snapped={snapped} onAngle={handleAngle} />
        </div>
        <Readout theta={theta} snapped={snapped} hidden={!answered} />
      </div>

      {!answered ? (
        <div className="quiz-actions">
          <button type="button" className="btn primary wide" onClick={submit}>
            Submit answer
          </button>
          <p className="muted small">Snap is on, so the point lands on the marked angles.</p>
        </div>
      ) : (
        <>
          <p className={correct ? 'feedback good-text' : 'feedback bad-text'}>
            {correct ? 'Correct.' : 'Not quite.'}{' '}
            {!correct && (
              <>
                At <Tex tex={snapped.tex} />, <Tex tex={`\\${target.fn}\\theta = ${actual.tex}`} />.
              </>
            )}
          </p>

          <div className="panel solutions">
            <p className="muted small">Solutions</p>
            <div className="solution-list">
              {solutions.map((angle) => (
                <span key={angle.id} data-angle={angle.id}>
                  <Tex tex={`\\theta = ${angle.tex}`} />
                </span>
              ))}
            </div>
          </div>

          <button type="button" className="btn primary wide" onClick={nextRound}>
            {round + 1 >= targets.length ? 'See score' : 'Next round'} <kbd>Enter</kbd>
          </button>
        </>
      )}
    </div>
  );
}
