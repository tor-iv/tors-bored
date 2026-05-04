'use client';

import { type ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type BadgeIntent = 'current' | 'outbid' | 'won' | 'error' | 'info' | 'new';

interface BadgeProps {
  intent?: BadgeIntent;
  children: ReactNode;
  className?: string;
}

const RECEIPT_COLORS: Record<BadgeIntent, string> = {
  current: 'var(--success)',
  outbid:  'var(--ink-muted)',
  won:     'var(--success)',
  error:   'var(--error)',
  info:    'var(--ink-muted)',
  new:     'var(--success)',
};

export default function Badge({ intent = 'info', children, className = '' }: BadgeProps) {
  const { theme } = useTheme();

  if (theme === 'receipt') {
    const color = RECEIPT_COLORS[intent];
    const bold = intent === 'won' || intent === 'current';
    return (
      <span
        className={`font-mono text-[0.6875rem] uppercase tracking-wide ${bold ? 'font-bold' : ''} ${className}`}
        style={{ color, fontFamily: 'var(--font-display)' }}
      >
        [{children}]
      </span>
    );
  }

  if (theme === 'y2k') {
    const bgMap: Record<BadgeIntent, string> = {
      current: '#008000', outbid: '#808080', won: '#000080',
      error: '#ff0000', info: '#808080', new: '#00ff00',
    };
    return (
      <span
        className={`px-1 py-0.5 text-white text-[11px] font-bold uppercase border-2 border-t-white border-l-white border-b-black border-r-black ${className}`}
        style={{ backgroundColor: bgMap[intent], fontFamily: 'var(--font-ui, Tahoma, sans-serif)' }}
      >
        {children}
      </span>
    );
  }

  // Handdrawn
  const colorMap: Record<BadgeIntent, string> = {
    current: 'var(--success)', outbid: 'var(--ink-muted)', won: 'var(--success)',
    error: 'var(--error)', info: 'var(--ink-muted)', new: 'var(--accent)',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs rounded-sm font-semibold ${className}`}
      style={{ color: colorMap[intent], border: `1px solid ${colorMap[intent]}`, fontFamily: 'var(--font-display)' }}
    >
      {children}
    </span>
  );
}
