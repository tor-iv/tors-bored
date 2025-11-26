'use client';

import { motion } from 'framer-motion';

interface GlazeSelectorProps {
  selected: string | null;
  onSelect: (glaze: string) => void;
}

const glazeTypes = [
  {
    id: 'matte',
    name: 'Matte',
    description: 'Soft, velvety finish without shine',
    visual: 'Understated elegance',
    colors: ['#E8DCC8', '#B8A082', '#8B9D83', '#C96846'],
  },
  {
    id: 'glossy',
    name: 'Glossy',
    description: 'Shiny, reflective surface',
    visual: 'Vibrant and eye-catching',
    colors: ['#4A90D9', '#E07856', '#6B8E23', '#8B4513'],
  },
  {
    id: 'satin',
    name: 'Satin',
    description: 'Subtle sheen, between matte and glossy',
    visual: 'Smooth and sophisticated',
    colors: ['#D4A574', '#708090', '#8B9D83', '#A0522D'],
  },
  {
    id: 'textured',
    name: 'Textured',
    description: 'Tactile surface with visual interest',
    visual: 'Unique character',
    colors: ['#8B7355', '#556B2F', '#CD853F', '#2F4F4F'],
  },
  {
    id: 'crystalline',
    name: 'Crystalline',
    description: 'Crystal formations create stunning patterns',
    visual: 'One-of-a-kind effects',
    colors: ['#87CEEB', '#DDA0DD', '#98FB98', '#FFD700'],
  },
  {
    id: 'raw',
    name: 'Unglazed',
    description: 'Natural clay surface, often burnished',
    visual: 'Organic and earthy',
    colors: ['#C96846', '#8B7355', '#A0522D', '#5C3D2E'],
  },
];

export default function GlazeSelector({ selected, onSelect }: GlazeSelectorProps) {
  return (
    <div>
      <p className="text-center mb-6" style={{ color: 'var(--theme-text-muted)' }}>
        The glaze determines the look and feel of your finished piece
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {glazeTypes.map((glaze) => (
          <motion.button
            key={glaze.id}
            onClick={() => onSelect(glaze.id)}
            className={`
              relative p-4 rounded-xl border-2 text-center transition-all duration-200
              ${selected === glaze.id
                ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)]'
                : 'border-gray-200 hover:border-[var(--theme-primary)] hover:bg-gray-50'
              }
            `}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selection indicator */}
            {selected === glaze.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}

            {/* Glaze color swatches */}
            <div className="flex justify-center gap-1 mb-3">
              {glaze.colors.map((color, i) => (
                <motion.div
                  key={i}
                  className="w-6 h-6 rounded-full relative overflow-hidden"
                  style={{
                    backgroundColor: color,
                    boxShadow: glaze.id === 'glossy'
                      ? 'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.4)'
                      : glaze.id === 'matte'
                        ? 'none'
                        : 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}
                  whileHover={{ scale: 1.2 }}
                >
                  {/* Glossy shine effect */}
                  {glaze.id === 'glossy' && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)'
                      }}
                    />
                  )}
                  {/* Crystalline sparkle effect */}
                  {glaze.id === 'crystalline' && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 20%),
                                   radial-gradient(circle at 70% 60%, rgba(255,255,255,0.6) 0%, transparent 15%)`
                      }}
                    />
                  )}
                  {/* Textured effect */}
                  {glaze.id === 'textured' && (
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Glaze info */}
            <h3
              className="font-semibold mb-1"
              style={{
                color: 'var(--theme-text)',
                fontFamily: 'var(--font-caveat), cursive',
                fontSize: '1.2rem'
              }}
            >
              {glaze.name}
            </h3>
            <p className="text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>
              {glaze.description}
            </p>
            <p
              className="text-xs italic"
              style={{ color: 'var(--theme-text)', opacity: 0.6 }}
            >
              {glaze.visual}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Color note */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--theme-text-muted)' }}>
        Specific colors can be discussed - these are just examples of what&apos;s possible!
      </p>
    </div>
  );
}
