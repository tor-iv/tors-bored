'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuctions, useAuctionItems } from '@/hooks/queries/useAuctions';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';
import BidModal, { type RawItem } from '@/components/auction/BidModal';
import AddCardModal from '@/components/auction/AddCardModal';
import ReceiptPage from '@/components/theme/receipt/ReceiptPage';
import ReceiptChrome from '@/components/theme/receipt/ReceiptChrome';
import ReceiptFooterChrome from '@/components/theme/receipt/ReceiptFooterChrome';
import ReceiptPhotoFrame from '@/components/theme/receipt/ReceiptPhotoFrame';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import { confettiPiece } from '@/lib/animation-variants';

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

// ─── Ticking "ENDS 71H 38M" readout ──────────────────────────────────────────
// Hydration-safe: empty until mounted, then ticks every 30s.

function EndsIn({ endDate }: { endDate?: string }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!endDate) return;
    function compute() {
      const ms = new Date(endDate!).getTime() - Date.now();
      if (ms <= 0) {
        setLabel('ENDED');
        return;
      }
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      setLabel(`${h}H ${m}M`);
    }
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <span style={{ fontFamily: 'var(--font-thermal)', fontSize: 21, color: 'var(--error)' }}>
      ENDS {label || '—'}
    </span>
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

// ─── Bid slip (one per lot, cut-here styling) ────────────────────────────────

interface BidSlipProps {
  item: RawItem;
  index: number;
  total: number;
  endDate?: string;
  onBid: (item: RawItem, amount?: number) => void;
}

function BidSlip({ item, index, total, endDate, onBid }: BidSlipProps) {
  const [amount, setAmount] = useState('');
  const bidCount = item.current_bid ? '1+' : '0';

  function placeBid() {
    const parsed = parseFloat(amount);
    onBid(item, Number.isFinite(parsed) && parsed > 0 ? parsed : undefined);
  }

  return (
    <div style={{ margin: '20px 0 26px' }}>
      <ReceiptDivider variant="tear" />
      <div
        style={{
          borderLeft: '1px dashed var(--border)',
          borderRight: '1px dashed var(--border)',
          padding: '14px 14px 16px',
          position: 'relative',
        }}
      >
        {/* Slip header */}
        <div
          className="flex flex-wrap justify-between"
          style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 2, color: 'var(--ink-muted)' }}
        >
          <span className="whitespace-nowrap">★ LOT RECORD ★</span>
          <span className="whitespace-nowrap">
            LOT-{item.sku ?? 'OBJ-????'} · REG #{String(index + 1).padStart(2, '0')}/
            {String(total).padStart(2, '0')}
          </span>
        </div>

        {/* Photo + identity */}
        <div className="grid" style={{ gridTemplateColumns: '112px 1fr', gap: 14, marginTop: 12 }}>
          <ReceiptPhotoFrame src={item.images?.[0]} alt={item.title} title={item.title} size="md" />
          <div className="min-w-0">
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{item.title}</div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: 'var(--ink-muted)', marginTop: 2 }}>
              {item.sku} · {(item.techniques ?? []).map((t) => t.toUpperCase()).join(' · ')}
            </div>
            <div
              className="receipt-stamp-badge"
              style={{ fontSize: 11, transform: 'rotate(-3deg)', marginTop: 10 }}
            >
              BIDDING OPEN
            </div>
          </div>
        </div>

        {/* Bid state rows */}
        <div className="flex flex-col" style={{ marginTop: 12, fontSize: 12, gap: 5 }}>
          <div className="receipt-line-item" style={{ gap: 6 }}>
            <span>STARTING BID</span>
            <span className="leader" />
            <span style={{ fontFamily: 'var(--font-thermal)', fontSize: 22, lineHeight: 1 }}>
              ${(item.starting_bid ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="receipt-line-item" style={{ gap: 6 }}>
            <span>CURRENT BID</span>
            <span className="leader" />
            {item.current_bid ? (
              <span style={{ fontFamily: 'var(--font-thermal)', fontSize: 22, lineHeight: 1 }}>
                ${item.current_bid.toFixed(2)}
              </span>
            ) : (
              <span style={{ fontWeight: 600 }}>NO BIDS YET</span>
            )}
          </div>
          <div className="receipt-line-item" style={{ gap: 6 }}>
            <span>BIDS PLACED</span>
            <span className="leader" />
            <span style={{ fontWeight: 600 }}>{bidCount}</span>
          </div>
        </div>

        {/* Ends + inline bid entry */}
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ marginTop: 14, gap: 12 }}
        >
          <EndsIn endDate={endDate} />
          <div className="flex items-center" style={{ gap: 10 }}>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') placeBid();
              }}
              placeholder="$ 0.00"
              inputMode="decimal"
              className="receipt-input"
              style={{ width: 78, fontSize: 13, padding: '4px 2px' }}
              aria-label={`Bid amount for ${item.title}`}
            />
            <button className="receipt-action-btn" onClick={placeBid}>
              PLACE BID
            </button>
          </div>
        </div>
      </div>
      <div style={{ borderBottom: '2px dashed var(--border)' }} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AuctionsPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [sortBy, setSortBy] = useState<'ending-soon' | 'price-low' | 'price-high'>('ending-soon');
  const [selectedItem, setSelectedItem] = useState<RawItem | null>(null);
  const [prefillAmount, setPrefillAmount] = useState<number | null>(null);
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

  function handleBidClick(item: RawItem, amount?: number) {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setSelectedItem(item);
    setPrefillAmount(amount ?? null);
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
      setPrefillAmount(null);
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
    setPrefillAmount(pending.amount);
    setBidError(null);
    setShowBidModal(true);
  }

  const endDate = auction?.extended_end_date ?? auction?.end_date;

  // ── Loading state
  if (isLoading) {
    return (
      <ReceiptPage>
        <ReceiptChrome />
        <div className="py-10 text-center">
          <div
            className="uppercase tracking-widest"
            style={{ fontSize: 12, color: 'var(--ink-muted)' }}
          >
            <span className="receipt-loader-dots">PRINTING BID SLIPS</span>
            <span className="dot-matrix-cursor">_</span>
          </div>
        </div>
      </ReceiptPage>
    );
  }

  // ── No active auction
  if (!auction) {
    return (
      <ReceiptPage>
        <ReceiptChrome />
        <div className="py-8 text-center" style={{ lineHeight: 1.8 }}>
          <div
            className="receipt-stamp-badge receipt-stamp-badge--red"
            style={{ fontSize: 16, transform: 'rotate(-2deg)' }}
          >
            NO LIVE LOTS
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 14 }}>
            NO ACTIVE AUCTION AT THIS TIME.
            <br />
            CHECK BACK SOON.
          </div>
        </div>
        <ReceiptFooterChrome barcodeSeed="TORS-BORED-AUCTIONS" />
      </ReceiptPage>
    );
  }

  // ── Main bid slips
  return (
    <>
      <ConfettiBurst active={showConfetti} />

      <ReceiptPage>
        <ReceiptChrome />

        <div className="receipt-section-bar" style={{ margin: '18px 0 4px' }}>
          <span>ACTIVE AUCTIONS — BID SLIPS</span>
          <span className="receipt-section-bar-count">QTY {rawItems.length}</span>
        </div>

        {/* Auction title + sort row */}
        <div
          className="flex flex-wrap items-baseline justify-between"
          style={{ gap: '2px 12px', fontSize: 10, letterSpacing: 1, color: 'var(--ink-muted)', padding: '6px 0 2px' }}
        >
          <span className="uppercase">{auction.title}</span>
          <label className="flex items-baseline" style={{ gap: 6 }}>
            <span>SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="receipt-input uppercase"
              style={{ fontSize: 10, width: 'auto', cursor: 'pointer', padding: '1px 0' }}
            >
              <option value="ending-soon">[ENDING SOON]</option>
              <option value="price-low">[PRICE ↑]</option>
              <option value="price-high">[PRICE ↓]</option>
            </select>
          </label>
        </div>

        {sortedItems.length === 0 ? (
          <div className="py-8 text-center" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            NO LOTS AVAILABLE.
          </div>
        ) : (
          sortedItems.map((item, index) => (
            <BidSlip
              key={item.id}
              item={item}
              index={index}
              total={sortedItems.length}
              endDate={endDate}
              onBid={handleBidClick}
            />
          ))
        )}

        <ReceiptFooterChrome barcodeSeed={auction.id} />
      </ReceiptPage>

      {/* ── MODALS ── */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <BidModal
        isOpen={showBidModal}
        onClose={() => { setShowBidModal(false); setBidError(null); setPrefillAmount(null); }}
        item={selectedItem}
        onSubmitBid={handleSubmitBid}
        bidError={bidError}
        prefillAmount={prefillAmount}
      />

      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => { setShowAddCardModal(false); pendingBidRef.current = null; }}
        onSuccess={handleCardAdded}
      />
    </>
  );
}
