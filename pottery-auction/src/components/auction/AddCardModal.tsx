'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { getStripe } from '@/lib/stripe/client';
import { modalOverlay, modalContent } from '@/lib/animation-variants';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

// Receipt-themed Stripe Elements appearance — hardcoded, CSS vars not accepted
const receiptAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#1a1a1a',
    colorBackground: '#f2ede3',
    colorText: '#1a1a1a',
    colorDanger: '#cc2200',
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
  },
};

interface SetupFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

function SetupForm({ onSuccess, onClose }: SetupFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: window.location.href,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? 'Card setup failed. Please try again.');
      setIsSubmitting(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {errorMessage && (
        <div
          className="text-[0.75rem] uppercase py-2"
          style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}
        >
          ERROR: {errorMessage}
        </div>
      )}

      <ReceiptDivider variant="major" />

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="receipt-stamp w-full py-3 text-[0.875rem] uppercase tracking-widest border border-current"
        style={{
          fontFamily: 'var(--font-stamp)',
          color: isSubmitting ? 'var(--ink-muted)' : 'var(--ink)',
          transform: 'rotate(-0.3deg)',
          boxShadow: isSubmitting ? 'none' : '2px 2px 0 var(--ink)',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? '[ SAVING... ]' : '[ SAVE CARD ]'}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="w-full text-center text-[0.6875rem] uppercase py-1"
        style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
      >
        CANCEL
      </button>
    </form>
  );
}

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCardModal({ isOpen, onClose, onSuccess }: AddCardModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setSetupError(null);
      return;
    }

    setIsLoading(true);
    fetch('/api/payments/setup-intent', { method: 'POST' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setSetupError(data.error ?? 'Unable to set up payment. Please try again.');
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(() => setSetupError('Network error. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  function handleSuccess() {
    onSuccess();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(26,26,26,0.65)' }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="receipt-modal w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="receipt-strip-content py-4">
                <div
                  className="text-center text-[0.625rem] uppercase tracking-widest mb-1"
                  style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                >
                  TOR&apos;S BORED POTTERY CO.
                </div>
                <div
                  className="text-center text-[1rem] font-bold uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
                >
                  ADD PAYMENT METHOD
                </div>
                <div
                  className="text-center text-[0.6875rem] uppercase mt-1"
                  style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                >
                  REQUIRED TO PLACE BIDS
                </div>

                <ReceiptDivider variant="decorative" className="mt-3" />

                <p
                  className="text-[0.75rem] uppercase text-center py-2"
                  style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                >
                  A PAYMENT METHOD IS NEEDED TO PARTICIPATE
                  IN LIVE AUCTIONS. YOUR CARD WILL ONLY BE
                  CHARGED IF YOU WIN.
                </p>

                <ReceiptDivider variant="major" />

                {isLoading && (
                  <div
                    className="py-6 text-center text-[0.75rem] uppercase"
                    style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                  >
                    <span className="receipt-loader-dots">LOADING PAYMENT FORM</span>
                    <span className="dot-matrix-cursor">_</span>
                  </div>
                )}

                {setupError && (
                  <div className="py-4 space-y-2">
                    <div
                      className="text-[0.875rem] font-bold uppercase"
                      style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}
                    >
                      SETUP UNAVAILABLE
                    </div>
                    <div
                      className="text-[0.6875rem] uppercase"
                      style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                    >
                      {setupError}
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full text-center text-[0.75rem] uppercase py-2"
                      style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                    >
                      CLOSE
                    </button>
                  </div>
                )}

                {clientSecret && !isLoading && !setupError && (
                  <div className="py-2">
                    <Elements
                      stripe={getStripe()}
                      options={{ clientSecret, appearance: receiptAppearance }}
                    >
                      <SetupForm onSuccess={handleSuccess} onClose={onClose} />
                    </Elements>
                  </div>
                )}

                <ReceiptDivider variant="minor" />
                <div
                  className="text-center text-[0.5rem] uppercase tracking-widest py-1"
                  style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                >
                  SECURED BY STRIPE — PCI COMPLIANT
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
