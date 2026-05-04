'use client';
import { useState } from 'react';
import Link from 'next/link';
import Win98Window from './Win98Window';
import BlinkingClock from './BlinkingClock';

interface Y2KPieceDetailProps {
  item: any;
  bids: any[];
  sku: string;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Y2KPieceDetail({ item, bids, sku }: Y2KPieceDetailProps) {
  const [bidAmount, setBidAmount] = useState('');

  const isSold = !!item.sold_at;
  const isAuction = item.listing_type === 'auction';
  const isBuyNow = item.listing_type === 'buy_now';
  const auction = item.auction;
  const auctionActive = auction?.status === 'active';
  const endDate = auction?.extended_end_date ?? auction?.end_date;
  const reserveMet = !auction?.reserve_price || (item.current_bid ?? 0) >= auction.reserve_price;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Win98Window title={item.title ?? sku} icon="/y2k/info-icon.svg">
        {/* Photo */}
        {item.images?.[0] && (
          <div style={{ marginBottom: 12 }}>
            <span className="win98-photo-frame">
              <img
                src={item.images[0]}
                alt={item.title}
                style={{ maxWidth: 280, height: 'auto', display: 'block' }}
              />
            </span>
          </div>
        )}

        {/* Item details table */}
        <table style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, marginBottom: 12, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ color: 'var(--ink-muted)', paddingRight: 12, width: 100 }}>SKU</td>
              <td style={{ color: 'var(--ink)', fontWeight: 'bold' }}>{item.sku}</td>
            </tr>
            {item.description && (
              <tr>
                <td style={{ color: 'var(--ink-muted)', paddingRight: 12, verticalAlign: 'top' }}>Description</td>
                <td style={{ color: 'var(--ink)' }}>{item.description}</td>
              </tr>
            )}
            {item.techniques?.length > 0 && (
              <tr>
                <td style={{ color: 'var(--ink-muted)', paddingRight: 12 }}>Techniques</td>
                <td style={{ color: 'var(--ink)' }}>{item.techniques.join(', ')}</td>
              </tr>
            )}
            {isAuction && (
              <>
                <tr>
                  <td style={{ color: 'var(--ink-muted)', paddingRight: 12 }}>Starting Bid</td>
                  <td style={{ color: 'var(--ink)' }}>{formatPrice(item.starting_bid)}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--ink-muted)', paddingRight: 12 }}>Current Bid</td>
                  <td style={{ color: 'var(--ink)', fontWeight: 'bold' }}>{formatPrice(item.current_bid)}</td>
                </tr>
                {auctionActive && endDate && (
                  <tr>
                    <td style={{ color: 'var(--ink-muted)', paddingRight: 12 }}>Time Left</td>
                    <td><BlinkingClock endDate={endDate} /></td>
                  </tr>
                )}
              </>
            )}
            {isBuyNow && (
              <tr>
                <td style={{ color: 'var(--ink-muted)', paddingRight: 12 }}>Buy Now Price</td>
                <td style={{ color: 'var(--ink)', fontWeight: 'bold' }}>{formatPrice(item.buy_now_price)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Bid widget */}
        {isAuction && auctionActive && !isSold && (
          <Win98Window title="🏺 Place Your Bid" className="mb-4">
            {!reserveMet && (
              <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 10, color: 'var(--error)', marginBottom: 6 }}>
                ⚠ Reserve not met — current bid is below the reserve price.
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                className="win98-text-field"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                style={{ width: 140 }}
              />
              <button className="win98-btn">SUBMIT BID</button>
            </div>
          </Win98Window>
        )}

        {/* Buy now action */}
        {isBuyNow && !isSold && (
          <div style={{ marginBottom: 12 }}>
            <Link href={`/checkout?sku=${sku}`}>
              <button className="win98-btn" style={{ background: '#000080', color: '#ffffff' }}>
                BUY NOW — {formatPrice(item.buy_now_price)}
              </button>
            </Link>
          </div>
        )}

        {isSold && (
          <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--error)', fontWeight: 'bold', marginBottom: 12 }}>
            SOLD
          </p>
        )}

        {/* Bid history */}
        {isAuction && bids.length > 0 && (
          <>
            <div style={{ fontFamily: '"Comic Sans MS", cursive', fontSize: 13, color: 'var(--accent)', marginBottom: 6, marginTop: 12 }}>
              Bid History
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#000080', color: '#ffffff' }}>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Date</th>
                  <th style={{ padding: '3px 6px', textAlign: 'right', border: '1px solid var(--border)' }}>Amount</th>
                  <th style={{ padding: '3px 6px', textAlign: 'left', border: '1px solid var(--border)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid: any, i: number) => (
                  <tr key={bid.id} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-well)' }}>
                    <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>
                      {formatTimestamp(bid.created_at)}
                    </td>
                    <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: 'var(--ink)', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatPrice(bid.amount)}
                    </td>
                    <td style={{ padding: '3px 6px', border: '1px solid var(--border)', color: i === 0 ? 'var(--success)' : 'var(--ink-muted)' }}>
                      {i === 0 ? 'CURRENT' : 'OUTBID'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <Link href="/browse">
            <button className="win98-btn">← Back to Browse</button>
          </Link>
        </div>
      </Win98Window>
    </div>
  );
}
