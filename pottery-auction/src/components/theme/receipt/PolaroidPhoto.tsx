import Image from 'next/image';

interface PolaroidPhotoProps {
  src: string;
  alt: string;
  sku?: string;
  caption?: string;
  /** Use 'thumbnail' for browse list (80×80px) */
  size?: 'full' | 'thumbnail';
  className?: string;
}

export default function PolaroidPhoto({
  src,
  alt,
  sku,
  caption,
  size = 'full',
  className = '',
}: PolaroidPhotoProps) {
  const isThumbnail = size === 'thumbnail';

  // Stable ±3° tilt derived from SKU characters
  const tiltDeg = sku
    ? ([...sku].reduce((a, c) => a + c.charCodeAt(0), 0) % 7) - 3
    : -1.5;

  if (isThumbnail) {
    return (
      <div className={`receipt-polaroid ${className}`}>
        <div
          className="receipt-polaroid-frame"
          style={{ padding: 4, position: 'relative' }}
        >
          <div style={{ width: 80, height: 80, position: 'relative', flexShrink: 0 }}>
            <Image
              src={src}
              alt={alt}
              fill
              style={{ objectFit: 'cover', filter: 'sepia(0.18) saturate(0.88) contrast(1.05) brightness(0.98)' }}
              sizes="80px"
            />
          </div>
        </div>
        {(sku || caption) && (
          <div className="receipt-polaroid-caption">
            {sku && <div className="receipt-polaroid-sku">{sku}</div>}
            {caption && <div>{caption}</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`receipt-polaroid ${className}`}>
      <div
        className="receipt-polaroid-frame"
        style={{
          transform: `rotate(var(--polaroid-tilt, -1.5deg))`,
          ['--polaroid-tilt' as string]: `${tiltDeg}deg`,
        } as React.CSSProperties}
      >
        {/* Tape decorations */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 24,
            height: 8,
            backgroundColor: 'rgba(255,235,150,0.55)',
            top: -4,
            left: 12,
            transform: 'rotate(-6deg)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 24,
            height: 8,
            backgroundColor: 'rgba(255,235,150,0.55)',
            top: -4,
            right: 12,
            transform: 'rotate(6deg)',
          }}
        />
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
          <Image
            src={src}
            alt={alt}
            fill
            style={{
              objectFit: 'cover',
              filter: 'sepia(0.18) saturate(0.88) contrast(1.05) brightness(0.98)',
            }}
            sizes="(max-width: 560px) 100vw, 560px"
          />
        </div>
      </div>
      {(sku || caption) && (
        <div style={{ transform: `rotate(var(--polaroid-tilt, -1.5deg))`, ['--polaroid-tilt' as string]: `${tiltDeg}deg` } as React.CSSProperties}>
          <div className="receipt-polaroid-caption">
            {caption && <div>{caption}</div>}
            {sku && <div className="receipt-polaroid-sku">{sku}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
