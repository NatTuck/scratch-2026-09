import { useRef } from 'react';
import type { Angle } from '../lib/cards';
import { ANGLES } from '../lib/cards';
import { angularDistance, normalizeAngle } from '../lib/unitCircle';

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 140;
const LABEL_RADIUS = RADIUS + 24;

interface CircleSvgProps {
  theta: number;
  snapped: Angle | null;
  onAngle: (theta: number) => void;
}

function pointAt(theta: number, radius: number) {
  return {
    x: CENTER + Math.cos(theta) * radius,
    y: CENTER - Math.sin(theta) * radius,
  };
}

export default function CircleSvg({ theta, snapped, onAngle }: CircleSvgProps) {
  const dragging = useRef(false);

  function angleFromEvent(event: React.PointerEvent<SVGSVGElement>): number | null {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * SIZE - CENTER;
    const y = CENTER - ((event.clientY - rect.top) / rect.height) * SIZE;
    if (Math.hypot(x, y) < 8) return null;
    return normalizeAngle(Math.atan2(y, x));
  }

  function handlePointer(event: React.PointerEvent<SVGSVGElement>) {
    const angle = angleFromEvent(event);
    if (angle !== null) onAngle(angle);
  }

  function handleDown(event: React.PointerEvent<SVGSVGElement>) {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    handlePointer(event);
  }

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    if (dragging.current) handlePointer(event);
  }

  function endDrag(event: React.PointerEvent<SVGSVGElement>) {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const point = pointAt(theta, RADIUS);
  const start = pointAt(0, RADIUS);
  const cosineX = CENTER + Math.cos(theta) * RADIUS;
  const sineY = CENTER - Math.sin(theta) * RADIUS;
  const largeArc = theta > Math.PI ? 1 : 0;

  return (
    <svg
      className="circle-svg"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="application"
      aria-label="Unit circle. Drag the point to change the angle, or use the left and right arrow keys."
      data-theta={theta.toFixed(4)}
      data-snapped={snapped?.id ?? 'free'}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* angle wedge */}
      {theta > 0.001 && (
        <path
          d={`M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${point.x} ${point.y} Z`}
          fill="var(--accent)"
          opacity="0.13"
        />
      )}

      {/* axes */}
      <line x1="28" y1={CENTER} x2={SIZE - 28} y2={CENTER} stroke="var(--border)" strokeWidth="1.5" />
      <line x1={CENTER} y1={SIZE - 28} x2={CENTER} y2="28" stroke="var(--border)" strokeWidth="1.5" />

      {/* unit circle */}
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="1.5" />

      {/* scale marks */}
      <text x={CENTER + RADIUS} y={CENTER + 17} textAnchor="middle" className="axis-tick">
        1
      </text>
      <text x={CENTER - RADIUS} y={CENTER + 17} textAnchor="middle" className="axis-tick">
        −1
      </text>
      <text x={CENTER - 10} y={CENTER - RADIUS + 4} textAnchor="end" className="axis-tick">
        1
      </text>
      <text x={CENTER - 10} y={CENTER + RADIUS + 4} textAnchor="end" className="axis-tick">
        −1
      </text>

      {/* angle labels */}
      {ANGLES.map((angle) => {
        const label = pointAt(angle.radians, LABEL_RADIUS);
        const active =
          snapped !== null ? snapped.id === angle.id : angularDistance(theta, angle.radians) < 0.01;
        return (
          <text
            key={angle.id}
            x={label.x}
            y={label.y + 4}
            textAnchor="middle"
            className={active ? 'angle-label active' : 'angle-label'}
          >
            {angle.label}
          </text>
        );
      })}

      {/* tick dots */}
      {ANGLES.map((angle) => {
        const tick = pointAt(angle.radians, RADIUS);
        return <circle key={angle.id} cx={tick.x} cy={tick.y} r="2.5" fill="var(--muted)" />;
      })}

      {/* cosine: horizontal leg */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={cosineX}
        y2={CENTER}
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* sine: vertical leg */}
      <line
        x1={cosineX}
        y1={CENTER}
        x2={cosineX}
        y2={sineY}
        stroke="var(--amber)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* guide back to the y-axis */}
      <line
        x1={cosineX}
        y1={sineY}
        x2={CENTER}
        y2={sineY}
        stroke="var(--muted)"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.55"
      />

      {/* radius arm */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={point.x}
        y2={point.y}
        stroke="var(--text)"
        strokeWidth="2"
        opacity="0.6"
      />

      <circle cx={CENTER} cy={CENTER} r="3" fill="var(--muted)" />
      <circle
        cx={point.x}
        cy={point.y}
        r="7"
        fill="var(--accent)"
        stroke="var(--panel)"
        strokeWidth="2"
      />

      {/* keeps the full square interactive and gives the empty area a hit target */}
      <rect x="0" y="0" width={SIZE} height={SIZE} fill="transparent" pointerEvents="all" />
    </svg>
  );
}
