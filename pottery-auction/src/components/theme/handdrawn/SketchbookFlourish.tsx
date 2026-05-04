'use client';

interface SketchbookFlourishProps {
  seed?: number;
  size?: number;
}

const doodles = [
  'star',
  'leaf',
  'dot-cluster',
  'curved-arrow',
  'circle-dot',
  'tick',
  'cross-hatch',
  'comma-flick',
];

const positions = [
  { top: 4, left: 4, bottom: 'auto', right: 'auto' },
  { top: 4, right: 4, bottom: 'auto', left: 'auto' },
  { bottom: 4, left: 4, top: 'auto', right: 'auto' },
  { bottom: 4, right: 4, top: 'auto', left: 'auto' },
] as const;

export default function SketchbookFlourish({ seed = 0, size = 20 }: SketchbookFlourishProps) {
  const picks = [
    doodles[seed % 8],
    doodles[(seed + 2) % 8],
    doodles[(seed + 4) % 8],
    doodles[(seed + 6) % 8],
  ];

  return (
    <>
      {picks.map((name, i) => {
        const pos = positions[i];
        return (
          <img
            key={i}
            src={`/doodles/${name}.svg`}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: size,
              height: size,
              opacity: 0.5,
              // Tint toward ink color
              filter: 'invert(1) sepia(1) saturate(0.5) hue-rotate(5deg)',
              top: pos.top !== 'auto' ? pos.top : undefined,
              left: pos.left !== 'auto' ? pos.left : undefined,
              bottom: pos.bottom !== 'auto' ? pos.bottom : undefined,
              right: pos.right !== 'auto' ? pos.right : undefined,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        );
      })}
    </>
  );
}
