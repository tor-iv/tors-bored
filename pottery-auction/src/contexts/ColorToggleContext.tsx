'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type PresetTheme = 'terracotta' | 'sage' | 'charcoal';
type ThemeType = PresetTheme | 'custom';

interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  text: string;
  textMuted: string;
  // Semantic colors derived from theme
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
}

interface ColorToggleContextType {
  currentTheme: ThemeType;
  customColor: string | null;
  setPresetTheme: (theme: PresetTheme) => void;
  setCustomColor: (hex: string) => void;
  themeHex: string;
}

// Pottery studio color presets - warm, earthy, handcrafted feel
const THEME_PRESETS: Record<PresetTheme, ThemeColors> = {
  terracotta: {
    primary: '#E07856',      // Warm terracotta clay
    primaryDark: '#C96846',  // Fired clay
    primaryLight: '#FAE5DE', // Light terracotta wash
    text: '#5C3D2E',         // Rich brown
    textMuted: '#8B6B5C',    // Muted clay brown
    error: '#A04030',        // Deep terracotta for errors
    errorLight: '#FAE5DE',   // Light terracotta bg for errors
    success: '#5C3D2E',      // Brown for success
    successLight: '#FAE5DE', // Light terracotta bg for success
  },
  sage: {
    primary: '#8B9D83',      // Sage green
    primaryDark: '#6B7D63',  // Deep sage
    primaryLight: '#E8EBE6', // Light sage wash
    text: '#3D4A38',         // Forest green
    textMuted: '#5E6B58',    // Muted sage
    error: '#4A5544',        // Dark sage for errors
    errorLight: '#E8EBE6',   // Light sage bg for errors
    success: '#3D4A38',      // Forest for success
    successLight: '#E8EBE6', // Light sage bg for success
  },
  charcoal: {
    primary: '#6B6B6B',      // Warm charcoal
    primaryDark: '#4A4A4A',  // Deep charcoal
    primaryLight: '#E8E8E8', // Light gray wash
    text: '#2B2B2B',         // Near black
    textMuted: '#5A5A5A',    // Muted charcoal
    error: '#3A3A3A',        // Dark charcoal for errors
    errorLight: '#E8E8E8',   // Light gray bg for errors
    success: '#2B2B2B',      // Dark for success
    successLight: '#E8E8E8', // Light gray bg for success
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
    // Semantic colors - derived from the theme color
    error: hslToHex(h, Math.min(s + 20, 80), 20),       // Very dark variant
    errorLight: hslToHex(h, Math.max(s - 20, 10), 92),  // Very light bg
    success: hslToHex(h, Math.min(s + 20, 80), 25),     // Dark variant
    successLight: hslToHex(h, Math.max(s - 20, 10), 92), // Very light bg
  };
}

// Calculate relative luminance for contrast checking
function getLuminance(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 0;

  const [r, g, b] = [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Get text color that contrasts well with background
function getContrastText(bgHex: string): string {
  const luminance = getLuminance(bgHex);
  // If background is light (luminance > 0.5), use dark text; otherwise use light text
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
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

  // Semantic colors
  root.style.setProperty('--theme-error', colors.error);
  root.style.setProperty('--theme-error-light', colors.errorLight);
  root.style.setProperty('--theme-success', colors.success);
  root.style.setProperty('--theme-success-light', colors.successLight);

  // Contrast-safe text colors for use on primary backgrounds
  root.style.setProperty('--theme-text-on-primary', getContrastText(colors.primary));
  root.style.setProperty('--theme-text-on-primary-dark', getContrastText(colors.primaryDark));
  root.style.setProperty('--theme-text-on-primary-light', getContrastText(colors.primaryLight));
}

const ColorToggleContext = createContext<ColorToggleContextType | undefined>(undefined);

interface StoredTheme {
  type: 'preset' | 'custom';
  value: string;
}

export function ColorToggleProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('terracotta');
  const [customColor, setCustomColorState] = useState<string | null>(null);

  // Calculate current theme hex
  const themeHex = currentTheme === 'custom' && customColor
    ? customColor
    : THEME_PRESETS[currentTheme as PresetTheme]?.primary || THEME_PRESETS.terracotta.primary;

  // Apply theme whenever it changes
  useEffect(() => {
    let colors: ThemeColors;
    let hex: string;

    if (currentTheme === 'custom' && customColor) {
      colors = generateThemeFromHex(customColor);
      hex = customColor;
    } else {
      const preset = THEME_PRESETS[currentTheme as PresetTheme] || THEME_PRESETS.terracotta;
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
        if (parsed.type === 'preset' && ['terracotta', 'sage', 'charcoal'].includes(parsed.value)) {
          setCurrentTheme(parsed.value as PresetTheme);
        } else if (parsed.type === 'custom' && parsed.value) {
          setCurrentTheme('custom');
          setCustomColorState(parsed.value);
        }
      } catch {
        // Legacy format - just a string like 'terracotta'
        if (['terracotta', 'sage', 'charcoal'].includes(stored)) {
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
