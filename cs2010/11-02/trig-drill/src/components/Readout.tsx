import type { Angle } from '../lib/cards';
import { displayAngle, displayValue, FUNCTIONS } from '../lib/unitCircle';
import Tex from './Tex';

interface ReadoutProps {
  theta: number;
  snapped: Angle | null;
  hidden?: boolean;
}

export default function Readout({ theta, snapped, hidden = false }: ReadoutProps) {
  const angle = displayAngle(theta, snapped);

  return (
    <aside className="readout" aria-live="polite">
      <div className="angle-block">
        <Tex tex={angle.radiansTex} display className="angle-primary" />
        <Tex tex={angle.degreesTex} className="angle-degrees" />
      </div>

      <div className="value-list">
        {FUNCTIONS.map((fn) => {
          const value = displayValue(fn, theta, snapped);
          return (
            <div className={`value-row ${fn}`} key={fn} data-fn={fn} data-tex={value.tex}>
              <span className="value-name">
                <Tex tex={`\\${fn}\\theta`} />
              </span>
              <span className="value-number">
                {hidden ? <span className="value-hidden">?</span> : <Tex tex={value.tex} />}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
