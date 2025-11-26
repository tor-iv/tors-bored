'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PotteryWheelDoodle } from '@/components/decorations';

// Rotating pottery quotes/facts
const potteryQuotes = [
  "Every wobble tells a story.",
  "Perfectly imperfect, every time.",
  "Made with clay and caffeine.",
  "Life's too short for boring pottery.",
  "Handmade means hand-loved.",
  "From mud to masterpiece.",
  "Embrace the wobble.",
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [quote, setQuote] = useState(potteryQuotes[0]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate through quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % potteryQuotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setQuote(potteryQuotes[quoteIndex]);
  }, [quoteIndex]);

  return (
    <footer className="relative overflow-hidden clay-dots">
      {/* Background with theme color */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'var(--theme-primary)' }}
      />

      {/* Floating decorative blob */}
      <motion.div
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-10"
        style={{ backgroundColor: 'var(--theme-primary-dark)' }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand section with pottery wheel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-4">
              <PotteryWheelDoodle
                className="w-10 h-10"
                color="var(--theme-text-on-primary)"
                animate={true}
              />
              <span
                className="text-2xl font-bold"
                style={{
                  color: 'var(--theme-text-on-primary)',
                  fontFamily: 'var(--font-caveat), cursive'
                }}
              >
                Tor&apos;s Bored Pottery
              </span>
            </div>
            <p
              className="mb-4 max-w-md"
              style={{ color: 'var(--theme-text-on-primary)', opacity: 0.9 }}
            >
              Handcrafted ceramics released monthly. Every piece is thrown on the wheel,
              glazed by hand, and fired with love (and occasionally mild anxiety about kiln temperatures).
            </p>

            {/* Rotating quote */}
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm italic"
              style={{
                color: 'var(--theme-text-on-primary)',
                opacity: 0.7,
                fontFamily: 'var(--font-caveat), cursive',
                fontSize: '1.1rem'
              }}
            >
              &ldquo;{quote}&rdquo;
            </motion.p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{
                color: 'var(--theme-text-on-primary)',
                fontFamily: 'var(--font-caveat), cursive',
                fontSize: '1.4rem'
              }}
            >
              Explore
            </h3>
            <nav className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/auctions', label: 'Auctions' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/commissions', label: 'Commission a Piece' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block transition-all duration-200 hover-wobbly"
                  style={{
                    color: 'var(--theme-text-on-primary)',
                    opacity: 0.85
                  }}
                >
                  <motion.span
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="inline-block"
                  >
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </nav>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <p
            className="text-sm"
            style={{ color: 'var(--theme-text-on-primary)', opacity: 0.6 }}
          >
            © {currentYear} Tor&apos;s Bored Pottery. All rights reserved.
          </p>

          <p
            className="text-sm flex items-center gap-2"
            style={{ color: 'var(--theme-text-on-primary)', opacity: 0.6 }}
          >
            Made with
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🏺
            </motion.span>
            +
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ☕
            </motion.span>
            in the studio
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
