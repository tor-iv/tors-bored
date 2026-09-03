'use client';
import { useEffect } from 'react';

export default function CursorTrail() {
  useEffect(() => {
    // Only activate on pointer-fine (desktop) devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const COUNT = 8;
    const positions = Array.from({ length: COUNT }, () => ({ x: 0, y: 0 }));
    const dotElements: HTMLDivElement[] = [];

    for (let i = 0; i < COUNT; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = [
        'width: 6px',
        'height: 6px',
        'border-radius: 50%',
        'background: var(--accent, #000080)',
        'position: fixed',
        'pointer-events: none',
        'z-index: 9999',
        'left: 0',
        'top: 0',
      ].join(';');
      document.body.appendChild(dot);
      dotElements.push(dot);
    }

    const onMouseMove = (e: MouseEvent) => {
      positions[0] = { x: e.clientX, y: e.clientY };
    };

    let animFrameId: number;

    const animate = () => {
      for (let i = 1; i < COUNT; i++) {
        positions[i] = {
          x: positions[i].x + (positions[i - 1].x - positions[i].x) * 0.3,
          y: positions[i].y + (positions[i - 1].y - positions[i].y) * 0.3,
        };
      }
      dotElements.forEach((dot, i) => {
        dot.style.left = `${positions[i].x - 3}px`;
        dot.style.top = `${positions[i].y - 3}px`;
        dot.style.opacity = String((COUNT - i) / COUNT);
      });
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(animFrameId);
      document.removeEventListener('mousemove', onMouseMove);
      dotElements.forEach((dot) => dot.remove());
    };
  }, []);

  return null;
}
