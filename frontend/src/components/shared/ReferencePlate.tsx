import React from 'react';

interface ReferencePlateProps {
  reference: string;
  marque?: string;
  modele?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: {
    refFontSize: '11px',
    metaFontSize: '10px',
    letterSpacing: '0.08em',
    px: '8px',
    py: '4px',
    gap: '3px',
    borderRadius: '4px',
  },
  md: {
    refFontSize: '13px',
    metaFontSize: '11px',
    letterSpacing: '0.10em',
    px: '12px',
    py: '6px',
    gap: '4px',
    borderRadius: '4px',
  },
  lg: {
    refFontSize: '15px',
    metaFontSize: '12px',
    letterSpacing: '0.12em',
    px: '16px',
    py: '8px',
    gap: '5px',
    borderRadius: '4px',
  },
};

const ReferencePlate: React.FC<ReferencePlateProps> = ({
  reference,
  marque,
  modele,
  size = 'md',
}) => {
  const cfg = SIZE_CONFIG[size];
  const hasSecondary = Boolean(marque || modele);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: cfg.gap,
        backgroundColor: 'var(--atelier)',
        border: '1px solid var(--rule)',
        borderRadius: cfg.borderRadius,
        paddingLeft: cfg.px,
        paddingRight: cfg.px,
        paddingTop: cfg.py,
        paddingBottom: cfg.py,
        boxShadow: 'inset 0 1px 3px rgba(24,33,31,0.07), inset 0 -1px 0 rgba(255,255,255,0.6)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
      aria-label={[marque, modele, reference].filter(Boolean).join(' ')}
    >
      <span
        style={{
          fontSize: cfg.refFontSize,
          fontWeight: 500,
          letterSpacing: cfg.letterSpacing,
          color: 'var(--graphite)',
          lineHeight: 1,
          textTransform: 'uppercase',
          userSelect: 'all',
        }}
      >
        {reference}
      </span>

      {hasSecondary && (
        <span
          style={{
            fontSize: cfg.metaFontSize,
            fontWeight: 400,
            letterSpacing: '0.04em',
            color: 'var(--steel)',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {marque && (
            <span style={{ textTransform: 'uppercase' }}>{marque}</span>
          )}
          {marque && modele && (
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: '1px',
                height: '0.75em',
                backgroundColor: 'var(--rule)',
                verticalAlign: 'middle',
                flexShrink: 0,
              }}
            />
          )}
          {modele && <span>{modele}</span>}
        </span>
      )}
    </div>
  );
};

export default ReferencePlate;
