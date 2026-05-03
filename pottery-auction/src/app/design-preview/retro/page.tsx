'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Mail, Calendar, Clock } from 'lucide-react';
import PreviewNav from '../components/PreviewNav';

// Generate stable visitor number on client only
function useVisitorNumber(digits: number) {
  const [number, setNumber] = useState('0'.repeat(digits));
  useEffect(() => {
    setNumber(
      Math.floor(Math.random() * Math.pow(10, digits))
        .toString()
        .padStart(digits, '0')
    );
  }, [digits]);
  return number;
}

// Bold sans logo
function RetroLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-inter)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
      }}
    >
      Tor&apos;s Pottery
    </span>
  );
}

// Modern button with subtle retro bevel
function RetroButton({
  children,
  variant = 'primary',
  href,
  className = '',
  size = 'default',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'coral' | 'ghost';
  href?: string;
  className?: string;
  size?: 'default' | 'large';
}) {
  const baseStyles = `
    inline-flex items-center gap-2 font-semibold transition-all duration-150
    ${size === 'large' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'}
  `;

  const variants = {
    primary: 'modern-retro-button',
    coral: 'modern-retro-button modern-retro-button-coral',
    ghost: `
      text-[var(--muted-blue)] hover:text-[var(--blue-dark)]
      border-b-2 border-transparent hover:border-[var(--muted-blue)]
    `,
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return <button className={combinedClassName}>{children}</button>;
}

// Modern card with subtle retro touch
function RetroCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      className={`modern-retro-card p-6 ${className}`}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Navigation link
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[var(--text-secondary)] hover:text-[var(--warm-black)] transition-colors"
      style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '0.875rem',
        fontWeight: 600,
      }}
    >
      {children}
    </Link>
  );
}

// Clean navigation
function RetroNav() {
  const links = [
    { href: '/gallery', label: 'Gallery' },
    { href: '/auctions', label: 'Auctions' },
    { href: '/commissions', label: 'Commissions' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav
      className="flex items-center justify-between px-6 md:px-12 py-5 border-b"
      style={{
        background: 'var(--off-white)',
        borderColor: 'var(--border-gray)',
      }}
    >
      <Link href="/" className="text-xl text-[var(--warm-black)]">
        <RetroLogo />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <NavLink key={link.href} href={link.href}>
            {link.label}
          </NavLink>
        ))}
      </div>

      <RetroButton variant="coral" href="/auctions">
        Shop
        <ArrowUpRight size={16} />
      </RetroButton>
    </nav>
  );
}

// Retro-inspired dashed divider
function RetroDivider() {
  return <div className="modern-retro-divider w-full my-12" />;
}

// "Under construction" badge as ironic touch
function UnderConstructionBadge() {
  return (
    <span className="modern-retro-badge">
      <span className="inline-block w-2 h-2 bg-[var(--coral)] rounded-full animate-pulse" />
      New pieces coming
    </span>
  );
}

export default function ModernRetroVariant() {
  const visitorCount = useVisitorNumber(4);

  const featuredPieces = [
    {
      id: '001',
      title: 'Terracotta Bowl',
      price: '$85',
      description: 'Hand-thrown with warm earthy tones',
      tag: 'Popular',
    },
    {
      id: '002',
      title: 'Sage Vase',
      price: '$120',
      description: 'Deep green glaze, organic form',
      tag: 'New',
    },
    {
      id: '003',
      title: 'Honey Mug Set',
      price: '$65',
      description: 'Set of 2, perfect for morning coffee',
      tag: null,
    },
  ];

  const quickLinks = [
    { href: '/gallery', label: 'Browse Full Gallery', icon: ArrowRight },
    { href: '/auctions', label: 'Current Auction Listings', icon: Calendar },
    { href: '/commissions', label: 'Request Custom Piece', icon: Mail },
  ];

  return (
    <div className="variant-modern-retro min-h-screen" style={{ background: 'var(--off-white)' }}>
      <RetroNav />

      {/* Hero Section - Clean modern layout */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UnderConstructionBadge />

              <h1
                className="text-5xl md:text-6xl lg:text-7xl mt-6 mb-6 leading-[1.05]"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 800,
                  color: 'var(--warm-black)',
                  letterSpacing: '-0.03em',
                }}
              >
                Handmade
                <br />
                <span style={{ color: 'var(--muted-blue)' }}>Pottery</span>
              </h1>

              <p
                className="text-lg md:text-xl mb-8 leading-relaxed max-w-md"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--text-secondary)',
                  fontWeight: 400,
                }}
              >
                Functional ceramics crafted with intention. Each piece is made by hand in small
                batches.
              </p>

              <div className="flex flex-wrap gap-4">
                <RetroButton variant="primary" href="/auctions" size="large">
                  Shop Current Pieces
                  <ArrowRight size={18} />
                </RetroButton>
                <RetroButton variant="ghost" href="/gallery" size="large">
                  View Gallery
                </RetroButton>
              </div>
            </motion.div>

            {/* Image placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div
                className="aspect-[4/5] flex items-center justify-center"
                style={{
                  background: 'var(--light-gray)',
                  borderRadius: '4px',
                  border: '1px solid var(--border-gray)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  [Featured Image]
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <RetroDivider />

      {/* Featured Pieces */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  color: 'var(--muted-blue)',
                }}
              >
                Featured
              </span>
              <h2
                className="text-3xl md:text-4xl"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 800,
                  color: 'var(--warm-black)',
                  letterSpacing: '-0.02em',
                }}
              >
                Latest Pieces
              </h2>
            </div>
            <RetroButton variant="ghost" href="/gallery">
              View All <ArrowRight size={16} />
            </RetroButton>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredPieces.map((piece, index) => (
              <motion.div
                key={piece.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <RetroCard className="h-full">
                  {/* Image placeholder */}
                  <div
                    className="aspect-square mb-4 flex items-center justify-center relative"
                    style={{
                      background: 'var(--light-gray)',
                      borderRadius: '4px',
                    }}
                  >
                    {piece.tag && (
                      <span
                        className="absolute top-3 left-3 px-2 py-1 text-xs font-bold uppercase"
                        style={{
                          fontFamily: 'var(--font-space-mono)',
                          background:
                            piece.tag === 'Popular' ? 'var(--coral)' : 'var(--muted-blue)',
                          color: 'white',
                          borderRadius: '2px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {piece.tag}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      [Photo]
                    </span>
                  </div>

                  {/* Piece info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="text-lg"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontWeight: 700,
                        color: 'var(--warm-black)',
                      }}
                    >
                      {piece.title}
                    </h3>
                    <span
                      className="text-lg"
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontWeight: 700,
                        color: 'var(--coral)',
                      }}
                    >
                      {piece.price}
                    </span>
                  </div>

                  <p
                    className="text-sm mb-4"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {piece.description}
                  </p>

                  <RetroButton variant="ghost" className="w-full justify-center">
                    View Details <ArrowRight size={14} />
                  </RetroButton>
                </RetroCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <RetroDivider />

      {/* Quick Links Section */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="flex items-center justify-between p-5 transition-all hover:bg-[var(--light-gray)]"
                  style={{
                    border: '1px solid var(--border-gray)',
                    borderRadius: '4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontWeight: 600,
                      color: 'var(--warm-black)',
                    }}
                  >
                    {link.label}
                  </span>
                  <link.icon size={18} style={{ color: 'var(--muted-blue)' }} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About/CTA Section */}
      <section className="py-20 px-6 md:px-12" style={{ background: 'var(--light-gray)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-widest mb-4 block"
              style={{
                fontFamily: 'var(--font-space-mono)',
                color: 'var(--muted-blue)',
              }}
            >
              Custom Work
            </span>

            <h2
              className="text-4xl md:text-5xl mb-6"
              style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 800,
                color: 'var(--warm-black)',
                letterSpacing: '-0.02em',
              }}
            >
              Have an idea?
            </h2>

            <p
              className="text-lg mb-8 max-w-lg mx-auto"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--text-secondary)',
              }}
            >
              I take on custom commissions for special pieces. Share your vision and let&apos;s
              create something unique together.
            </p>

            <RetroButton variant="coral" href="/commissions" size="large">
              Submit Commission Request
              <ArrowRight size={18} />
            </RetroButton>
          </motion.div>
        </div>
      </section>

      {/* Footer with visitor counter as easter egg */}
      <footer
        className="py-12 px-6 md:px-12 border-t"
        style={{
          borderColor: 'var(--border-gray)',
          background: 'var(--off-white)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <RetroLogo className="text-lg text-[var(--warm-black)]" />

            <div className="flex flex-wrap justify-center gap-6">
              {['Gallery', 'Auctions', 'Commissions', 'About'].map((link) => (
                <NavLink key={link} href={`/${link.toLowerCase()}`}>
                  {link}
                </NavLink>
              ))}
            </div>

            {/* Visitor counter as subtle retro easter egg */}
            <div className="flex items-center gap-4">
              <span
                className="text-xs"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--text-secondary)',
                }}
              >
                {new Date().getFullYear()}
              </span>
              <span
                className="px-2 py-1 text-xs"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  background: 'var(--warm-black)',
                  color: 'var(--light-gray)',
                  borderRadius: '2px',
                  letterSpacing: '0.05em',
                }}
              >
                #{visitorCount}
              </span>
            </div>
          </div>

          {/* Timestamp as retro touch */}
          <div className="flex justify-center mt-8">
            <span
              className="flex items-center gap-2 text-xs"
              style={{
                fontFamily: 'var(--font-space-mono)',
                color: 'var(--text-secondary)',
              }}
            >
              <Clock size={12} />
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </footer>

      {/* Add spacing for preview nav */}
      <div className="h-16" />

      <PreviewNav />
    </div>
  );
}
