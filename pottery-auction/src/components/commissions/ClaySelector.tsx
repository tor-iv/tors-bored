'use client';

import { motion } from 'framer-motion';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

interface ClaySelectorProps {
  selected: string | null;
  onSelect: (clay: string) => void;
}

const clayTypes = [
  {
    id: 'stoneware',
    name: 'STONEWARE',
    props: 'FOOD SAFE · OVEN SAFE · EARTHY TONES',
    note: 'DURABLE, VERSATILE, EVERYDAY USE',
    swatch: '#8B7355',
  },
  {
    id: 'porcelain',
    name: 'PORCELAIN',
    props: 'DELICATE · SMOOTH FINISH · WHITE',
    note: 'ELEGANT, REFINED, TRANSLUCENT',
    swatch: '#E8E5DC',
  },
  {
    id: 'earthenware',
    name: 'EARTHENWARE',
    props: 'TERRACOTTA TONES · POROUS · DECORATIVE',
    note: 'WARM, TRADITIONAL, COLORFUL GLAZES',
    swatch: '#C96846',
  },
  {
    id: 'raku',
    name: 'RAKU',
    props: 'METALLIC FX · CRACKLE GLAZE · DECO ONLY',
    note: 'DRAMATIC, UNPREDICTABLE, UNIQUE',
    swatch: '#2F2F2F',
  },
];

export default function ClaySelector({ selected, onSelect }: ClaySelectorProps) {
  return (
    <div>
      <div
        className="text-[0.625rem] uppercase tracking-widest mb-3"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        SELECT CLAY BODY · CHECK ONE:
      </div>

      <div className="space-y-0">
        {clayTypes.map((clay, i) => {
          const isSelected = selected === clay.id;
          return (
            <div key={clay.id}>
              <motion.button
                onClick={() => onSelect(clay.id)}
                className="w-full text-left"
                whileTap={{ scale: 0.995 }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <div
                  className="py-2 px-1"
                  style={{
                    backgroundColor: isSelected ? 'rgba(0,0,0,0.04)' : 'transparent',
                    transition: 'background-color 0.12s',
                  }}
                >
                  {/* Top row: checkbox + swatch + name */}
                  <div className="receipt-line-item">
                    <span
                      style={{
                        fontFamily: 'var(--font-thermal)',
                        fontSize: '1rem',
                        color: isSelected ? 'var(--ink)' : 'var(--ink-muted)',
                        minWidth: 36,
                        display: 'inline-block',
                      }}
                    >
                      {isSelected ? '[X]' : '[ ]'}
                    </span>

                    {/* Clay swatch */}
                    <span
                      aria-hidden
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        backgroundColor: clay.swatch,
                        border: '1px solid var(--ink-muted)',
                        marginRight: 8,
                        flexShrink: 0,
                        verticalAlign: 'middle',
                        opacity: isSelected ? 1 : 0.6,
                      }}
                    />

                    <span
                      className="uppercase"
                      style={{
                        fontFamily: 'var(--font-stamp)',
                        fontSize: '0.9rem',
                        letterSpacing: '0.08em',
                        color: isSelected ? 'var(--ink)' : 'var(--ink-muted)',
                        flex: 1,
                      }}
                    >
                      {clay.name}
                    </span>

                    <span className="leader" />

                    <span
                      className="text-[0.5625rem] uppercase whitespace-nowrap"
                      style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                    >
                      {clay.note}
                    </span>
                  </div>

                  {/* Properties row */}
                  <div
                    className="text-[0.5rem] uppercase tracking-wider ml-9 mt-0.5"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', opacity: isSelected ? 0.75 : 0.45 }}
                  >
                    {clay.props}
                  </div>
                </div>
              </motion.button>
              {i < clayTypes.length - 1 && <ReceiptDivider variant="minor" />}
            </div>
          );
        })}
      </div>

      <div
        className="text-[0.5rem] uppercase tracking-widest mt-4"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        * TOR WILL CONFIRM BEST CLAY FOR YOUR DESIGN AT REVIEW *
      </div>
    </div>
  );
}
