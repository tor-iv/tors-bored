'use client';
import Link from 'next/link';
import Win98Window from './Win98Window';
import Y2KSidebar from './Y2KSidebar';
import Marquee from './Marquee';

interface Y2KHomeProps {
  featuredItem?: {
    id: string;
    sku: string;
    title: string;
    images?: string[];
    current_bid?: number | null;
    buy_now_price?: number | null;
    listing_type?: string;
  } | null;
  auctionItems?: Array<{
    id: string;
    sku: string;
    title: string;
    images?: string[];
    currentBid?: number | null;
    startingBid?: number | null;
    endDate?: string | null;
  }>;
  shopItems?: Array<{
    id: string;
    sku: string;
    title: string;
    images?: string[];
    buyNowPrice?: number | null;
  }>;
}

function formatPrice(val: number | null | undefined) {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
}

export default function Y2KHome({ featuredItem, auctionItems = [], shopItems = [] }: Y2KHomeProps) {
  const allItems = [
    ...auctionItems.map((i) => ({ ...i, type: 'auction' as const })),
    ...shopItems.map((i) => ({ ...i, type: 'buy_now' as const })),
  ].slice(0, 6);

  return (
    <div className="y2k-starfield">
      {/* Marquee announcement bar */}
      <Marquee />

      <div className="y2k-desktop" style={{ paddingTop: 8 }}>
        <Y2KSidebar />

        <div className="y2k-main">
          {/* Welcome window */}
          <Win98Window title="🏺 Welcome to Tor's Bored Pottery!" controls={['minimize', 'maximize', 'close']}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {featuredItem?.images?.[0] && (
                <span className="win98-photo-frame" style={{ flexShrink: 0, position: 'relative' }}>
                  <img
                    src={featuredItem.images[0]}
                    alt={featuredItem.title}
                    style={{ width: 140, height: 140, objectFit: 'cover', display: 'block' }}
                  />
                </span>
              )}
              {!featuredItem?.images?.[0] && (
                <div
                  className="win98-photo-frame"
                  style={{
                    width: 140,
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    flexShrink: 0,
                  }}
                >
                  🏺
                </div>
              )}
              <div style={{ flex: 1, minWidth: 180 }}>
                <h1 style={{ fontFamily: '"Comic Sans MS", cursive', fontSize: '1.2rem', color: 'var(--accent)', marginBottom: 8, lineHeight: 1.2 }}>
                  Welcome to my pottery site!!! 🌟
                </h1>
                <p style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif', fontSize: 12, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 10 }}>
                  Hi! I&apos;m Tor and I make handcrafted ceramics in Brooklyn, NY. Every piece is one-of-a-kind, thrown on the wheel, and fired with care. 🎨
                </p>
                {featuredItem && (
                  <div style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, marginBottom: 10, padding: '4px 8px', background: 'var(--bg-well)', border: '1px inset var(--border)' }}>
                    <strong>Featured:</strong> {featuredItem.title}
                    {featuredItem.current_bid && <span style={{ marginLeft: 8 }}>Current bid: <strong>{formatPrice(featuredItem.current_bid)}</strong></span>}
                    {featuredItem.buy_now_price && <span style={{ marginLeft: 8 }}>Buy now: <strong>{formatPrice(featuredItem.buy_now_price)}</strong></span>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link href="/browse">
                    <button className="win98-btn" style={{ background: '#000080', color: '#ffffff', fontFamily: 'Tahoma, sans-serif' }}>
                      📁 ENTER GALLERY
                    </button>
                  </Link>
                  <Link href="/shop">
                    <button className="win98-btn" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                      🛒 SHOP NOW
                    </button>
                  </Link>
                  <Link href="/commissions">
                    <button className="win98-btn" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                      ✏️ COMMISSION
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </Win98Window>

          {/* Pieces grid */}
          {allItems.length > 0 && (
            <Win98Window title="★ FEATURED PIECES ★" controls={['minimize', 'maximize', 'close']}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, padding: 4 }}>
                {allItems.map((item, i) => {
                  const isNew = i < 2;
                  const price = item.type === 'auction'
                    ? (item as any).currentBid ?? (item as any).startingBid
                    : (item as any).buyNowPrice;
                  return (
                    <Link key={item.id} href={`/piece/${item.sku}`} style={{ textDecoration: 'none' }}>
                      <div className="win98-window" style={{ position: 'relative', cursor: 'pointer' }}>
                        {isNew && <span className="y2k-new-badge">NEW!</span>}
                        <div className="win98-title-bar" style={{ fontSize: 9, padding: '2px 4px' }}>
                          <span className="win98-title-bar-text" style={{ fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.sku}
                          </span>
                        </div>
                        <div className="win98-window-body" style={{ padding: 4 }}>
                          <span className="win98-photo-frame" style={{ display: 'block', marginBottom: 4 }}>
                            {item.images?.[0] ? (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: 80, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏺</div>
                            )}
                          </span>
                          <div style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 10, color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                          <div style={{ fontFamily: '"Courier New", monospace', fontSize: 11, color: item.type === 'auction' ? '#000080' : '#008000', fontWeight: 'bold' }}>
                            {item.type === 'auction' ? '🔨 ' : '🛒 '}{formatPrice(price)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div style={{ padding: '8px 4px 0', borderTop: '1px solid var(--border)' }}>
                <Link href="/browse">
                  <button className="win98-btn" style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
                    View All Pieces →
                  </button>
                </Link>
              </div>
            </Win98Window>
          )}

          {/* How it works */}
          <Win98Window title="ℹ️ How It Works" controls={['minimize', 'close']}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { icon: '🔍', step: '1. Browse', desc: 'Explore the gallery for one-of-a-kind pieces.' },
                { icon: '🔨', step: '2. Bid or Buy', desc: 'Place bids in monthly auctions or buy instantly.' },
                { icon: '📦', step: '3. Enjoy!', desc: 'Ships from the studio straight to your door.' },
              ].map(({ icon, step, desc }) => (
                <div key={step} style={{ textAlign: 'center', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <strong style={{ display: 'block', marginBottom: 2, color: 'var(--accent)' }}>{step}</strong>
                  <span style={{ color: 'var(--ink-muted)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </Win98Window>

          {/* Guestbook CTA */}
          <div
            style={{
              textAlign: 'center',
              fontFamily: '"Comic Sans MS", cursive',
              fontSize: 13,
              color: '#ffff00',
              padding: '8px',
              background: '#000080',
              border: '2px solid #ffffff',
            }}
          >
            🌟 Sign the guestbook! Tell Tor what you think! 🌟
            &nbsp;&nbsp;
            <button
              className="win98-btn"
              style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 10 }}
              onClick={() => alert('Guestbook coming soon! 📝')}
            >
              Sign Here!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
