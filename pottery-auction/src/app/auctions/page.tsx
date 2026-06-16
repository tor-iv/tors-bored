'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuctions, useAuctionItems } from '@/hooks/queries/useAuctions';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';
import BidModal, { type RawItem } from '@/components/auction/BidModal';
import AddCardModal from '@/components/auction/AddCardModal';
import Barcode from '@/components/theme/receipt/Barcode';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import { staggerContainer, clayForm, shelfLift, confettiPiece, kilnGlow } from '@/lib/animation-variants';

// ─── Raw API shapes ───────────────────────────────────────────────────────────

interface RawAuction {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  extended_end_date: string | null;
  status: string;
  featured_image: string | null;
}

// ─── Countdown component ──────────────────────────────────────────────────────

function CountdownTicket({ endDate }: { endDate: string }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });

  useEffect(() => {
    setMounted(true);

    function compute() {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      setTimeLeft({
        days: Math.floor(totalSec / 86400),
        hours: Math.floor((totalSec % 86400) / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
        ended: false,
      });
    }

    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const totalMinutesLeft = timeLeft.days * 1440 + timeLeft.hours * 60 + timeLeft.minutes;
  const isUrgent = !timeLeft.ended && totalMinutesLeft < 10;

  if (!mounted) {
    return (
      <div className="text-center py-2">
        <div
          className="text-[0.75rem] uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
        >
          TIME REMAINING
        </div>
        <div
          className="receipt-price tracking-wider"
          style={{ fontFamily: 'var(--font-thermal)', fontSize: '2.4rem', lineHeight: 1, color: 'var(--ink)' }}
        >
          --:--:--:--
        </div>
      </div>
    );
  }

  if (timeLeft.ended) {
    return (
      <div className="text-center py-2">
        <ReceiptDivider variant="major" />
        <div
          className="receipt-stamp text-[1.125rem] font-bold uppercase tracking-wider py-2"
          style={{ fontFamily: 'var(--font-stamp)', color: 'var(--error)' }}
        >
          *** SOLD / LOT CLOSED ***
        </div>
        <ReceiptDivider variant="major" />
      </div>
    );
  }

  const segments = timeLeft.days > 0
    ? [
        { value: pad(timeLeft.days),     label: 'DD' },
        { value: pad(timeLeft.hours),    label: 'HH' },
        { value: pad(timeLeft.minutes),  label: 'MM' },
        { value: pad(timeLeft.seconds),  label: 'SS' },
      ]
    : [
        { value: pad(timeLeft.hours),    label: 'HH' },
        { value: pad(timeLeft.minutes),  label: 'MM' },
        { value: pad(timeLeft.seconds),  label: 'SS' },
      ];

  return (
    <motion.div
      className="text-center py-2"
      variants={isUrgent ? kilnGlow : undefined}
      animate={isUrgent ? 'glow' : 'rest'}
    >
      <div
        className="text-[0.625rem] uppercase tracking-widest mb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        TIME REMAINING
      </div>
      <div className="flex items-center justify-center gap-1">
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <motion.span
                key={`${seg.label}-${seg.value}`}
                initial={{ y: -6, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                className="receipt-price"
                style={{
                  fontFamily: 'var(--font-thermal)',
                  fontSize: '2.4rem',
                  lineHeight: 1,
                  color: isUrgent ? 'var(--error)' : 'var(--ink)',
                  animation: isUrgent ? 'blink 1s step-end infinite' : undefined,
                  letterSpacing: '0.05em',
                }}
              >
                {seg.value}
              </motion.span>
              <span
                className="text-[0.5rem] uppercase tracking-widest"
                style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
              >
                {seg.label}
              </span>
            </div>
            {i < segments.length - 1 && (
              <span
                className="text-[1.5rem] font-bold mb-3"
                style={{ color: isUrgent ? 'var(--error)' : 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
      {isUrgent && (
        <div
          className="text-[0.625rem] uppercase tracking-widest mt-1"
          style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}
        >
          * CLOSING SOON — BID NOW *
        </div>
      )}
    </motion.div>
  );
}

// ─── Empty polaroid placeholder ───────────────────────────────────────────────
// Hand-drawn ink vessel silhouettes (no photo yet). Four shapes, chosen
// deterministically from the title so a given lot always shows the same vessel.

const VESSELS: React.ReactNode[] = [
  // Bulbous flower vase
  <path key="vase" d="M40 18 q-3 8 2 14 q-14 8 -14 30 q0 22 22 22 q22 0 22 -22 q0 -22 -14 -30 q5 -6 2 -14 z" />,
  // Wide bowl
  <path key="bowl" d="M22 46 q28 30 56 0 q-2 -4 -8 -4 l-40 0 q-6 0 -8 4 z" />,
  // Mug with handle
  <g key="mug">
    <path d="M30 34 l36 0 l-3 44 l-30 0 z" />
    <path d="M66 44 q16 2 14 16 q-2 12 -14 12" fill="none" />
  </g>,
  // Tall jug with spout
  <path key="jug" d="M38 22 l16 0 l3 10 q10 6 10 24 q0 22 -21 22 q-21 0 -21 -22 q0 -16 10 -24 z" />,
];

function vesselFor(title: string): React.ReactNode {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return VESSELS[h % VESSELS.length];
}

function EmptyPolaroid({ title }: { title: string }) {
  return (
    <div className="receipt-polaroid-frame" style={{ maxWidth: 200, margin: '0 auto' }}>
      <div
        style={{
          width: '100%',
          aspectRatio: '1/1',
          backgroundColor: 'var(--paper-highlight)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="62%"
          height="62%"
          fill="var(--ink)"
          stroke="var(--ink)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          style={{ opacity: 0.5, transform: 'rotate(-1.5deg)' }}
          aria-hidden
        >
          <g fillOpacity={0.06}>{vesselFor(title)}</g>
        </svg>
        <span
          className="receipt-stamp"
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            fontFamily: 'var(--font-stamp)',
            fontSize: '0.5rem',
            letterSpacing: '0.15em',
            color: 'var(--ink-muted)',
            opacity: 0.6,
            transform: 'rotate(-4deg)',
          }}
        >
          STUDIO PROOF
        </span>
      </div>
      <div className="receipt-polaroid-caption">{title}</div>
    </div>
  );
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

function ConfettiBurst({ active }: { active: boolean }) {
  // Deterministic spread (pure — no Math.random during render) fanned around a circle.
  const pieces = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const radius = 60 + (i % 5) * 24;
    return {
      x: Math.cos(angle) * radius,
      y: -(70 + (i % 7) * 20),
      rotate: (i % 2 === 0 ? 1 : -1) * (200 + i * 28),
      color: ['var(--ink)', 'var(--error)', 'var(--success)', 'var(--accent)'][i % 4],
    };
  });

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center">
          {pieces.map((p, i) => (
            <motion.div
              key={i}
              custom={p}
              variants={confettiPiece}
              initial="initial"
              animate="animate"
              className="absolute w-2 h-2"
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Lot card ─────────────────────────────────────────────────────────────────

interface LotCardProps {
  item: RawItem;
  index: number;
  onBid: (item: RawItem) => void;
}

function LotCard({ item, index, onBid }: LotCardProps) {
  const hasImage = item.images && item.images.length > 0;
  const currentBid = item.current_bid ?? item.starting_bid ?? 0;
  const tilt = index % 2 === 0 ? 'rotate(-1.2deg)' : 'rotate(0.8deg)';

  return (
    <motion.div
      variants={clayForm}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <motion.div
        variants={shelfLift}
        initial="rest"
        whileHover="hover"
        className="receipt-polaroid"
        style={{ transform: tilt }}
      >
        {/* Polaroid photo */}
        {hasImage ? (
          <div className="receipt-polaroid-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            <div className="receipt-polaroid-caption" style={{ fontFamily: 'var(--font-caption)' }}>
              {item.title}
            </div>
          </div>
        ) : (
          <EmptyPolaroid title={item.title} />
        )}

        {/* SKU under polaroid */}
        {item.sku && (
          <div className="receipt-polaroid-sku text-center mt-2">
            SKU: {item.sku}
          </div>
        )}

        {/* Line items */}
        <div className="space-y-1 mt-3 px-1">
          <ReceiptDivider variant="minor" />
          <div
            className="receipt-line-item text-[0.75rem]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <span className="uppercase whitespace-nowrap">STARTING BID</span>
            <span className="leader" />
            <span className="receipt-price" style={{ color: 'var(--ink)' }}>
              ${(item.starting_bid ?? 0).toFixed(2)}
            </span>
          </div>

          <div
            className="receipt-line-item text-[0.75rem]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <span className="uppercase whitespace-nowrap">CURRENT BID</span>
            <span className="leader" />
            {item.current_bid ? (
              <span className="receipt-price font-bold" style={{ color: 'var(--ink)' }}>
                ${item.current_bid.toFixed(2)}
              </span>
            ) : (
              <span className="text-[0.625rem] uppercase" style={{ color: 'var(--ink-muted)' }}>
                NO BIDS YET
              </span>
            )}
          </div>

          {item.highest_bidder && (
            <div
              className="receipt-line-item text-[0.75rem]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              <span className="uppercase whitespace-nowrap">HIGH BIDDER</span>
              <span className="leader" />
              <span style={{ color: 'var(--ink)' }}>{item.highest_bidder.slice(0, 12).toUpperCase()}</span>
            </div>
          )}

          {item.techniques && item.techniques.length > 0 && (
            <div
              className="text-[0.5rem] uppercase tracking-wider mt-1"
              style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
            >
              TECH: {item.techniques.join(' / ').toUpperCase()}
            </div>
          )}

          <ReceiptDivider variant="minor" />
        </div>

        {/* Bid button */}
        <div className="mt-3 px-1 pb-1 flex justify-center">
          <button
            onClick={() => onBid(item)}
            className="receipt-stamp uppercase tracking-widest px-6 py-2 text-[0.875rem] border border-current"
            style={{
              fontFamily: 'var(--font-stamp)',
              color: 'var(--ink)',
              transform: 'rotate(-0.5deg)',
              boxShadow: '3px 3px 0 var(--ink)',
              transition: 'box-shadow 0.1s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0 var(--ink)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(-0.5deg) translate(2px, 2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 var(--ink)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(-0.5deg)';
            }}
          >
            [ PLACE BID ]
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AuctionsPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [sortBy, setSortBy] = useState<'ending-soon' | 'price-low' | 'price-high'>('ending-soon');
  const [selectedItem, setSelectedItem] = useState<RawItem | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const pendingBidRef = useRef<{ item: RawItem; amount: number } | null>(null);

  // Fetch active auction
  const { data: auctionsData, isLoading: auctionsLoading } = useAuctions('active');
  const auctions: RawAuction[] = auctionsData?.auctions ?? [];
  const auction: RawAuction | undefined = auctions[0];

  // Fetch items for the auction
  const { data: itemsData, isLoading: itemsLoading } = useAuctionItems(auction?.id ?? '');
  const rawItems: RawItem[] = itemsData?.items ?? [];

  const isLoading = auctionsLoading || (!!auction && itemsLoading);

  // Sort items
  const sortedItems = [...rawItems].sort((a, b) => {
    if (sortBy === 'price-low') return (a.current_bid ?? a.starting_bid ?? 0) - (b.current_bid ?? b.starting_bid ?? 0);
    if (sortBy === 'price-high') return (b.current_bid ?? b.starting_bid ?? 0) - (a.current_bid ?? a.starting_bid ?? 0);
    return 0; // ending-soon: preserve server order
  });

  function handleBidClick(item: RawItem) {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setSelectedItem(item);
    setBidError(null);
    setShowBidModal(true);
  }

  async function handleSubmitBid(amount: number): Promise<void> {
    if (!selectedItem) return;

    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: selectedItem.id, amount }),
    });

    if (res.status === 201) {
      // Success
      setShowBidModal(false);
      setSelectedItem(null);
      setBidError(null);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      // Refetch items
      queryClient.invalidateQueries({ queryKey: ['auctions', auction?.id, 'items'] });
      return;
    }

    const data = await res.json().catch(() => ({ error: 'Failed to place bid' }));

    if (res.status === 402 && data.error === 'payment_method_required') {
      // Need card — store pending bid and open card modal
      pendingBidRef.current = { item: selectedItem, amount };
      setShowBidModal(false);
      setShowAddCardModal(true);
      return;
    }

    if (res.status === 401) {
      setShowBidModal(false);
      setShowAuthModal(true);
      return;
    }

    // 400 or other error
    const minBid = data.minimum_bid;
    const msg = minBid
      ? `${(data.error ?? 'BID TOO LOW').toUpperCase()} — MINIMUM: $${Number(minBid).toFixed(2)}`
      : (data.error ?? 'Failed to place bid').toUpperCase();
    setBidError(msg);
    throw new Error(msg);
  }

  async function handleCardAdded() {
    // Retry the pending bid after card is added
    setShowAddCardModal(false);
    const pending = pendingBidRef.current;
    if (!pending) return;
    pendingBidRef.current = null;
    setSelectedItem(pending.item);
    setBidError(null);
    setShowBidModal(true);
  }

  // Transaction code for the page header
  const txCode = auction
    ? `TXN-${auction.id.slice(0, 8).toUpperCase()}`
    : 'TXN---------';
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const endDate = auction?.extended_end_date ?? auction?.end_date;

  // ── Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-well)' }}
      >
        <div className="receipt-strip-paper" style={{ maxWidth: 400, padding: '40px 24px', textAlign: 'center' }}>
          <div
            className="text-[0.875rem] uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
          >
            <span className="receipt-loader-dots">PRINTING LOT SHEET</span>
            <span className="dot-matrix-cursor">_</span>
          </div>
        </div>
      </div>
    );
  }

  // ── No active auction
  if (!auction) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-well)' }}
      >
        <div
          className="receipt-strip-paper"
          style={{ maxWidth: 420, padding: '0 0 32px' }}
        >
          <div className="receipt-edge-top" />
          <div className="receipt-strip-content py-8 text-center space-y-3">
            <ReceiptDivider variant="decorative" />
            <div
              className="text-[0.625rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              TOR&apos;S BORED POTTERY CO.
            </div>
            <div
              className="receipt-stamp text-[1.5rem] font-bold uppercase"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              NO LIVE LOT SHEET
            </div>
            <div
              className="text-[0.75rem] uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              NO ACTIVE AUCTION AT THIS TIME.
            </div>
            <div
              className="text-[0.75rem] uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              CHECK BACK SOON.
            </div>
            <ReceiptDivider variant="decorative" />
            <div
              className="text-[0.5rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ALL PIECES HANDMADE WITH CARE
            </div>
          </div>
          <div className="receipt-edge-bottom" />
        </div>
      </div>
    );
  }

  // ── Main lot sheet
  return (
    <div style={{ backgroundColor: 'var(--bg-well)', minHeight: '100vh', padding: '32px 16px 80px' }}>
      <ConfettiBurst active={showConfetti} />

      {/* The receipt paper strip */}
      <div
        className="receipt-strip-paper"
        style={{ maxWidth: 520, margin: '0 auto' }}
      >
        {/* Red rubber-stamp LIVE accent */}
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
            color: 'var(--error)',
            border: '2.5px solid var(--error)',
            borderRadius: 3,
            padding: '3px 12px 2px',
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            lineHeight: 1.1,
            textAlign: 'center',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            textShadow: '0 0 1px var(--error), 0.5px 0.4px 0 rgba(176,57,44,0.2)',
            boxShadow: 'inset 0 0 0 1.5px rgba(176,57,44,0.15)',
            filter: 'url(#roughen)',
          }}
        >
          LIVE
          <div style={{ fontSize: '0.42rem', letterSpacing: '0.22em', marginTop: 2 }}>● BIDDING OPEN ●</div>
        </motion.div>

        {/* Faded blue circular date stamp — secondary accent */}
        <motion.div
          initial={{ opacity: 0, scale: 1.2, rotate: 14 }}
          animate={{ opacity: 0.52, scale: 1, rotate: 8 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.8 }}
          aria-hidden
          className="receipt-date-stamp"
          style={{
            position: 'absolute',
            top: 58,
            left: 14,
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.38rem', letterSpacing: '0.1em', lineHeight: 1.4 }}>
            <div>RECEIVED</div>
            <div style={{ fontSize: '0.52rem', letterSpacing: '0.06em', fontWeight: 'bold' }}>JUN 2026</div>
            <div>STUDIO</div>
          </div>
        </motion.div>

        <div className="receipt-edge-top" />
        <div className="receipt-strip-content py-6">

          {/* ── HEADER BLOCK ── */}
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
              CASHIER: TOR &nbsp;·&nbsp; REG #04 &nbsp;·&nbsp; MEMBER: ✓
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="receipt-stamp text-[1.25rem] uppercase tracking-wide py-1"
              style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
            >
              ★★★ LIVE LOT SHEET ★★★
            </div>
            <div
              className="text-[0.5rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              ★★★★★ POTTERY ★★★★★
            </div>

            <ReceiptDivider variant="decorative" />

            <div
              className="text-[1rem] font-bold uppercase leading-tight pt-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              {auction.title.toUpperCase()}
            </div>
            {auction.description && (
              <div
                className="text-[0.6875rem] uppercase leading-snug pt-1 max-w-xs mx-auto"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                {auction.description}
              </div>
            )}

            <div className="pt-2" style={{ lineHeight: 1.6 }}>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                {txCode} &nbsp;·&nbsp; DATE: {today}
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                TIME: 06:42:11 &nbsp;·&nbsp; TERMINAL: POS-04
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                LOTS: {rawItems.length} &nbsp;·&nbsp; TAX-EXEMPT: STUDIO
              </div>
              <div
                className="text-[0.6875rem] uppercase"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                SUBTOTAL: SEE LOTS &nbsp;·&nbsp; STATUS: LIVE
              </div>
            </div>
          </div>

          <ReceiptDivider variant="major" />

          {/* ── COUNTDOWN ── */}
          {endDate && <CountdownTicket endDate={endDate} />}

          <ReceiptDivider variant="major" />

          {/* ── SORT CONTROL ── */}
          <div className="py-2 flex items-baseline gap-2">
            <label
              className="text-[0.6875rem] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              SORT BY:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="receipt-input flex-1 text-[0.75rem] uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', cursor: 'pointer' }}
            >
              <option value="ending-soon">ENDING SOON</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
            </select>
          </div>

          <ReceiptDivider variant="major" />

          {/* ── LOT ENTRIES ── */}
          {sortedItems.length === 0 ? (
            <div
              className="py-8 text-center text-[0.75rem] uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              NO LOTS AVAILABLE.
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-5 py-2"
            >
              {sortedItems.map((item, index) => (
                <div key={item.id}>
                  {/* Lot header */}
                  <div
                    className="text-[0.6875rem] uppercase tracking-widest pb-1"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                  >
                    LOT {String(index + 1).padStart(2, '0')} OF {String(sortedItems.length).padStart(2, '0')}
                  </div>
                  <LotCard item={item} index={index} onBid={handleBidClick} />
                  {index < sortedItems.length - 1 && (
                    <div className="pt-6">
                      <ReceiptDivider variant="minor" />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          <ReceiptDivider variant="major" />

          {/* ── FOOTER ── */}
          <div className="pt-2 pb-4 text-center" style={{ lineHeight: 1.5 }}>
            <div className="receipt-tear" />

            {/* Lot summary rows */}
            <div className="text-left px-2 mb-3" style={{ lineHeight: 1.7 }}>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">TOTAL LOTS</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>{rawItems.length}</span>
              </div>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">TAX-EXEMPT</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>STUDIO</span>
              </div>
              <div
                className="receipt-line-item text-[0.6875rem]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
              >
                <span className="uppercase whitespace-nowrap">BUYER&apos;S PREMIUM</span>
                <span className="leader" />
                <span style={{ color: 'var(--ink)' }}>0%</span>
              </div>
            </div>

            <ReceiptDivider variant="minor" />

            <Barcode seed={auction.id} className="mx-auto mt-2" />

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
              ALL SALES FINAL · NO REFUNDS
            </div>
            <div
              className="text-[0.6875rem] uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
            >
              HANDMADE WITH LOVE
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
              {txCode} · {today}
            </div>
          </div>
        </div>
        <div className="receipt-edge-bottom" />
      </div>

      {/* ── MODALS ── */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <BidModal
        isOpen={showBidModal}
        onClose={() => { setShowBidModal(false); setBidError(null); }}
        item={selectedItem}
        onSubmitBid={handleSubmitBid}
        bidError={bidError}
      />

      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => { setShowAddCardModal(false); pendingBidRef.current = null; }}
        onSuccess={handleCardAdded}
      />
    </div>
  );
}
