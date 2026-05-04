'use client';
import { useState, useEffect } from 'react';

function formatRemaining(endDateStr: string | null | undefined): string {
  if (!endDateStr) return '—';
  const diff = new Date(endDateStr).getTime() - Date.now();
  if (diff <= 0) return 'ENDED';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export default function LiveCountdown({ endDate }: { endDate: string | null | undefined }) {
  const [remaining, setRemaining] = useState(() => formatRemaining(endDate));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(formatRemaining(endDate)), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return <span>{remaining}</span>;
}
