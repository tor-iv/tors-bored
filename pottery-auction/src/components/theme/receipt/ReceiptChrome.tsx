'use client';

import { useEffect, useState } from 'react';
import ReceiptNav from './ReceiptNav';

/** Ticking DATE + CASHIER row. Hydration-safe: the timestamp is empty on the
 *  server and on the first client paint; the interval starts in an effect. */
function ReceiptDateCashierRow() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const p = (n: number) => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      setTime(
        `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
      );
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="receipt-date-row">
      <span>
        DATE: {time}
        <span className="receipt-blink-cursor">▌</span>
      </span>
      <span>
        CASHIER: <span className="receipt-cashier">Tor</span>
      </span>
    </div>
  );
}

/** Top-of-paper chrome shared by every receipt page: printed nav, masthead,
 *  date/cashier row. Sits inside .receipt-strip-content. */
export default function ReceiptChrome() {
  return (
    <>
      <ReceiptNav />
      <div className="receipt-masthead">
        <div className="receipt-masthead-title">TOR&apos;S POTTERY STUDIO</div>
        <div className="receipt-masthead-subtitle">★ EST. BROOKLYN, NY ★</div>
      </div>
      <ReceiptDateCashierRow />
    </>
  );
}
