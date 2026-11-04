import { TAU, normalizeAngle } from '../lib/unitCircle';

const WIDTH = 720;
const HEIGHT = 236;
const PAD = { left: 48, right: 16, top: 16, bottom: 30 };
const PLOT_WIDTH = WIDTH - PAD.left - PAD.right;
const SIN_CENTER = 56;
const COS_CENTER = 160;
const AMPLITUDE = 34;
const SAMPLES = 160;

function xFor(theta: number): number {
  return PAD.left + (normalizeAngle(theta) / TAU) * PLOT_WIDTH;
}

function curvePath(kind: 'sin' | 'cos', center: number): string {
  let d = '';
  for (let i = 0; i <= SAMPLES; i++) {
    const theta = (i / SAMPLES) * TAU;
    const value = kind === 'sin' ? Math.sin(theta) : Math.cos(theta);
    const x = PAD.left + (i / SAMPLES) * PLOT_WIDTH;
    const y = center - value * AMPLITUDE;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
}

const X_TICKS = [
  { theta: 0, label: '0', anchor: 'start' as const },
  { theta: Math.PI / 2, label: 'π/2', anchor: 'middle' as const },
  { theta: Math.PI, label: 'π', anchor: 'middle' as const },
  { theta: (3 * Math.PI) / 2, label: '3π/2', anchor: 'middle' as const },
  { theta: TAU, label: '2π', anchor: 'end' as const },
];

interface WaveStripProps {
  theta: number;
}

export default function WaveStrip({ theta }: WaveStripProps) {
  const playheadX = xFor(theta);
  const sinY = SIN_CENTER - Math.sin(theta) * AMPLITUDE;
  const cosY = COS_CENTER - Math.cos(theta) * AMPLITUDE;

  return (
    <figure className="wave">
      <figcaption className="muted small">
        sin θ and cos θ as you drag — the same values, unrolled
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Sine and cosine curves with a playhead at the current angle">
        <text x={PAD.left} y={12} className="wave-label sin">
          sin θ
        </text>
        <text x={PAD.left} y={COS_CENTER - AMPLITUDE - 14} className="wave-label cos">
          cos θ
        </text>

        {[SIN_CENTER, COS_CENTER].map((center) => (
          <line
            key={center}
            x1={PAD.left}
            y1={center}
            x2={WIDTH - PAD.right}
            y2={center}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}

        {X_TICKS.map((tick) => {
          const x = PAD.left + (tick.theta / TAU) * PLOT_WIDTH;
          return (
            <line
              key={tick.theta}
              x1={x}
              y1={SIN_CENTER - AMPLITUDE - 4}
              x2={x}
              y2={COS_CENTER + AMPLITUDE + 4}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.6"
            />
          );
        })}

        <path d={curvePath('sin', SIN_CENTER)} fill="none" stroke="var(--amber)" strokeWidth="2" />
        <path d={curvePath('cos', COS_CENTER)} fill="none" stroke="var(--accent)" strokeWidth="2" />

        {[1, 0, -1].map((value) => (
          <g key={value}>
            <text x={PAD.left - 10} y={SIN_CENTER - value * AMPLITUDE + 4} textAnchor="end" className="axis-tick">
              {value === -1 ? '−1' : value}
            </text>
            <text x={PAD.left - 10} y={COS_CENTER - value * AMPLITUDE + 4} textAnchor="end" className="axis-tick">
              {value === -1 ? '−1' : value}
            </text>
          </g>
        ))}

        <line
          x1={playheadX}
          y1={SIN_CENTER - AMPLITUDE - 10}
          x2={playheadX}
          y2={COS_CENTER + AMPLITUDE + 10}
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <circle cx={playheadX} cy={sinY} r="5" fill="var(--amber)" stroke="var(--panel)" strokeWidth="2" />
        <circle cx={playheadX} cy={cosY} r="5" fill="var(--accent)" stroke="var(--panel)" strokeWidth="2" />

        {X_TICKS.map((tick) => {
          const x = PAD.left + (tick.theta / TAU) * PLOT_WIDTH;
          return (
            <text key={tick.label} x={x} y={HEIGHT - 8} textAnchor={tick.anchor} className="axis-tick">
              {tick.label}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}
