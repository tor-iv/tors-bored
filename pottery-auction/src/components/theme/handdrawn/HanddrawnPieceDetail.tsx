import Link from 'next/link';
import RoughBorder from './RoughBorder';
import SketchbookFlourish from './SketchbookFlourish';
import PageFlipTransition from './PageFlipTransition';
import LiveCountdown from './LiveCountdown';

interface HanddrawnPieceDetailProps {
  item: any;
  bids: any[];
  sku: string;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

function getRemainingTime(endDateStr: string | null | undefined): string {
  if (!endDateStr) return '—';
  const diff = new Date(endDateStr).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

function isCurrentlyReserved(item: any): boolean {
  return item.reserved_until && new Date(item.reserved_until) > new Date() && !item.sold_at;
}

export default function HanddrawnPieceDetail({ item, bids, sku }: HanddrawnPieceDetailProps) {
  const isSold = !!item.sold_at;
  const isReserved = isCurrentlyReserved(item);
  const isAuction = item.listing_type === 'auction';
  const isBuyNow = item.listing_type === 'buy_now';
  const auction = item.auction;
  const auctionActive = auction?.status === 'active';
  const endDate = auction?.extended_end_date ?? auction?.end_date;
  const reserveMet = !auction?.reserve_price || (item.current_bid ?? 0) >= auction.reserve_price;
  const seedNum = sku.charCodeAt(0);

  return (
    <PageFlipTransition>
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Photo area */}
        {item.images?.[0] && (
          <div style={{ marginBottom: '2rem' }}>
            <RoughBorder roughness={1.5} strokeWidth={2}>
              <div style={{ padding: '8px', position: 'relative', backgroundColor: 'var(--bg-well)' }}>
                <SketchbookFlourish seed={seedNum} size={20} />
                <img
                  src={item.images[0]}
                  alt={item.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </RoughBorder>
          </div>
        )}

        {/* SKU label */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--ink-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
          }}
        >
          {item.sku}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--ink)',
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}
        >
          {item.title}
        </h1>

        {/* Description */}
        {item.description && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--ink-muted)',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}
          >
            {item.description}
          </p>
        )}

        {/* Techniques */}
        {item.techniques?.length > 0 && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--ink-muted)',
              marginBottom: '1.5rem',
            }}
          >
            {item.techniques.join(' · ')}
          </p>
        )}

        {/* Pricing section */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {isAuction ? (
            <div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    color: 'var(--ink-muted)',
                  }}
                >
                  Current bid:{' '}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                  }}
                >
                  {formatPrice(item.current_bid ?? item.starting_bid)}
                </span>
              </div>
              {auctionActive && endDate && (
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--ink-muted)',
                  }}
                >
                  Time remaining: <LiveCountdown endDate={endDate} />
                </div>
              )}
              {!auctionActive && (
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--ink-muted)',
                  }}
                >
                  Auction ended
                </div>
              )}
              {!reserveMet && auctionActive && (
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--error)',
                    marginTop: '0.5rem',
                  }}
                >
                  Reserve price not yet met.
                </p>
              )}
            </div>
          ) : (
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: isSold ? 'var(--ink-muted)' : 'var(--accent)',
                }}
              >
                {isSold ? 'Sold' : formatPrice(item.buy_now_price)}
              </span>
              {isReserved && !isSold && (
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--ink-muted)',
                    marginTop: '0.25rem',
                  }}
                >
                  Reserved — check back soon.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {isBuyNow && !isSold && !isReserved && (
            <RoughBorder roughness={1.5} strokeWidth={2} stroke="var(--accent)" fill="var(--accent)">
              <Link
                href={`/checkout?sku=${sku}`}
                style={{
                  display: 'block',
                  padding: '12px 24px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--bg)',
                  textDecoration: 'none',
                }}
              >
                Buy Now — {formatPrice(item.buy_now_price)}
              </Link>
            </RoughBorder>
          )}
          {isAuction && auctionActive && (
            <RoughBorder roughness={1.5} strokeWidth={2} stroke="var(--accent)" fill="var(--accent)">
              <span
                style={{
                  display: 'block',
                  padding: '12px 24px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--bg)',
                }}
              >
                Place Bid
              </span>
            </RoughBorder>
          )}
          <RoughBorder roughness={1.5} strokeWidth={2} stroke="var(--accent)" fill="none">
            <Link
              href="/browse"
              style={{
                display: 'block',
                padding: '12px 24px',
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--ink)',
                textDecoration: 'none',
              }}
            >
              Browse More
            </Link>
          </RoughBorder>
        </div>

        {/* Bid history */}
        {isAuction && bids.length > 0 && (
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: '1rem',
              }}
            >
              Bid History
            </h2>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {bids.map((bid, i) => {
                const isTop = i === 0;
                return (
                  <div
                    key={bid.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.625rem 0.75rem',
                      backgroundColor: isTop ? 'var(--bg-well)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      fontFamily: 'var(--font-body)',
                      fontSize: isTop ? '1rem' : '0.875rem',
                    }}
                  >
                    <span style={{ color: 'var(--ink-muted)' }}>
                      {new Date(bid.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      {formatPrice(bid.amount)}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.75rem',
                        color: isTop ? 'var(--success)' : 'var(--ink-muted)',
                        backgroundColor: isTop ? 'var(--accent-light)' : 'transparent',
                        padding: isTop ? '1px 6px' : '0',
                      }}
                    >
                      {isTop ? 'CURRENT' : 'OUTBID'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageFlipTransition>
  );
}
