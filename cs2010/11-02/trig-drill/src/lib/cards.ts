export type DeckId = 'values' | 'derivatives';
export type Mode = 'choice' | 'flip';

export interface Card {
  id: string;
  deck: DeckId;
  prompt: string;
  answer: string;
  /** Ordered candidate wrong answers, best trap first. */
  hintPool: string[];
}

export const UNDEFINED = '\\text{undefined}';

const SIN_CYCLE = ['\\sin x', '\\cos x', '-\\sin x', '-\\cos x'];
const COS_CYCLE = ['\\cos x', '-\\sin x', '-\\cos x', '\\sin x'];

export interface Angle {
  id: string;
  /** LaTeX label, e.g. \frac{\pi}{6}. */
  tex: string;
  /** Plain-text label for SVG, e.g. π/6. */
  label: string;
  /** Radians in [0, 2π). */
  radians: number;
  /** Degrees in [0, 360). */
  degrees: number;
  sin: string;
  cos: string;
  tan: string;
}

const HALF = '\\frac{1}{2}';
const NEG_HALF = '-\\frac{1}{2}';
const ROOT2 = '\\frac{\\sqrt{2}}{2}';
const NEG_ROOT2 = '-\\frac{\\sqrt{2}}{2}';
const ROOT3 = '\\frac{\\sqrt{3}}{2}';
const NEG_ROOT3 = '-\\frac{\\sqrt{3}}{2}';
const ROOT3_OVER_3 = '\\frac{\\sqrt{3}}{3}';
const NEG_ROOT3_OVER_3 = '-\\frac{\\sqrt{3}}{3}';
const SQRT3 = '\\sqrt{3}';
const NEG_SQRT3 = '-\\sqrt{3}';

/** The 16 unit-circle angles in §3.5 territory, counter-clockwise from 0. */
export const ANGLES: Angle[] = [
  { id: '0', tex: '0', label: '0', radians: 0, degrees: 0, sin: '0', cos: '1', tan: '0' },
  {
    id: 'pi/6',
    tex: '\\frac{\\pi}{6}',
    label: 'π/6',
    radians: Math.PI / 6,
    degrees: 30,
    sin: HALF,
    cos: ROOT3,
    tan: ROOT3_OVER_3,
  },
  {
    id: 'pi/4',
    tex: '\\frac{\\pi}{4}',
    label: 'π/4',
    radians: Math.PI / 4,
    degrees: 45,
    sin: ROOT2,
    cos: ROOT2,
    tan: '1',
  },
  {
    id: 'pi/3',
    tex: '\\frac{\\pi}{3}',
    label: 'π/3',
    radians: Math.PI / 3,
    degrees: 60,
    sin: ROOT3,
    cos: HALF,
    tan: SQRT3,
  },
  {
    id: 'pi/2',
    tex: '\\frac{\\pi}{2}',
    label: 'π/2',
    radians: Math.PI / 2,
    degrees: 90,
    sin: '1',
    cos: '0',
    tan: UNDEFINED,
  },
  {
    id: '2pi/3',
    tex: '\\frac{2\\pi}{3}',
    label: '2π/3',
    radians: (2 * Math.PI) / 3,
    degrees: 120,
    sin: ROOT3,
    cos: NEG_HALF,
    tan: NEG_SQRT3,
  },
  {
    id: '3pi/4',
    tex: '\\frac{3\\pi}{4}',
    label: '3π/4',
    radians: (3 * Math.PI) / 4,
    degrees: 135,
    sin: ROOT2,
    cos: NEG_ROOT2,
    tan: '-1',
  },
  {
    id: '5pi/6',
    tex: '\\frac{5\\pi}{6}',
    label: '5π/6',
    radians: (5 * Math.PI) / 6,
    degrees: 150,
    sin: HALF,
    cos: NEG_ROOT3,
    tan: NEG_ROOT3_OVER_3,
  },
  {
    id: 'pi',
    tex: '\\pi',
    label: 'π',
    radians: Math.PI,
    degrees: 180,
    sin: '0',
    cos: '-1',
    tan: '0',
  },
  {
    id: '7pi/6',
    tex: '\\frac{7\\pi}{6}',
    label: '7π/6',
    radians: (7 * Math.PI) / 6,
    degrees: 210,
    sin: NEG_HALF,
    cos: NEG_ROOT3,
    tan: ROOT3_OVER_3,
  },
  {
    id: '5pi/4',
    tex: '\\frac{5\\pi}{4}',
    label: '5π/4',
    radians: (5 * Math.PI) / 4,
    degrees: 225,
    sin: NEG_ROOT2,
    cos: NEG_ROOT2,
    tan: '1',
  },
  {
    id: '4pi/3',
    tex: '\\frac{4\\pi}{3}',
    label: '4π/3',
    radians: (4 * Math.PI) / 3,
    degrees: 240,
    sin: NEG_ROOT3,
    cos: NEG_HALF,
    tan: SQRT3,
  },
  {
    id: '3pi/2',
    tex: '\\frac{3\\pi}{2}',
    label: '3π/2',
    radians: (3 * Math.PI) / 2,
    degrees: 270,
    sin: '-1',
    cos: '0',
    tan: UNDEFINED,
  },
  {
    id: '5pi/3',
    tex: '\\frac{5\\pi}{3}',
    label: '5π/3',
    radians: (5 * Math.PI) / 3,
    degrees: 300,
    sin: NEG_ROOT3,
    cos: HALF,
    tan: NEG_SQRT3,
  },
  {
    id: '7pi/4',
    tex: '\\frac{7\\pi}{4}',
    label: '7π/4',
    radians: (7 * Math.PI) / 4,
    degrees: 315,
    sin: NEG_ROOT2,
    cos: ROOT2,
    tan: '-1',
  },
  {
    id: '11pi/6',
    tex: '\\frac{11\\pi}{6}',
    label: '11π/6',
    radians: (11 * Math.PI) / 6,
    degrees: 330,
    sin: NEG_HALF,
    cos: ROOT3,
    tan: NEG_ROOT3_OVER_3,
  },
];

interface DerivRule {
  fn: string;
  answer: string;
  traps: string[];
}

const BASE_RULES: DerivRule[] = [
  { fn: '\\sin x', answer: '\\cos x', traps: ['-\\cos x', '\\sin x', '-\\sin x'] },
  { fn: '\\cos x', answer: '-\\sin x', traps: ['\\sin x', '-\\cos x', '\\cos x'] },
  { fn: '\\tan x', answer: '\\sec^2 x', traps: ['\\sec x\\tan x', '-\\sec^2 x', '-\\csc^2 x'] },
  { fn: '\\cot x', answer: '-\\csc^2 x', traps: ['-\\csc x\\cot x', '\\csc^2 x', '-\\sec^2 x'] },
  { fn: '\\sec x', answer: '\\sec x\\tan x', traps: ['-\\sec x\\tan x', '\\sec^2 x', '\\csc x\\cot x'] },
  { fn: '\\csc x', answer: '-\\csc x\\cot x', traps: ['\\csc x\\cot x', '-\\csc^2 x', '\\csc^2 x'] },
];

/** Cycles used to jump straight to any higher-order derivative. */
export function nthDerivative(fn: 'sin' | 'cos', n: number): string {
  const cycle = fn === 'sin' ? SIN_CYCLE : COS_CYCLE;
  return cycle[((n % 4) + 4) % 4];
}

const HIGHER_ORDERS = [2, 3, 4, 74, 59];

/** Reciprocal pairs, used as the nastiest tan/cot traps. */
const RECIPROCAL: Record<string, string> = {
  '0': UNDEFINED,
  [UNDEFINED]: '0',
  '1': '1',
  [SQRT3]: ROOT3_OVER_3,
  [ROOT3_OVER_3]: SQRT3,
  [NEG_SQRT3]: NEG_ROOT3_OVER_3,
  [NEG_ROOT3_OVER_3]: NEG_SQRT3,
};

function negate(tex: string): string | null {
  if (tex === '0' || tex === UNDEFINED) return null;
  return tex.startsWith('-') ? tex.slice(1) : `-${tex}`;
}

function rotate<T>(items: T[], by: number): T[] {
  if (items.length === 0) return [];
  const n = ((by % items.length) + items.length) % items.length;
  return items.slice(n).concat(items.slice(0, n));
}

function dedupe(items: (string | null)[], answer: string): string[] {
  const out: string[] = [];
  for (const item of items) {
    if (!item || item === answer || out.includes(item)) continue;
    out.push(item);
  }
  return out;
}

function valuePool(): string[] {
  const set = new Set<string>();
  for (const angle of ANGLES) {
    for (const value of [angle.sin, angle.cos, angle.tan]) {
      set.add(value);
      const flipped = negate(value);
      if (flipped) set.add(flipped);
    }
  }
  return [...set];
}

function derivativePool(): string[] {
  const set = new Set<string>();
  for (const rule of BASE_RULES) {
    set.add(rule.answer);
    const flipped = negate(rule.answer);
    if (flipped) set.add(flipped);
  }
  for (const value of [...SIN_CYCLE, ...COS_CYCLE]) set.add(value);
  return [...set];
}

export function buildCards(): Card[] {
  const values = valuePool();
  const derivatives = derivativePool();
  const cards: Card[] = [];
  let index = 0;

  for (const angle of ANGLES) {
    for (const fn of ['sin', 'cos', 'tan'] as const) {
      const answer = angle[fn];
      const specific: (string | null)[] = [];
      if (fn === 'sin') specific.push(angle.cos);
      if (fn === 'cos') specific.push(angle.sin);
      if (fn === 'tan') specific.push(RECIPROCAL[answer] ?? null);
      specific.push(negate(answer));

      cards.push({
        id: `value:${fn}:${angle.id}`,
        deck: 'values',
        prompt: `\\${fn}\\left(${angle.tex}\\right)`,
        answer,
        hintPool: dedupe([...specific, ...rotate(values, index)], answer),
      });
      index++;
    }
  }

  for (const rule of BASE_RULES) {
    cards.push({
      id: `deriv:${rule.fn}`,
      deck: 'derivatives',
      prompt: `\\frac{d}{dx}\\left(${rule.fn}\\right)`,
      answer: rule.answer,
      hintPool: dedupe([...rule.traps, ...derivatives], rule.answer),
    });
  }

  for (const fn of ['sin', 'cos'] as const) {
    const cycle = fn === 'sin' ? SIN_CYCLE : COS_CYCLE;
    for (const n of HIGHER_ORDERS) {
      const answer = nthDerivative(fn, n);
      cards.push({
        id: `deriv:d${n}:${fn}`,
        deck: 'derivatives',
        prompt: `\\frac{d^{${n}}}{dx^{${n}}}\\left(\\${fn} x\\right)`,
        answer,
        hintPool: dedupe([negate(answer), ...cycle, ...derivatives], answer),
      });
    }
  }

  return cards;
}

export const CARDS: Card[] = buildCards();

export const DECKS: { id: DeckId; title: string; blurb: string }[] = [
  {
    id: 'values',
    title: 'Exact trig values',
    blurb: 'sin, cos and tan at the 16 unit-circle angles, including the undefined ones.',
  },
  {
    id: 'derivatives',
    title: 'Trig derivatives',
    blurb: 'The six base rules plus the higher-order cycle for sin x and cos x.',
  },
];

export function cardsForDeck(deck: DeckId): Card[] {
  return CARDS.filter((card) => card.deck === deck);
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Four options, always containing the answer exactly once. */
export function buildChoices(card: Card, rng: () => number = Math.random): string[] {
  const wrong: string[] = [];
  for (const hint of card.hintPool) {
    if (hint === card.answer || wrong.includes(hint)) continue;
    wrong.push(hint);
    if (wrong.length === 3) break;
  }
  return shuffle([card.answer, ...wrong], rng);
}
