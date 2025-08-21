'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ColorOption = 'red' | 'green' | 'blue';

interface ColorToggleContextType {
  currentColor: ColorOption;
  setColor: (color: ColorOption) => void;
  getTextColorClass: () => string;
  getTextColorForBackground: (bgType: 'light' | 'dark' | 'medium') => string;
  getDarkModeTextClass: () => string;
}

const ColorToggleContext = createContext<ColorToggleContextType | undefined>(undefined);

export function ColorToggleProvider({ children }: { children: ReactNode }) {
  const [currentColor, setCurrentColor] = useState<ColorOption>('green');

  const setColor = (color: ColorOption) => {
    setCurrentColor(color);
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('textColor', color);
    }
  };

  const getTextColorClass = () => {
    switch (currentColor) {
      case 'red':
        return 'text-toggle-red';
      case 'green':
        return 'text-toggle-green';
      case 'blue':
        return 'text-toggle-blue';
      default:
        return 'text-toggle-green';
    }
  };

  const getTextColorForBackground = (bgType: 'light' | 'dark' | 'medium') => {
    if (bgType === 'dark') {
      return 'text-white';
    }
    // Use dark text on light and medium backgrounds for better readability
    return 'text-medium-dark';
  };

  const getDarkModeTextClass = () => {
    return 'text-white';
  };

  // Load color from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('textColor') as ColorOption;
      if (savedColor && ['red', 'green', 'blue'].includes(savedColor)) {
        setCurrentColor(savedColor);
      }
    }
  }, []);

  return (
    <ColorToggleContext.Provider value={{ 
      currentColor, 
      setColor, 
      getTextColorClass, 
      getTextColorForBackground, 
      getDarkModeTextClass 
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