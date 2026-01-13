import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-brand-blue text-brand-white hover:bg-blue-600 disabled:bg-brand-gray-400',
    secondary: 'bg-brand-black text-brand-white hover:bg-brand-gray-800 disabled:bg-brand-gray-400',
    outline: 'border-2 border-brand-gray-700 text-brand-white hover:border-brand-gray-500 disabled:border-brand-gray-700 disabled:text-brand-gray-500',
    ghost: 'text-brand-gray-400 hover:text-brand-white disabled:text-brand-gray-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
