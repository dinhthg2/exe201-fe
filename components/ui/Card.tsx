import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  onClick 
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = `bg-background rounded-xl shadow-sm border border-border ${paddingClasses[padding]}`;
  const hoverClasses = hover ? 'hover:shadow-md transition-all duration-200 cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}