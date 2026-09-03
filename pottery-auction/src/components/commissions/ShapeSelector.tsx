'use client';

import { motion } from 'framer-motion';
import ReceiptDivider from '@/components/theme/receipt/ReceiptDivider';

interface ShapeSelectorProps {
  selected: string | null;
  onSelect: (shape: string) => void;
}

const shapes = [
  {
    id: 'bowl',
    name: 'BOWL',
    desc: 'SERVING OR DISPLAY',
    svg: (
      <svg viewBox="0 0 100 80" width="40" height="32" fill="none">
        <path d="M10 35 Q10 65 50 70 Q90 65 90 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="50" cy="35" rx="40" ry="12" stroke="currentColor" strokeWidth="3" fill="none" />
      </svg>
    ),
  },
  {
    id: 'vase',
    name: 'VASE',
    desc: 'ELEGANT VESSEL',
    svg: (
      <svg viewBox="0 0 100 100" width="32" height="40" fill="none">
        <path d="M35 90 Q30 70 35 50 Q32 30 40 15 Q45 10 50 10 Q55 10 60 15 Q68 30 65 50 Q70 70 65 90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M35 90 Q50 95 65 90" stroke="currentColor" strokeWidth="3" fill="none" />
        <ellipse cx="50" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: 'mug',
    name: 'MUG',
    desc: 'DAILY COMPANION',
    svg: (
      <svg viewBox="0 0 100 100" width="38" height="38" fill="none">
        <path d="M20 25 L20 75 Q20 85 35 85 L55 85 Q70 85 70 75 L70 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M20 25 Q45 20 70 25" stroke="currentColor" strokeWidth="3" fill="none" />
        <path d="M70 35 Q85 35 85 50 Q85 65 70 65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'plate',
    name: 'PLATE',
    desc: 'FUNCTIONAL / DECOR',
    svg: (
      <svg viewBox="0 0 100 60" width="44" height="28" fill="none">
        <ellipse cx="50" cy="30" rx="45" ry="20" stroke="currentColor" strokeWidth="3" fill="none" />
        <ellipse cx="50" cy="30" rx="30" ry="12" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: 'planter',
    name: 'PLANTER',
    desc: 'HOME FOR PLANTS',
    svg: (
      <svg viewBox="0 0 100 90" width="36" height="36" fill="none">
        <path d="M25 20 L20 80 Q20 85 30 85 L70 85 Q80 85 80 80 L75 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M25 20 Q50 15 75 20" stroke="currentColor" strokeWidth="3" fill="none" />
        <path d="M50 10 Q45 5 50 0 Q55 5 50 10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'sculpture',
    name: 'SCULPTURE',
    desc: 'ARTISTIC FORM',
    svg: (
      <svg viewBox="0 0 100 100" width="32" height="38" fill="none">
        <path d="M40 90 Q30 70 35 50 Q25 40 40 30 Q35 20 50 10 Q65 20 60 30 Q75 40 65 50 Q70 70 60 90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M40 90 Q50 95 60 90" stroke="currentColor" strokeWidth="3" fill="none" />
      </svg>
    ),
  },
];

export default function ShapeSelector({ selected, onSelect }: ShapeSelectorProps) {
  return (
    <div>
      <div
        className="text-[0.625rem] uppercase tracking-widest mb-3"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        SELECT BASE FORM · CHECK ONE:
      </div>

      <div className="space-y-0">
        {shapes.map((shape, i) => {
          const isSelected = selected === shape.id;
          return (
            <div key={shape.id}>
              <motion.button
                onClick={() => onSelect(shape.id)}
                className="w-full text-left"
                whileTap={{ scale: 0.995 }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <div
                  className="receipt-line-item py-2 px-1"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: isSelected ? 'var(--ink)' : 'var(--ink-muted)',
                    backgroundColor: isSelected ? 'rgba(0,0,0,0.04)' : 'transparent',
                    transition: 'background-color 0.12s',
                  }}
                >
                  {/* Checkbox glyph */}
                  <span
                    style={{
                      fontFamily: 'var(--font-thermal)',
                      fontSize: '1rem',
                      color: isSelected ? 'var(--ink)' : 'var(--ink-muted)',
                      minWidth: 18,
                      display: 'inline-block',
                    }}
                  >
                    {isSelected ? '[X]' : '[ ]'}
                  </span>

                  {/* Vessel icon */}
                  <span
                    className="inline-flex items-center justify-center mx-2"
                    style={{
                      color: isSelected ? 'var(--ink)' : 'var(--ink-muted)',
                      opacity: isSelected ? 1 : 0.5,
                      verticalAlign: 'middle',
                      minWidth: 48,
                    }}
                  >
                    {shape.svg}
                  </span>

                  {/* Name */}
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
                    {shape.name}
                  </span>

                  <span className="leader" />

                  {/* Description */}
                  <span
                    className="text-[0.6875rem] uppercase whitespace-nowrap"
                    style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
                  >
                    {shape.desc}
                  </span>
                </div>
              </motion.button>
              {i < shapes.length - 1 && <ReceiptDivider variant="minor" />}
            </div>
          );
        })}
      </div>

      <div
        className="text-[0.5rem] uppercase tracking-widest mt-4"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)' }}
      >
        * CUSTOM FORMS AVAILABLE — NOTE IN DETAILS SECTION *
      </div>
    </div>
  );
}
