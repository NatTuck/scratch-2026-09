import { DECKS, type Card, type DeckId, type Mode } from '../lib/cards';
import Tex from './Tex';

export interface SessionResult {
  card: Card;
  correct: boolean;
}

export interface Summary {
  deck: DeckId;
  mode: Mode;
  results: SessionResult[];
}

interface ResultsProps {
  summary: Summary;
  onDrillMissed: (summary: Summary) => void;
  onHome: () => void;
}

export default function Results({ summary, onDrillMissed, onHome }: ResultsProps) {
  const total = summary.results.length;
  const correct = summary.results.filter((result) => result.correct).length;
  const missed = summary.results.filter((result) => !result.correct);
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  const deckTitle = DECKS.find((deck) => deck.id === summary.deck)?.title ?? 'Session';

  return (
    <div className="stack">
      <section className="panel">
        <p className="muted small">{deckTitle}</p>
        <h2 className="score">
          {correct} / {total}
        </h2>
        <p className="muted">{accuracy}% correct</p>
        <div className="meter">
          <span className="meter-mastered" style={{ width: `${accuracy}%` }} />
        </div>
      </section>

      {missed.length === 0 ? (
        <section className="panel">
          <h3>Clean sweep</h3>
          <p className="muted small">
            Nothing missed. Those cards moved up a box, so they will show up less often.
          </p>
        </section>
      ) : (
        <section className="panel">
          <h3>Missed ({missed.length})</h3>
          <div className="missed">
            {missed.map((result) => (
              <div className="missed-row" key={result.card.id}>
                <Tex tex={result.card.prompt} />
                <span className="arrow" aria-hidden="true">
                  →
                </span>
                <Tex tex={result.card.answer} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grade-row">
        <button type="button" className="btn primary wide" onClick={onHome}>
          Back to decks
        </button>
        {missed.length > 0 && (
          <button type="button" className="btn wide" onClick={() => onDrillMissed(summary)}>
            Drill missed ({missed.length})
          </button>
        )}
      </div>
    </div>
  );
}
