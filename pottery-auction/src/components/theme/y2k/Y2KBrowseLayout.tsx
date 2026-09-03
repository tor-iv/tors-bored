'use client';
import { useRouter } from 'next/navigation';
import Win98Window from './Win98Window';
import Y2KSidebar from './Y2KSidebar';
import BlinkingClock from './BlinkingClock';

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
  techniques?: string[];
  images?: string[];
  createdAt?: string | null;
}

interface Y2KBrowseLayoutProps {
  items: BrowseItem[];
  heading: string;
  emptyMessage?: string;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

function isNew(item: BrowseItem): boolean {
  if (!item.createdAt) return false;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return new Date(item.createdAt).getTime() > thirtyDaysAgo;
}

export default function Y2KBrowseLayout({ items, heading, emptyMessage }: Y2KBrowseLayoutProps) {
  const router = useRouter();

  return (
    <div className="y2k-desktop" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <Y2KSidebar />

      <div className="y2k-main">
        <Win98Window
          title={`📁 ${heading} — ${items.length} item${items.length !== 1 ? 's' : ''}`}
          controls={['minimize', 'maximize', 'close']}
        >
          {/* Toolbar row */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: 6,
              marginBottom: 6,
              fontFamily: 'Tahoma, sans-serif',
              fontSize: 11,
            }}
          >
            <button className="win98-btn" style={{ minWidth: 'unset', padding: '2px 8px', fontSize: 10 }}>
              🗂️ File
            </button>
            <button className="win98-btn" style={{ minWidth: 'unset', padding: '2px 8px', fontSize: 10 }}>
              ✏️ Edit
            </button>
            <button className="win98-btn" style={{ minWidth: 'unset', padding: '2px 8px', fontSize: 10 }}>
              👁️ View
            </button>
            <div
              style={{
                marginLeft: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '1px 6px',
                background: '#ffffff',
                border: '1px inset #808080',
                flex: 1,
              }}
            >
              <span style={{ color: 'var(--ink-muted)' }}>📁</span>
              <span>C:\TorPottery\Gallery</span>
            </div>
          </div>

          {/* Status bar: showing x items */}
          <div
            style={{
              fontFamily: 'Tahoma, sans-serif',
              fontSize: 10,
              color: 'var(--ink-muted)',
              marginBottom: 4,
              paddingBottom: 4,
              borderBottom: '1px solid var(--border)',
            }}
          >
            {items.length} object{items.length !== 1 ? 's' : ''} — Double-click to view details
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div className="win98-window" style={{ maxWidth: 280, margin: '0 auto' }}>
                <div className="win98-title-bar">
                  <span className="win98-title-bar-text">🚧 Empty Folder</span>
                </div>
                <div className="win98-window-body" style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📂</div>
                  <p style={{ fontFamily: '"Comic Sans MS", cursive', fontSize: 13, marginBottom: 8 }}>
                    No items found!
                  </p>
                  <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: 11, color: 'var(--ink-muted)' }}>
                    {emptyMessage ?? 'Check back soon — Tor is busy at the wheel.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="y2k-icon-grid">
              {items.map((item) => {
                const price = item.listingType === 'auction'
                  ? (item.currentBid ?? item.startingBid)
                  : item.buyNowPrice;
                const isSold = !!item.soldAt;
                const showNew = isNew(item) && !isSold;

                return (
                  <div
                    key={item.id}
                    className="y2k-icon-item"
                    onClick={() => router.push(`/piece/${item.sku}`)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${item.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/piece/${item.sku}`);
                      }
                    }}
                  >
                    {showNew && <span className="y2k-new-badge">NEW!</span>}

                    {/* Icon thumbnail */}
                    <div
                      className="win98-photo-frame"
                      style={{ position: 'relative', marginBottom: 4 }}
                    >
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="y2k-icon-thumb"
                        />
                      ) : (
                        <div
                          className="y2k-icon-thumb"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32,
                            background: '#e0e0e0',
                          }}
                        >
                          🏺
                        </div>
                      )}
                      {isSold && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: '"Comic Sans MS", cursive',
                            color: '#ff0000',
                            fontWeight: 'bold',
                            fontSize: 14,
                            transform: 'rotate(-15deg)',
                          }}
                        >
                          SOLD
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <span className="y2k-icon-label">{item.title}</span>

                    {/* Price + type badge */}
                    <div
                      style={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: 10,
                        color: isSold ? '#808080' : item.listingType === 'auction' ? '#000080' : '#008000',
                        fontWeight: 'bold',
                        marginTop: 1,
                      }}
                    >
                      {isSold ? 'SOLD' : (item.listingType === 'auction' ? '🔨 ' : '🛒 ') + formatPrice(price)}
                    </div>

                    {/* Countdown for auctions */}
                    {item.listingType === 'auction' && item.endDate && !isSold && (
                      <div style={{ fontSize: 9, fontFamily: 'Tahoma, sans-serif', color: 'var(--ink-muted)', marginTop: 1 }}>
                        <BlinkingClock endDate={item.endDate} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Status bar */}
          <div
            style={{
              marginTop: 8,
              paddingTop: 4,
              borderTop: '1px solid var(--border)',
              fontFamily: 'Tahoma, sans-serif',
              fontSize: 10,
              color: 'var(--ink-muted)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{items.filter((i) => !i.soldAt).length} item(s) available</span>
            <span>{items.filter((i) => i.soldAt).length} sold</span>
          </div>
        </Win98Window>
      </div>
    </div>
  );
}
