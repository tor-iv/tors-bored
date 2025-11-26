'use client';

import { ButtonHTMLAttributes, useState } from 'react';
import { useColorToggle } from '@/contexts/ColorToggleContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export default function ButtonSimple({ children, isLoading, className = '', ...props }: ButtonProps) {
  const { themeHex } = useColorToggle();
  const [isHovered, setIsHovered] = useState(false);

  // Get theme colors
  const baseColor = themeHex;

  // Create darker version for hover (reduce brightness by ~20%)
  const darkerColor = adjustBrightness(baseColor, -20);

  const backgroundColor = isLoading ? '#999' : (isHovered ? darkerColor : baseColor);

  return (
    <button
      {...props}
      className={className}
      style={{
        backgroundColor,
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '500',
        fontSize: '16px',
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        width: '100%',
        transition: 'background-color 0.2s',
        opacity: props.disabled ? 0.5 : 1,
      }}
      disabled={isLoading || props.disabled}
      onMouseEnter={() => !isLoading && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading ? '⏳ Loading...' : children}
    </button>
  );
}

// Helper function to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness
  const adjust = (value: number) => {
    const adjusted = value + (value * percent / 100);
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
