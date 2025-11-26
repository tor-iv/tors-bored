'use client';

import { useRef, useState, useEffect } from 'react';
import { useColorToggle } from '@/contexts/ColorToggleContext';

interface DrawingCanvasProps {
  onSave?: (imageData: string) => void;
  placeholder?: string;
}

export default function DrawingCanvas({ onSave, placeholder = "Draw your idea" }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#065f46'); // emerald green (default theme)
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState<string[]>([]);
  const { getTextColorClass } = useColorToggle();

  const colors = [
    { name: 'Blue', value: '#7dd3fc' },    // sky-300 (Pastel Blue theme)
    { name: 'Green', value: '#065f46' },   // emerald-800 (default theme)
    { name: 'Purple', value: '#581c87' }   // purple-900 (Royal Purple theme)
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size (CSS pixels)
    const displayWidth = 600;
    const displayHeight = 400;
    
    // Set actual size in memory (scaled up for high-DPI)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // Scale back down using CSS
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(dpr, dpr);

    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    // Save initial state
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    setHistory(prev => [...prev, dataURL]);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Handle both mouse and touch events
    const clientX = 'clientX' in e ? e.clientX : e.touches[0]?.clientX || 0;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0]?.clientY || 0;

    return {
      x: (clientX - rect.left) * scaleX / (window.devicePixelRatio || 1),
      y: (clientY - rect.top) * scaleY / (window.devicePixelRatio || 1)
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
      // Auto-save drawing when user stops drawing
      if (onSave) {
        const canvas = canvasRef.current;
        if (canvas) {
          const dataURL = canvas.toDataURL();
          onSave(dataURL);
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with proper dimensions accounting for DPI scaling
    const displayWidth = 600;
    const displayHeight = 400;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    saveState();
  };

  const undo = () => {
    if (history.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    const img = new Image();
    img.onload = () => {
      // Clear with proper dimensions
      const displayWidth = 600;
      const displayHeight = 400;
      
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
    };
    img.src = newHistory[newHistory.length - 1];
  };


  return (
    <div className="space-y-4">
      <p className={`text-sm italic ${getTextColorClass()}`}>
        {placeholder}
      </p>
      
      {/* Canvas */}
      <div className="border border-medium-cream rounded-lg overflow-hidden bg-white shadow-sm">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block cursor-crosshair touch-none"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Tools */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Color palette */}
        <div className="flex items-center space-x-3">
          {colors.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setCurrentColor(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                currentColor === color.value
                  ? 'border-medium-dark scale-110'
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>

        {/* Brush size */}
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${getTextColorClass()}`}>Brush Size</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={undo}
            disabled={history.length <= 1}
            className={`text-xs hover:opacity-70 transition-opacity disabled:opacity-30 ${getTextColorClass()}`}
          >
            Undo
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className={`text-xs hover:opacity-70 transition-opacity ${getTextColorClass()}`}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}