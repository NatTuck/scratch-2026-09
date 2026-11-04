import { useEffect, useMemo, useRef, useState } from 'react';
import { buildChoices, type Card, type Mode } from '../lib/cards';
import type { SessionResult } from './Results';
import Tex from './Tex';

interface SessionProps {
  cards: Card[];
  mode: Mode;
  onAnswer: (cardId: string, correct: boolean) => void;
  onFinish: (results: SessionResult[]) => void;
  onQuit: () => void;
}

export default function Session({ cards, mode, onAnswer, onFinish, onQuit }: SessionProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const resultsRef = useRef<SessionResult[]>([]);
  const card = cards[index];

  const choiceMap = useMemo(
    () => new Map(cards.map((entry) => [entry.id, buildChoices(entry)])),
    [cards],
  );
  const choices = choiceMap.get(card.id) ?? [card.answer];

  function commit(correct: boolean) {
    if (answered) return;
    resultsRef.current = [...resultsRef.current, { card, correct }];
    onAnswer(card.id, correct);
    setAnswered(true);
  }

  function pick(choice: string) {
    if (answered) return;
    setSelected(choice);
    commit(choice === card.answer);
  }

  function next() {
    if (!answered) return;
    if (index + 1 >= cards.length) {
      onFinish(resultsRef.current);
      return;
    }
    setIndex(index + 1);
    setRevealed(false);
    setSelected(null);
    setAnswered(false);
  }

  // Re-registered each render so the handlers always see current state.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onQuit();
        return;
      }

      if (mode === 'flip') {
        if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
          event.preventDefault();
          setRevealed(true);
          return;
        }
        if (revealed && !answered && (event.key === '1' || event.key === '2')) {
          event.preventDefault();
          commit(event.key === '2');
          return;
        }
      } else if (!answered) {
        const slot = Number(event.key);
        if (Number.isInteger(slot) && slot >= 1 && slot <= choices.length) {
          event.preventDefault();
          pick(choices[slot - 1]);
          return;
        }
      }

      if (answered && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        next();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const correctSoFar = resultsRef.current.filter((result) => result.correct).length;
  const percent = ((index + (answered ? 1 : 0)) / cards.length) * 100;

  return (
    <div className="stack session">
      <div className="session-head">
        <span className="muted small">
          Card {index + 1} of {cards.length}
        </span>
        <span className="muted small">
          {correctSoFar} correct · {answered ? index + 1 - correctSoFar : index - correctSoFar} missed
        </span>
        <button type="button" className="btn ghost small" onClick={onQuit}>
          Quit (Esc)
        </button>
      </div>
      <div className="meter thin" aria-hidden="true">
        <span className="meter-progress" style={{ width: `${percent}%` }} />
      </div>

      <section className="cardface" aria-live="polite">
        <Tex tex={card.prompt} display className="prompt" />
        {mode === 'flip' && revealed && (
          <div className="answer">
            <span className="muted small">Answer</span>
            <Tex tex={card.answer} display />
          </div>
        )}
      </section>

      {mode === 'flip' ? (
        !revealed ? (
          <button type="button" className="btn primary wide" onClick={() => setRevealed(true)}>
            Show answer <kbd>Space</kbd>
          </button>
        ) : !answered ? (
          <div className="grade-row">
            <button type="button" className="btn danger wide" onClick={() => commit(false)}>
              Missed <kbd>1</kbd>
            </button>
            <button type="button" className="btn good wide" onClick={() => commit(true)}>
              Got it <kbd>2</kbd>
            </button>
          </div>
        ) : (
          <>
            <p className="feedback">
              {resultsRef.current[resultsRef.current.length - 1]?.correct
                ? 'Nice.'
                : 'Logged as a miss — it will come back.'}
            </p>
            <button type="button" className="btn primary wide" onClick={next}>
              {index + 1 >= cards.length ? 'See results' : 'Next card'} <kbd>Space</kbd>
            </button>
          </>
        )
      ) : (
        <>
          <div className="choices">
            {choices.map((choice, slot) => {
              const isAnswer = choice === card.answer;
              const isSelected = choice === selected;
              let className = 'choice';
              if (answered && isAnswer) className += ' correct';
              if (answered && isSelected && !isAnswer) className += ' wrong';
              return (
                <button
                  type="button"
                  key={`${card.id}-${choice}`}
                  className={className}
                  disabled={answered}
                  onClick={() => pick(choice)}
                >
                  <span className="choice-key">{slot + 1}</span>
                  <Tex tex={choice} />
                </button>
              );
            })}
          </div>

          {answered ? (
            <>
              <p className={selected === card.answer ? 'feedback good-text' : 'feedback bad-text'}>
                {selected === card.answer ? 'Correct.' : 'Not quite — the answer is highlighted.'}
              </p>
              <button type="button" className="btn primary wide" onClick={next}>
                {index + 1 >= cards.length ? 'See results' : 'Next card'} <kbd>Space</kbd>
              </button>
            </>
          ) : (
            <p className="feedback muted small">Pick one. Keys 1–4 work too.</p>
          )}
        </>
      )}
    </div>
  );
}
