import Link from 'next/link';
import RoughBorder from './RoughBorder';

interface BrowseItem {
  id: string;
  sku: string;
  title: string;
  listingType: 'auction' | 'buy_now';
  buyNowPrice?: number | null;
  currentBid?: number | null;
  startingBid?: number | null;
  endDate?: string | null;
  soldAt?: string | null;
  reservedUntil?: string | null;
  techniques?: string[];
  images?: string[];
}

interface HanddrawnBrowseLayoutProps {
  items: BrowseItem[];
  heading?: string;
  emptyMessage?: string;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

export default function HanddrawnBrowseLayout({
  items,
  heading = 'Browse All Pieces',
  emptyMessage = 'No pieces available right now. Check back soon.',
}: HanddrawnBrowseLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {heading && (
        <h1
          className="text-center mb-12"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          {heading}
        </h1>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              color: 'var(--ink)',
              marginBottom: '0.75rem',
            }}
          >
            Nothing here yet.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '1rem' }}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => {
            const isSold = !!item.soldAt;
            const price =
              item.listingType === 'auction'
                ? (item.currentBid ?? item.startingBid)
                : item.buyNowPrice;

            return (
              <Link
                key={item.id}
                href={`/piece/${item.sku}`}
                className="block transition-opacity hover:opacity-90"
                style={{ textDecoration: 'none' }}
              >
                <RoughBorder roughness={1.5} strokeWidth={2} fill="var(--bg-well)">
                  <div
                    style={{
                      padding: '0.5rem',
                      position: 'relative',
                    }}
                  >
                    {/* Image */}
                    {item.images?.[0] ? (
                      <div style={{ padding: '8px', marginBottom: '0.75rem' }}>
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '200px',
                          backgroundColor: 'var(--accent-light)',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          color: 'var(--ink-muted)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        No image
                      </div>
                    )}

                    <div style={{ padding: '0 0.5rem 0.75rem' }}>
                      {/* Badge */}
                      <span
                        style={{
                          display: 'inline-block',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--accent-light)',
                          border: '1px solid var(--accent)',
                          color: 'var(--accent)',
                          padding: '1px 8px',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {item.listingType === 'auction' ? 'AUCTION' : 'BUY NOW'}
                      </span>

                      {/* Title */}
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: 'var(--ink)',
                          marginBottom: '0.25rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.title}
                      </div>

                      {/* Price */}
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: isSold ? 'var(--ink-muted)' : 'var(--accent)',
                        }}
                      >
                        {isSold ? 'SOLD' : formatPrice(price)}
                      </div>
                    </div>

                    {/* Sold overlay */}
                    {isSold && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(247,243,232,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'var(--ink-muted)',
                            transform: 'rotate(-15deg)',
                            border: '3px solid var(--ink-muted)',
                            padding: '4px 16px',
                          }}
                        >
                          SOLD
                        </span>
                      </div>
                    )}
                  </div>
                </RoughBorder>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
