'use client';

import { motion } from 'framer-motion';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

interface GlazeSelectorProps {
  selected: string | null;
  onSelect: (glaze: string) => void;
}

const glazeTypes = [
  {
    id: 'matte',
    name: 'MATTE',
    finish: 'VELVETY · NO SHINE',
    note: 'UNDERSTATED ELEGANCE',
    swatches: ['#E8DCC8', '#B8A082', '#8B9D83', '#C96846'],
  },
  {
    id: 'glossy',
    name: 'GLOSSY',
    finish: 'SHINY · REFLECTIVE',
    note: 'VIBRANT & EYE-CATCHING',
    swatches: ['#4A90D9', '#E07856', '#6B8E23', '#8B4513'],
  },
  {
    id: 'satin',
    name: 'SATIN',
    finish: 'SUBTLE SHEEN · BETWEEN MATTE/GLOSS',
    note: 'SMOOTH, SOPHISTICATED',
    swatches: ['#D4A574', '#708090', '#8B9D83', '#A0522D'],
  },
  {
    id: 'textured',
    name: 'TEXTURED',
    finish: 'TACTILE SURFACE · VISUAL INTEREST',
    note: 'UNIQUE CHARACTER',
    swatches: ['#8B7355', '#556B2F', '#CD853F', '#2F4F4F'],
  },
  {
    id: 'crystalline',
    name: 'CRYSTALLINE',
    finish: 'CRYSTAL FORMATIONS · PATTERNS',
    note: 'ONE-OF-A-KIND EFFECTS',
    swatches: ['#87CEEB', '#DDA0DD', '#98FB98', '#FFD700'],
  },
  {
    id: 'raw',
    name: 'UNGLAZED',
    finish: 'NATURAL CLAY · BURNISHED',
    note: 'ORGANIC AND EARTHY',
    swatches: ['#C96846', '#8B7355', '#A0522D', '#5C3D2E'],
  },
];

export default function GlazeSelector({ selected, onSelect }: GlazeSelectorProps) {
  return (
    <div>
      <div
        className="text-[0.625rem] uppercase tracking-widest mb-3"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        SELECT GLAZE FINISH · CHECK ONE:
      </div>

      <div className="space-y-0">
        {glazeTypes.map((glaze, i) => {
          const isSelected = selected === glaze.id;
          return (
            <div key={glaze.id}>
              <motion.button
                onClick={() => onSelect(glaze.id)}
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
                  {/* Top row */}
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

                    {/* Color swatches */}
                    <span
                      aria-hidden
                      className="inline-flex gap-0.5 mr-2"
                      style={{ verticalAlign: 'middle', flexShrink: 0 }}
                    >
                      {glaze.swatches.map((color, ci) => (
                        <span
                          key={ci}
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            backgroundColor: color,
                            border: '0.5px solid rgba(0,0,0,0.12)',
                            opacity: isSelected ? 1 : 0.55,
                          }}
                        />
                      ))}
                    </span>

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
                      {glaze.name}
                    </span>

                    <span className="leader" />

                    <span
                      className="text-[0.5625rem] uppercase whitespace-nowrap"
                      style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                    >
                      {glaze.note}
                    </span>
                  </div>

                  {/* Finish description */}
                  <div
                    className="text-[0.5rem] uppercase tracking-wider ml-9 mt-0.5"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', opacity: isSelected ? 0.75 : 0.45 }}
                  >
                    {glaze.finish}
                  </div>
                </div>
              </motion.button>
              {i < glazeTypes.length - 1 && <ReceiptDivider variant="minor" />}
            </div>
          );
        })}
      </div>

      <div
        className="text-[0.5rem] uppercase tracking-widest mt-4"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        * SPECIFIC COLORS CAN BE DISCUSSED AT REVIEW STAGE *
      </div>
    </div>
  );
}
