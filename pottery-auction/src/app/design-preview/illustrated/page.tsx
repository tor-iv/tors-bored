'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PreviewNav from '../components/PreviewNav';

// Illustration: Pottery shelf with items
function PotteryShelf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shelf board */}
      <rect x="0" y="170" width="800" height="30" fill="#8B6B4A" />
      <rect x="0" y="170" width="800" height="4" fill="#A08060" />

      {/* Vase 1 - tall */}
      <path d="M100 170 Q100 120 90 80 Q100 60 120 60 Q140 60 130 80 Q120 120 120 170 Z" fill="#C96F53" />
      <ellipse cx="110" cy="60" rx="20" ry="8" fill="#B85F43" />

      {/* Bowl */}
      <path d="M220 170 Q200 140 210 120 Q240 100 280 100 Q310 100 320 120 Q330 140 310 170 Z" fill="#7A9E7E" />
      <ellipse cx="265" cy="105" rx="45" ry="15" fill="#6A8E6E" />

      {/* Mug */}
      <rect x="400" y="120" width="50" height="50" rx="4" fill="#D4A853" />
      <path d="M450 130 Q470 135 470 145 Q470 155 450 160" stroke="#B8923F" strokeWidth="4" fill="none" />
      <ellipse cx="425" cy="120" rx="25" ry="8" fill="#C49843" />

      {/* Small pot */}
      <path d="M560 170 Q550 150 555 130 Q570 120 590 120 Q610 120 615 130 Q620 150 610 170 Z" fill="#C96F53" />

      {/* Plate stack */}
      <ellipse cx="700" cy="165" rx="40" ry="8" fill="#F5EDE4" stroke="#D4CFC8" strokeWidth="2" />
      <ellipse cx="700" cy="160" rx="38" ry="7" fill="#F5EDE4" stroke="#D4CFC8" strokeWidth="2" />
      <ellipse cx="700" cy="155" rx="36" ry="6" fill="#F5EDE4" stroke="#D4CFC8" strokeWidth="2" />
    </svg>
  );
}

// Illustration: Window with light
function StudioWindow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Window frame */}
      <rect x="10" y="10" width="180" height="260" fill="#5C4033" rx="4" />
      <rect x="20" y="20" width="160" height="240" fill="#87CEEB" rx="2" />

      {/* Window panes */}
      <line x1="100" y1="20" x2="100" y2="260" stroke="#5C4033" strokeWidth="6" />
      <line x1="20" y1="140" x2="180" y2="140" stroke="#5C4033" strokeWidth="6" />

      {/* Light rays */}
      <path d="M100 140 L300 300" stroke="#FFF9E6" strokeWidth="80" opacity="0.15" />
      <path d="M100 140 L350 250" stroke="#FFF9E6" strokeWidth="60" opacity="0.1" />

      {/* Curtain hints */}
      <path d="M15 20 Q30 100 20 180 Q15 220 20 260" stroke="#8B6B4A" strokeWidth="8" opacity="0.3" />
      <path d="M185 20 Q170 100 180 180 Q185 220 180 260" stroke="#8B6B4A" strokeWidth="8" opacity="0.3" />
    </svg>
  );
}

// Illustration: Pottery wheel
function PotteryWheelIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base/stand */}
      <path d="M60 180 L80 120 L120 120 L140 180 Z" fill="#5C4033" />

      {/* Wheel platform */}
      <ellipse cx="100" cy="120" rx="60" ry="15" fill="#8B6B4A" />
      <ellipse cx="100" cy="115" rx="55" ry="12" fill="#A08060" />

      {/* Clay on wheel */}
      <path d="M70 115 Q70 80 80 60 Q100 45 120 60 Q130 80 130 115" fill="#C96F53" />
      <ellipse cx="100" cy="60" rx="25" ry="10" fill="#B85F43" />

      {/* Hands shaping clay */}
      <path d="M55 90 Q65 85 70 90 Q75 100 65 105 Q55 100 55 90" fill="#E8C4A0" />
      <path d="M145 90 Q135 85 130 90 Q125 100 135 105 Q145 100 145 90" fill="#E8C4A0" />
    </svg>
  );
}

// Tag-style card component
function TagCard({
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
      className={`pottery-tag p-6 pt-8 ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
      whileHover={{ y: -8, rotate: 0, transition: { type: 'spring', stiffness: 300 } }}
    >
      {children}
    </motion.div>
  );
}

// Wooden beam navigation
function WoodenBeamNav() {
  const links = [
    { href: '/gallery', label: 'Gallery' },
    { href: '/auctions', label: 'Auctions' },
    { href: '/commissions', label: 'Commissions' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="wooden-beam py-3 px-8 flex items-center justify-between">
      <Link
        href="/"
        className="text-2xl text-white"
        style={{ fontFamily: 'var(--font-permanent-marker)' }}
      >
        Tor&apos;s Pottery
      </Link>
      <div className="flex gap-1">
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-2 text-sm"
            style={{
              fontFamily: 'var(--font-caveat)',
              fontSize: '1.1rem',
              color: '#F5EDE4',
              background: 'linear-gradient(135deg, #FFFEF8 0%, #F5EDE4 100%)',
              borderRadius: '2px 8px 2px 8px',
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 2}deg)`,
              boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ color: '#5C4033' }}>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function IllustratedVariant() {
  const featuredPieces = [
    {
      title: 'Sunrise Bowl',
      price: '$85',
      description: 'Warm terracotta with golden rim',
      status: 'Available',
    },
    {
      title: 'Forest Vase',
      price: '$120',
      description: 'Sage green with leaf impressions',
      status: 'Auction Live',
    },
    {
      title: 'Honey Mug Set',
      price: '$65',
      description: 'Set of 4 ochre glazed mugs',
      status: 'Coming Soon',
    },
  ];

  return (
    <div className="variant-illustrated min-h-screen" style={{ background: '#F5EDE4' }}>
      {/* Illustrated background layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Window with light streaming in */}
        <div className="absolute top-0 left-0 w-64 opacity-60">
          <StudioWindow className="w-full" />
        </div>

        {/* Shelves at different heights */}
        <div className="absolute top-20 right-0 w-3/4 opacity-40">
          <PotteryShelf className="w-full" />
        </div>

        {/* Pottery wheel in corner */}
        <div className="absolute bottom-20 left-10 w-48 opacity-30">
          <PotteryWheelIllustration className="w-full" />
        </div>

        {/* Warm light gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(255, 249, 230, 0.4) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <WoodenBeamNav />

        {/* Hero Section */}
        <section className="pt-20 pb-32 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                className="text-6xl md:text-8xl mb-6"
                style={{
                  fontFamily: 'var(--font-permanent-marker)',
                  color: '#5C4033',
                  textShadow: '3px 3px 0 rgba(255,255,255,0.5)',
                }}
              >
                Handcrafted
                <br />
                <span style={{ color: '#C96F53' }}>with Love</span>
              </h1>

              <p
                className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto"
                style={{
                  fontFamily: 'var(--font-libre-franklin)',
                  color: '#5C4033',
                  lineHeight: 1.6,
                }}
              >
                Every piece tells a story. From my hands to your home,
                <br />
                <span
                  style={{
                    fontFamily: 'var(--font-caveat)',
                    fontSize: '1.3em',
                    color: '#7A9E7E',
                  }}
                >
                  discover pottery made with passion
                </span>
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/auctions"
                  className="px-8 py-4 text-lg font-medium transition-transform hover:scale-105"
                  style={{
                    fontFamily: 'var(--font-libre-franklin)',
                    background: '#C96F53',
                    color: '#FFFEF8',
                    borderRadius: '4px 12px 4px 12px',
                    boxShadow: '4px 4px 0 #5C4033',
                  }}
                >
                  Shop the Auction
                </Link>
                <Link
                  href="/gallery"
                  className="px-8 py-4 text-lg font-medium transition-transform hover:scale-105"
                  style={{
                    fontFamily: 'var(--font-libre-franklin)',
                    background: 'transparent',
                    color: '#5C4033',
                    border: '2px solid #5C4033',
                    borderRadius: '4px 12px 4px 12px',
                  }}
                >
                  Browse Gallery
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Pieces as Tags */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-4xl text-center mb-16"
              style={{
                fontFamily: 'var(--font-caveat)',
                color: '#5C4033',
              }}
            >
              Fresh from the Kiln
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredPieces.map((piece, index) => (
                <TagCard key={piece.title} tilt={(index - 1) * 2}>
                  {/* Status badge */}
                  <span
                    className="absolute top-3 right-3 px-2 py-1 text-xs rounded"
                    style={{
                      fontFamily: 'var(--font-libre-franklin)',
                      background: piece.status === 'Auction Live' ? '#C96F53' : '#7A9E7E',
                      color: '#FFFEF8',
                    }}
                  >
                    {piece.status}
                  </span>

                  {/* Placeholder for image */}
                  <div
                    className="w-full aspect-square mb-4 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(92, 64, 51, 0.1)' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-caveat)',
                        color: '#5C4033',
                        opacity: 0.5,
                      }}
                    >
                      [Photo]
                    </span>
                  </div>

                  <h3
                    className="text-2xl mb-2"
                    style={{
                      fontFamily: 'var(--font-caveat)',
                      color: '#5C4033',
                    }}
                  >
                    {piece.title}
                  </h3>

                  <p
                    className="text-sm mb-3"
                    style={{
                      fontFamily: 'var(--font-libre-franklin)',
                      color: '#5C4033',
                      opacity: 0.8,
                    }}
                  >
                    {piece.description}
                  </p>

                  <p
                    className="text-2xl"
                    style={{
                      fontFamily: 'var(--font-permanent-marker)',
                      color: '#C96F53',
                    }}
                  >
                    {piece.price}
                  </p>
                </TagCard>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4" style={{ background: 'rgba(122, 158, 126, 0.15)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-4xl mb-12"
              style={{
                fontFamily: 'var(--font-caveat)',
                color: '#5C4033',
              }}
            >
              How the Auction Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Browse', desc: 'New pieces drop every 15th' },
                { step: '2', title: 'Bid', desc: 'Place your bid securely' },
                { step: '3', title: 'Win', desc: 'Shipped with care to you' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: '#C96F53',
                      fontFamily: 'var(--font-permanent-marker)',
                      color: '#FFFEF8',
                      fontSize: '1.5rem',
                    }}
                  >
                    {item.step}
                  </div>
                  <h3
                    className="text-2xl mb-2"
                    style={{
                      fontFamily: 'var(--font-caveat)',
                      color: '#5C4033',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-libre-franklin)',
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
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <TagCard className="text-center py-12" tilt={-1}>
              <h2
                className="text-4xl mb-4"
                style={{
                  fontFamily: 'var(--font-permanent-marker)',
                  color: '#5C4033',
                }}
              >
                Got an Idea?
              </h2>
              <p
                className="text-lg mb-8 max-w-xl mx-auto"
                style={{
                  fontFamily: 'var(--font-libre-franklin)',
                  color: '#5C4033',
                  opacity: 0.8,
                }}
              >
                Submit your pottery dreams and I might just make them real.
                Custom pieces, your vision, my hands.
              </p>
              <Link
                href="/commissions"
                className="inline-block px-8 py-4 text-lg font-medium transition-transform hover:scale-105"
                style={{
                  fontFamily: 'var(--font-libre-franklin)',
                  background: '#7A9E7E',
                  color: '#FFFEF8',
                  borderRadius: '4px 12px 4px 12px',
                  boxShadow: '4px 4px 0 #5C4033',
                }}
              >
                Submit a Commission
              </Link>
            </TagCard>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="py-8 px-4 text-center"
          style={{
            background: '#5C4033',
            color: '#F5EDE4',
          }}
        >
          <p style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.2rem' }}>
            Made with clay and care by Tor
          </p>
        </footer>
      </div>

      <PreviewNav />
    </div>
  );
}
