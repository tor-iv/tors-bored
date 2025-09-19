'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeOption = 'red' | 'green' | 'blue';

interface ColorToggleContextType {
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  getTextColorClass: () => string;
  getPrimaryColorClass: () => string;
  getThemeColor: () => string;
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
      getThemeColor
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