# Trig Drill

Static flashcard app for Calculus Volume 1, §3.5 (derivatives of trig functions).
Built for a no-calculator, no-formula-sheet quiz.

Two decks:

- **Exact trig values** — sin, cos and tan at the 16 unit-circle angles, including the
  undefined ones.
- **Trig derivatives** — the six base rules plus higher-order derivatives of sin and cos.

Two answer modes: four-choice quiz (distractors are real traps: sign flips, swapped
functions, reciprocal values) and flip-and-self-grade. Scheduling is a five-box Leitner
system stored in `localStorage`.

## Unit circle tab

- **Explore** — drag the point (mouse, touch, or arrow keys) around the circle. cos θ is
  the blue horizontal leg, sin θ the amber vertical leg. Exact values are shown at all 16
  special angles; turn snap off for free dragging with decimals. A synced sine/cosine
  strip unrolls the same angle so the signs and curve values line up.
- **Reverse quiz** — given something like `cos θ = −1/2`, drag to any angle that works.
  Five rounds, with all solutions revealed after each answer.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # card, scheduling and unit-circle checks
npm run build    # static output in dist/
npm run preview  # serve the build
```

`dist/` is fully static and uses relative paths, so it works from any subdirectory of a
static host. Serve it rather than opening the file directly — browsers block ES modules on
`file://`. KaTeX fonts are bundled, so it runs offline once served.

## Notes

- Content lives in `src/lib/cards.ts` as data tables, not hand-written cards. Add an angle
  there and the sin/cos/tan cards appear automatically.
- The unit circle reads the same `ANGLES` table, so the drill and the visualization can
  never disagree. Geometry and quiz logic live in `src/lib/unitCircle.ts`.
- `src/lib/srs.ts` handles boxes and persistence. Progress key:
  `trig-drill:v1:progress`.
