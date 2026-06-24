/**
 * RECONDITECH brand logo.
 *
 * Mark — a verdigris tile holding a white "renewal" loop (the reconditioning
 * cycle) wrapped around a brass hex nut (the hardware / tech core):
 * recondition + tech, in one geometric mark. Built to stay legible from a
 * 16px favicon up to a hero lockup.
 *
 * Geometry mirrors `public/favicon.svg` — keep the two in sync if either moves.
 */

interface LogoProps {
  /** Square size of the mark in px. The wordmark scales from this. */
  size?: number;
  /** Render the RECONDITECH wordmark next to the mark. */
  wordmark?: boolean;
  /** Small mono caption under the wordmark (e.g. "Admin"). Implies wordmark. */
  subtitle?: string;
  /** Tile / accent colors. Defaults to the brand palette. */
  tile?: string;
  loop?: string;
  hex?: string;
}

// ─── Mark ──────────────────────────────────────────────────────────────────────

function Mark({
  size = 28,
  tile = '#1C7A62',
  loop = '#FAFBFB',
  hex = '#A87C2A',
}: Pick<LogoProps, 'size' | 'tile' | 'loop' | 'hex'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="64" height="64" rx="15" fill={tile} />
      {/* Renewal loop — open circle with a gap at the top. */}
      <path
        d="M37.47 16.96 A16 16 0 1 1 26.53 16.96"
        fill="none"
        stroke={loop}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Arrowhead closing the loop into the gap. */}
      <path d="M32.17 14.91 L27 22.64 L23.24 12.3 Z" fill={loop} />
      {/* Hex nut core. */}
      <path
        d="M38.5 32 L35.25 37.63 L28.75 37.63 L25.5 32 L28.75 26.37 L35.25 26.37 Z"
        fill={hex}
      />
    </svg>
  );
}

// ─── Logo lockup ─────────────────────────────────────────────────────────────

export default function Logo({
  size = 28,
  wordmark = true,
  subtitle,
  tile,
  loop,
  hex,
}: LogoProps) {
  const showWord = wordmark || Boolean(subtitle);
  const wordSize = Math.round(size * 0.58);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(size * 0.32),
        lineHeight: 1,
      }}
    >
      <Mark size={size} tile={tile} loop={loop} hex={hex} />

      {showWord && (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 700,
              fontSize: wordSize,
              letterSpacing: '0.01em',
              lineHeight: 1,
              color: 'var(--graphite)',
              whiteSpace: 'nowrap',
            }}
          >
            RECONDI<span style={{ color: 'var(--verdigris)' }}>TECH</span>
          </span>
          {subtitle && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500,
                fontSize: Math.max(9, Math.round(size * 0.34)),
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--steel)',
              }}
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
