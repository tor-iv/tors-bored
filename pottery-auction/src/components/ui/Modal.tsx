'use client';

import { type ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';
import RoughBorder from '@/components/theme/handdrawn/RoughBorder';
import Win98Modal from '@/components/theme/y2k/Win98Modal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (theme === 'y2k') {
    return (
      <Win98Modal isOpen={isOpen} onClose={onClose} title={title ?? 'Dialog'} className={className}>
        {children}
      </Win98Modal>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={theme === 'handdrawn' ? { opacity: 0, y: -40, rotate: -2 } : { opacity: 0, y: 8 }}
            animate={theme === 'handdrawn' ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 1, y: 0 }}
            exit={theme === 'handdrawn' ? { opacity: 0, y: 40, rotate: 2 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {theme === 'handdrawn' ? (
              <RoughBorder
                roughness={1.8}
                strokeWidth={2}
                className={`max-w-md w-full ${className}`}
                style={{ boxShadow: '4px 6px 0 rgba(0,0,0,0.08)', backgroundColor: 'var(--bg)' }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    {title && (
                      <h2
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: 'var(--ink)',
                        }}
                      >
                        {title}
                      </h2>
                    )}
                    <button
                      onClick={onClose}
                      aria-label="Close"
                      style={{ color: 'var(--ink-muted)', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  {children}
                </div>
              </RoughBorder>
            ) : theme === 'receipt' ? (
              <div
                className={`receipt-modal relative ${className}`}
                style={{ fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)' }}
              >
                {/* Dashed tear-off border at top */}
                <div
                  className="h-px mb-4"
                  style={{
                    background: 'repeating-linear-gradient(to right, var(--border) 0, var(--border) 6px, transparent 6px, transparent 12px)',
                  }}
                />
                <div className="flex justify-between items-start mb-2">
                  {title && (
                    <div className="text-[0.875rem] font-bold uppercase tracking-wide" style={{ color: 'var(--ink)' }}>
                      {title}
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="ml-auto text-[0.6875rem] uppercase hover:underline"
                    style={{ color: 'var(--ink-muted)' }}
                    aria-label="Close"
                  >
                    [X]
                  </button>
                </div>
                {title && <ReceiptDivider variant="minor" className="mb-3" />}
                {children}
                <ReceiptDivider variant="tear" className="mt-4" />
              </div>
            ) : (
              <div
                className={`relative bg-[var(--bg)] border border-[var(--border)] max-w-md w-full p-6 shadow-xl ${className}`}
              >
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4"
                  style={{ color: 'var(--ink-muted)' }}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                {title && (
                  <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}
                  >
                    {title}
                  </h2>
                )}
                {children}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
