'use client';

import { useState, useEffect } from 'react';

interface DotMatrixPrintProps {
  text: string;
  /** ms per character, defaults to 30 */
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export default function DotMatrixPrint({
  text,
  speed = 30,
  onComplete,
  className = '',
}: DotMatrixPrintProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;

    const interval = setInterval(() => {
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
        return;
      }
      setDisplayed(text.slice(0, i));
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={className} aria-live="polite">
      {displayed}
      {!done && <span className="dot-matrix-cursor" aria-hidden>_</span>}
    </span>
  );
}
