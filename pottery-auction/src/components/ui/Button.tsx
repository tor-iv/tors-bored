'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTheme } from '@/contexts/ThemeContext';

const buttonVariants = cva(
  'inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      theme: {
        handdrawn: '',
        y2k: '',
        receipt: 'font-mono uppercase tracking-wide',
      },
      intent: {
        primary: '',
        secondary: '',
        ghost: '',
        danger: '',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    compoundVariants: [
      // RECEIPT primary: [ LABEL ] bracket style
      {
        theme: 'receipt',
        intent: 'primary',
        className: [
          'receipt-btn-primary',
          'px-4 py-2 text-[0.875rem] font-semibold',
          'bg-transparent border-none text-[var(--ink)]',
          'before:content-["[_"] after:content-["_]"]',
          'hover:bg-[var(--ink)] hover:text-[var(--bg)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--ink)]',
        ].join(' '),
      },
      // RECEIPT secondary: < LABEL > angle-bracket style
      {
        theme: 'receipt',
        intent: 'secondary',
        className: [
          'px-4 py-2 text-[0.875rem] font-semibold',
          'bg-transparent border-none text-[var(--ink-muted)]',
          'before:content-["<_"] after:content-["_>"]',
          'hover:bg-[var(--ink)] hover:text-[var(--bg)]',
        ].join(' '),
      },
      // RECEIPT ghost: text only, dash underline on hover
      {
        theme: 'receipt',
        intent: 'ghost',
        className: 'px-0 py-1 text-[0.875rem] text-[var(--ink-muted)] underline-offset-4 hover:underline',
      },
      // RECEIPT danger: [ VOID ] in error red
      {
        theme: 'receipt',
        intent: 'danger',
        className: [
          'px-4 py-2 text-[0.875rem] font-semibold',
          'bg-transparent border-none text-[var(--error)]',
          'before:content-["[_"] after:content-["_]"]',
          'hover:bg-[var(--error)] hover:text-[var(--bg)]',
        ].join(' '),
      },

      // HAND-DRAWN primary: warm clay fill (rough border added via Rough.js in Phase 3)
      {
        theme: 'handdrawn',
        intent: 'primary',
        className: [
          'px-6 py-3 font-semibold text-[var(--bg)]',
          'bg-[var(--accent)] hover:bg-[var(--accent-hover)]',
          'rounded-sm active:scale-[0.98]',
          'font-[var(--font-display)]',
        ].join(' '),
      },
      {
        theme: 'handdrawn',
        intent: 'secondary',
        className: [
          'px-6 py-3 font-semibold text-[var(--accent)]',
          'bg-transparent border border-[var(--accent)]',
          'rounded-sm hover:bg-[var(--accent-light)]',
          'font-[var(--font-display)]',
        ].join(' '),
      },
      {
        theme: 'handdrawn',
        intent: 'ghost',
        className: 'px-0 py-1 text-[var(--ink)] underline-offset-4 hover:underline font-[var(--font-display)]',
      },
      {
        theme: 'handdrawn',
        intent: 'danger',
        className: [
          'px-6 py-3 font-semibold text-white',
          'bg-[var(--error)] hover:opacity-90',
          'rounded-sm font-[var(--font-display)]',
        ].join(' '),
      },

      // Y2K primary: navy active-window-title style (full Win98 bevel added in Phase 3)
      {
        theme: 'y2k',
        intent: 'primary',
        className: [
          'px-4 py-1 text-white font-bold text-[11px]',
          'bg-[#000080] hover:bg-[#0000aa]',
          'border-2 border-t-white border-l-white border-b-black border-r-black',
          'shadow-[inset_1px_1px_#dfdfdf,inset_-1px_-1px_#808080]',
          'active:border-t-black active:border-l-black active:border-b-white active:border-r-white',
          'font-[var(--font-ui,_Tahoma,_sans-serif)]',
        ].join(' '),
      },
      {
        theme: 'y2k',
        intent: 'secondary',
        className: [
          'px-4 py-1 text-[var(--ink)] font-bold text-[11px]',
          'bg-[#d4d0c8]',
          'border-2 border-t-white border-l-white border-b-black border-r-black',
          'shadow-[inset_1px_1px_#dfdfdf,inset_-1px_-1px_#808080]',
          'active:border-t-black active:border-l-black active:border-b-white active:border-r-white',
          'font-[var(--font-ui,_Tahoma,_sans-serif)]',
        ].join(' '),
      },
      {
        theme: 'y2k',
        intent: 'ghost',
        className: 'px-0 py-1 text-[#0000ff] underline font-[var(--font-ui,_Tahoma,_sans-serif)] text-[11px]',
      },
      {
        theme: 'y2k',
        intent: 'danger',
        className: [
          'px-4 py-1 text-white font-bold text-[11px]',
          'bg-[var(--error)] hover:opacity-90',
          'border-2 border-t-white border-l-white border-b-black border-r-black',
          'font-[var(--font-ui,_Tahoma,_sans-serif)]',
        ].join(' '),
      },
    ],
    defaultVariants: {
      theme: 'receipt',
      intent: 'primary',
      size: 'md',
    },
  }
);

type LegacyVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, 'theme'> {
  isLoading?: boolean;
  /** @deprecated use intent instead */
  variant?: LegacyVariant;
}

const VARIANT_TO_INTENT: Record<LegacyVariant, NonNullable<VariantProps<typeof buttonVariants>['intent']>> = {
  primary: 'primary',
  secondary: 'secondary',
  outline: 'secondary',
  ghost: 'ghost',
  danger: 'danger',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ intent, variant, size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => {
    const { theme } = useTheme();
    const resolvedIntent = intent ?? (variant ? VARIANT_TO_INTENT[variant] : 'primary');

    return (
      <button
        ref={ref}
        className={`${buttonVariants({ theme, intent: resolvedIntent, size })} ${className}`}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };
export default Button;
