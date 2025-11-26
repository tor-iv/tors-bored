'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--theme-primary)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 bg-[var(--theme-primary-dark)] rounded-full"
              />
              <span className="text-xl font-bold">Tor&apos;s Bored Pottery</span>
            </div>
            <p className="text-white/80">
              Handcrafted ceramics released monthly. Custom commissions welcome.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/auctions', label: 'Current Items' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/commissions', label: 'Custom Requests' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-white/20 mt-12 pt-8 text-center"
        >
          <p className="text-white/60 text-sm">
            © {currentYear} Tor&apos;s Bored Pottery. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}