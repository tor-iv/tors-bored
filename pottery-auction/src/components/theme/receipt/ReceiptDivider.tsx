interface ReceiptDividerProps {
  variant?: 'major' | 'minor' | 'decorative' | 'tear';
  className?: string;
}

const PATTERNS = {
  major:     '================================',
  minor:     '--------------------------------',
  decorative:'* * * * * * * * * * * * * * * *',
} as const;

export default function ReceiptDivider({ variant = 'minor', className = '' }: ReceiptDividerProps) {
  if (variant === 'tear') {
    return <div className={`receipt-tear ${className}`} role="separator" aria-hidden />;
  }

  const pattern = PATTERNS[variant];

  return (
    <div
      role="separator"
      aria-hidden
      className={`divider-${variant} overflow-hidden whitespace-nowrap text-[0.75rem] leading-relaxed select-none ${className}`}
      style={{ color: 'var(--ink-muted)' }}
    >
      {pattern.repeat(10)}
    </div>
  );
}
