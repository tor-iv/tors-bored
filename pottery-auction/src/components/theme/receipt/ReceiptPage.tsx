import { type ReactNode } from 'react';

interface ReceiptPageProps {
  children: ReactNode;
  className?: string;
}

export default function ReceiptPage({ children, className = '' }: ReceiptPageProps) {
  return (
    <div className="receipt-strip">
      <div className={`receipt-strip-paper ${className}`}>
        <div className="receipt-edge-top" aria-hidden="true" />
        <div className="receipt-strip-content">
          {children}
        </div>
        <div className="receipt-edge-bottom" aria-hidden="true" />
      </div>
    </div>
  );
}
