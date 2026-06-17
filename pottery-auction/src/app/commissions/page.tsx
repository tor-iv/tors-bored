'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PotteryWizard, WizardData } from '@/components/commissions';
import { useAuth } from '@/hooks/useAuth';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-well)' }}
    >
      <div
        className="receipt-strip-paper"
        style={{ maxWidth: 380, padding: '0 0 32px' }}
      >
        <div className="receipt-edge-top" />
        <div className="receipt-strip-content py-10 text-center space-y-3">
          <ReceiptDivider variant="decorative" />
          <div
            className="text-[0.625rem] uppercase tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            TOR&apos;S BORED POTTERY CO.
          </div>
          <ReceiptDivider variant="minor" />
          <div
            className="text-[1.1rem] uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
          >
            <span className="receipt-loader-dots">PRINTING WORK ORDER</span>
            <span className="dot-matrix-cursor">_</span>
          </div>
          <div
            className="text-[0.6875rem] uppercase"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            PLEASE STAND BY...
          </div>
          <ReceiptDivider variant="decorative" />
        </div>
        <div className="receipt-edge-bottom" />
      </div>
    </div>
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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-well)', padding: '32px 16px 80px' }}
    >
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="receipt-strip-paper"
        style={{ maxWidth: 420, position: 'relative' }}
      >
        {/* Green RECEIVED stamp */}
        <motion.div
          initial={{ opacity: 0, scale: 1.4, rotate: -18 }}
          animate={{ opacity: 0.88, scale: 1, rotate: -13 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.5 }}
          aria-hidden
          style={{
            position: 'absolute',
            top: 62,
            right: 16,
            zIndex: 3,
            fontFamily: 'var(--font-stamp)',
            color: 'var(--stamp-blue, #335a7a)',
            border: '2.5px solid var(--stamp-blue, #335a7a)',
            borderRadius: 3,
            padding: '3px 12px 2px',
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            lineHeight: 1.1,
            textAlign: 'center',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        >
          RECEIVED
          <div style={{ fontSize: '0.42rem', letterSpacing: '0.22em', marginTop: 2 }}>● JUN 2026 ●</div>
        </motion.div>

        <div className="receipt-edge-top" />
        <div className="receipt-strip-content py-6">
          {/* Header */}
          <div className="text-center pb-3" style={{ lineHeight: 1.45 }}>
            <div
              className="text-[0.625rem] uppercase tracking-[0.3em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              TOR&apos;S BORED POTTERY CO.
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★ EST. BROOKLYN, NY ★
            </div>

            <ReceiptDivider variant="decorative" />

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="receipt-stamp text-[1.4rem] uppercase tracking-wide py-1"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ✓ WORK ORDER RECEIVED
            </motion.div>
            <div
              className="text-[0.5rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★ WE&apos;LL BE IN TOUCH ★
            </div>

            <ReceiptDivider variant="decorative" />

            <div className="pt-1" style={{ lineHeight: 1.6 }}>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                {orderNo} &nbsp;·&nbsp; DATE: {today}
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                CLIENT: {data.name.toUpperCase()} &nbsp;·&nbsp; STATUS: SUBMITTED
              </div>
            </div>
          </div>

          <ReceiptDivider variant="major" />

          {/* Order summary */}
          <div
            className="text-[0.625rem] uppercase tracking-widest pb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            ORDER SUMMARY
          </div>
          <ReceiptDivider variant="minor" />
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
          <div
            className="text-[0.625rem] uppercase tracking-widest pb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            NEXT STEPS
          </div>
          <ReceiptDivider variant="minor" />
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

          {/* Tear-off + barcode */}
          <div className="pt-2 pb-4 text-center" style={{ lineHeight: 1.5 }}>
            <div className="receipt-tear" />

            <Barcode seed={orderNo} className="mx-auto mt-2" />

            <ReceiptDivider variant="decorative" />

            <div
              className="receipt-stamp text-[0.9rem] uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ★ THANK YOU ★
            </div>
            <div
              className="text-[0.6875rem] uppercase mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              STUDIO COPY · HANDMADE TO ORDER
            </div>

            <ReceiptDivider variant="minor" />

            <button
              onClick={onReset}
              className="receipt-stamp uppercase tracking-widest px-6 py-2 text-[0.875rem] border border-current mt-3"
              style={{
                fontFamily: 'var(--font-stamp)',
                color: 'var(--ink)',
                boxShadow: '3px 3px 0 var(--ink)',
                transition: 'box-shadow 0.1s, transform 0.1s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0 var(--ink)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px, 2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 var(--ink)';
                (e.currentTarget as HTMLButtonElement).style.transform = '';
              }}
            >
              [ SUBMIT ANOTHER ORDER ]
            </button>
          </div>
        </div>
        <div className="receipt-edge-bottom" />
      </motion.div>
    </div>
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
    <div style={{ backgroundColor: 'var(--bg-well)', minHeight: '100vh', padding: '32px 16px 80px' }}>

      {/* The receipt paper strip */}
      <div
        className="receipt-strip-paper"
        style={{ maxWidth: 560, margin: '0 auto' }}
      >
        {/* Blue circular date stamp */}
        <motion.div
          initial={{ opacity: 0, scale: 1.2, rotate: 14 }}
          animate={{ opacity: 0.52, scale: 1, rotate: 8 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.8 }}
          aria-hidden
          className="receipt-date-stamp"
          style={{ position: 'absolute', top: 58, left: 14, zIndex: 3, pointerEvents: 'none' }}
        >
          <div style={{ fontSize: '0.38rem', letterSpacing: '0.1em', lineHeight: 1.4 }}>
            <div>RECEIVED</div>
            <div style={{ fontSize: '0.52rem', letterSpacing: '0.06em', fontWeight: 'bold' }}>JUN 2026</div>
            <div>STUDIO</div>
          </div>
        </motion.div>

        {/* Commission stamp — top right */}
        <motion.div
          initial={{ opacity: 0, scale: 1.4, rotate: -18 }}
          animate={{ opacity: 0.88, scale: 1, rotate: -13 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.35 }}
          aria-hidden
          style={{
            position: 'absolute',
            top: 62,
            right: 16,
            zIndex: 3,
            fontFamily: 'var(--font-stamp)',
            color: 'var(--stamp-blue, #335a7a)',
            border: '2.5px solid var(--stamp-blue, #335a7a)',
            borderRadius: 3,
            padding: '3px 12px 2px',
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            lineHeight: 1.1,
            textAlign: 'center',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        >
          CUSTOM
          <div style={{ fontSize: '0.42rem', letterSpacing: '0.22em', marginTop: 2 }}>● WORK ORDER ●</div>
        </motion.div>

        <div className="receipt-edge-top" />
        <div className="receipt-strip-content py-6">

          {/* ── HEADER ── */}
          <div className="text-center pb-3" style={{ lineHeight: 1.45 }}>
            <div
              className="text-[0.625rem] uppercase tracking-[0.3em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              TOR&apos;S BORED POTTERY CO.
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★ EST. BROOKLYN, NY ★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              CASHIER: TOR &nbsp;·&nbsp; REG #04 &nbsp;·&nbsp; STUDIO DIRECT
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="receipt-stamp text-[1.25rem] uppercase tracking-wide py-1"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ★★★ COMMISSION WORK ORDER ★★★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★★★★★ HANDMADE TO ORDER ★★★★★
            </div>

            <ReceiptDivider variant="decorative" />

            <div className="pt-2" style={{ lineHeight: 1.6 }}>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                FORM NO: {formNo} &nbsp;·&nbsp; DATE: {today}
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                {user
                  ? `CLIENT: ${(userProfile?.displayName ?? user.email ?? 'MEMBER').toUpperCase().slice(0, 20)}`
                  : 'CLIENT: GUEST'}{' '}
                &nbsp;·&nbsp; TYPE: CUSTOM PIECE
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                TURNAROUND: 3–5 BUS. DAYS FOR QUOTE
              </div>
            </div>
          </div>

          <ReceiptDivider variant="major" />

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

          {/* ── FOOTER ── */}
          <div className="pt-2 pb-4 text-center" style={{ lineHeight: 1.5 }}>
            <div className="receipt-tear" />

            <div className="text-left px-2 mb-3" style={{ lineHeight: 1.7 }}>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">DEPOSIT</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>TBD AT QUOTE</span>
              </div>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">ARTIST</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>TOR</span>
              </div>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">STUDIO</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>BROOKLYN, NY</span>
              </div>
            </div>

            <ReceiptDivider variant="minor" />

            <Barcode seed={formNo} className="mx-auto mt-2" />

            <ReceiptDivider variant="decorative" />

            <div
              className="receipt-stamp text-[1rem] uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ★ THANK YOU ★
            </div>
            <div
              className="text-[0.6875rem] uppercase mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              STUDIO COPY · HANDMADE TO ORDER
            </div>
            <div
              className="text-[0.6875rem] uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              EACH PIECE ONE OF A KIND
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="text-[0.5rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★★★★★ POTTERY ★★★★★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest mt-0.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              TOR&apos;S BORED POTTERY CO. · BROOKLYN, NY
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              {formNo} · {today}
            </div>
          </div>
        </div>
        <div className="receipt-edge-bottom" />
      </div>
    </div>
  );
}
