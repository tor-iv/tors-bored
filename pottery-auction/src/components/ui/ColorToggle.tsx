'use client';

import { useState, useRef, useEffect } from 'react';
import { useColorToggle } from '@/contexts/ColorToggleContext';

// Preset pastel colors
const presetColors = [
  { name: 'blue' as const, color: '#93c5fd', label: 'Pastel Blue' },
  { name: 'green' as const, color: '#86efac', label: 'Pastel Green' },
  { name: 'purple' as const, color: '#c4b5fd', label: 'Pastel Purple' },
];

// Custom color palette (24 pastel colors)
const paletteColors = [
  // Row 1 - Light pastels
  '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#a5f3fc', '#bfdbfe', '#ddd6fe', '#fbcfe8',
  // Row 2 - Medium pastels
  '#fca5a5', '#fdba74', '#fde047', '#86efac', '#67e8f9', '#93c5fd', '#c4b5fd', '#f9a8d4',
  // Row 3 - Vibrant
  '#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6',
];

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
    <div className="relative flex items-center space-x-3" ref={paletteRef}>
      <span className="text-xs opacity-70 hidden sm:inline text-gray-700">Theme:</span>

      {/* Preset color buttons */}
      {presetColors.map((color) => (
        <button
          key={color.name}
          onClick={() => setPresetTheme(color.name)}
          style={{ backgroundColor: color.color }}
          className={`w-5 h-5 rounded-full transition-all duration-200 ${
            isPresetSelected(color.name)
              ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 shadow-lg'
              : 'hover:scale-110 opacity-80 hover:opacity-100 hover:shadow-md'
          }`}
          title={`Switch to ${color.label} theme`}
          aria-label={`Set theme to ${color.name}`}
        >
          {isPresetSelected(color.name) && (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
            </div>
          )}
        </button>
      ))}

      {/* Custom color picker button */}
      <button
        onClick={() => setShowPalette(!showPalette)}
        className={`w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center ${
          currentTheme === 'custom'
            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 shadow-lg'
            : 'border-2 border-dashed border-gray-400 hover:scale-110 hover:border-gray-500'
        }`}
        style={currentTheme === 'custom' && customColor ? { backgroundColor: customColor } : {}}
        title="Custom color"
        aria-label="Open custom color picker"
      >
        {currentTheme === 'custom' && customColor ? (
          <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
        ) : (
          <span className="text-gray-400 text-xs font-bold">+</span>
        )}
      </button>

      {/* Color palette dropdown */}
      {showPalette && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
          <p className="text-xs text-gray-500 mb-2 font-medium">Pick a color</p>
          <div className="grid grid-cols-8 gap-1.5">
            {paletteColors.map((hex) => (
              <button
                key={hex}
                onClick={() => {
                  setCustomColor(hex);
                  setShowPalette(false);
                }}
                style={{ backgroundColor: hex }}
                className={`w-6 h-6 rounded-full transition-all duration-150 hover:scale-110 ${
                  isCustomColorSelected(hex)
                    ? 'ring-2 ring-offset-1 ring-gray-400'
                    : ''
                }`}
                title={hex}
                aria-label={`Set custom color to ${hex}`}
              >
                {isCustomColorSelected(hex) && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
