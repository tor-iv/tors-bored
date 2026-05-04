'use client';
import Link from 'next/link';
import Win98Window from './Win98Window';
import VisitorCounter from './VisitorCounter';

export default function Y2KHome() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {/* Hero window */}
      <Win98Window
        title="Welcome to Tor's Pottery!"
        icon="/y2k/info-icon.svg"
        className="mb-6"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <h1 style={{ fontFamily: '"Comic Sans MS", cursive', fontSize: '1.75rem', color: 'var(--accent)', marginBottom: 12 }}>
            Welcome to Tor&apos;s Bored Pottery!
          </h1>
          <img
            src="/paintings/multicolor-vase.png"
            alt="Featured pottery piece"
            style={{
              maxWidth: 200,
              height: 'auto',
              margin: '0 auto 16px',
              display: 'block',
              border: '2px solid var(--border)',
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 12, color: 'var(--ink)', marginBottom: 16, lineHeight: 1.6 }}>
            Handcrafted ceramics from Brooklyn, NY. Every piece is one-of-a-kind, thrown on the wheel, and fired with care.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse">
              <button className="win98-btn" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                ENTER GALLERY
              </button>
            </Link>
            <Link href="/shop">
              <button className="win98-btn" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                SHOP NOW
              </button>
            </Link>
          </div>
        </div>
      </Win98Window>

      {/* Featured section */}
      <Win98Window
        title="★ FEATURED PIECES ★"
        icon="/y2k/info-icon.svg"
        className="mb-6"
      >
        <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--ink-muted)', textAlign: 'center', padding: '12px 0' }}>
          New pieces added monthly. Check back often for auctions and buy-now items!
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse">
            <button className="win98-btn">Browse All</button>
          </Link>
          <Link href="/shop">
            <button className="win98-btn">Buy Now</button>
          </Link>
          <Link href="/commissions">
            <button className="win98-btn">Commission</button>
          </Link>
        </div>
      </Win98Window>

      {/* How it works */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Win98Window title="Step 1: Browse">
          <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--ink)' }}>
            Explore the gallery to find handmade pieces that speak to you.
          </p>
        </Win98Window>
        <Win98Window title="Step 2: Bid or Buy">
          <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--ink)' }}>
            Place a bid in monthly auctions or purchase buy-now items instantly.
          </p>
        </Win98Window>
        <Win98Window title="Step 3: Enjoy!">
          <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--ink)' }}>
            Your one-of-a-kind piece ships directly from the studio to your door.
          </p>
        </Win98Window>
      </div>

      {/* Visitor counter */}
      <div style={{ textAlign: 'center' }}>
        <VisitorCounter />
      </div>
    </div>
  );
}
