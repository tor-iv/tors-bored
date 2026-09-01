'use client';

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { getStripe } from '@/lib/stripe/client';
import type { OrderTotals } from '@/lib/stripe/pricing';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

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

// ─── Leader-dot line row ──────────────────────────────────────────────────────

function LineRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="receipt-line-item"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: accent ? '0.875rem' : '0.75rem',
        color: 'var(--ink-muted)',
      }}
    >
      <span className="uppercase whitespace-nowrap">{label}</span>
      <span className="leader" aria-hidden="true" />
      <span style={{ color: 'var(--ink)', fontFamily: accent ? 'var(--font-thermal)' : undefined, fontSize: accent ? '1rem' : undefined }}>
        {value}
      </span>
    </div>
  );
}

// ─── Order summary block ──────────────────────────────────────────────────────

function OrderSummary({ item, amounts }: { item: CheckoutItemData; amounts: OrderTotals }) {
  return (
    <div className="py-2 space-y-1">
      <LineRow label="ITEM" value={item.title} />
      <LineRow label="SKU" value={item.sku} />
      <ReceiptDivider variant="minor" />
      <LineRow
        label="SUBTOTAL"
        value={
          <span className="receipt-price">{formatCents(amounts.subtotalCents)}</span>
        }
      />
      <LineRow
        label="SHIPPING"
        value={
          <span className="receipt-price">{formatCents(amounts.shippingCents)}</span>
        }
      />
      <LineRow
        label="TAX (NY 8.875%)"
        value={
          <span className="receipt-price">{formatCents(amounts.taxCents)}</span>
        }
      />
      <ReceiptDivider variant="minor" />
      {/* Big VT323 TOTAL */}
      <div
        className="receipt-line-item"
        style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', color: 'var(--ink-muted)' }}
      >
        <span className="uppercase whitespace-nowrap font-bold" style={{ color: 'var(--ink)' }}>TOTAL</span>
        <span className="leader" aria-hidden="true" />
        <span
          className="receipt-price"
          style={{
            fontFamily: 'var(--font-thermal)',
            fontSize: '2rem',
            lineHeight: 1,
            color: 'var(--ink)',
            letterSpacing: '0.05em',
          }}
        >
          {formatCents(amounts.totalCents)}
        </span>
      </div>
    </div>
  );
}

// ─── Stripe payment form ──────────────────────────────────────────────────────

function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
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
      {/* Shipping address */}
      <div>
        <div
          className="py-1 text-[0.625rem] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
        >
          SHIP TO
        </div>
        <ReceiptDivider variant="minor" />
        <div className="py-2">
          <AddressElement options={{ mode: 'shipping', defaultValues: { address: { country: 'US' } } }} />
        </div>
      </div>

      <ReceiptDivider variant="major" />

      {/* Payment */}
      <div>
        <div
          className="py-1 text-[0.625rem] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
        >
          PAYMENT METHOD
        </div>
        <ReceiptDivider variant="minor" />
        <div className="py-2">
          <PaymentElement />
        </div>
      </div>

      {errorMessage && (
        <div className="py-2 text-[0.75rem] uppercase" style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}>
          *** ERROR: {errorMessage} ***
        </div>
      )}

      <ReceiptDivider variant="major" />

      {/* PAY NOW button */}
      <div className="flex justify-center py-2">
        <button
          type="submit"
          disabled={!stripe || !elements || isSubmitting}
          className="receipt-action-btn"
          style={{ cursor: isSubmitting ? 'wait' : undefined }}
        >
          {isSubmitting ? 'PROCESSING...' : 'PAY NOW'}
        </button>
      </div>
      <div
        className="text-[0.5rem] text-center uppercase tracking-widest"
        style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
      >
        ● PAYMENTS SECURED BY STRIPE ●
      </div>
    </form>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

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
      <div
        className="py-8 text-center text-[0.75rem] uppercase tracking-widest"
        style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
      >
        <span className="receipt-loader-dots">PREPARING INVOICE</span>
        <span className="dot-matrix-cursor">_</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 space-y-3" style={{ fontFamily: 'var(--font-display)' }}>
        <ReceiptDivider variant="major" />
        <div className="text-[0.875rem] uppercase font-bold text-center" style={{ color: 'var(--error)' }}>
          CHECKOUT UNAVAILABLE
        </div>
        <div className="text-[0.6875rem] uppercase text-center" style={{ color: 'var(--ink-muted)' }}>{error}</div>
        <ReceiptDivider variant="major" />
      </div>
    );
  }

  if (!clientSecret || !orderId || !amounts) return null;

  return (
    <>
      <ReceiptDivider variant="major" />

      {/* ── ORDER SUMMARY ── */}
      <div
        className="text-[0.625rem] uppercase tracking-widest pb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        ORDER SUMMARY
      </div>
      <ReceiptDivider variant="minor" />
      <OrderSummary item={item} amounts={amounts} />

      <ReceiptDivider variant="major" />

      {/* ── CHECKOUT FORM ── */}
      <div
        className="text-[0.625rem] uppercase tracking-widest pb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        INVOICE · PAYMENT DUE NOW
      </div>
      <ReceiptDivider variant="minor" />

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
