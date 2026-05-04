import ReceiptDivider from './ReceiptDivider';
import { formatReceiptDate, formatReceiptTimestamp } from '@/lib/format/receipt-timestamp';

interface ReceiptHeaderProps {
  ticket?: string;
  date?: Date | string;
  cashier?: string;
  subtitle?: string;
  className?: string;
}

export default function ReceiptHeader({
  ticket,
  date,
  cashier = 'TOR',
  subtitle,
  className = '',
}: ReceiptHeaderProps) {
  const now = date ? new Date(date) : new Date();
  const dateStr = formatReceiptDate(now);
  const timeStr = formatReceiptTimestamp(now).split('  ')[1] ?? '';

  return (
    <div
      className={`font-mono text-[0.875rem] ${className}`}
      style={{ fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)', color: 'var(--ink)' }}
    >
      <ReceiptDivider variant="major" />
      <div className="text-center py-1 text-[1.125rem] font-bold uppercase tracking-wide">
        TOR&apos;S POTTERY STUDIO
      </div>
      {subtitle && (
        <div className="text-center text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
          {subtitle}
        </div>
      )}
      <ReceiptDivider variant="major" />
      <div className="py-0.5 text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
        <span>DATE: {dateStr}</span>
        <span className="ml-4">TIME: {timeStr}</span>
      </div>
      <div className="py-0.5 text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
        CASHIER: {cashier}
      </div>
      {ticket && (
        <div className="py-0.5 text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>
          TICKET #: {ticket}
        </div>
      )}
      <ReceiptDivider variant="major" />
    </div>
  );
}
