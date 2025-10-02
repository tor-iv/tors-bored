'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeOption = 'red' | 'green' | 'blue';

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
      case 'red':
        return 'text-red-600';
      case 'green':
        return 'text-green-700';
      case 'blue':
        return 'text-blue-600';
      default:
        return 'text-green-700';
    }
  };

  const getPrimaryColorClass = () => {
    switch (currentTheme) {
      case 'red':
        return 'text-red-500';
      case 'green':
        return 'text-green-600';
      case 'blue':
        return 'text-blue-500';
      default:
        return 'text-green-600';
    }
  };

  const getThemeColor = () => {
    switch (currentTheme) {
      case 'red':
        return '#E74C3C';
      case 'green':
        return '#0A8754';
      case 'blue':
        return '#2E86AB';
      default:
        return '#0A8754';
    }
  };

  const getBgColorClass = () => {
    switch (currentTheme) {
      case 'red':
        return 'bg-red-500';
      case 'green':
        return 'bg-green-600';
      case 'blue':
        return 'bg-blue-500';
      default:
        return 'bg-green-600';
    }
  };

  const getBgLightColorClass = () => {
    switch (currentTheme) {
      case 'red':
        return 'bg-red-100';
      case 'green':
        return 'bg-green-100';
      case 'blue':
        return 'bg-blue-100';
      default:
        return 'bg-green-100';
    }
  };

  const getBorderColorClass = () => {
    switch (currentTheme) {
      case 'red':
        return 'border-red-500';
      case 'green':
        return 'border-green-600';
      case 'blue':
        return 'border-blue-500';
      default:
        return 'border-green-600';
    }
  };

  const getHoverBgColorClass = () => {
    switch (currentTheme) {
      case 'red':
        return 'hover:bg-red-500';
      case 'green':
        return 'hover:bg-green-600';
      case 'blue':
        return 'hover:bg-blue-500';
      default:
        return 'hover:bg-green-600';
    }
  };

  const getRingColorClass = () => {
    switch (currentTheme) {
      case 'red':
        return 'ring-red-500';
      case 'green':
        return 'ring-green-600';
      case 'blue':
        return 'ring-blue-500';
      default:
        return 'ring-green-600';
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('colorTheme') as ThemeOption;
      if (savedTheme && ['red', 'green', 'blue'].includes(savedTheme)) {
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