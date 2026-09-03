interface ReceiptLoaderProps {
  label?: string;
  className?: string;
}

export default function ReceiptLoader({ label = 'LOADING', className = '' }: ReceiptLoaderProps) {
  return (
    <div
      className={`font-mono text-[0.875rem] py-4 ${className}`}
      style={{ fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)', color: 'var(--ink-muted)' }}
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="uppercase">{label}</div>
      <div className="receipt-loader-dots">. . . . . . . . . . . . . . . . . . . .</div>
    </div>
  );
}
