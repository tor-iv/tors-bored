'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
  maxAttempts?: number;
}

// Polls the order API until status is no longer 'pending', then refreshes the page.
// This handles the gap between Stripe's confirmPayment redirect and the webhook processing.
export default function PaymentProcessing({ orderId, maxAttempts = 10 }: Props) {
  const router = useRouter();

  useEffect(() => {
    let attempt = 0;

    const poll = async () => {
      attempt++;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const order = await res.json();
          if (order.status !== 'pending') {
            router.refresh();
            return;
          }
        }
      } catch {
        // ignore transient errors; keep polling
      }

      if (attempt < maxAttempts) {
        setTimeout(poll, 1000);
      }
    };

    setTimeout(poll, 1000);
  }, [orderId, maxAttempts, router]);

  return (
    <div className="py-4 text-center space-y-2" style={{ fontFamily: 'var(--font-display)' }}>
      <div className="text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
        PROCESSING PAYMENT...
      </div>
      <div className="text-[0.6875rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
        Please wait. Do not close this page.
      </div>
    </div>
  );
}
