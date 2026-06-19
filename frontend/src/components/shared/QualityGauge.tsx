import React from 'react';
import type { QualiteEtat } from '../../types';

interface QualityGaugeProps {
  qualite: QualiteEtat;
  size?: 'sm' | 'md';
}

const QUALITE_SEGMENTS: Record<QualiteEtat, number> = {
  COMME_NEUF: 4,
  TRES_BON: 3,
  BON: 2,
  CORRECT: 1,
};

const QUALITE_LABELS: Record<QualiteEtat, string> = {
  COMME_NEUF: 'Comme neuf',
  TRES_BON: 'Très bon',
  BON: 'Bon',
  CORRECT: 'Correct',
};

const FILLED_COLOR = '#1C7A62';
const EMPTY_COLOR = '#DCE1E2';

const QualityGauge: React.FC<QualityGaugeProps> = ({ qualite, size = 'md' }) => {
  const filledCount = QUALITE_SEGMENTS[qualite];
  const label = QUALITE_LABELS[qualite];

  const segmentHeight = size === 'sm' ? 6 : 8;
  const segmentWidth = size === 'sm' ? 18 : 24;
  const gap = size === 'sm' ? 2 : 3;
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap, alignItems: 'center' }}>
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            style={{
              width: segmentWidth,
              height: segmentHeight,
              borderRadius: 2,
              backgroundColor: segment <= filledCount ? FILLED_COLOR : EMPTY_COLOR,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize,
          color: FILLED_COLOR,
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default QualityGauge;
