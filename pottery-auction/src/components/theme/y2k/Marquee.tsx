'use client';

const TEXT = "★ Welcome to Tor's Bored Pottery ★ Brooklyn, NY ★ Handmade ceramics ★ Monthly auctions ★ Buy Now items available ★ Commission a piece ★";

export default function Marquee() {
  return (
    <>
      <style>{`.y2k-marquee { animation: y2k-marquee-scroll 20s linear infinite; } @keyframes y2k-marquee-scroll { from { transform: translateX(100%); } to { transform: translateX(-100%); } }`}</style>
      <div style={{ overflow: 'hidden', background: '#000080', padding: '2px 0' }}>
        <div
          className="y2k-marquee"
          style={{ whiteSpace: 'nowrap', color: '#ffff00', fontFamily: 'Tahoma, sans-serif', fontSize: 11 }}
        >
          {TEXT}
        </div>
      </div>
    </>
  );
}
