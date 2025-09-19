'use client';

import { useColorToggle } from '@/contexts/ColorToggleContext';

export default function ColorToggle() {
  const { currentTheme, setTheme } = useColorToggle();

  const colors = [
    { name: 'red' as const, color: '#E74C3C', label: 'Red' },
    { name: 'green' as const, color: '#0A8754', label: 'Green' },
    { name: 'blue' as const, color: '#2E86AB', label: 'Blue' }
  ];

  return (
    <div className="flex items-center space-x-3">
      <span className="text-xs opacity-70 hidden sm:inline text-gray-700">Theme:</span>
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => setTheme(color.name)}
          style={{ backgroundColor: color.color }}
          className={`group w-5 h-5 rounded-full transition-all duration-200 ${
            currentTheme === color.name 
              ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 shadow-lg' 
              : 'hover:scale-110 opacity-80 hover:opacity-100 hover:shadow-md'
          }`}
          title={`Switch to ${color.label} theme`}
          aria-label={`Set text color to ${color.name}`}
        >
          {currentTheme === color.name && (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}