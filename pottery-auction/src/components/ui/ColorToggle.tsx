'use client';

import { useState, useRef, useEffect } from 'react';
import { useColorToggle } from '@/contexts/ColorToggleContext';

// Preset glaze colors - pottery studio themes
const presetGlazes = [
  { name: 'terracotta' as const, color: '#E07856', label: 'Terracotta' },
  { name: 'sage' as const, color: '#8B9D83', label: 'Sage' },
  { name: 'charcoal' as const, color: '#6B6B6B', label: 'Charcoal' },
];

// Custom glaze palette - earthy, studio-inspired colors
const glazeColors = [
  // Row 1 - Warm earth tones
  '#E07856', '#C96846', '#B8860B', '#CD853F', '#D2691E', '#A0522D', '#8B4513', '#5C3D2E',
  // Row 2 - Natural greens and blues
  '#8B9D83', '#6B8E23', '#556B2F', '#708090', '#5F9EA0', '#6B7D63', '#4A5D4A', '#2F4F4F',
  // Row 3 - Neutrals and accents
  '#D4A574', '#C4A35A', '#B8860B', '#DEB887', '#F5DEB3', '#D2B48C', '#BC8F8F', '#9C8B7D',
];

// Glaze Test Tile Component
function GlazeTile({
  color,
  isSelected,
  onClick,
  label,
  size = 'normal',
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  label: string;
  size?: 'normal' | 'small';
}) {
  const tileSize = size === 'small' ? 'w-7 h-8' : 'w-8 h-10';
  const holeSize = size === 'small' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <button
      onClick={onClick}
      className={`
        ${tileSize} relative group
        transition-all duration-200 ease-out
        ${isSelected ? 'scale-105 -translate-y-0.5' : 'hover:scale-105 hover:-translate-y-0.5'}
      `}
      title={label}
      aria-label={`Set glaze to ${label}`}
    >
      {/* Tile shadow */}
      <div
        className={`
          absolute inset-0 rounded-sm bg-black/20 blur-sm
          transition-all duration-200
          ${isSelected ? 'translate-y-1 opacity-40' : 'translate-y-0.5 opacity-20 group-hover:translate-y-1 group-hover:opacity-30'}
        `}
      />

      {/* Main tile body - clay base */}
      <div
        className={`
          absolute inset-0 rounded-sm
          bg-gradient-to-br from-amber-100 to-amber-200
          border border-amber-300/50
        `}
      />

      {/* Glaze layer with glossy effect */}
      <div
        className="absolute inset-0 rounded-sm overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {/* Glossy sheen gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg,
              rgba(255,255,255,0.4) 0%,
              rgba(255,255,255,0.1) 30%,
              transparent 50%,
              rgba(0,0,0,0.05) 100%
            )`,
          }}
        />

        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hanging hole at top */}
      <div
        className={`
          absolute top-1 left-1/2 -translate-x-1/2
          ${holeSize} rounded-full
          bg-amber-800/30
          border border-amber-900/20
          shadow-inner
        `}
      />

      {/* Selection indicator - glowing ring */}
      {isSelected && (
        <div
          className="absolute -inset-0.5 rounded-sm opacity-60"
          style={{
            boxShadow: `0 0 8px 2px ${color}`,
          }}
        />
      )}

      {/* Check mark for selected state */}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-3 h-3 drop-shadow-md"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'rgba(255,255,255,0.9)' }}
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

export default function ColorToggle() {
  const { currentTheme, customColor, setPresetTheme, setCustomColor } = useColorToggle();
  const [showPalette, setShowPalette] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Close palette when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setShowPalette(false);
      }
    }

    if (showPalette) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPalette]);

  const isPresetSelected = (name: string) =>
    currentTheme === name && currentTheme !== 'custom';

  const isCustomColorSelected = (hex: string) =>
    currentTheme === 'custom' && customColor === hex;

  return (
    <div className="relative flex items-center gap-2" ref={paletteRef}>
      <span className="text-xs opacity-60 hidden sm:inline mr-1" style={{ color: 'var(--theme-text)' }}>
        Glaze:
      </span>

      {/* Preset glaze tiles */}
      {presetGlazes.map((glaze) => (
        <GlazeTile
          key={glaze.name}
          color={glaze.color}
          isSelected={isPresetSelected(glaze.name)}
          onClick={() => setPresetTheme(glaze.name)}
          label={glaze.label}
        />
      ))}

      {/* Custom glaze picker button */}
      <button
        onClick={() => setShowPalette(!showPalette)}
        className={`
          w-8 h-10 relative group
          transition-all duration-200 ease-out
          ${currentTheme === 'custom' ? 'scale-105 -translate-y-0.5' : 'hover:scale-105 hover:-translate-y-0.5'}
        `}
        title="More glazes"
        aria-label="Open glaze picker"
      >
        {/* Tile shadow */}
        <div
          className={`
            absolute inset-0 rounded-sm bg-black/20 blur-sm
            transition-all duration-200
            ${currentTheme === 'custom' ? 'translate-y-1 opacity-40' : 'translate-y-0.5 opacity-20 group-hover:translate-y-1 group-hover:opacity-30'}
          `}
        />

        {/* Main tile body - either custom color or clay/unfired look */}
        <div
          className={`
            absolute inset-0 rounded-sm overflow-hidden
            ${currentTheme === 'custom' ? '' : 'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-dashed border-amber-400/50'}
          `}
          style={currentTheme === 'custom' && customColor ? { backgroundColor: customColor } : {}}
        >
          {currentTheme === 'custom' && customColor && (
            <>
              {/* Glossy sheen */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg,
                    rgba(255,255,255,0.4) 0%,
                    rgba(255,255,255,0.1) 30%,
                    transparent 50%,
                    rgba(0,0,0,0.05) 100%
                  )`,
                }}
              />
            </>
          )}

          {/* Plus icon for unfired/no custom selected */}
          {currentTheme !== 'custom' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-600/60 text-lg font-light">+</span>
            </div>
          )}
        </div>

        {/* Hanging hole */}
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-800/30 border border-amber-900/20 shadow-inner"
        />

        {/* Selection glow */}
        {currentTheme === 'custom' && customColor && (
          <div
            className="absolute -inset-0.5 rounded-sm opacity-60"
            style={{ boxShadow: `0 0 8px 2px ${customColor}` }}
          />
        )}
      </button>

      {/* Glaze palette dropdown - styled like a sample board */}
      {showPalette && (
        <div
          className="absolute top-full right-0 mt-3 p-4 rounded-lg shadow-xl border z-50"
          style={{
            background: 'linear-gradient(135deg, #f5ebe0 0%, #e8dcc8 100%)',
            borderColor: '#d4c4a8',
          }}
        >
          {/* Sample board title */}
          <p
            className="text-xs font-medium mb-3 pb-2 border-b"
            style={{ color: '#6b5c4c', borderColor: '#d4c4a8' }}
          >
            Pick a glaze
          </p>

          {/* Grid of glaze tiles */}
          <div className="grid grid-cols-8 gap-2">
            {glazeColors.map((hex) => (
              <GlazeTile
                key={hex}
                color={hex}
                isSelected={isCustomColorSelected(hex)}
                onClick={() => {
                  setCustomColor(hex);
                  setShowPalette(false);
                }}
                label={hex}
                size="small"
              />
            ))}
          </div>

          {/* Board texture */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}
    </div>
  );
}
