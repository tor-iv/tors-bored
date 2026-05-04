'use client';
import type { ReactNode, HTMLAttributes } from 'react';

interface Win98WindowProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  controls?: Array<'minimize' | 'maximize' | 'close'>;
}

export default function Win98Window({
  title,
  icon,
  children,
  className = '',
  onClose,
  controls = ['close'],
  ...rest
}: Win98WindowProps) {
  return (
    <div className={`win98-window ${className}`} {...rest}>
      <div className="win98-title-bar">
        {icon && <img src={icon} width="16" height="16" alt="" aria-hidden="true" />}
        <span className="win98-title-bar-text">{title}</span>
        <div className="win98-title-bar-controls">
          {controls.includes('minimize') && (
            <button aria-label="Minimize">_</button>
          )}
          {controls.includes('maximize') && (
            <button aria-label="Maximize">□</button>
          )}
          {controls.includes('close') && (
            <button onClick={onClose} aria-label="Close">✕</button>
          )}
        </div>
      </div>
      <div className="win98-window-body">
        {children}
      </div>
    </div>
  );
}
