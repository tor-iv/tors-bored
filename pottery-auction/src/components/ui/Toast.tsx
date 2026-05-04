'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

type ToastIntent = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  intent?: ToastIntent;
  isVisible: boolean;
  onDismiss: () => void;
  /** Auto-dismiss after ms (default 3000) */
  duration?: number;
}

export default function Toast({
  message,
  intent = 'info',
  isVisible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [isVisible, duration, onDismiss]);

  const receiptColors: Record<ToastIntent, string> = {
    success: 'var(--success)',
    error:   'var(--error)',
    info:    'var(--ink)',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100]"
        >
          {theme === 'receipt' ? (
            <div
              className="font-mono text-[0.875rem] px-4 py-2 border border-[var(--border)] bg-[var(--bg)]"
              style={{
                fontFamily: 'var(--font-display, "IBM Plex Mono", monospace)',
                color: receiptColors[intent],
                boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
              }}
            >
              — {message.toUpperCase()} —
            </div>
          ) : (
            <div
              className="px-4 py-3 rounded shadow-lg max-w-sm text-sm"
              style={{
                backgroundColor: intent === 'error' ? 'var(--error)' : intent === 'success' ? 'var(--success)' : 'var(--ink)',
                color: 'var(--bg)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {message}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
