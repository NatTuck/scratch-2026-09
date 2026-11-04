import { useState } from 'react';
import { DECKS, cardsForDeck, type DeckId, type Mode } from '../lib/cards';
import { deckStats, type Progress } from '../lib/srs';

interface HomeProps {
  progress: Progress;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onStart: (deck: DeckId, mode: Mode, cram: boolean) => void;
  onReset: () => void;
}

export default function Home({ progress, mode, onModeChange, onStart, onReset }: HomeProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="stack">
      <section className="panel modes" aria-label="Answer mode">
        <div className="modes-head">
          <h2>Answer mode</h2>
          <p className="muted small">Applies to both decks. Keyboard friendly.</p>
        </div>
        <div className="segmented" role="group" aria-label="Answer mode">
          <button
            type="button"
            className={mode === 'choice' ? 'seg active' : 'seg'}
            aria-pressed={mode === 'choice'}
            onClick={() => onModeChange('choice')}
          >
            <span className="seg-title">Multiple choice</span>
            <span className="seg-sub">Four options, instant feedback</span>
          </button>
          <button
            type="button"
            className={mode === 'flip' ? 'seg active' : 'seg'}
            aria-pressed={mode === 'flip'}
            onClick={() => onModeChange('flip')}
          >
            <span className="seg-title">Flip</span>
            <span className="seg-sub">Recall it, then grade yourself</span>
          </button>
        </div>
      </section>

      {DECKS.map((deck) => {
        const cards = cardsForDeck(deck.id);
        const stats = deckStats(cards, progress);
        const pct = (n: number) => `${(n / stats.total) * 100}%`;
        return (
          <section className="panel deck" key={deck.id}>
            <div className="deck-head">
              <div>
                <h2>{deck.title}</h2>
                <p className="muted small">{deck.blurb}</p>
              </div>
              <span className="pill">{stats.total} cards</span>
            </div>

            <div className="meter" aria-hidden="true">
              <span className="meter-mastered" style={{ width: pct(stats.mastered) }} />
              <span className="meter-learning" style={{ width: pct(stats.learning) }} />
            </div>
            <p className="muted small stats">
              {stats.mastered} mastered · {stats.learning} learning · {stats.fresh} new
            </p>

            <div className="deck-actions">
              <button
                type="button"
                className="btn primary"
                onClick={() => onStart(deck.id, mode, false)}
              >
                Start session
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => onStart(deck.id, mode, true)}
              >
                Cram all {stats.total}
              </button>
            </div>
          </section>
        );
      })}

      <div className="footer-row">
        {confirmingReset ? (
          <>
            <span className="muted small">Erase all saved progress?</span>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                onReset();
                setConfirmingReset(false);
              }}
            >
              Yes, reset
            </button>
            <button type="button" className="btn ghost" onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="btn ghost small" onClick={() => setConfirmingReset(true)}>
            Reset progress
          </button>
        )}
      </div>

      <p className="muted small note">
        Sessions serve 20 cards, weakest first. A miss drops a card back to the start, so it keeps
        coming back. Progress is saved in this browser.
      </p>
    </div>
  );
}
