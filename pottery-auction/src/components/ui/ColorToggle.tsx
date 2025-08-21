'use client';

import { useColorToggle } from '@/contexts/ColorToggleContext';

export default function ColorToggle() {
  const { currentColor, setColor } = useColorToggle();

  const colors = [
    { name: 'red' as const, class: 'bg-toggle-red', label: 'Red' },
    { name: 'green' as const, class: 'bg-toggle-green', label: 'Green' },
    { name: 'blue' as const, class: 'bg-toggle-blue', label: 'Blue' }
  ];

  return (
    <div className="flex items-center space-x-3">
      <span className="text-xs text-medium-dark opacity-70 hidden sm:inline">Theme:</span>
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => setColor(color.name)}
          className={`group w-5 h-5 rounded-full transition-all duration-200 ${color.class} ${
            currentColor === color.name 
              ? 'ring-2 ring-offset-2 ring-medium-dark scale-110 shadow-lg' 
              : 'hover:scale-110 opacity-80 hover:opacity-100 hover:shadow-md'
          }`}
          title={`Switch to ${color.label} theme`}
          aria-label={`Set text color to ${color.name}`}
        >
          {currentColor === color.name && (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}