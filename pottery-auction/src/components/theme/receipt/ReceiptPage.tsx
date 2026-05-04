import { type ReactNode } from 'react';

interface ReceiptPageProps {
  children: ReactNode;
  className?: string;
}

export default function ReceiptPage({ children, className = '' }: ReceiptPageProps) {
  return (
    <div
      className={`receipt-page min-h-screen py-8 ${className}`}
      style={{
        fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)',
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
      }}
    >
      {children}
    </div>
  );
}
