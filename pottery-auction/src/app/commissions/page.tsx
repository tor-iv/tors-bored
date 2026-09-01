'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PotteryWizard, WizardData } from '@/components/commissions';
import { useAuth } from '@/hooks/useAuth';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptChrome from '@/components/theme/receipt/ReceiptChrome';
import ReceiptFooterChrome from '@/components/theme/receipt/ReceiptFooterChrome';
import Barcode from '@/components/theme/receipt/Barcode';
import { scaleIn, fadeUp } from '@/lib/animation-variants';

// ─── Form number derived from today's date (stable for a session) ─────────────

const formNo = `WO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

// ─── Submission to /api/commissions ──────────────────────────────────────────

async function submitCommission(data: WizardData): Promise<void> {
  // Build a rich description that includes shape/clay/glaze selections
  const description = [
    data.shape    ? `SHAPE: ${data.shape.toUpperCase()}` : null,
    data.clay     ? `CLAY: ${data.clay.toUpperCase()}` : null,
    data.glaze    ? `GLAZE: ${data.glaze.toUpperCase()}` : null,
    data.description ? `NOTES: ${data.description}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const body: Record<string, unknown> = {
    email: data.email,
    name: data.name,
    description,
    // drawing is optional; only include if present (data URL)
    ...(data.drawing ? { images: [data.drawing] } : {}),
  };

  const res = await fetch('/api/commissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to submit' }));
    throw new Error((err.error as string) ?? 'Failed to submit commission');
  }
}

// ─── Loading slip ─────────────────────────────────────────────────────────────

function LoadingSlip() {
  return (
    <ReceiptPage>
      <ReceiptChrome />
      <div className="py-10 text-center">
        <div className="uppercase tracking-widest" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
          <span className="receipt-loader-dots">PRINTING WORK ORDER</span>
          <span className="dot-matrix-cursor">_</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 8 }}>PLEASE STAND BY...</div>
      </div>
    </ReceiptPage>
  );
}

// ─── Success slip ─────────────────────────────────────────────────────────────

function SuccessSlip({
  data,
  onReset,
}: {
  data: WizardData;
  onReset: () => void;
}) {
  const orderNo = formNo;
  return (
    <ReceiptPage>
      <ReceiptChrome />
      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>✓ WORK ORDER RECEIVED</span>
        <span className="receipt-section-bar-count">{orderNo}</span>
      </div>
      <div
        className="flex flex-wrap justify-between"
        style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', padding: '6px 0 10px' }}
      >
        <span>CLIENT: {data.name.toUpperCase()}</span>
        <span>DATE: {today} · STATUS: SUBMITTED</span>
      </div>

          {/* Order summary */}
          <div className="receipt-section-bar" style={{ margin: '4px 0 8px' }}>
            <span>ORDER SUMMARY</span>
          </div>
          <div className="space-y-1.5 py-2">
            {data.shape && (
              <div
                className="receipt-line-item text-[0.75rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">SHAPE</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-stamp)' }}>
                  {data.shape.toUpperCase()}
                </span>
              </div>
            )}
            {data.clay && (
              <div
                className="receipt-line-item text-[0.75rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">CLAY BODY</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-stamp)' }}>
                  {data.clay.toUpperCase()}
                </span>
              </div>
            )}
            {data.glaze && (
              <div
                className="receipt-line-item text-[0.75rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">GLAZE FINISH</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-stamp)' }}>
                  {data.glaze.toUpperCase()}
                </span>
              </div>
            )}
            {data.drawing && (
              <div
                className="receipt-line-item text-[0.75rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">SKETCH</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>ATTACHED</span>
              </div>
            )}
            <div
              className="receipt-line-item text-[0.75rem]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">CONTACT</span>
              <span className="leader" />
              <span style={{ color: 'var(--ink)' }}>{data.email}</span>
            </div>
          </div>

          <ReceiptDivider variant="major" />

          {/* What happens next */}
          <div className="receipt-section-bar" style={{ margin: '14px 0 8px' }}>
            <span>NEXT STEPS</span>
          </div>
          <div className="space-y-1.5 py-2">
            {[
              'TOR REVIEWS YOUR ORDER',
              'EMAIL REPLY W/ QUESTIONS / QUOTE',
              'TIMELINE + PRICING CONFIRMED',
              'STUDIO BEGINS YOUR PIECE',
            ].map((step, i) => (
              <div
                key={i}
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="whitespace-nowrap">STEP {i + 1}</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>{step}</span>
              </div>
            ))}
          </div>
          <div
            className="text-[0.6875rem] uppercase mt-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            * RESPONSE WITHIN 3–5 BUSINESS DAYS *
          </div>

          <ReceiptDivider variant="major" />

          <div className="py-3 flex justify-center">
            <button onClick={onReset} className="receipt-action-btn">
              SUBMIT ANOTHER ORDER
            </button>
          </div>

      <ReceiptFooterChrome barcodeSeed={orderNo} />
    </ReceiptPage>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="py-2 px-3 mb-4 text-[0.75rem] uppercase flex items-center gap-2"
      style={{
        fontFamily: 'var(--font-display)',
        color: 'var(--error)',
        border: '1px solid var(--error)',
        backgroundColor: 'rgba(176,57,44,0.05)',
      }}
    >
      <span className="flex-1">⚠ {message}</span>
      <button onClick={onDismiss} style={{ color: 'var(--error)' }} aria-label="Dismiss">✕</button>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CommissionsPage() {
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<WizardData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleWizardComplete = async (data: WizardData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitCommission(data);
      setSubmittedData(data);
      setIsSubmitted(true);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message.toUpperCase()
          : 'FAILED TO SUBMIT — PLEASE TRY AGAIN';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setSubmitError(null);
  };

  if (isSubmitting) return <LoadingSlip />;

  if (isSubmitted && submittedData) {
    return <SuccessSlip data={submittedData} onReset={handleReset} />;
  }

  return (
    <ReceiptPage>
      <ReceiptChrome />
      <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
        <span>COMMISSION WORK ORDER</span>
        <span className="receipt-section-bar-count">{formNo}</span>
      </div>
      <div
        className="flex flex-wrap justify-between"
        style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', padding: '6px 0 10px' }}
      >
        <span>
          {user
            ? `CLIENT: ${(userProfile?.displayName ?? user.email ?? 'MEMBER').toUpperCase().slice(0, 20)}`
            : 'CLIENT: GUEST'}
        </span>
        <span>QUOTE IN 3–5 BUS. DAYS</span>
      </div>

          {/* ── ERROR BANNER ── */}
          <AnimatePresence>
            {submitError && (
              <ErrorBanner message={submitError} onDismiss={() => setSubmitError(null)} />
            )}
          </AnimatePresence>

          {/* ── WIZARD ── */}
          <PotteryWizard
            onComplete={handleWizardComplete}
            initialName={userProfile?.displayName ?? ''}
            initialEmail={user?.email ?? ''}
          />

          <ReceiptDivider variant="major" />

      <ReceiptFooterChrome barcodeSeed={formNo} />
    </ReceiptPage>
  );
}
