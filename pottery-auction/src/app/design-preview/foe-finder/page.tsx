'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Mail, Calendar, Clock, X, Minus, Square } from 'lucide-react';
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

// Bold Inter logo with tight letter-spacing
function FFLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`ff-heading ${className}`}
      style={{
        fontWeight: 800,
        letterSpacing: '-0.04em',
        textTransform: 'uppercase',
      }}
    >
      Tor&apos;s Pottery
    </span>
  );
}

// FoeFinder flat blue button with sharp corners
function FFButton({
  children,
  href,
  className = '',
  size = 'default',
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  size?: 'default' | 'large';
}) {
  const combinedClassName = `ff-button ${
    size === 'large' ? 'px-8 py-4 text-sm' : 'px-6 py-3 text-xs'
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return <button className={combinedClassName}>{children}</button>;
}

// Window-style card with title bar
function FFWindow({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`ff-window ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {/* Title bar */}
      <div className="ff-title-bar">
        <span>{title}</span>
        <div className="ff-title-buttons">
          <button className="ff-title-btn">
            <Minus size={8} />
          </button>
          <button className="ff-title-btn">
            <Square size={8} />
          </button>
          <button className="ff-title-btn">
            <X size={8} />
          </button>
        </div>
      </div>
      {/* Content area */}
      <div className="ff-content">{children}</div>
    </motion.div>
  );
}

// Clean navigation
function FFNav() {
  const links = [
    { href: '/gallery', label: 'Gallery' },
    { href: '/auctions', label: 'Auctions' },
    { href: '/commissions', label: 'Commissions' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav
      className="flex items-center justify-between px-6 md:px-12 py-4"
      style={{
        background: 'var(--ff-gray)',
        borderBottom: '1px solid var(--ff-gray-dark)',
      }}
    >
      <Link href="/" className="text-xl text-[var(--ff-black)]">
        <FFLogo />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[var(--ff-black)] hover:text-[var(--ff-blue)] transition-colors"
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <FFButton href="/auctions">
        Shop Now
        <ArrowUpRight size={14} className="inline ml-2" />
      </FFButton>
    </nav>
  );
}

export default function FoeFinderVariant() {
  const visitorCount = useVisitorNumber(6);

  const featuredPieces = [
    {
      id: '001',
      title: 'Terracotta Bowl',
      price: '$85',
      description: 'Hand-thrown with warm earthy tones',
      status: 'AVAILABLE',
    },
    {
      id: '002',
      title: 'Sage Vase',
      price: '$120',
      description: 'Deep green glaze, organic form',
      status: 'BIDDING',
    },
    {
      id: '003',
      title: 'Honey Mug Set',
      price: '$65',
      description: 'Set of 2, perfect for morning coffee',
      status: 'AVAILABLE',
    },
  ];

  const quickLinks = [
    { href: '/gallery', label: 'Browse Gallery', code: 'CMD+G' },
    { href: '/auctions', label: 'Active Auctions', code: 'CMD+A' },
    { href: '/commissions', label: 'Request Commission', code: 'CMD+R' },
  ];

  return (
    <div
      className="variant-foe-finder min-h-screen"
      style={{ background: 'var(--ff-gray)' }}
    >
      <FFNav />

      {/* Hero Section - Centered window layout */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <FFWindow title="TOR'S POTTERY // WELCOME">
            <div className="py-12 px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Status badge */}
                <span
                  className="inline-block px-3 py-1 mb-6"
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: 'var(--ff-blue)',
                    color: 'white',
                  }}
                >
                  Now Accepting Bids
                </span>

                <h1
                  className="ff-heading text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.05]"
                >
                  Handmade
                  <br />
                  <span style={{ color: 'var(--ff-blue)' }}>Pottery</span>
                </h1>

                <p
                  className="ff-text text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed"
                  style={{ color: 'var(--ff-black)' }}
                >
                  Functional ceramics crafted with intention. Each piece is made
                  by hand in small batches.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <FFButton href="/auctions" size="large">
                    Shop Current Pieces
                    <ArrowRight size={16} className="inline ml-2" />
                  </FFButton>
                  <button
                    className="px-8 py-4 text-xs font-semibold uppercase tracking-wider border-2 border-[var(--ff-black)] text-[var(--ff-black)] hover:bg-[var(--ff-black)] hover:text-white transition-colors"
                    style={{ fontFamily: 'var(--font-space-mono)' }}
                  >
                    View Gallery
                  </button>
                </div>
              </motion.div>
            </div>
          </FFWindow>
        </div>
      </section>

      {/* Featured Pieces - Grid of windows */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span
                className="px-2 py-1"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'var(--ff-blue)',
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Featured
              </span>
              <h2 className="ff-heading text-2xl md:text-3xl">Latest Pieces</h2>
            </div>
            <Link
              href="/gallery"
              className="text-[var(--ff-blue)] hover:underline"
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredPieces.map((piece, index) => (
              <FFWindow key={piece.id} title={`ITEM_${piece.id}`}>
                {/* Image placeholder */}
                <div
                  className="aspect-square flex items-center justify-center relative mb-4"
                  style={{ background: 'var(--ff-gray)' }}
                >
                  {/* Status tag */}
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5"
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: piece.status === 'BIDDING' ? 'var(--ff-blue)' : 'var(--ff-black)',
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {piece.status}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '11px',
                      color: 'var(--ff-black)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    [Photo]
                  </span>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    className="ff-heading text-lg"
                    style={{ fontWeight: 700 }}
                  >
                    {piece.title}
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontWeight: 700,
                      color: 'var(--ff-blue)',
                    }}
                  >
                    {piece.price}
                  </span>
                </div>

                <p
                  className="ff-text text-sm mb-4"
                  style={{ color: '#4A4A4A' }}
                >
                  {piece.description}
                </p>

                <FFButton className="w-full justify-center">
                  View Details
                  <ArrowRight size={12} className="inline ml-2" />
                </FFButton>
              </FFWindow>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links - Keyboard shortcut style */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <FFWindow title="QUICK_NAVIGATION">
            <div className="divide-y divide-[var(--ff-gray-dark)]">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between py-4 px-2 hover:bg-[var(--ff-gray)] transition-colors"
                >
                  <span
                    className="ff-heading text-base"
                    style={{ fontWeight: 600 }}
                  >
                    {link.label}
                  </span>
                  <span
                    className="px-2 py-1"
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: 'var(--ff-gray)',
                      border: '1px solid var(--ff-gray-dark)',
                    }}
                  >
                    {link.code}
                  </span>
                </Link>
              ))}
            </div>
          </FFWindow>
        </div>
      </section>

      {/* Commission CTA */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <FFWindow title="CUSTOM_COMMISSIONS">
            <div className="py-12 px-8 text-center">
              <span
                className="inline-block px-3 py-1 mb-6"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  background: 'var(--ff-black)',
                  color: 'white',
                }}
              >
                Custom Work
              </span>

              <h2 className="ff-heading text-3xl md:text-4xl mb-4">
                Have an idea?
              </h2>

              <p
                className="ff-text text-base mb-8 max-w-md mx-auto"
                style={{ color: '#4A4A4A' }}
              >
                I take on custom commissions for special pieces. Share your
                vision and let&apos;s create something unique together.
              </p>

              <FFButton href="/commissions" size="large">
                Submit Commission Request
                <Mail size={14} className="inline ml-2" />
              </FFButton>
            </div>
          </FFWindow>
        </div>
      </section>

      {/* Footer with status bar styling */}
      <footer className="py-8 px-6 md:px-12 mt-8">
        <div className="max-w-6xl mx-auto">
          {/* Main footer in a window */}
          <div
            className="ff-window"
            style={{ marginBottom: 0 }}
          >
            <div className="ff-title-bar">
              <span>SYSTEM_INFO</span>
              <div className="ff-title-buttons">
                <button className="ff-title-btn">
                  <Minus size={8} />
                </button>
                <button className="ff-title-btn">
                  <Square size={8} />
                </button>
                <button className="ff-title-btn">
                  <X size={8} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <FFLogo className="text-lg" />

                <div className="flex flex-wrap justify-center gap-6">
                  {['Gallery', 'Auctions', 'Commissions', 'About'].map((link) => (
                    <Link
                      key={link}
                      href={`/${link.toLowerCase()}`}
                      className="text-[var(--ff-black)] hover:text-[var(--ff-blue)] transition-colors"
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {link}
                    </Link>
                  ))}
                </div>

                {/* Visitor counter */}
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1"
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: 'var(--ff-black)',
                      color: 'var(--ff-gray)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    VISITOR #{visitorCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="ff-status-bar flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock size={12} />
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
              <span>© {new Date().getFullYear()} Tor&apos;s Pottery</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Spacing for preview nav */}
      <div className="h-20" />

      <PreviewNav />
    </div>
  );
}
