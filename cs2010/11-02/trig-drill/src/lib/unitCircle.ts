import { ANGLES, UNDEFINED, type Angle } from './cards';

export type FnName = 'sin' | 'cos' | 'tan';
export const TAU = Math.PI * 2;
export const FUNCTIONS: FnName[] = ['sin', 'cos', 'tan'];

/** Fold any real angle into [0, 2π). */
export function normalizeAngle(theta: number): number {
  const wrapped = theta % TAU;
  return wrapped < 0 ? wrapped + TAU : wrapped;
}

/** Shortest distance between two angles, ignoring full turns. */
export function angularDistance(a: number, b: number): number {
  const delta = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(delta, TAU - delta);
}

export function nearestAngleIndex(theta: number): number {
  let bestIndex = 0;
  let bestDistance = Infinity;
  ANGLES.forEach((angle, index) => {
    const distance = angularDistance(theta, angle.radians);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

export function snappedAngle(theta: number): Angle {
  return ANGLES[nearestAngleIndex(theta)];
}

/** Numeric value, so free-drag mode still has something to show. */
export function valueAt(fn: FnName, theta: number): number {
  if (fn === 'sin') return Math.sin(theta);
  if (fn === 'cos') return Math.cos(theta);
  const cosine = Math.cos(theta);
  return Math.abs(cosine) < 1e-12 ? NaN : Math.sin(theta) / cosine;
}

export interface ValueDisplay {
  tex: string;
  negative: boolean;
  /** null when the function is undefined. */
  numeric: number | null;
}

/**
 * Exact LaTeX for a snapped angle, decimals for a free one.
 * Keeps the readout honest even when the point is between special angles.
 */
export function displayValue(fn: FnName, theta: number, snapped: Angle | null): ValueDisplay {
  if (snapped) {
    const tex = snapped[fn];
    return {
      tex,
      negative: tex.startsWith('-'),
      numeric: fn === 'tan' && tex === UNDEFINED ? null : valueAt(fn, snapped.radians),
    };
  }

  const numeric = valueAt(fn, theta);
  if (!Number.isFinite(numeric)) {
    return { tex: UNDEFINED, negative: false, numeric: null };
  }
  const rounded = Number(numeric.toFixed(3));
  if (rounded === 0) return { tex: '0', negative: false, numeric: 0 };
  return { tex: String(rounded), negative: rounded < 0, numeric: rounded };
}

export interface AngleDisplay {
  radiansTex: string;
  degreesTex: string;
  degrees: number;
}

export function displayAngle(theta: number, snapped: Angle | null): AngleDisplay {
  if (snapped) {
    return {
      radiansTex: snapped.tex,
      degreesTex: `${snapped.degrees}^\\circ`,
      degrees: snapped.degrees,
    };
  }
  const wrapped = normalizeAngle(theta);
  const turns = Number((wrapped / Math.PI).toFixed(2));
  const degrees = Math.round((wrapped * 180) / Math.PI);
  return {
    radiansTex: `${turns}\\pi`,
    degreesTex: `${degrees}^\\circ`,
    degrees,
  };
}

/** Every special angle where fn has exactly this value, in [0, 2π). */
export function solutionsFor(fn: FnName, answerTex: string): Angle[] {
  return ANGLES.filter((angle) => angle[fn] === answerTex);
}

export interface QuizTarget {
  fn: FnName;
  answer: string;
}

function buildQuizTargets(): QuizTarget[] {
  const seen = new Set<string>();
  const targets: QuizTarget[] = [];
  for (const fn of FUNCTIONS) {
    for (const angle of ANGLES) {
      const answer = angle[fn];
      if (answer === UNDEFINED) continue;
      const key = `${fn}:${answer}`;
      if (seen.has(key)) continue;
      seen.add(key);
      targets.push({ fn, answer });
    }
  }
  return targets;
}

/** One target per distinct (function, value) pair. Undefined tangents excluded. */
export const QUIZ_TARGETS: QuizTarget[] = buildQuizTargets();

export function promptTex(target: QuizTarget): string {
  return `\\${target.fn}\\theta = ${target.answer}`;
}

/** Quiz answers always snap, so string equality on the table is exact. */
export function isCorrectAnswer(fn: FnName, answerTex: string, theta: number): boolean {
  return ANGLES[nearestAngleIndex(theta)][fn] === answerTex;
}

/** A starting angle that is definitely not a solution, so no round starts solved. */
export function wrongStartAngle(target: QuizTarget): number {
  const options = ANGLES.filter((angle) => angle[target.fn] !== target.answer);
  return options[Math.floor(Math.random() * options.length)].radians;
}
