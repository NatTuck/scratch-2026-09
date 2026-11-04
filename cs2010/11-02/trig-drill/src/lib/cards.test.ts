import { describe, expect, it } from 'vitest';
import katex from 'katex';
import {
  ANGLES,
  CARDS,
  UNDEFINED,
  buildChoices,
  cardsForDeck,
  nthDerivative,
} from './cards';
import { MAX_BOX, deckStats, recordResult, selectCards, type Progress } from './srs';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('card generation', () => {
  it('covers every function at every angle', () => {
    expect(cardsForDeck('values')).toHaveLength(ANGLES.length * 3);
    expect(ANGLES).toHaveLength(16);
  });

  it('has unique ids and unique prompts', () => {
    const ids = CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(CARDS.length);
    const valuePrompts = cardsForDeck('values').map((card) => card.prompt);
    expect(new Set(valuePrompts).size).toBe(valuePrompts.length);
  });

  it('keeps tangent undefined at the quadrantal angles', () => {
    const half = cardsForDeck('values').find((card) => card.id === 'value:tan:pi/2');
    const threeHalves = cardsForDeck('values').find((card) => card.id === 'value:tan:3pi/2');
    expect(half?.answer).toBe(UNDEFINED);
    expect(threeHalves?.answer).toBe(UNDEFINED);
  });

  it('includes the six base derivative rules', () => {
    const base = cardsForDeck('derivatives').filter((card) => card.id.startsWith('deriv:\\'));
    expect(base).toHaveLength(6);
    const answers = base.map((card) => card.answer);
    expect(answers).toContain('\\sec^2 x');
    expect(answers).toContain('-\\csc x\\cot x');
  });

  it('gives every card at least three wrong answers', () => {
    for (const card of CARDS) {
      const wrong = card.hintPool.filter((hint) => hint !== card.answer);
      expect(new Set(wrong).size).toBe(wrong.length);
      expect(wrong.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('builds four distinct choices that include the answer', () => {
    for (const card of CARDS) {
      for (let seed = 0; seed < 40; seed++) {
        const choices = buildChoices(card, mulberry32(seed));
        expect(choices).toHaveLength(4);
        expect(new Set(choices).size).toBe(4);
        expect(choices).toContain(card.answer);
      }
    }
  });

  it('derives higher-order cycles correctly', () => {
    expect(nthDerivative('sin', 1)).toBe('\\cos x');
    expect(nthDerivative('sin', 2)).toBe('-\\sin x');
    expect(nthDerivative('sin', 4)).toBe('\\sin x');
    expect(nthDerivative('sin', 74)).toBe('-\\sin x');
    expect(nthDerivative('sin', 59)).toBe('-\\cos x');
    expect(nthDerivative('cos', 1)).toBe('-\\sin x');
    expect(nthDerivative('cos', 2)).toBe('-\\cos x');
    expect(nthDerivative('cos', 3)).toBe('\\sin x');
  });

  it('renders every prompt, answer and choice as valid LaTeX', () => {
    for (const card of CARDS) {
      expect(() => katex.renderToString(card.prompt, { throwOnError: true })).not.toThrow();
      expect(() => katex.renderToString(card.answer, { throwOnError: true })).not.toThrow();
      for (const choice of buildChoices(card, mulberry32(7))) {
        expect(() => katex.renderToString(choice, { throwOnError: true })).not.toThrow();
      }
    }
  });
});

describe('scheduling', () => {
  const card = CARDS[0];

  it('promotes on a correct answer and resets on a miss', () => {
    let progress: Progress = {};
    progress = recordResult(progress, card.id, true);
    expect(progress[card.id].box).toBe(1);
    progress = recordResult(progress, card.id, true);
    expect(progress[card.id].box).toBe(2);
    progress = recordResult(progress, card.id, false);
    expect(progress[card.id].box).toBe(1);
    expect(progress[card.id].seen).toBe(3);
    expect(progress[card.id].correct).toBe(2);
  });

  it('caps the box', () => {
    let progress: Progress = {};
    for (let i = 0; i < 12; i++) progress = recordResult(progress, card.id, true);
    expect(progress[card.id].box).toBe(MAX_BOX);
  });

  it('serves low boxes before high boxes', () => {
    const sample = CARDS.slice(0, 6);
    const progress: Progress = {};
    for (const entry of sample) progress[entry.id] = { box: 5, seen: 1, correct: 1, lastSeen: 1 };
    progress[sample[0].id] = { box: 1, seen: 1, correct: 0, lastSeen: 2 };

    const picked = selectCards(sample, progress, 2, false);
    expect(picked[0].id).toBe(sample[0].id);
  });

  it('counts fresh, learning and mastered cards', () => {
    const sample = CARDS.slice(0, 4);
    const progress: Progress = {
      [sample[0].id]: { box: 1, seen: 1, correct: 0, lastSeen: 1 },
      [sample[1].id]: { box: 5, seen: 5, correct: 5, lastSeen: 1 },
    };
    expect(deckStats(sample, progress)).toEqual({
      total: 4,
      fresh: 2,
      learning: 1,
      mastered: 1,
    });
  });
});
