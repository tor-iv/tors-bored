'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import VisitorCounter from '@/components/theme/y2k/VisitorCounter';

const footerLinks = [
  { href: '/',            label: 'Home'              },
  { href: '/browse',      label: 'Browse'            },
  { href: '/shop',        label: 'Shop'              },
  { href: '/commissions', label: 'Commission a Piece'},
];

export default function Footer() {
  const { theme } = useTheme();
  const year = new Date().getFullYear();

  if (theme === 'receipt') {
    // Footer content lives on the paper (ReceiptFooterChrome); only the theme
    // toggle sits outside so y2k stays reachable from every page.
    return (
      <footer>
        <ThemeToggle />
      </footer>
    );
  }

  // Y2K branch
  if (theme === 'y2k') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <footer style={{ background: 'var(--bg)', borderTop: '2px solid var(--border)', padding: '16px', fontFamily: 'Tahoma, sans-serif', fontSize: 11, color: 'var(--ink)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: '"Comic Sans MS", cursive', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>Tor&apos;s Bored Pottery</div>
              <div>Brooklyn, NY · Handmade Ceramics</div>
              <div style={{ marginTop: 4, color: 'var(--ink-muted)' }}>Page last updated: {today}</div>
              <div style={{ marginTop: 2, color: 'var(--ink-muted)', fontSize: 10 }}>Best viewed in Internet Explorer 5.5 at 1024×768</div>
            </div>
            <VisitorCounter />
          </div>
          <nav style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{ color: 'var(--link)', fontSize: 11 }}>{link.label}</Link>
            ))}
          </nav>
        </div>
        <ThemeToggle />
      </footer>
    );
  }

  // Generic stub — functional with CSS tokens
  return (
    <footer
      className="py-12 mt-auto"
      style={{ backgroundColor: 'var(--bg-well)', borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div
              className="text-xl font-bold mb-3"
              style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}
            >
              Tor&apos;s Bored Pottery
            </div>
            <p className="text-sm max-w-sm" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
              Handcrafted ceramics released monthly. Every piece is thrown on the wheel, glazed by hand, and fired with care.
            </p>
          </div>

          <nav className="space-y-2">
            <div className="text-sm font-semibold mb-2 uppercase" style={{ color: 'var(--ink)' }}>
              Explore
            </div>
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="mt-8 pt-8 border-t text-sm flex flex-col sm:flex-row justify-between gap-4"
          style={{ borderColor: 'var(--border)', color: 'var(--ink-muted)' }}
        >
          <span>© {year} Tor&apos;s Bored Pottery. All rights reserved.</span>
          <span>Handmade with care in Brooklyn.</span>
        </div>
      </div>
      <ThemeToggle />
    </footer>
  );
}
