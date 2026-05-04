'use client';
import { useState, useEffect } from 'react';

interface BlinkingClockProps {
  endDate: string | null | undefined;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function BlinkingClock({ endDate }: BlinkingClockProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!endDate) return <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11 }}>—</span>;
  if (remaining === null) return <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11 }}>--:--:--</span>;
  if (remaining <= 0) return <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: '#ff0000' }}>ENDED</span>;

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isUrgent = remaining < 3600000; // < 1 hour
  const isCritical = remaining < 300000; // < 5 minutes

  const clockClass = isCritical ? 'y2k-critical' : isUrgent ? 'y2k-urgent' : '';

  return (
    <span
      className={clockClass}
      style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 11,
        whiteSpace: 'nowrap',
      }}
    >
      {pad(hours)}
      <span className="y2k-blink-colon">:</span>
      {pad(minutes)}
      <span className="y2k-blink-colon">:</span>
      {pad(seconds)}
    </span>
  );
}
