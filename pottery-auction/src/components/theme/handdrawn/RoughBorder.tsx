'use client';

import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import rough from 'roughjs';

interface RoughBorderProps {
  children: ReactNode;
  roughness?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  fill?: string;
  style?: CSSProperties;
}

export default function RoughBorder({
  children,
  roughness = 1.5,
  stroke = 'var(--ink)',
  strokeWidth = 2,
  className = '',
  fill = 'none',
  style,
}: RoughBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 480);
    checkMobile(); // initial
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    function drawBorder() {
      const container = containerRef.current;
      const svg = svgRef.current;
      if (!container || !svg) return;

      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      // Update SVG dimensions
      svg.setAttribute('width', String(width));
      svg.setAttribute('height', String(height));
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      // Clear previous drawing
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Resolve CSS var stroke color
      const resolvedStroke = stroke.startsWith('var(')
        ? getComputedStyle(document.documentElement).getPropertyValue(
            stroke.replace('var(', '').replace(')', '').trim()
          ).trim() || '#1b1211'
        : stroke;

      const rc = rough.svg(svg);
      const padding = strokeWidth;
      const node = rc.rectangle(
        padding,
        padding,
        width - padding * 2,
        height - padding * 2,
        {
          roughness,
          stroke: resolvedStroke,
          strokeWidth,
          fill,
          fillStyle: 'solid',
        }
      );
      svg.appendChild(node);
    }

    function debouncedDraw() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(drawBorder, 150);
    }

    // Initial draw
    drawBorder();

    // Watch for size changes
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observerRef.current = new ResizeObserver(debouncedDraw);
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isMobile, roughness, stroke, strokeWidth, fill]);

  if (isMobile) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          border: `${strokeWidth}px dashed ${stroke}`,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 1,
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
