import ReceiptDivider from './ReceiptDivider';

interface ReceiptFooterProps {
  className?: string;
}

export default function ReceiptFooter({ className = '' }: ReceiptFooterProps) {
  const year = new Date().getFullYear();

  return (
    <div
      className={`font-mono text-center text-[0.6875rem] py-4 ${className}`}
      style={{ fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)', color: 'var(--ink-muted)' }}
    >
      <ReceiptDivider variant="decorative" />
      <div className="py-1 uppercase tracking-wide">
        THANK YOU FOR YOUR BUSINESS
      </div>
      <div className="py-0.5 uppercase">
        ALL SALES FINAL
      </div>
      <div className="py-0.5 uppercase">
        HANDMADE WITH CARE IN BROOKLYN
      </div>
      <ReceiptDivider variant="decorative" />
      <div className="py-1 uppercase tracking-widest text-[0.625rem]">
        KEEP YOUR RECEIPT
      </div>
      <div className="py-0.5 text-[0.625rem]" style={{ color: 'var(--border)' }}>
        © {year} TOR&apos;S BORED POTTERY
      </div>
    </div>
  );
}
