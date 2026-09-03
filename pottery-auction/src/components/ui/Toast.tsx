'use client';

import { useEffect, useRef } from 'react';
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

  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; });

  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(() => onDismissRef.current(), duration);
    return () => clearTimeout(t);
  }, [isVisible, duration]);

  const receiptColors: Record<ToastIntent, string> = {
    success: 'var(--success)',
    error:   'var(--error)',
    info:    'var(--ink)',
  };

  if (theme === 'y2k') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 right-6 z-[100]"
          >
            <div className="win98-window" style={{ minWidth: 200 }}>
              <div className="win98-title-bar">
                <img
                  src={intent === 'error' ? '/y2k/error-icon.svg' : '/y2k/info-icon.svg'}
                  width="14"
                  height="14"
                  alt=""
                  aria-hidden="true"
                />
                <span className="win98-title-bar-text" style={{ fontSize: 10 }}>
                  {intent === 'error' ? 'Error' : intent === 'success' ? 'Information' : 'Message'}
                </span>
                <div className="win98-title-bar-controls">
                  <button onClick={onDismiss} aria-label="Close">✕</button>
                </div>
              </div>
              <div className="win98-window-body" style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}>
                {message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

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
