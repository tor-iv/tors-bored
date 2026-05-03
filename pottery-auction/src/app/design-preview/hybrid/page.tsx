'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PreviewNav from '../components/PreviewNav';

// Illustrated pottery shelf (reused from illustrated variant)
function PotteryShelf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="170" width="800" height="30" fill="#8B6B4A" />
      <rect x="0" y="170" width="800" height="4" fill="#A08060" />
      <path d="M100 170 Q100 120 90 80 Q100 60 120 60 Q140 60 130 80 Q120 120 120 170 Z" fill="#C96F53" />
      <ellipse cx="110" cy="60" rx="20" ry="8" fill="#B85F43" />
      <path d="M220 170 Q200 140 210 120 Q240 100 280 100 Q310 100 320 120 Q330 140 310 170 Z" fill="#7A9E7E" />
      <ellipse cx="265" cy="105" rx="45" ry="15" fill="#6A8E6E" />
      <rect x="400" y="120" width="50" height="50" rx="4" fill="#D4A853" />
      <path d="M450 130 Q470 135 470 145 Q470 155 450 160" stroke="#B8923F" strokeWidth="4" fill="none" />
      <ellipse cx="425" cy="120" rx="25" ry="8" fill="#C49843" />
      <path d="M560 170 Q550 150 555 130 Q570 120 590 120 Q610 120 615 130 Q620 150 610 170 Z" fill="#C96F53" />
      <ellipse cx="700" cy="165" rx="40" ry="8" fill="#F5EDE4" stroke="#D4CFC8" strokeWidth="2" />
      <ellipse cx="700" cy="160" rx="38" ry="7" fill="#F5EDE4" stroke="#D4CFC8" strokeWidth="2" />
      <ellipse cx="700" cy="155" rx="36" ry="6" fill="#F5EDE4" stroke="#D4CFC8" strokeWidth="2" />
    </svg>
  );
}

// Illustrated window
function StudioWindow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="180" height="260" fill="#5C4033" rx="4" />
      <rect x="20" y="20" width="160" height="240" fill="#87CEEB" rx="2" />
      <line x1="100" y1="20" x2="100" y2="260" stroke="#5C4033" strokeWidth="6" />
      <line x1="20" y1="140" x2="180" y2="140" stroke="#5C4033" strokeWidth="6" />
      <path d="M100 140 L300 300" stroke="#FFF9E6" strokeWidth="80" opacity="0.15" />
    </svg>
  );
}

// Hybrid chunky button - combines retro feel with warm colors
function HybridButton({
  children,
  href,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'sage';
  className?: string;
}) {
  const variants = {
    primary: {
      bg: '#C96F53',
      shadow: '#B8432F',
      text: '#FFFEF8',
    },
    secondary: {
      bg: '#5C4033',
      shadow: '#3D2A22',
      text: '#F5EDE4',
    },
    sage: {
      bg: '#7A9E7E',
      shadow: '#5A7E5E',
      text: '#FFFEF8',
    },
  };

  const v = variants[variant];

  const buttonStyles = {
    fontFamily: 'var(--font-space-mono)',
    background: v.bg,
    color: v.text,
    padding: '14px 28px',
    boxShadow: `0 4px 0 ${v.shadow}`,
    borderRadius: '3px',
    textTransform: 'uppercase' as const,
    fontWeight: 700,
    letterSpacing: '0.08em',
    fontSize: '14px',
    transition: 'all 0.1s ease',
  };

  const content = (
    <motion.span
      className={`inline-flex items-center gap-2 ${className}`}
      style={buttonStyles}
      whileHover={{ y: -2, boxShadow: `0 6px 0 ${v.shadow}` }}
      whileTap={{ y: 2, boxShadow: `0 2px 0 ${v.shadow}` }}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// Hybrid tag card - illustrated style with chunky border
function HybridTagCard({
  children,
  className = '',
  tilt = 0,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: number;
}) {
  return (
    <motion.div
      className={`relative p-6 pt-10 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FFFEF8 0%, #F5EDE4 100%)',
        border: '3px solid #5C4033',
        boxShadow: '4px 4px 0 #5C4033',
        borderRadius: '2px',
        transform: `rotate(${tilt}deg)`,
      }}
      whileHover={{
        y: -6,
        rotate: 0,
        boxShadow: '6px 6px 0 #5C4033',
        transition: { type: 'spring', stiffness: 300 },
      }}
    >
      {/* Punched hole effect */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
        style={{
          background: '#F5EDE4',
          border: '2px solid #5C4033',
          boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.15)',
        }}
      />
      {children}
    </motion.div>
  );
}

// Hybrid navigation - wooden beam with retro buttons
function HybridNav() {
  const links = [
    { href: '/gallery', label: 'GALLERY' },
    { href: '/auctions', label: 'AUCTIONS' },
    { href: '/commissions', label: 'COMMISSIONS' },
  ];

  return (
    <nav
      className="flex items-center justify-between px-6 py-4"
      style={{
        background: 'linear-gradient(180deg, #8B6B4A 0%, #6B4F3A 50%, #5C4033 100%)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      <Link
        href="/"
        className="text-2xl"
        style={{
          fontFamily: 'var(--font-permanent-marker)',
          color: '#F5EDE4',
          textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        }}
      >
        Tor&apos;s Pottery
      </Link>

      <div className="flex items-center gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-2 text-xs font-bold transition-all"
            style={{
              fontFamily: 'var(--font-space-mono)',
              background: '#F5EDE4',
              color: '#5C4033',
              border: '2px solid #5C4033',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// Price tag component - monospace on illustrated background
function PriceTag({ price }: { price: string }) {
  return (
    <span
      className="inline-block px-3 py-1"
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontWeight: 700,
        fontSize: '1.25rem',
        color: '#C96F53',
        background: 'rgba(255, 254, 248, 0.9)',
        border: '2px solid #C96F53',
      }}
    >
      {price}
    </span>
  );
}

export default function HybridVariant() {
  const featuredPieces = [
    {
      title: 'Sunrise Bowl',
      price: '$85',
      bids: 7,
      timeLeft: '2d 4h',
      status: 'LIVE',
    },
    {
      title: 'Forest Vase',
      price: '$120',
      bids: 12,
      timeLeft: '1d 8h',
      status: 'HOT',
    },
    {
      title: 'Honey Mug Set',
      price: '$65',
      bids: 3,
      timeLeft: '4d 12h',
      status: 'NEW',
    },
  ];

  return (
    <div className="variant-hybrid min-h-screen" style={{ background: '#F5EDE4' }}>
      {/* Illustrated background layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-64 opacity-50">
          <StudioWindow className="w-full" />
        </div>
        <div className="absolute top-24 right-0 w-3/4 opacity-30">
          <PotteryShelf className="w-full" />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(255, 249, 230, 0.5) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <HybridNav />

        {/* Hero Section */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Handwritten headline */}
              <h1
                className="text-5xl md:text-8xl mb-4"
                style={{
                  fontFamily: 'var(--font-permanent-marker)',
                  color: '#5C4033',
                  textShadow: '3px 3px 0 rgba(255,255,255,0.5)',
                }}
              >
                Handcrafted
              </h1>
              <h2
                className="text-4xl md:text-6xl mb-8"
                style={{
                  fontFamily: 'var(--font-caveat)',
                  color: '#7A9E7E',
                }}
              >
                with heart & hands
              </h2>

              {/* Monospace tagline */}
              <p
                className="text-sm md:text-base mb-12 max-w-xl mx-auto"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  color: '#5C4033',
                  letterSpacing: '0.05em',
                  lineHeight: 1.8,
                }}
              >
                UNIQUE POTTERY PIECES // MONTHLY AUCTIONS // MADE WITH LOVE
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <HybridButton href="/auctions" variant="primary">
                  SHOP AUCTION <ArrowRight size={16} />
                </HybridButton>
                <HybridButton href="/gallery" variant="secondary">
                  BROWSE GALLERY
                </HybridButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Auction Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section header with retro styling */}
            <div
              className="flex items-center gap-4 mb-12 pb-4"
              style={{ borderBottom: '3px solid #5C4033' }}
            >
              <motion.span
                className="px-3 py-1 text-xs font-bold"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  background: '#C96F53',
                  color: '#FFFEF8',
                }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                LIVE
              </motion.span>
              <h2
                className="text-3xl"
                style={{
                  fontFamily: 'var(--font-caveat)',
                  color: '#5C4033',
                }}
              >
                Current Auction
              </h2>
              <span
                className="text-sm ml-auto"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  color: '#5C4033',
                }}
              >
                ENDS: FEB 15, 2025
              </span>
            </div>

            {/* Auction cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPieces.map((piece, index) => (
                <HybridTagCard key={piece.title} tilt={(index - 1) * 1.5}>
                  {/* Status badge */}
                  <span
                    className="absolute top-3 right-3 px-2 py-0.5 text-xs font-bold"
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      background: piece.status === 'HOT' ? '#C96F53' : piece.status === 'LIVE' ? '#7A9E7E' : '#D4A853',
                      color: '#FFFEF8',
                    }}
                  >
                    {piece.status}
                  </span>

                  {/* Image placeholder */}
                  <div
                    className="w-full aspect-square mb-4 flex items-center justify-center"
                    style={{
                      background: 'rgba(92, 64, 51, 0.08)',
                      border: '2px dashed rgba(92, 64, 51, 0.3)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-caveat)',
                        color: '#5C4033',
                        opacity: 0.5,
                        fontSize: '1.2rem',
                      }}
                    >
                      [Photo]
                    </span>
                  </div>

                  {/* Title - handwritten */}
                  <h3
                    className="text-2xl mb-3"
                    style={{
                      fontFamily: 'var(--font-caveat)',
                      color: '#5C4033',
                    }}
                  >
                    {piece.title}
                  </h3>

                  {/* Stats - monospace */}
                  <div
                    className="grid grid-cols-2 gap-2 mb-4 text-xs"
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      color: '#5C4033',
                    }}
                  >
                    <div>BIDS: {piece.bids}</div>
                    <div>TIME: {piece.timeLeft}</div>
                  </div>

                  {/* Price and bid button */}
                  <div className="flex items-center justify-between">
                    <PriceTag price={piece.price} />
                    <HybridButton variant="sage">
                      BID
                    </HybridButton>
                  </div>
                </HybridTagCard>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Hybrid style */}
        <section
          className="py-16 px-6"
          style={{ background: 'rgba(122, 158, 126, 0.15)' }}
        >
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl text-center mb-12"
              style={{
                fontFamily: 'var(--font-caveat)',
                color: '#5C4033',
              }}
            >
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Browse', desc: 'New drops every 15th' },
                { step: '02', title: 'Bid', desc: 'Secure payment via Stripe' },
                { step: '03', title: 'Win', desc: 'Shipped with care' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="text-center p-6"
                  style={{
                    background: '#FFFEF8',
                    border: '2px solid #5C4033',
                    boxShadow: '3px 3px 0 #5C4033',
                  }}
                >
                  <span
                    className="block text-3xl mb-2"
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontWeight: 700,
                      color: '#C96F53',
                    }}
                  >
                    {item.step}
                  </span>
                  <h3
                    className="text-xl mb-2"
                    style={{
                      fontFamily: 'var(--font-caveat)',
                      color: '#5C4033',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      color: '#5C4033',
                      opacity: 0.8,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <HybridTagCard className="text-center py-10">
              <h2
                className="text-3xl mb-4"
                style={{
                  fontFamily: 'var(--font-permanent-marker)',
                  color: '#5C4033',
                }}
              >
                Got an Idea?
              </h2>
              <p
                className="text-sm mb-6 max-w-md mx-auto"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  color: '#5C4033',
                  lineHeight: 1.8,
                }}
              >
                SUBMIT YOUR POTTERY DREAMS AND I MIGHT JUST MAKE THEM REAL.
              </p>
              <HybridButton href="/commissions" variant="sage">
                SUBMIT COMMISSION <ArrowRight size={16} />
              </HybridButton>
            </HybridTagCard>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="py-8 px-6 text-center"
          style={{
            background: '#5C4033',
            color: '#F5EDE4',
          }}
        >
          <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '12px', letterSpacing: '0.1em' }}>
            MADE WITH CLAY AND CARE BY TOR // 2025
          </p>
        </footer>
      </div>

      <PreviewNav />
    </div>
  );
}
