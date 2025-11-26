'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Wand2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ButtonSimple from '../ui/ButtonSimple';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'magic-link';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'magic-link') {
      return handleMagicLink(e);
    }

    setIsLoading(true);
    setError('');

    const supabase = createClient();

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      }
      onClose();
      // Clear form
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setMagicLinkSent(false);
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={() => {
                  onClose();
                  resetModal();
                }}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              {/* Magic Link Sent Success State */}
              {magicLinkSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-theme-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-theme-success" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-pottery-charcoal mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
                  </p>
                  <button
                    onClick={() => {
                      setMagicLinkSent(false);
                      setEmail('');
                    }}
                    className="text-pottery-terracotta hover:underline"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-pottery-charcoal mb-6">
                    {authMode === 'login' && 'Welcome Back'}
                    {authMode === 'signup' && 'Create Account'}
                    {authMode === 'magic-link' && 'Sign In with Magic Link'}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-sm font-medium text-pottery-charcoal mb-2">
                          Display Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pottery-terracotta"
                            placeholder="Your name"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-pottery-charcoal mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pottery-terracotta"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    {authMode !== 'magic-link' && (
                      <div>
                        <label className="block text-sm font-medium text-pottery-charcoal mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pottery-terracotta"
                            placeholder="••••••••"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-theme-error text-sm">{error}</p>
                    )}

                    <ButtonSimple
                      type="submit"
                      isLoading={isLoading}
                    >
                      {authMode === 'login' && 'Sign In'}
                      {authMode === 'signup' && 'Create Account'}
                      {authMode === 'magic-link' && 'Send Magic Link'}
                    </ButtonSimple>
                  </form>

                  {/* Divider for Magic Link */}
                  {authMode !== 'magic-link' && (
                    <div className="mt-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('magic-link');
                          setError('');
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Wand2 size={16} />
                        Sign in with Magic Link
                      </button>
                    </div>
                  )}

                  <div className="mt-6 text-center space-y-2">
                    {authMode === 'magic-link' ? (
                      <button
                        onClick={() => {
                          setAuthMode('login');
                          setError('');
                        }}
                        className="text-pottery-terracotta hover:underline"
                      >
                        Back to password sign in
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setAuthMode(authMode === 'login' ? 'signup' : 'login');
                          setError('');
                        }}
                        className="text-pottery-terracotta hover:underline"
                      >
                        {authMode === 'login'
                          ? "Don't have an account? Sign up"
                          : 'Already have an account? Sign in'
                        }
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}