'use client';

import { useTheme, type Theme } from '@/contexts/ThemeContext';

const NEXT_THEME_LABEL: Record<Theme, string> = {
  handdrawn: 'Y2K',
  y2k: 'RECEIPT',
  receipt: 'HAND-DRAWN',
};

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  if (theme === 'receipt') {
    return (
      <button
        onClick={cycleTheme}
        title={`Switch to ${NEXT_THEME_LABEL[theme]} theme`}
        className="fixed bottom-6 right-6 z-50 font-mono text-[0.6875rem] uppercase tracking-wide text-[var(--ink-muted)] before:content-['[_'] after:content-['_]'] hover:bg-[var(--ink)] hover:text-[var(--bg)] px-2 py-1 transition-colors"
      >
        SWITCH THEME
      </button>
    );
  }

  if (theme === 'handdrawn') {
    return (
      <button
        onClick={cycleTheme}
        title={`Switch to ${NEXT_THEME_LABEL[theme]} theme`}
        className="fixed bottom-6 right-6 z-50 text-sm font-[var(--font-display)] text-[var(--accent)] hover:text-[var(--accent-hover)] px-3 py-2 border border-[var(--border)] rounded-sm hover:bg-[var(--accent-light)] transition-colors"
      >
        ✦ themes
      </button>
    );
  }

  // Y2K
  return (
    <button
      onClick={cycleTheme}
      title={`Switch to ${NEXT_THEME_LABEL[theme]} theme`}
      className="fixed bottom-6 right-6 z-50 px-3 py-1 text-[11px] font-bold bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[inset_1px_1px_#dfdfdf,inset_-1px_-1px_#808080] font-[Tahoma,sans-serif] active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
    >
      THEME ▼
    </button>
  );
}
