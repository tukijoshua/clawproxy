import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      whileHover={hover ? { y: -4, boxShadow: '0 10px 30px rgba(0, 102, 255, 0.2)' } : {}}
      onClick={onClick}
      className={`bg-brand-white rounded-2xl p-6 transition-shadow ${
        onClick ? 'cursor-pointer text-left w-full' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
}
