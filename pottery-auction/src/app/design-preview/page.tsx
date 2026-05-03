'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const variants = [
  {
    slug: 'illustrated',
    name: 'Illustrated Studio',
    description: 'Warm, hand-painted pottery studio vibe. Tag-style cards, wooden beam nav, illustrated backgrounds.',
    colors: ['#F5EDE4', '#C96F53', '#7A9E7E', '#5C4033'],
    fonts: 'Permanent Marker + Caveat + Libre Franklin',
  },
  {
    slug: 'retro',
    name: 'Retro Web Revival',
    description: 'Modern retro aesthetic. Bold typography, muted blue accents, clean cards with subtle shadows.',
    colors: ['#FAFAF8', '#4A6FA5', '#E8734A', '#1A1A1A'],
    fonts: 'Inter 800 + Space Mono',
  },
  {
    slug: 'refined',
    name: 'Refined Artisan',
    description: 'Warm, elegant design with soft sage and honey accents. Large radius cards, gentle animations.',
    colors: ['#FDF9F3', '#4A7C59', '#D4A853', '#3D3833'],
    fonts: 'Playfair Display + Cormorant + Inter',
  },
  {
    slug: 'hybrid',
    name: 'Hybrid',
    description: 'Best of both: Illustrated backgrounds with retro UI elements. Warm and tactile.',
    colors: ['#F5EDE4', '#C96F53', '#5C4033', '#7A9E7E'],
    fonts: 'Permanent Marker + Caveat + Space Mono',
  },
  {
    slug: 'happy-medium',
    name: 'Happy Medium',
    description: 'True Happy Medium recreation: dark green nav, brush script logo, pill buttons, warm cream background.',
    colors: ['#FDF8F3', '#0A8754', '#D4A853', '#2B2520'],
    fonts: 'Satisfy (brush) + Playfair Display + Inter',
  },
  {
    slug: 'foe-finder',
    name: 'FoeFinder',
    description: 'True FoeFinder recreation: gray background, window-style cards, pure blue buttons, sharp corners.',
    colors: ['#d4d4d4', '#0066ff', '#000080', '#1A1A1A'],
    fonts: 'Inter 800 + Space Mono',
  },
];

export default function DesignPreviewIndex() {
  // Hide the root layout's Header and Footer
  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F1EC] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1
            className="text-5xl mb-4"
            style={{ fontFamily: 'var(--font-caveat)', color: '#2B2520' }}
          >
            Design Preview
          </h1>
          <p
            className="text-lg"
            style={{ fontFamily: 'var(--font-inter)', color: '#4A453E' }}
          >
            6 distinct aesthetic directions for Tor&apos;s Pottery Shop.
            <br />
            Click a card to preview, then let me know which one speaks to you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {variants.map((variant, index) => (
            <motion.div
              key={variant.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/design-preview/${variant.slug}`}>
                <div
                  className="p-6 rounded-lg border-2 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  style={{
                    background: 'white',
                    borderColor: '#E8E6E1',
                  }}
                >
                  {/* Color swatches */}
                  <div className="flex gap-2 mb-4">
                    {variant.colors.map((color) => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded-full border border-gray-200"
                        style={{ background: color }}
                      />
                    ))}
                  </div>

                  <h2
                    className="text-2xl mb-2"
                    style={{ fontFamily: 'var(--font-caveat)', color: '#2B2520' }}
                  >
                    {variant.name}
                  </h2>

                  <p
                    className="text-sm mb-4"
                    style={{ fontFamily: 'var(--font-inter)', color: '#4A453E' }}
                  >
                    {variant.description}
                  </p>

                  <p
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-inter)', color: '#888' }}
                  >
                    Fonts: {variant.fonts}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="text-sm underline"
            style={{ fontFamily: 'var(--font-inter)', color: '#4A453E' }}
          >
            Back to current site
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
