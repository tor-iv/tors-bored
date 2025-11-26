'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '../auth/AuthModal';
import ColorToggle from '../ui/ColorToggle';

export default function Header() {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/auctions', label: 'Current Pieces' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/commissions', label: 'Submit Ideas' },
  ];

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-medium-light/95 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className={`text-3xl font-serif font-bold text-[var(--theme-text)]`}>
                Tor&apos;s Bored Pottery
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center space-x-6">
              <ColorToggle />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className={`hidden sm:block text-sm font-serif text-[var(--theme-text)]`}>
                    {userProfile?.displayName || user?.email}
                  </span>
                  {userProfile?.isAdmin && (
                    <Link href="/admin" className={`text-sm font-serif hover:opacity-70 transition-opacity text-[var(--theme-text)]`}>
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className={`text-sm font-serif hover:opacity-70 transition-opacity text-[var(--theme-text)]`}
                    title="Sign out"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`text-sm font-serif hover:opacity-70 transition-opacity text-[var(--theme-text)]`}
                >
                  Login
                </button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden text-[var(--theme-text)]`}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <nav className="bg-medium-light/90 backdrop-blur-sm shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] relative after:absolute after:left-0 after:right-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-medium-light/50 after:to-transparent after:pointer-events-none after:content-['']">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex space-x-12 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-serif hover:opacity-70 transition-opacity border-b-2 border-transparent hover:border-current pb-1 text-[var(--theme-text)]`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-medium-light border-t border-medium-cream"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-sm font-serif hover:opacity-70 transition-opacity text-[var(--theme-text)]`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}