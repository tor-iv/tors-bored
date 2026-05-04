'use client';

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { getStripe } from '@/lib/stripe/client';
import type { OrderTotals } from '@/lib/stripe/pricing';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import Button from '@/components/ui/Button';

// Hardcoded hex values — Stripe Elements does not accept CSS var() strings
const receiptAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#1a1a1a',
    colorBackground: '#f2ede3',
    colorText: '#1a1a1a',
    colorDanger: '#c0392b',
    fontFamily: '"IBM Plex Mono", "Courier New", monospace',
    spacingUnit: '4px',
    borderRadius: '0px',
  },
  rules: {
    '.Input': {
      border: 'none',
      borderBottom: '1px solid #1a1a1a',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      padding: '8px 0',
    },
    '.Label': {
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.05em',
      fontWeight: '400',
    },
    '.Tab': {
      border: '1px solid #d4cfc7',
      borderRadius: '0px',
    },
    '.Tab--selected': {
      borderColor: '#1a1a1a',
    },
  },
};

interface CheckoutItemData {
  id: string;
  sku: string;
  title: string;
  buyNowPrice: number;
}

interface CheckoutClientProps {
  item: CheckoutItemData;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function OrderSummary({ item, amounts }: { item: CheckoutItemData; amounts: OrderTotals }) {
  return (
    <div className="py-2 space-y-1 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
      <div className="flex justify-between">
        <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>ITEM</span>
        <span style={{ color: 'var(--ink)' }}>{item.title}</span>
      </div>
      <div className="flex justify-between">
        <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>SKU</span>
        <span style={{ color: 'var(--ink)' }}>{item.sku}</span>
      </div>
      <ReceiptDivider variant="minor" />
      <div className="flex justify-between">
        <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>SUBTOTAL</span>
        <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(amounts.subtotalCents)}</span>
      </div>
      <div className="flex justify-between">
        <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>SHIPPING</span>
        <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(amounts.shippingCents)}</span>
      </div>
      <div className="flex justify-between">
        <span className="uppercase" style={{ color: 'var(--ink-muted)' }}>TAX (NY 8.875%)</span>
        <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(amounts.taxCents)}</span>
      </div>
      <ReceiptDivider variant="minor" />
      <div className="flex justify-between text-[1rem] font-bold">
        <span className="uppercase" style={{ color: 'var(--ink)' }}>TOTAL</span>
        <span className="receipt-price" style={{ color: 'var(--ink)' }}>{formatCents(amounts.totalCents)}</span>
      </div>
    </div>
  );
}

function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirm?order_id=${orderId}`,
      },
    });

    // confirmPayment only returns here on error — on success it redirects
    if (error) {
      setErrorMessage(error.message ?? 'Payment failed. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="py-1 text-[0.875rem] font-bold uppercase mb-2" style={{ color: 'var(--ink)' }}>
          SHIPPING ADDRESS
        </div>
        <AddressElement options={{ mode: 'shipping', defaultValues: { address: { country: 'US' } } }} />
      </div>

      <ReceiptDivider variant="major" />

      <div>
        <div className="py-1 text-[0.875rem] font-bold uppercase mb-2" style={{ color: 'var(--ink)' }}>
          PAYMENT
        </div>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="py-2 text-[0.875rem] uppercase" style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}>
          ERROR: {errorMessage}
        </div>
      )}

      <ReceiptDivider variant="major" />
      <Button
        type="submit"
        intent="primary"
        disabled={!stripe || !elements || isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? '[ PROCESSING... ]' : '[ COMPLETE PURCHASE ]'}
      </Button>
      <div className="text-[0.6875rem] text-center uppercase pt-1" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
        PAYMENTS SECURED BY STRIPE
      </div>
    </form>
  );
}

export default function CheckoutClient({ item }: CheckoutClientProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<OrderTotals | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/checkout/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku: item.sku }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          const code = data.error ?? 'unknown_error';
          setError(code === 'item_unavailable'
            ? 'This item is currently being purchased by another customer. Please check back shortly.'
            : code === 'item_sold'
            ? 'This item has already been sold.'
            : data.message ?? 'Unable to start checkout. Please try again.');
        } else {
          setClientSecret(data.clientSecret);
          setOrderId(data.orderId);
          setAmounts(data.amounts);
        }
      })
      .catch(() => setError('Network error. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [item.sku]);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-[0.875rem] uppercase" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
        PREPARING CHECKOUT...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 space-y-3 text-[0.875rem]" style={{ fontFamily: 'var(--font-display)' }}>
        <ReceiptDivider variant="major" />
        <div className="uppercase font-bold" style={{ color: 'var(--error)' }}>
          CHECKOUT UNAVAILABLE
        </div>
        <div className="uppercase text-[0.6875rem]" style={{ color: 'var(--ink-muted)' }}>{error}</div>
        <ReceiptDivider variant="major" />
      </div>
    );
  }

  if (!clientSecret || !orderId || !amounts) return null;

  return (
    <>
      <ReceiptDivider variant="major" />
      <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
        ORDER SUMMARY
      </div>
      <ReceiptDivider variant="major" />
      <OrderSummary item={item} amounts={amounts} />
      <ReceiptDivider variant="major" />
      <div className="py-1 text-[0.875rem] font-bold uppercase" style={{ color: 'var(--ink)' }}>
        CHECKOUT
      </div>
      <ReceiptDivider variant="major" />
      <div className="py-3">
        <Elements
          stripe={getStripe()}
          options={{ clientSecret, appearance: receiptAppearance }}
        >
          <CheckoutForm orderId={orderId} />
        </Elements>
      </div>
    </>
  );
}
