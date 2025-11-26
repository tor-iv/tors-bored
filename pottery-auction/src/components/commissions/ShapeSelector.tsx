'use client';

import { motion } from 'framer-motion';

interface ShapeSelectorProps {
  selected: string | null;
  onSelect: (shape: string) => void;
}

const shapes = [
  {
    id: 'bowl',
    name: 'Bowl',
    description: 'Perfect for serving or display',
    svg: (
      <svg viewBox="0 0 100 80" className="w-full h-full" fill="none">
        <path
          d="M10 35 Q10 65 50 70 Q90 65 90 35"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="50" cy="35" rx="40" ry="12" stroke="currentColor" strokeWidth="3" fill="none" />
      </svg>
    ),
  },
  {
    id: 'vase',
    name: 'Vase',
    description: 'Elegant vessel for flowers',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <path
          d="M35 90 Q30 70 35 50 Q32 30 40 15 Q45 10 50 10 Q55 10 60 15 Q68 30 65 50 Q70 70 65 90"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M35 90 Q50 95 65 90" stroke="currentColor" strokeWidth="3" fill="none" />
        <ellipse cx="50" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: 'mug',
    name: 'Mug',
    description: 'Your morning companion',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <path
          d="M20 25 L20 75 Q20 85 35 85 L55 85 Q70 85 70 75 L70 25"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M20 25 Q45 20 70 25" stroke="currentColor" strokeWidth="3" fill="none" />
        <path
          d="M70 35 Q85 35 85 50 Q85 65 70 65"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'plate',
    name: 'Plate',
    description: 'Functional or decorative',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full" fill="none">
        <ellipse cx="50" cy="30" rx="45" ry="20" stroke="currentColor" strokeWidth="3" fill="none" />
        <ellipse cx="50" cy="30" rx="30" ry="12" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: 'planter',
    name: 'Planter',
    description: 'Home for your plants',
    svg: (
      <svg viewBox="0 0 100 90" className="w-full h-full" fill="none">
        <path
          d="M25 20 L20 80 Q20 85 30 85 L70 85 Q80 85 80 80 L75 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M25 20 Q50 15 75 20" stroke="currentColor" strokeWidth="3" fill="none" />
        {/* Little plant */}
        <path d="M50 10 Q45 5 50 0 Q55 5 50 10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M50 15 Q40 10 50 0 Q60 10 50 15" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'sculpture',
    name: 'Sculpture',
    description: 'Pure artistic expression',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <path
          d="M40 90 Q30 70 35 50 Q25 40 40 30 Q35 20 50 10 Q65 20 60 30 Q75 40 65 50 Q70 70 60 90"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M40 90 Q50 95 60 90" stroke="currentColor" strokeWidth="3" fill="none" />
        <circle cx="50" cy="35" r="3" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
];

export default function ShapeSelector({ selected, onSelect }: ShapeSelectorProps) {
  return (
    <div>
      <p className="text-center mb-6" style={{ color: 'var(--theme-text-muted)' }}>
        Select the base shape for your custom pottery piece
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {shapes.map((shape) => (
          <motion.button
            key={shape.id}
            onClick={() => onSelect(shape.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${selected === shape.id
                ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)]'
                : 'border-gray-200 hover:border-[var(--theme-primary)] hover:bg-gray-50'
              }
            `}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selection indicator */}
            {selected === shape.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}

            {/* Shape illustration */}
            <div
              className="w-20 h-20 mx-auto mb-3"
              style={{ color: selected === shape.id ? 'var(--theme-text)' : 'var(--theme-text-muted)' }}
            >
              {shape.svg}
            </div>

            {/* Shape info */}
            <h3
              className="font-semibold mb-1"
              style={{
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-caveat), cursive',
                fontSize: '1.25rem'
              }}
            >
              {shape.name}
            </h3>
            <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              {shape.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
