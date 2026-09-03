'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/contexts/ThemeContext';
import AuthModal from '../auth/AuthModal';
import Marquee from '@/components/theme/y2k/Marquee';

const navItems = [
  { href: '/',           label: 'Home',        receiptLabel: 'HOME'         },
  { href: '/browse',     label: 'Browse',      receiptLabel: 'BROWSE'       },
  { href: '/shop',       label: 'Shop',        receiptLabel: 'SHOP'         },
  { href: '/commissions',label: 'Commissions', receiptLabel: 'COMMISSIONS'  },
];

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthStore();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logoutAction().catch(console.error);
    logout();
  };

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
                {user?.isAdmin && (
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
                  {user?.isAdmin && (
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
