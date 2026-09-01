'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';
import AuthModal from '@/components/auth/AuthModal';

const NAV_ITEMS = [
  { href: '/', label: 'HOME' },
  { href: '/auctions', label: 'AUCTIONS' },
  { href: '/browse', label: 'BROWSE' },
  { href: '/shop', label: 'SHOP' },
  { href: '/commissions', label: 'COMMISSIONS' },
];

/** Printed nav row — the first line on the receipt paper. */
export default function ReceiptNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    await logoutAction().catch(console.error);
    logout();
  };

  return (
    <>
      <nav className="receipt-nav">
        <div className="receipt-nav-links">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`receipt-nav-link${active ? ' receipt-nav-link--active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {isAuthenticated ? (
          <div className="receipt-nav-links" style={{ fontSize: 10 }}>
            {user?.isAdmin && (
              <Link href="/admin" className="receipt-nav-link receipt-nav-link--muted">
                ADMIN
              </Link>
            )}
            <Link href="/account" className="receipt-nav-link receipt-nav-link--muted">
              ACCOUNT
            </Link>
            <button onClick={handleSignOut} className="receipt-nav-link receipt-nav-link--muted">
              SIGN OUT
            </button>
          </div>
        ) : (
          <button className="receipt-nav-signin" onClick={() => setShowAuthModal(true)}>
            SIGN IN
          </button>
        )}
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
