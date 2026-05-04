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

  return (
    <div className={`receipt-polaroid ${className}`}>
      <div
        className="receipt-polaroid-frame"
        style={isThumbnail ? { padding: 4 } : undefined}
      >
        {isThumbnail ? (
          <div style={{ width: 80, height: 80, position: 'relative', flexShrink: 0 }}>
            <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} sizes="80px" />
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
            <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 560px) 100vw, 560px" />
          </div>
        )}
      </div>
      {(sku || caption) && (
        <div className="receipt-polaroid-caption">
          {sku && <div className="receipt-polaroid-sku">{sku}</div>}
          {caption && <div>{caption.toUpperCase()}</div>}
        </div>
      )}
    </div>
  );
}
