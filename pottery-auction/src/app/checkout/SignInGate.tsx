'use client';

import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptHeader from '@/components/theme/receipt/ReceiptHeader';
import ReceiptFooter from '@/components/theme/receipt/ReceiptFooter';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import Button from '@/components/ui/Button';

interface Props {
  sku: string;
}

export default function SignInGate({ sku }: Props) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <ReceiptPage>
      <ReceiptHeader ticket={`CHECKOUT-${sku}`} />
      <ReceiptDivider variant="major" />
      <div className="py-4 text-center space-y-3" style={{ fontFamily: 'var(--font-display)' }}>
        <div className="text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
          SIGN IN REQUIRED
        </div>
        <div className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
          Please sign in to complete your purchase.
        </div>
      </div>
      <ReceiptDivider variant="major" />
      <div className="py-3">
        <Button intent="primary" onClick={() => setShowAuth(true)}>
          [ SIGN IN TO CONTINUE ]
        </Button>
      </div>
      <ReceiptDivider variant="major" />
      <ReceiptFooter />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </ReceiptPage>
  );
}
