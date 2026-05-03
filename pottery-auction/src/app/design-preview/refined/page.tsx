'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Calendar, Package, Heart, Sparkles } from 'lucide-react';
import PreviewNav from '../components/PreviewNav';

// Elegant script logo with Cormorant Garamond
function WarmLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-cormorant)',
        fontWeight: 500,
        fontStyle: 'italic',
        letterSpacing: '-0.01em',
      }}
    >
      Tor&apos;s Pottery
    </span>
  );
}

// Warm, inviting button with hover lift
function WarmButton({
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
    primary: 'refined-v2-button',
    secondary: `
      bg-white border-2 border-[var(--soft-border)] rounded-xl
      hover:border-[var(--soft-sage)] hover:bg-[var(--sage-light)]
      text-[var(--warm-charcoal)]
    `,
    ghost: 'refined-v2-link text-[var(--soft-sage)] hover:text-[var(--sage-dark)]',
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

// Warm card with gentle hover animation
function WarmCard({
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
      className={`refined-v2-card p-8 ${className}`}
      whileHover={hover ? { y: -6, scale: 1.01 } : undefined}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Animated navigation link with underline
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="refined-v2-link py-2">
      <span
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.9rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        {children}
      </span>
    </Link>
  );
}

// Clean navigation with warmth
function WarmNav() {
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
      className="flex items-center justify-between px-8 md:px-16 py-6"
      style={{ background: 'var(--warm-cream)' }}
    >
      <Link href="/" className="text-3xl text-[var(--warm-charcoal)]">
        <WarmLogo />
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {links.map((link) => (
          <NavLink key={link.href} href={link.href}>
            {link.label}
          </NavLink>
        ))}
      </div>

      <WarmButton variant="primary" href="/auctions" size="default">
        Shop Now
      </WarmButton>
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
            background: 'var(--sage-light)',
            color: 'var(--soft-sage)',
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
          color: 'var(--warm-charcoal)',
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
            color: 'var(--charcoal-light)',
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

export default function RefinedV2Variant() {
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
    <div className="variant-refined-v2 min-h-screen" style={{ background: 'var(--warm-cream)' }}>
      <WarmNav />

      {/* Hero Section - Asymmetric layout with generous spacing */}
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
                className="inline-block px-4 py-2 mb-8 text-sm font-medium rounded-full"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: 'var(--honey-light)',
                  color: 'var(--honey)',
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
                  color: 'var(--warm-charcoal)',
                  letterSpacing: '-0.02em',
                }}
              >
                Pottery made
                <br />
                with <span style={{ color: 'var(--soft-sage)' }}>intention</span>
              </h1>

              <p
                className="text-lg md:text-xl mb-10 leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--charcoal-light)',
                  letterSpacing: '0.01em',
                  maxWidth: '440px',
                }}
              >
                Each piece is thoughtfully crafted by hand, designed to bring warmth and beauty to
                your everyday moments.
              </p>

              <div className="flex flex-wrap gap-4">
                <WarmButton href="/auctions" size="large">
                  Shop Current Pieces
                  <ArrowRight size={18} />
                </WarmButton>
                <WarmButton variant="secondary" href="/gallery" size="large">
                  View Gallery
                </WarmButton>
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
                    background: 'linear-gradient(145deg, #F5EDE4 0%, var(--soft-border) 100%)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontStyle: 'italic',
                      color: 'var(--charcoal-light)',
                      fontSize: '1.5rem',
                    }}
                  >
                    [Featured Image]
                  </span>
                </div>
                {/* Decorative elements */}
                <div
                  className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full -z-10"
                  style={{ background: 'var(--sage-light)' }}
                />
                <div
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-full -z-10"
                  style={{ background: 'var(--honey-light)' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats section with warm styling */}
      <section
        className="py-16 border-y"
        style={{
          borderColor: 'var(--soft-border)',
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
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{ background: 'var(--sage-light)' }}
                >
                  <stat.icon size={22} style={{ color: 'var(--soft-sage)' }} />
                </div>
                <p
                  className="text-4xl md:text-5xl mb-2"
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontWeight: 500,
                    color: 'var(--warm-charcoal)',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--charcoal-light)',
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

      {/* Featured Pieces - Generous spacing */}
      <section className="py-24 md:py-32 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <SectionHeading
              eyebrow="Fresh from the Kiln"
              title="Latest Pieces"
              description="Ready to find their forever home"
            />
            <WarmButton variant="ghost" href="/gallery">
              View All <ArrowRight size={16} />
            </WarmButton>
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
                <WarmCard className="h-full">
                  {/* Image placeholder */}
                  <div
                    className="aspect-square rounded-2xl mb-6 flex items-center justify-center"
                    style={{ background: 'var(--warm-cream)' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontStyle: 'italic',
                        color: 'var(--charcoal-light)',
                      }}
                    >
                      [Photo]
                    </span>
                  </div>

                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--honey)',
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
                      color: 'var(--warm-charcoal)',
                    }}
                  >
                    {piece.title}
                  </h3>

                  <p
                    className="text-sm mb-6 leading-relaxed"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--charcoal-light)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {piece.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--soft-border)]">
                    <span
                      className="text-xl font-medium"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--warm-charcoal)',
                      }}
                    >
                      {piece.price}
                    </span>
                    <WarmButton variant="ghost">
                      View <ArrowRight size={14} />
                    </WarmButton>
                  </div>
                </WarmCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process section with warm background */}
      <section
        className="py-24 md:py-32 px-8 md:px-16"
        style={{ background: 'linear-gradient(180deg, white 0%, var(--warm-cream) 100%)' }}
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
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
                  style={{ background: 'white', boxShadow: '0 4px 20px var(--soft-shadow)' }}
                >
                  <step.icon size={32} style={{ color: 'var(--soft-sage)' }} />
                </div>
                <h3
                  className="text-2xl mb-4"
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontWeight: 500,
                    color: 'var(--warm-charcoal)',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-base leading-relaxed max-w-xs mx-auto"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--charcoal-light)',
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

      {/* Commission CTA with honey accent */}
      <section className="py-24 px-8 md:px-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <WarmCard
              className="text-center py-20 px-8 md:px-16 relative overflow-hidden"
              hover={false}
            >
              {/* Decorative background elements */}
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2"
                style={{ background: 'var(--honey-light)', opacity: 0.5 }}
              />
              <div
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/2 -translate-x-1/2"
                style={{ background: 'var(--sage-light)', opacity: 0.5 }}
              />

              <div className="relative z-10">
                <span
                  className="inline-block px-4 py-2 mb-6 text-sm font-medium rounded-full"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    background: 'var(--honey-light)',
                    color: 'var(--honey)',
                  }}
                >
                  Custom Creations
                </span>
                <h2
                  className="text-4xl md:text-5xl mb-6"
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontWeight: 500,
                    color: 'var(--warm-charcoal)',
                  }}
                >
                  Have Something in Mind?
                </h2>
                <p
                  className="text-lg mb-10 max-w-xl mx-auto"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--charcoal-light)',
                    letterSpacing: '0.01em',
                    lineHeight: 1.7,
                  }}
                >
                  I love bringing ideas to life. Share your vision for a custom piece and let&apos;s
                  create something special together.
                </p>
                <WarmButton href="/commissions" size="large">
                  Submit a Commission Request
                  <ArrowRight size={18} />
                </WarmButton>
              </div>
            </WarmCard>
          </motion.div>
        </div>
      </section>

      {/* Footer with warm styling */}
      <footer
        className="py-16 px-8 md:px-16 border-t"
        style={{
          borderColor: 'var(--soft-border)',
          background: 'white',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <WarmLogo className="text-2xl text-[var(--warm-charcoal)]" />

            <div className="flex flex-wrap justify-center gap-8">
              {['Gallery', 'Auctions', 'Custom Work', 'About'].map((link) => (
                <NavLink key={link} href={`/${link.toLowerCase().replace(' ', '-')}`}>
                  {link}
                </NavLink>
              ))}
            </div>

            <p
              className="text-sm"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--charcoal-light)',
                letterSpacing: '0.02em',
              }}
            >
              Crafted with care ·{' '}
              <span style={{ color: 'var(--soft-sage)' }}>{new Date().getFullYear()}</span>
            </p>
          </div>
        </div>
      </footer>

      <PreviewNav />
    </div>
  );
}
