'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type PresetTheme = 'blue' | 'green' | 'purple';
type ThemeType = PresetTheme | 'custom';

interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  text: string;
  textMuted: string;
}

interface ColorToggleContextType {
  currentTheme: ThemeType;
  customColor: string | null;
  setPresetTheme: (theme: PresetTheme) => void;
  setCustomColor: (hex: string) => void;
  themeHex: string;
}

// Pastel color presets
const THEME_PRESETS: Record<PresetTheme, ThemeColors> = {
  blue: {
    primary: '#93c5fd',      // blue-300
    primaryDark: '#60a5fa',  // blue-400
    primaryLight: '#dbeafe', // blue-100
    text: '#1e40af',         // blue-800
    textMuted: '#1d4ed8',    // blue-700
  },
  green: {
    primary: '#86efac',      // green-300
    primaryDark: '#4ade80',  // green-400
    primaryLight: '#dcfce7', // green-100
    text: '#166534',         // green-800
    textMuted: '#15803d',    // green-700
  },
  purple: {
    primary: '#c4b5fd',      // violet-300
    primaryDark: '#a78bfa',  // violet-400
    primaryLight: '#ede9fe', // violet-100
    text: '#5b21b6',         // violet-800
    textMuted: '#6d28d9',    // violet-700
  },
};

// Convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate theme colors from a single hex color
function generateThemeFromHex(hex: string): ThemeColors {
  const { h, s, l } = hexToHSL(hex);

  return {
    primary: hex,
    primaryDark: hslToHex(h, Math.min(s + 10, 100), Math.max(l - 15, 20)),
    primaryLight: hslToHex(h, Math.max(s - 20, 10), Math.min(l + 25, 95)),
    text: hslToHex(h, Math.min(s + 20, 80), 25),
    textMuted: hslToHex(h, Math.min(s + 15, 70), 35),
  };
}

// Apply theme colors to CSS variables on :root
function applyThemeToDOM(colors: ThemeColors, hex: string) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-dark', colors.primaryDark);
  root.style.setProperty('--theme-primary-light', colors.primaryLight);
  root.style.setProperty('--theme-text', colors.text);
  root.style.setProperty('--theme-text-muted', colors.textMuted);
  root.style.setProperty('--theme-border', colors.primary);
  root.style.setProperty('--theme-ring', colors.primary);
  root.style.setProperty('--theme-hex', hex);
}

const ColorToggleContext = createContext<ColorToggleContextType | undefined>(undefined);

interface StoredTheme {
  type: 'preset' | 'custom';
  value: string;
}

export function ColorToggleProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('green');
  const [customColor, setCustomColorState] = useState<string | null>(null);

  // Calculate current theme hex
  const themeHex = currentTheme === 'custom' && customColor
    ? customColor
    : THEME_PRESETS[currentTheme as PresetTheme]?.primary || THEME_PRESETS.green.primary;

  // Apply theme whenever it changes
  useEffect(() => {
    let colors: ThemeColors;
    let hex: string;

    if (currentTheme === 'custom' && customColor) {
      colors = generateThemeFromHex(customColor);
      hex = customColor;
    } else {
      const preset = THEME_PRESETS[currentTheme as PresetTheme] || THEME_PRESETS.green;
      colors = preset;
      hex = preset.primary;
    }

    applyThemeToDOM(colors, hex);
  }, [currentTheme, customColor]);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('colorTheme');
    if (stored) {
      try {
        const parsed: StoredTheme = JSON.parse(stored);
        if (parsed.type === 'preset' && ['blue', 'green', 'purple'].includes(parsed.value)) {
          setCurrentTheme(parsed.value as PresetTheme);
        } else if (parsed.type === 'custom' && parsed.value) {
          setCurrentTheme('custom');
          setCustomColorState(parsed.value);
        }
      } catch {
        // Legacy format - just a string like 'blue'
        if (['blue', 'green', 'purple'].includes(stored)) {
          setCurrentTheme(stored as PresetTheme);
        }
      }
    }
  }, []);

  const setPresetTheme = useCallback((theme: PresetTheme) => {
    setCurrentTheme(theme);
    setCustomColorState(null);

    if (typeof window !== 'undefined') {
      const stored: StoredTheme = { type: 'preset', value: theme };
      localStorage.setItem('colorTheme', JSON.stringify(stored));
    }
  }, []);

  const setCustomColor = useCallback((hex: string) => {
    setCurrentTheme('custom');
    setCustomColorState(hex);

    if (typeof window !== 'undefined') {
      const stored: StoredTheme = { type: 'custom', value: hex };
      localStorage.setItem('colorTheme', JSON.stringify(stored));
    }
  }, []);

  return (
    <ColorToggleContext.Provider value={{
      currentTheme,
      customColor,
      setPresetTheme,
      setCustomColor,
      themeHex,
    }}>
      {children}
    </ColorToggleContext.Provider>
  );
}

export function useColorToggle() {
  const context = useContext(ColorToggleContext);
  if (context === undefined) {
    throw new Error('useColorToggle must be used within a ColorToggleProvider');
  }
  return context;
}
