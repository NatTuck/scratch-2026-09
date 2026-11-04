import { useEffect, useState } from 'react';
import Home from './components/Home';
import Results, { type SessionResult, type Summary } from './components/Results';
import Session from './components/Session';
import UnitCircle from './components/UnitCircle';
import { cardsForDeck, type Card, type DeckId, type Mode } from './lib/cards';
import {
  clearProgress,
  loadProgress,
  recordResult,
  saveProgress,
  selectCards,
  type Progress,
} from './lib/srs';

const SESSION_SIZE = 20;

type View =
  | { kind: 'home' }
  | { kind: 'circle' }
  | { kind: 'session'; deck: DeckId; mode: Mode; cards: Card[] }
  | { kind: 'results'; summary: Summary };

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [view, setView] = useState<View>({ kind: 'home' });
  const [mode, setMode] = useState<Mode>('choice');
  const [round, setRound] = useState(0);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  function startSession(deck: DeckId, mode: Mode, cram: boolean) {
    const deckCards = cardsForDeck(deck);
    const cards = selectCards(
      deckCards,
      progress,
      cram ? deckCards.length : SESSION_SIZE,
      cram,
    );
    if (cards.length === 0) return;
    setRound((value) => value + 1);
    setView({ kind: 'session', deck, mode, cards });
  }

  function handleAnswer(cardId: string, correct: boolean) {
    setProgress((current) => recordResult(current, cardId, correct));
  }

  function finish(deck: DeckId, mode: Mode, results: SessionResult[]) {
    setView({ kind: 'results', summary: { deck, mode, results } });
  }

  function drillMissed(summary: Summary) {
    const missed = summary.results.filter((result) => !result.correct).map((result) => result.card);
    if (missed.length === 0) return;
    setRound((value) => value + 1);
    setView({ kind: 'session', deck: summary.deck, mode: summary.mode, cards: missed });
  }

  function reset() {
    clearProgress();
    setProgress({});
    setView({ kind: 'home' });
  }

  return (
    <main className="app">
      <header className="app-head">
        <div>
          <h1>Trig Drill</h1>
          <p className="muted small">Calc 1 · §3.5 Derivatives of Trigonometric Functions</p>
        </div>
        {view.kind === 'home' || view.kind === 'circle' ? (
          <nav className="tabs" aria-label="Sections">
            <button
              type="button"
              className={view.kind === 'home' ? 'tab active' : 'tab'}
              aria-current={view.kind === 'home' ? 'page' : undefined}
              onClick={() => setView({ kind: 'home' })}
            >
              Drill
            </button>
            <button
              type="button"
              className={view.kind === 'circle' ? 'tab active' : 'tab'}
              aria-current={view.kind === 'circle' ? 'page' : undefined}
              onClick={() => setView({ kind: 'circle' })}
            >
              Unit circle
            </button>
          </nav>
        ) : (
          <span className="pill">in session</span>
        )}
      </header>

      {view.kind === 'home' && (
        <Home
          progress={progress}
          mode={mode}
          onModeChange={setMode}
          onStart={startSession}
          onReset={reset}
        />
      )}

      {view.kind === 'circle' && <UnitCircle />}

      {view.kind === 'session' && (
        <Session
          key={round}
          cards={view.cards}
          mode={view.mode}
          onAnswer={handleAnswer}
          onFinish={(results) => finish(view.deck, view.mode, results)}
          onQuit={() => setView({ kind: 'home' })}
        />
      )}

      {view.kind === 'results' && (
        <Results
          summary={view.summary}
          onDrillMissed={drillMissed}
          onHome={() => setView({ kind: 'home' })}
        />
      )}
    </main>
  );
}
