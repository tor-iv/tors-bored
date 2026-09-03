'use client';
import { useState, useEffect } from 'react';

const DIGIT_STYLE: React.CSSProperties = {
  background: '#000',
  color: '#00ff00',
  fontFamily: "'Courier New', monospace",
  fontSize: '18px',
  padding: '2px 4px',
  border: '1px solid #333',
  display: 'inline-block',
  minWidth: '16px',
  textAlign: 'center',
};

export default function VisitorCounter() {
  const [digits, setDigits] = useState<string>('------');

  useEffect(() => {
    let num = sessionStorage.getItem('visitorNum');
    if (!num) {
      num = String(Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
      sessionStorage.setItem('visitorNum', num);
    }
    setDigits(num.padStart(6, '0'));
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'Tahoma, sans-serif',
          fontSize: '10px',
          fontVariant: 'small-caps',
          marginBottom: '4px',
          color: 'var(--ink)',
        }}
      >
        VISITOR #
      </div>
      <div>
        {digits.split('').map((d, i) => (
          <span key={i} style={DIGIT_STYLE}>{d}</span>
        ))}
      </div>
    </div>
  );
}
