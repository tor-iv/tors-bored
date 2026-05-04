'use client';

import { type ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

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
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {theme === 'receipt' ? (
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
