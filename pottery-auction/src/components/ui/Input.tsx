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

    // Handdrawn / Y2K: shared generic style using tokens
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
