import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated';
}

/**
 * Reusable card component for content containers
 * Provides consistent spacing and styling
 */
export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-gray-800 rounded-lg',
    bordered: 'bg-gray-800 rounded-lg border border-gray-700',
    elevated: 'bg-gray-800 rounded-lg shadow-lg',
  };

  const classes = `${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

  return <div className={classes}>{children}</div>;
}
