'use client';

import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptChrome from '@/components/theme/receipt/ReceiptChrome';
import ReceiptFooterChrome from '@/components/theme/receipt/ReceiptFooterChrome';

interface Props {
  sku: string;
}

export default function SignInGate({ sku }: Props) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <ReceiptPage>
      <ReceiptChrome />
      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>CHECKOUT</span>
        <span className="receipt-section-bar-count">{sku.toUpperCase()}</span>
      </div>
      <div className="py-6 text-center" style={{ lineHeight: 1.8 }}>
        <div className="receipt-stamp-badge" style={{ fontSize: 14, transform: 'rotate(-2deg)' }}>
          SIGN IN REQUIRED
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 12 }}>
          PLEASE SIGN IN TO COMPLETE YOUR PURCHASE.
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="receipt-action-btn" onClick={() => setShowAuth(true)}>
            SIGN IN TO CONTINUE
          </button>
        </div>
      </div>
      <ReceiptFooterChrome barcodeSeed={`CHECKOUT-${sku}`} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </ReceiptPage>
  );
}
