'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import AuthModal from '../auth/AuthModal';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import Marquee from '@/components/theme/y2k/Marquee';

const navItems = [
  { href: '/',           label: 'Home',        receiptLabel: 'HOME'         },
  { href: '/browse',     label: 'Browse',      receiptLabel: 'BROWSE'       },
  { href: '/shop',       label: 'Shop',        receiptLabel: 'SHOP'         },
  { href: '/commissions',label: 'Commissions', receiptLabel: 'COMMISSIONS'  },
];

export default function Header() {
  const { userProfile, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut().catch(console.error);
  };

  if (theme === 'receipt') {
    return (
      <>
        <header
          className="sticky top-0 z-40"
          style={{
            backgroundColor: 'var(--bg)',
            fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)',
          }}
        >
          <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
            {/* Store name */}
            <div
              className="py-2 text-center text-[1.125rem] font-bold uppercase tracking-wide"
              style={{ color: 'var(--ink)' }}
            >
              TOR&apos;S POTTERY STUDIO
            </div>
            <ReceiptDivider variant="major" />

            {/* Nav + auth */}
            <div className="py-1 flex justify-between items-center flex-wrap gap-2">
              <nav className="flex gap-4 text-[0.6875rem]">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:underline uppercase"
                    style={{ color: 'var(--ink)' }}
                  >
                    [{item.receiptLabel}]
                  </Link>
                ))}
              </nav>
              <div className="text-[0.6875rem] flex gap-3">
                {isAuthenticated ? (
                  <>
                    {userProfile?.isAdmin && (
                      <Link href="/admin" className="hover:underline uppercase" style={{ color: 'var(--ink-muted)' }}>
                        [ADMIN]
                      </Link>
                    )}
                    <Link href="/account" className="hover:underline uppercase" style={{ color: 'var(--ink-muted)' }}>
                      [ACCOUNT]
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="hover:underline uppercase"
                      style={{ color: 'var(--ink-muted)' }}
                    >
                      [SIGN OUT]
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="hover:underline uppercase"
                    style={{ color: 'var(--ink)' }}
                  >
                    [SIGN IN]
                  </button>
                )}
              </div>
            </div>
            <ReceiptDivider variant="minor" />
          </div>
        </header>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  // Y2K branch
  if (theme === 'y2k') {
    return (
      <>
        <header className="win98-window sticky top-0 z-40">
          {/* Menu bar */}
          <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '2px 8px', fontFamily: 'Tahoma, sans-serif', fontSize: 11, display: 'flex', gap: 12 }}>
            <span>File</span><span>Edit</span><span>View</span><span>Help</span>
          </div>
          {/* Brand */}
          <div style={{ background: 'var(--bg)', padding: '4px 8px', fontFamily: '"Comic Sans MS", cursive', fontSize: 16, fontWeight: 'bold', color: 'var(--ink)' }}>
            Tor&apos;s Bored Pottery
          </div>
          {/* Nav */}
          <div className="win98-title-bar" style={{ padding: '4px 8px', gap: 16 }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ color: '#ffffff', fontFamily: 'Tahoma, sans-serif', fontSize: 11, textDecoration: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
              >
                {item.label}
              </Link>
            ))}
            <div style={{ flex: 1 }} />
            {isAuthenticated ? (
              <>
                {userProfile?.isAdmin && (
                  <Link href="/admin" style={{ color: '#ffffff', fontFamily: 'Tahoma, sans-serif', fontSize: 11, textDecoration: 'none' }}>Admin</Link>
                )}
                <Link href="/account" style={{ color: '#ffffff', fontFamily: 'Tahoma, sans-serif', fontSize: 11, textDecoration: 'none' }}>Account</Link>
                <button onClick={handleSignOut} style={{ color: '#ffffff', fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer' }}>Sign Out</button>
              </>
            ) : (
              <button onClick={() => setShowAuthModal(true)} style={{ color: '#ffffff', fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer' }}>Sign In</button>
            )}
          </div>
          <Marquee />
        </header>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  // Generic stub — functional, uses CSS tokens
  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-2xl font-bold"
              style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}
            >
              Tor&apos;s Bored Pottery
            </Link>

            <div className="flex items-center gap-6">
              {/* Desktop nav */}
              <nav className="hidden md:flex gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--ink)', fontFamily: 'var(--font-body)' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  {userProfile?.isAdmin && (
                    <Link href="/admin" className="text-sm hover:opacity-70" style={{ color: 'var(--ink)' }}>
                      Admin
                    </Link>
                  )}
                  <Link href="/account" className="text-sm hover:opacity-70" style={{ color: 'var(--ink)' }}>
                    Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm hover:opacity-70"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm hover:opacity-70"
                  style={{ color: 'var(--ink)' }}
                >
                  Sign in
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden"
                style={{ color: 'var(--ink)' }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden px-4 py-4 space-y-3 border-t"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm hover:opacity-70"
                style={{ color: 'var(--ink)', fontFamily: 'var(--font-body)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
