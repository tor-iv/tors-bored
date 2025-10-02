'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeOption = 'blue' | 'green' | 'purple';

interface ColorToggleContextType {
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  getTextColorClass: () => string;
  getPrimaryColorClass: () => string;
  getThemeColor: () => string;
  getBgColorClass: () => string;
  getBgLightColorClass: () => string;
  getBorderColorClass: () => string;
  getHoverBgColorClass: () => string;
  getRingColorClass: () => string;
}

const ColorToggleContext = createContext<ColorToggleContextType | undefined>(undefined);

export function ColorToggleProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>('green');

  const setTheme = (theme: ThemeOption) => {
    setCurrentTheme(theme);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('colorTheme', theme);
    }
  };

  const getTextColorClass = () => {
    switch (currentTheme) {
      case 'blue':
        return 'text-sky-700';
      case 'green':
        return 'text-emerald-800';
      case 'purple':
        return 'text-purple-900';
      default:
        return 'text-emerald-800';
    }
  };

  const getPrimaryColorClass = () => {
    switch (currentTheme) {
      case 'blue':
        return 'text-sky-600';
      case 'green':
        return 'text-emerald-700';
      case 'purple':
        return 'text-purple-800';
      default:
        return 'text-emerald-700';
    }
  };

  const getThemeColor = () => {
    switch (currentTheme) {
      case 'blue':
        return '#7dd3fc'; // sky-300 (pastel blue)
      case 'green':
        return '#065f46'; // emerald-800
      case 'purple':
        return '#581c87'; // purple-900 (deep royal purple)
      default:
        return '#065f46';
    }
  };

  const getBgColorClass = () => {
    switch (currentTheme) {
      case 'blue':
        return 'bg-sky-400';
      case 'green':
        return 'bg-emerald-700';
      case 'purple':
        return 'bg-purple-800';
      default:
        return 'bg-emerald-700';
    }
  };

  const getBgLightColorClass = () => {
    switch (currentTheme) {
      case 'blue':
        return 'bg-sky-100';
      case 'green':
        return 'bg-emerald-100';
      case 'purple':
        return 'bg-purple-100';
      default:
        return 'bg-emerald-100';
    }
  };

  const getBorderColorClass = () => {
    switch (currentTheme) {
      case 'blue':
        return 'border-sky-400';
      case 'green':
        return 'border-emerald-700';
      case 'purple':
        return 'border-purple-800';
      default:
        return 'border-emerald-700';
    }
  };

  const getHoverBgColorClass = () => {
    switch (currentTheme) {
      case 'blue':
        return 'hover:bg-sky-400';
      case 'green':
        return 'hover:bg-emerald-700';
      case 'purple':
        return 'hover:bg-purple-800';
      default:
        return 'hover:bg-emerald-700';
    }
  };

  const getRingColorClass = () => {
    switch (currentTheme) {
      case 'blue':
        return 'ring-sky-400';
      case 'green':
        return 'ring-emerald-700';
      case 'purple':
        return 'ring-purple-800';
      default:
        return 'ring-emerald-700';
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('colorTheme') as ThemeOption;
      if (savedTheme && ['blue', 'green', 'purple'].includes(savedTheme)) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  return (
    <ColorToggleContext.Provider value={{
      currentTheme,
      setTheme,
      getTextColorClass,
      getPrimaryColorClass,
      getThemeColor,
      getBgColorClass,
      getBgLightColorClass,
      getBorderColorClass,
      getHoverBgColorClass,
      getRingColorClass
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