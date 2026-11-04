import { describe, expect, it } from 'vitest';
import { ANGLES, UNDEFINED } from './cards';
import {
  QUIZ_TARGETS,
  TAU,
  angularDistance,
  displayAngle,
  displayValue,
  isCorrectAnswer,
  nearestAngleIndex,
  normalizeAngle,
  solutionsFor,
  valueAt,
  wrongStartAngle,
} from './unitCircle';

const NEG_HALF = '-\\frac{1}{2}';

describe('angle math', () => {
  it('normalizes negatives and extra turns into [0, 2π)', () => {
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 10);
    expect(normalizeAngle(TAU + 0.5)).toBeCloseTo(0.5, 10);
    expect(normalizeAngle(TAU)).toBeCloseTo(0, 10);
  });

  it('measures the short way around', () => {
    expect(angularDistance(0.1, TAU - 0.1)).toBeCloseTo(0.2, 10);
    expect(angularDistance(0, Math.PI)).toBeCloseTo(Math.PI, 10);
  });

  it('snaps to the nearest special angle', () => {
    expect(ANGLES[nearestAngleIndex((31 * Math.PI) / 180)].id).toBe('pi/6');
    expect(ANGLES[nearestAngleIndex((-1 * Math.PI) / 180)].id).toBe('0');
    expect(ANGLES[nearestAngleIndex((89 * Math.PI) / 180)].id).toBe('pi/2');
    expect(ANGLES[nearestAngleIndex((215 * Math.PI) / 180)].id).toBe('7pi/6');
  });

  it('keeps the table numerically honest', () => {
    for (const angle of ANGLES) {
      expect(Math.sin(angle.radians)).toBeCloseTo(Math.sin((angle.degrees * Math.PI) / 180), 10);
      expect(Math.cos(angle.radians)).toBeCloseTo(Math.cos((angle.degrees * Math.PI) / 180), 10);
    }
    expect(valueAt('sin', Math.PI / 2)).toBeCloseTo(1, 10);
    expect(valueAt('cos', Math.PI)).toBeCloseTo(-1, 10);
    expect(valueAt('tan', Math.PI / 4)).toBeCloseTo(1, 10);
    expect(Number.isNaN(valueAt('tan', Math.PI / 2))).toBe(true);
  });
});

describe('readout', () => {
  it('uses exact LaTeX when snapped', () => {
    const angle = ANGLES.find((entry) => entry.id === '2pi/3')!;
    expect(displayValue('cos', angle.radians, angle)).toEqual({
      tex: NEG_HALF,
      negative: true,
      numeric: Math.cos((2 * Math.PI) / 3),
    });
    expect(displayAngle(angle.radians, angle)).toMatchObject({
      radiansTex: '\\frac{2\\pi}{3}',
      degrees: 120,
    });
  });

  it('falls back to decimals when dragging freely', () => {
    const value = displayValue('sin', 1, null);
    expect(value.negative).toBe(false);
    expect(value.tex).toBe(String(Number(Math.sin(1).toFixed(3))));
    expect(displayAngle(1, null).radiansTex).toBe('0.32\\pi');
  });

  it('reports undefined tangents', () => {
    const angle = ANGLES.find((entry) => entry.id === 'pi/2')!;
    expect(displayValue('tan', angle.radians, angle).tex).toBe(UNDEFINED);
    expect(displayValue('tan', angle.radians, angle).numeric).toBeNull();
  });
});

describe('reverse quiz', () => {
  it('finds every solution on the special-angle grid', () => {
    expect(solutionsFor('sin', '0').map((angle) => angle.id)).toEqual(['0', 'pi']);
    expect(solutionsFor('cos', NEG_HALF).map((angle) => angle.id)).toEqual(['2pi/3', '4pi/3']);
    expect(solutionsFor('tan', '1').map((angle) => angle.id)).toEqual(['pi/4', '5pi/4']);
    expect(solutionsFor('sin', '1').map((angle) => angle.id)).toEqual(['pi/2']);
  });

  it('never asks for an undefined tangent', () => {
    expect(QUIZ_TARGETS.length).toBeGreaterThan(20);
    for (const target of QUIZ_TARGETS) {
      expect(target.answer).not.toBe(UNDEFINED);
      expect(solutionsFor(target.fn, target.answer).length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate targets', () => {
    const keys = QUIZ_TARGETS.map((target) => `${target.fn}:${target.answer}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('accepts any angle with that value and rejects the rest', () => {
    expect(isCorrectAnswer('cos', NEG_HALF, (2 * Math.PI) / 3)).toBe(true);
    expect(isCorrectAnswer('cos', NEG_HALF, (4 * Math.PI) / 3)).toBe(true);
    expect(isCorrectAnswer('cos', NEG_HALF, Math.PI / 3)).toBe(false);
    expect(isCorrectAnswer('tan', '1', (5 * Math.PI) / 4)).toBe(true);
  });

  it('never starts a round already solved', () => {
    for (const target of QUIZ_TARGETS) {
      for (let attempt = 0; attempt < 6; attempt++) {
        expect(isCorrectAnswer(target.fn, target.answer, wrongStartAngle(target))).toBe(false);
      }
    }
  });
});
