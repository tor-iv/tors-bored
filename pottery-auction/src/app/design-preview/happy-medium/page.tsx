'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Calendar, Package, Heart, Sparkles, Mail, Menu } from 'lucide-react';
import PreviewNav from '../components/PreviewNav';

// Brush script logo using Satisfy font
function HMBrushLogo({ className = '', color = 'white' }: { className?: string; color?: string }) {
  return (
    <span
      className={`hm-logo ${className}`}
      style={{
        color,
        fontSize: 'inherit',
      }}
    >
      Tor&apos;s Pottery
    </span>
  );
}

// Happy Medium pill button
function HMButton({
  children,
  variant = 'primary',
  href,
  className = '',
  size = 'default',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  href?: string;
  className?: string;
  size?: 'default' | 'large';
}) {
  const baseStyles = `
    inline-flex items-center gap-2 font-medium transition-all duration-300
    ${size === 'large' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'}
  `;

  const variants = {
    primary: 'hm-button',
    secondary: 'hm-button-secondary',
    ghost: `
      text-[var(--hm-green)] hover:text-[var(--hm-green-dark)]
      font-medium
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

// Happy Medium card with large border radius
function HMCard({
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
      className={`hm-card p-8 ${className}`}
      whileHover={hover ? { y: -8, scale: 1.01 } : undefined}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Color toggle pills (like Happy Medium has in top-left)
function ColorTogglePills() {
  return (
    <div className="hm-color-toggle">
      <button
        className="hm-color-pill"
        style={{ background: '#E74C3C' }}
        aria-label="Red theme"
      />
      <button
        className="hm-color-pill active"
        style={{ background: '#0A8754' }}
        aria-label="Green theme"
      />
      <button
        className="hm-color-pill"
        style={{ background: '#2E86AB' }}
        aria-label="Blue theme"
      />
    </div>
  );
}

// Dark green navigation header
function HMNav() {
  const links = [
    { href: '/gallery', label: 'Gallery' },
    { href: '/auctions', label: 'Auctions' },
    { href: '/commissions', label: 'Custom Work' },
    { href: '/about', label: 'About' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hm-nav flex items-center justify-between px-8 md:px-16 py-5"
    >
      {/* Color toggle in top-left corner */}
      <div className="absolute top-4 left-4 z-50">
        <ColorTogglePills />
      </div>

      <Link href="/" className="text-3xl">
        <HMBrushLogo />
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-white/80 hover:text-white transition-colors"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.9rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Newsletter signup hint */}
        <button
          className="hidden md:flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}
        >
          <Mail size={16} />
          Subscribe
        </button>

        <HMButton variant="secondary" href="/auctions" size="default">
          Shop Now
        </HMButton>

        <button className="md:hidden text-white">
          <Menu size={24} />
        </button>
      </div>
    </motion.nav>
  );
}

// Section heading component
function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 mb-4 text-sm font-medium rounded-full"
          style={{
            fontFamily: 'var(--font-inter)',
            background: 'var(--hm-honey-light)',
            color: 'var(--hm-honey)',
            letterSpacing: '0.02em',
          }}
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl mb-4"
        style={{
          fontFamily: 'var(--font-playfair)',
          fontWeight: 500,
          color: 'var(--hm-charcoal)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg max-w-xl"
          style={{
            fontFamily: 'var(--font-inter)',
            color: 'var(--hm-charcoal-light)',
            letterSpacing: '0.01em',
            lineHeight: 1.7,
            ...(centered && { margin: '0 auto' }),
          }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

export default function HappyMediumVariant() {
  const featuredPieces = [
    {
      title: 'Morning Light Bowl',
      price: '$85',
      category: 'Bowls',
      description: 'Soft cream glaze with golden undertones, perfect for your morning ritual',
    },
    {
      title: 'Moss Garden Vase',
      price: '$145',
      category: 'Vases',
      description: 'Deep forest green with organic textures inspired by Pacific Northwest moss',
    },
    {
      title: 'Everyday Mug',
      price: '$42',
      category: 'Mugs',
      description: 'Comfortable handle, generous capacity, built for daily use',
    },
  ];

  const stats = [
    { value: '200+', label: 'Pieces Created', icon: Sparkles },
    { value: '150+', label: 'Happy Collectors', icon: Heart },
    { value: '4', label: 'Years of Craft', icon: Calendar },
  ];

  const process = [
    {
      icon: Calendar,
      title: 'Monthly Drops',
      description:
        'New pieces are released on the 15th of each month. Follow along to see what\'s coming from the studio.',
    },
    {
      icon: Heart,
      title: 'Place Your Bid',
      description:
        'Bid on pieces that speak to you. Secure payment through Stripe ensures a smooth experience.',
    },
    {
      icon: Package,
      title: 'Careful Delivery',
      description:
        'Each piece is wrapped with care and shipped directly to your door, ready to become part of your home.',
    },
  ];

  return (
    <div className="variant-happy-medium min-h-screen" style={{ background: 'var(--hm-cream)' }}>
      <HMNav />

      {/* Hero Section - Asymmetric 5/7 layout like Happy Medium */}
      <section className="py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Text content - takes 5 columns */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              <span
                className="inline-block px-5 py-2.5 mb-8 text-sm font-medium rounded-full"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: 'var(--hm-green-light)',
                  color: 'var(--hm-green)',
                  letterSpacing: '0.03em',
                }}
              >
                Handmade in Small Batches
              </span>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.1]"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontWeight: 500,
                  color: 'var(--hm-charcoal)',
                  letterSpacing: '-0.02em',
                }}
              >
                Pottery made
                <br />
                with <span style={{ color: 'var(--hm-green)' }}>intention</span>
              </h1>

              <p
                className="text-lg md:text-xl mb-10 leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--hm-charcoal-light)',
                  letterSpacing: '0.01em',
                  maxWidth: '440px',
                }}
              >
                Each piece is thoughtfully crafted by hand, designed to bring warmth and beauty to
                your everyday moments.
              </p>

              <div className="flex flex-wrap gap-4">
                <HMButton href="/auctions" size="large">
                  Shop Current Pieces
                  <ArrowRight size={18} />
                </HMButton>
                <HMButton variant="secondary" href="/gallery" size="large">
                  View Gallery
                </HMButton>
              </div>
            </motion.div>

            {/* Image - takes 7 columns with offset */}
            <motion.div
              className="lg:col-span-7 lg:pl-8"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="relative">
                <div
                  className="aspect-[4/5] rounded-3xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #F5EDE4 0%, var(--hm-border) 100%)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-satisfy)',
                      color: 'var(--hm-charcoal-light)',
                      fontSize: '1.5rem',
                    }}
                  >
                    [Featured Image]
                  </span>
                </div>
                {/* Decorative circles like Happy Medium */}
                <div
                  className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full -z-10"
                  style={{ background: 'var(--hm-green-light)' }}
                />
                <div
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-full -z-10"
                  style={{ background: 'var(--hm-honey-light)' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section
        className="py-16 border-y"
        style={{
          borderColor: 'var(--hm-border)',
          background: 'white',
        }}
      >
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-3 gap-8 md:gap-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                  style={{ background: 'var(--hm-green-light)' }}
                >
                  <stat.icon size={24} style={{ color: 'var(--hm-green)' }} />
                </div>
                <p
                  className="text-4xl md:text-5xl mb-2"
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontWeight: 500,
                    color: 'var(--hm-charcoal)',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--hm-charcoal-light)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pieces */}
      <section className="py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <SectionHeading
              eyebrow="Fresh from the Kiln"
              title="Latest Pieces"
              description="Ready to find their forever home"
            />
            <HMButton variant="ghost" href="/gallery">
              View All <ArrowRight size={16} />
            </HMButton>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredPieces.map((piece, index) => (
              <motion.div
                key={piece.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <HMCard className="h-full">
                  {/* Image placeholder */}
                  <div
                    className="aspect-square rounded-2xl mb-6 flex items-center justify-center"
                    style={{ background: 'var(--hm-cream)' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-satisfy)',
                        color: 'var(--hm-charcoal-light)',
                      }}
                    >
                      [Photo]
                    </span>
                  </div>

                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--hm-honey)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {piece.category}
                  </span>

                  <h3
                    className="text-2xl mt-2 mb-3"
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      fontWeight: 500,
                      color: 'var(--hm-charcoal)',
                    }}
                  >
                    {piece.title}
                  </h3>

                  <p
                    className="text-sm mb-6 leading-relaxed"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--hm-charcoal-light)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {piece.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--hm-border)]">
                    <span
                      className="text-xl font-medium"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--hm-charcoal)',
                      }}
                    >
                      {piece.price}
                    </span>
                    <HMButton variant="ghost">
                      View <ArrowRight size={14} />
                    </HMButton>
                  </div>
                </HMCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process section */}
      <section
        className="py-24 md:py-32 px-8 md:px-16"
        style={{ background: 'linear-gradient(180deg, white 0%, var(--hm-cream) 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <SectionHeading
              centered
              eyebrow="How It Works"
              title="The Process"
              description="From clay to your collection in a few simple steps"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {process.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                  style={{ background: 'white', boxShadow: '0 4px 20px var(--hm-shadow)' }}
                >
                  <step.icon size={32} style={{ color: 'var(--hm-green)' }} />
                </div>
                <h3
                  className="text-2xl mb-4"
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontWeight: 500,
                    color: 'var(--hm-charcoal)',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-base leading-relaxed max-w-xs mx-auto"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--hm-charcoal-light)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission CTA */}
      <section className="py-24 px-8 md:px-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <HMCard
              className="text-center py-20 px-8 md:px-16 relative overflow-hidden"
              hover={false}
            >
              {/* Decorative background circles */}
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2"
                style={{ background: 'var(--hm-honey-light)', opacity: 0.5 }}
              />
              <div
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/2 -translate-x-1/2"
                style={{ background: 'var(--hm-green-light)', opacity: 0.5 }}
              />

              <div className="relative z-10">
                <span
                  className="inline-block px-5 py-2.5 mb-6 text-sm font-medium rounded-full"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    background: 'var(--hm-honey-light)',
                    color: 'var(--hm-honey)',
                  }}
                >
                  Custom Creations
                </span>
                <h2
                  className="text-4xl md:text-5xl mb-6"
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontWeight: 500,
                    color: 'var(--hm-charcoal)',
                  }}
                >
                  Have Something in Mind?
                </h2>
                <p
                  className="text-lg mb-10 max-w-xl mx-auto"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--hm-charcoal-light)',
                    letterSpacing: '0.01em',
                    lineHeight: 1.7,
                  }}
                >
                  I love bringing ideas to life. Share your vision for a custom piece and let&apos;s
                  create something special together.
                </p>
                <HMButton href="/commissions" size="large">
                  Submit a Commission Request
                  <ArrowRight size={18} />
                </HMButton>
              </div>
            </HMCard>
          </motion.div>
        </div>
      </section>

      {/* Footer with warm tagline */}
      <footer
        className="py-16 px-8 md:px-16 border-t"
        style={{
          borderColor: 'var(--hm-border)',
          background: 'white',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Link href="/" className="text-2xl" style={{ color: 'var(--hm-charcoal)' }}>
              <HMBrushLogo color="var(--hm-charcoal)" />
            </Link>

            <div className="flex flex-wrap justify-center gap-8">
              {['Gallery', 'Auctions', 'Custom Work', 'About'].map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase().replace(' ', '-')}`}
                  className="text-[var(--hm-charcoal-light)] hover:text-[var(--hm-green)] transition-colors"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  {link}
                </Link>
              ))}
            </div>

            <p
              className="text-sm"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--hm-charcoal-light)',
                letterSpacing: '0.02em',
              }}
            >
              Crafted with care ·{' '}
              <span style={{ color: 'var(--hm-green)' }}>{new Date().getFullYear()}</span>
            </p>
          </div>

          {/* Warm tagline */}
          <div className="text-center mt-12 pt-8 border-t border-[var(--hm-border)]">
            <p
              style={{
                fontFamily: 'var(--font-satisfy)',
                fontSize: '1.25rem',
                color: 'var(--hm-charcoal-light)',
              }}
            >
              Made with love, one piece at a time
            </p>
          </div>
        </div>
      </footer>

      <PreviewNav />
    </div>
  );
}
