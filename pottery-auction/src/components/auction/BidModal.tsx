'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlay, modalContent } from '@/lib/animation-variants';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

// Raw API item shape (snake_case from DB)
export interface RawItem {
  id: string;
  auction_id: string;
  title: string;
  description: string;
  images: string[];
  starting_bid: number | null;
  current_bid: number | null;
  highest_bidder: string | null;
  sku: string | null;
  listing_type: string;
  techniques?: string[];
  featured?: boolean;
}

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RawItem | null;
  onSubmitBid: (amount: number) => Promise<void>;
  bidError?: string | null;
}

export default function BidModal({ isOpen, onClose, item, onSubmitBid, bidError }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when item changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setBidAmount('');
      setError('');
    }
  }, [isOpen, item?.id]);

  // Propagate external bid errors (e.g. 400 with minimum_bid)
  useEffect(() => {
    if (bidError) setError(bidError);
  }, [bidError]);

  if (!item) return null;

  const currentBid = item.current_bid ?? item.starting_bid ?? 0;
  const minBid = item.current_bid ? item.current_bid + 5 : (item.starting_bid ?? 1);
  const suggestedBids = [minBid, minBid + 10, minBid + 25, minBid + 50];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      setError(`MINIMUM BID IS $${minBid.toFixed(2)}`);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onSubmitBid(amount);
      // onClose is called by parent on success
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message.toUpperCase() : 'FAILED TO PLACE BID');
    } finally {
      setIsLoading(false);
    }
  }

  const txCode = `BID-${item.sku ?? item.id.slice(0, 8).toUpperCase()}`;
  const now = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

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
              style={{ transform: 'rotate(-0.3deg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="receipt-strip-content py-4 space-y-3">
                {/* Ticket header */}
                <div className="text-center space-y-1">
                  <div
                    className="text-[0.625rem] uppercase tracking-widest"
                    style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                  >
                    TOR&apos;S BORED POTTERY CO.
                  </div>
                  <div
                    className="receipt-stamp text-[1.125rem] font-bold uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-stamp)', color: 'var(--ink)' }}
                  >
                    BID SLIP
                  </div>
                  <div
                    className="text-[0.6875rem] uppercase"
                    style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                  >
                    {txCode} &nbsp;·&nbsp; {now}
                  </div>
                </div>

                <ReceiptDivider variant="decorative" />

                {/* Item info */}
                <div className="space-y-1">
                  <div
                    className="text-[0.75rem] uppercase font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
                  >
                    LOT: {item.title.toUpperCase()}
                  </div>
                  {item.sku && (
                    <div className="receipt-polaroid-sku">SKU: {item.sku}</div>
                  )}
                </div>

                <ReceiptDivider variant="minor" />

                {/* Current bid info */}
                <div className="space-y-1">
                  <div className="receipt-line-item text-[0.75rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}>
                    <span className="uppercase">CURRENT BID</span>
                    <span className="leader" />
                    <span className="receipt-price font-bold" style={{ color: 'var(--ink)' }}>
                      ${currentBid.toFixed(2)}
                    </span>
                  </div>
                  <div className="receipt-line-item text-[0.75rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}>
                    <span className="uppercase">MINIMUM BID</span>
                    <span className="leader" />
                    <span className="receipt-price font-bold" style={{ color: 'var(--accent)' }}>
                      ${minBid.toFixed(2)}
                    </span>
                  </div>
                  {item.highest_bidder && (
                    <div className="receipt-line-item text-[0.75rem]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}>
                      <span className="uppercase">HIGH BIDDER</span>
                      <span className="leader" />
                      <span style={{ color: 'var(--ink)' }}>{item.highest_bidder.slice(0, 12).toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <ReceiptDivider variant="major" />

                {/* Bid form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label
                      className="block text-[0.6875rem] uppercase tracking-wider mb-1"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                    >
                      YOUR BID AMOUNT
                    </label>
                    <div className="flex items-center gap-1">
                      <span
                        className="text-[0.875rem] font-bold"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                      >
                        $
                      </span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => { setBidAmount(e.target.value); setError(''); }}
                        className="receipt-input receipt-price flex-1"
                        placeholder={minBid.toFixed(2)}
                        min={minBid}
                        step="0.01"
                        required
                        style={{ fontSize: '1rem', fontWeight: '700' }}
                      />
                    </div>
                  </div>

                  {/* Quick bid suggestions */}
                  <div>
                    <div
                      className="text-[0.6875rem] uppercase mb-2"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                    >
                      QUICK AMOUNTS:
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {suggestedBids.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setBidAmount(amount.toFixed(2))}
                          className="text-[0.625rem] py-1 border border-current uppercase hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div
                      className="text-[0.75rem] uppercase py-1"
                      style={{ color: 'var(--error)', fontFamily: 'var(--font-display)' }}
                    >
                      {error}
                    </div>
                  )}

                  <ReceiptDivider variant="minor" />

                  <div
                    className="text-[0.5rem] uppercase leading-relaxed"
                    style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                  >
                    BY PLACING A BID, YOU AUTHORIZE PAYMENT IF YOU WIN.
                    ALL SALES ARE FINAL. NO REFUNDS.
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="receipt-stamp w-full py-3 text-[0.875rem] uppercase tracking-widest border border-current"
                    style={{
                      fontFamily: 'var(--font-stamp)',
                      color: isLoading ? 'var(--ink-muted)' : 'var(--ink)',
                      transform: 'rotate(-0.5deg)',
                      boxShadow: isLoading ? 'none' : '3px 3px 0 var(--ink)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading ? '[ SUBMITTING... ]' : '[ PLACE BID ]'}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full text-center text-[0.625rem] uppercase"
                    style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                  >
                    CANCEL / CLOSE
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
