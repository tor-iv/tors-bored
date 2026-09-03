import { type HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTheme } from '@/contexts/ThemeContext';

const cardVariants = cva('', {
  variants: {
    theme: {
      receipt:  'font-mono border border-[var(--border)] bg-[var(--bg)] p-4',
      y2k:      'border-2 border-t-white border-l-white border-b-black border-r-black bg-[var(--bg-well)] p-4',
    },
    variant: {
      default: '',
      well:    '',
    },
  },
  compoundVariants: [
    { theme: 'receipt', variant: 'well', className: 'bg-[var(--bg-well)]' },
    { theme: 'y2k',     variant: 'well', className: 'bg-[var(--bg)]' },
  ],
  defaultVariants: { theme: 'receipt', variant: 'default' },
});

interface CardProps extends HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof cardVariants>, 'theme'> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant, className = '', children, ...props }, ref) => {
    const { theme } = useTheme();
    return (
      <div ref={ref} className={`${cardVariants({ theme, variant })} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
