'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import VisitorCounter from './VisitorCounter';
import Win98Window from './Win98Window';

function CurrentTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12 }}>{time || '--:--:--'}</span>;
}

const navLinks = [
  { href: '/',            label: '🏠 Home' },
  { href: '/browse',      label: '📁 Browse' },
  { href: '/shop',        label: '🛒 Shop' },
  { href: '/commissions', label: '✏️ Commission' },
  { href: '/account',     label: '👤 Account' },
];

export default function Y2KSidebar() {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <aside className="y2k-sidebar">
      {/* Clock widget */}
      <Win98Window title="🕐 Time">
        <div style={{ textAlign: 'center', padding: '4px 0' }}>
          <CurrentTime />
        </div>
      </Win98Window>

      {/* Navigation */}
      <Win98Window title="📂 Navigation">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="y2k-sidebar-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </Win98Window>

      {/* Visitor counter */}
      <Win98Window title="👥 Visitors">
        <div style={{ textAlign: 'center' }}>
          <VisitorCounter />
        </div>
      </Win98Window>

      {/* Now playing (fake period-correct widget) */}
      <Win98Window title="🎵 Now Playing">
        <div style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 10, color: 'var(--ink)', lineHeight: 1.4 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>Mambo No. 5</div>
          <div style={{ color: 'var(--ink-muted)' }}>Lou Bega</div>
          <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
            <button className="win98-btn" style={{ minWidth: 'unset', padding: '2px 6px', fontSize: 9 }}>⏮</button>
            <button className="win98-btn" style={{ minWidth: 'unset', padding: '2px 6px', fontSize: 9 }}>⏸</button>
            <button className="win98-btn" style={{ minWidth: 'unset', padding: '2px 6px', fontSize: 9 }}>⏭</button>
          </div>
        </div>
      </Win98Window>

      {/* Last updated */}
      <Win98Window title="📅 Site Info">
        <div style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 10, color: 'var(--ink-muted)', lineHeight: 1.4 }}>
          <div>Last updated:</div>
          <div style={{ color: 'var(--ink)', fontWeight: 'bold' }}>{today}</div>
          <hr className="y2k-rainbow-hr" style={{ margin: '4px 0' }} />
          <div style={{ fontSize: 9, textAlign: 'center' }}>
            Best viewed in<br />
            <strong>Internet Explorer 5.5</strong><br />
            at 1024×768
          </div>
        </div>
      </Win98Window>

      {/* Webring badge */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'Tahoma, sans-serif',
          fontSize: 9,
          color: 'var(--ink-muted)',
          border: '1px solid var(--border)',
          background: 'var(--bg-well)',
          padding: '4px',
        }}
      >
        ← Pottery Webring →<br />
        <span style={{ fontSize: 8 }}>[prev] [next] [random]</span>
      </div>
    </aside>
  );
}
