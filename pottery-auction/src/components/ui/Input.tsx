'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const { theme } = useTheme();

    if (theme === 'receipt') {
      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={id}
              className="block mb-1 text-[0.6875rem] uppercase tracking-wide"
              style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}
            >
              {label}:
            </label>
          )}
          <input
            ref={ref}
            id={id}
            className={`receipt-input ${className}`}
            {...props}
          />
          {error && (
            <p className="mt-1 text-[0.6875rem]" style={{ color: 'var(--error)' }}>
              {error}
            </p>
          )}
        </div>
      );
    }

    if (theme === 'handdrawn') {
      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={id}
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                color: 'var(--ink-muted)',
              }}
            >
              {label}
            </label>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full bg-transparent py-2 border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none text-[var(--ink)] ${className}`}
            style={{ fontFamily: 'var(--font-body)', fontSize: '1rem' }}
            {...props}
          />
          {error && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--error)', marginTop: '0.25rem' }}>
              {error}
            </p>
          )}
        </div>
      );
    }

    if (theme === 'y2k') {
      return (
        <div className="w-full">
          {label && (
            <label htmlFor={id} style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', color: 'var(--ink)', display: 'block', marginBottom: 2 }}>
              {label}
            </label>
          )}
          <input
            ref={ref}
            id={id}
            className={`win98-text-field w-full ${className}`}
            {...props}
          />
          {error && <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', color: 'var(--error)', marginTop: 2 }}>{error}</p>}
        </div>
      );
    }

    // Generic fallback
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block mb-1 text-sm font-medium"
            style={{ color: 'var(--ink)', fontFamily: 'var(--font-body)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
