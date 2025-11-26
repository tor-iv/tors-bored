'use client';

import { motion } from 'framer-motion';

interface ClaySelectorProps {
  selected: string | null;
  onSelect: (clay: string) => void;
}

const clayTypes = [
  {
    id: 'stoneware',
    name: 'Stoneware',
    description: 'Durable, versatile, perfect for everyday use',
    characteristics: ['Food safe', 'Oven safe', 'Earthy tones'],
    color: '#8B7355',
    texture: 'Slightly rough, rustic feel',
  },
  {
    id: 'porcelain',
    name: 'Porcelain',
    description: 'Elegant, refined, translucent when thin',
    characteristics: ['Delicate', 'Smooth finish', 'Pure white'],
    color: '#F5F5F0',
    texture: 'Smooth and silky',
  },
  {
    id: 'earthenware',
    name: 'Earthenware',
    description: 'Warm, traditional, beautiful with colorful glazes',
    characteristics: ['Terracotta tones', 'Porous', 'Decorative'],
    color: '#C96846',
    texture: 'Warm and organic',
  },
  {
    id: 'raku',
    name: 'Raku',
    description: 'Dramatic, unpredictable, each piece unique',
    characteristics: ['Metallic effects', 'Crackle glaze', 'Decorative only'],
    color: '#2F2F2F',
    texture: 'Varied, often metallic',
  },
];

export default function ClaySelector({ selected, onSelect }: ClaySelectorProps) {
  return (
    <div>
      <p className="text-center mb-6" style={{ color: 'var(--theme-text-muted)' }}>
        Each clay body has unique properties that affect the final piece
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clayTypes.map((clay) => (
          <motion.button
            key={clay.id}
            onClick={() => onSelect(clay.id)}
            className={`
              relative p-5 rounded-xl border-2 text-left transition-all duration-200
              ${selected === clay.id
                ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)]'
                : 'border-gray-200 hover:border-[var(--theme-primary)] hover:bg-gray-50'
              }
            `}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Selection indicator */}
            {selected === clay.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}

            <div className="flex gap-4">
              {/* Clay color swatch */}
              <div
                className="w-16 h-16 rounded-lg flex-shrink-0 relative overflow-hidden"
                style={{
                  backgroundColor: clay.color,
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {/* Texture overlay */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              {/* Clay info */}
              <div className="flex-1">
                <h3
                  className="font-semibold mb-1"
                  style={{
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--font-caveat), cursive',
                    fontSize: '1.3rem'
                  }}
                >
                  {clay.name}
                </h3>
                <p className="text-sm mb-2" style={{ color: 'var(--theme-text-muted)' }}>
                  {clay.description}
                </p>

                {/* Characteristics tags */}
                <div className="flex flex-wrap gap-1">
                  {clay.characteristics.map((char) => (
                    <span
                      key={char}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: selected === clay.id
                          ? 'var(--theme-primary)'
                          : 'rgba(0,0,0,0.05)',
                        color: selected === clay.id
                          ? 'var(--theme-text-on-primary)'
                          : 'var(--theme-text-muted)'
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Info note */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--theme-text-muted)' }}>
        Don&apos;t worry - I&apos;ll help you choose the best clay for your specific design during review
      </p>
    </div>
  );
}
