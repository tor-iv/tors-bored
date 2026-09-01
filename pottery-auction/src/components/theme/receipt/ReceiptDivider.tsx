interface ReceiptDividerProps {
  variant?: 'major' | 'minor' | 'decorative' | 'tear';
  className?: string;
}

// Real CSS rules instead of repeated glyph strings — crisp at every width,
// no overflow clipping, and the tear variant matches the mockup's ✂-plus-dash
// cut-here row.
const BORDER_STYLES: Record<'major' | 'minor' | 'decorative', React.CSSProperties> = {
  major:      { borderTop: '1px dashed var(--border)' },
  minor:      { borderTop: '1px dotted var(--border)' },
  decorative: { borderTop: '2px dashed var(--border)' },
};

export default function ReceiptDivider({ variant = 'minor', className = '' }: ReceiptDividerProps) {
  if (variant === 'tear') {
    return (
      <div
        role="separator"
        aria-hidden
        className={`flex items-center gap-2 ${className}`}
        style={{ color: 'var(--border)', fontSize: 11 }}
      >
        <span>✂</span>
        <span className="flex-1" style={{ borderBottom: '2px dashed var(--border)' }} />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-hidden
      className={`my-2 ${className}`}
      style={BORDER_STYLES[variant]}
    />
  );
}
