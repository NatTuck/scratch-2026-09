import { shuffle, type Card } from './cards';

const STORAGE_KEY = 'trig-drill:v1:progress';

export const MAX_BOX = 5;
/** Box at which a card counts as "mastered" on the home screen. */
export const MASTERED_BOX = 4;

export interface CardStats {
  box: number;
  seen: number;
  correct: number;
  lastSeen: number;
}

export type Progress = Record<string, CardStats>;

function clampBox(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(MAX_BOX, Math.max(1, Math.round(value)));
}

function readCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

/**
 * Reads saved progress. Anything corrupt or from an unexpected shape is
 * dropped rather than allowed to crash the app.
 */
export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const out: Progress = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
      const stats = value as Record<string, unknown>;
      out[id] = {
        box: clampBox(stats.box, 1),
        seen: readCount(stats.seen),
        correct: readCount(stats.correct),
        lastSeen: readCount(stats.lastSeen),
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode, quotas). Study session still works.
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Correct answers move a card up one box; a miss sends it back to box 1. */
export function recordResult(
  progress: Progress,
  cardId: string,
  correct: boolean,
  now: number = Date.now(),
): Progress {
  const prev = progress[cardId];
  const box = prev?.box ?? 0;
  return {
    ...progress,
    [cardId]: {
      box: correct ? Math.min(MAX_BOX, box + 1) : 1,
      seen: (prev?.seen ?? 0) + 1,
      correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
      lastSeen: now,
    },
  };
}

/**
 * Cram ignores scheduling. Otherwise lowest box first, then least recently
 * seen, so weak cards keep resurfacing until they are stable.
 */
export function selectCards(
  cards: readonly Card[],
  progress: Progress,
  count: number,
  cram: boolean,
): Card[] {
  if (cram) return shuffle(cards).slice(0, Math.min(count, cards.length));

  const keyed = cards.map((card) => ({
    card,
    box: progress[card.id]?.box ?? 0,
    lastSeen: progress[card.id]?.lastSeen ?? 0,
    tiebreak: Math.random(),
  }));

  keyed.sort(
    (a, b) => a.box - b.box || a.lastSeen - b.lastSeen || a.tiebreak - b.tiebreak,
  );
  return keyed.slice(0, count).map((entry) => entry.card);
}

export interface DeckStats {
  total: number;
  fresh: number;
  learning: number;
  mastered: number;
}

export function deckStats(cards: readonly Card[], progress: Progress): DeckStats {
  let fresh = 0;
  let learning = 0;
  let mastered = 0;
  for (const card of cards) {
    const stats = progress[card.id];
    if (!stats) fresh++;
    else if (stats.box >= MASTERED_BOX) mastered++;
    else learning++;
  }
  return { total: cards.length, fresh, learning, mastered };
}
