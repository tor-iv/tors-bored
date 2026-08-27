import React from 'react';

// Hand-drawn vessel silhouettes — deterministic pick from the title, used as
// the fallback "print" for items with no photo yet.
const VESSELS: React.ReactNode[] = [
  <path key="vase" d="M40 18 q-3 8 2 14 q-14 8 -14 30 q0 22 22 22 q22 0 22 -22 q0 -22 -14 -30 q5 -6 2 -14 z" />,
  <path key="bowl" d="M22 46 q28 30 56 0 q-2 -4 -8 -4 l-40 0 q-6 0 -8 4 z" />,
  <g key="mug">
    <path d="M30 34 l36 0 l-3 44 l-30 0 z" />
    <path d="M66 44 q16 2 14 16 q-2 12 -14 12" fill="none" />
  </g>,
  <path key="jug" d="M38 22 l16 0 l3 10 q10 6 10 24 q0 22 -21 22 q-21 0 -21 -22 q0 -16 10 -24 z" />,
];

function vesselFor(title: string): React.ReactNode {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return VESSELS[h % VESSELS.length];
}

const SIZE_STYLES: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
  sm: { width: 86, height: 86 },
  md: { width: 112, height: 112 },
  lg: { width: '100%', aspectRatio: '4 / 3' },
};

interface ReceiptPhotoFrameProps {
  src?: string | null;
  alt: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  /** Optional rubber stamp pinned to the frame's top-right corner. */
  stamp?: { label: string; variant?: 'blue' | 'red'; rotate?: number };
  className?: string;
}

/** Item photo rendered as a halftone "receipt print" (see .receipt-photo-frame
 *  in globals.css). Falls back to the hand-drawn vessel + STUDIO PROOF stamp. */
export default function ReceiptPhotoFrame({
  src,
  alt,
  title,
  size = 'sm',
  stamp,
  className = '',
}: ReceiptPhotoFrameProps) {
  return (
    <div className={`relative ${className}`} style={size === 'lg' ? { width: '100%' } : undefined}>
      <div className="receipt-photo-frame" style={SIZE_STYLES[size]}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} loading="lazy" />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              width="62%"
              height="62%"
              fill="var(--ink)"
              stroke="var(--ink)"
              strokeWidth={1.5}
              strokeLinejoin="round"
              style={{ opacity: 0.5 }}
              aria-hidden
            >
              <g fillOpacity={0.06}>{vesselFor(title)}</g>
            </svg>
            <span
              className="receipt-stamp"
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                fontFamily: 'var(--font-stamp)',
                fontSize: '0.5rem',
                letterSpacing: '0.15em',
                color: 'var(--ink-muted)',
                opacity: 0.6,
                transform: 'rotate(-4deg)',
              }}
            >
              STUDIO PROOF
            </span>
          </div>
        )}
      </div>
      {stamp && (
        <div
          className={`receipt-stamp-badge${stamp.variant === 'red' ? ' receipt-stamp-badge--red' : ''}`}
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            transform: `rotate(${stamp.rotate ?? 4}deg)`,
          }}
        >
          {stamp.label}
        </div>
      )}
    </div>
  );
}
