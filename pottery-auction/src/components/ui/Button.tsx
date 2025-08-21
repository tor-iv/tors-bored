import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pottery-terracotta disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-pottery-terracotta text-white hover:bg-pottery-clay',
      secondary: 'bg-pottery-sage text-white hover:bg-pottery-sage/80',
      outline: 'border border-pottery-terracotta text-pottery-terracotta hover:bg-pottery-terracotta hover:text-white',
      ghost: 'text-pottery-charcoal hover:bg-pottery-cream',
    };
    
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-8 text-base',
      lg: 'h-13 px-10 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-pottery-wheel rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;