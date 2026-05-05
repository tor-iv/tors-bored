interface BarcodeProps {
  seed: string; // e.g. order ID — used to generate deterministic bar pattern
  className?: string;
}

export default function Barcode({ seed, className = '' }: BarcodeProps) {
  // Generate a deterministic bar pattern from the seed string
  const hash = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0x7fffffff, 0);

  // Create 28 bars with varied widths (1–3px), total ~90px wide
  const bars: Array<{ width: number; isBar: boolean }> = [];
  let h = hash;
  for (let i = 0; i < 28; i++) {
    h = (h * 1664525 + 1013904223) & 0x7fffffff; // LCG step
    bars.push({
      width: (h % 3) + 1,
      isBar: h % 4 !== 0, // 75% black, 25% gap
    });
  }

  const gradientStops: string[] = [];
  let pos = 0;
  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);

  bars.forEach(({ width, isBar }) => {
    const pct = (pos / totalWidth) * 100;
    const endPct = ((pos + width) / totalWidth) * 100;
    const color = isBar ? '#1a1a1a' : '#f2ede3';
    gradientStops.push(`${color} ${pct.toFixed(1)}%`, `${color} ${endPct.toFixed(1)}%`);
    pos += width;
  });

  return (
    <div className={`receipt-barcode ${className}`} aria-hidden="true">
      <div
        className="receipt-barcode-bars"
        style={{
          background: `linear-gradient(to right, ${gradientStops.join(', ')})`,
        }}
      />
      <div className="receipt-barcode-label">{seed.slice(0, 16).toUpperCase()}</div>
    </div>
  );
}
