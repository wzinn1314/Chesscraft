import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
}

const theme = {
  colors: {
    background: '#121110',
    surface: '#1c1b18',
    border: '#2d2b27',
    borderLight: '#3d3a34',
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '18px',
  },
  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.3)',
    elevated: '0 8px 30px rgba(0, 0, 0, 0.4)',
  },
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style = {},
  variant = 'default',
  padding = 'md',
}) => {
  const baseStyles: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      border: `1px solid ${theme.colors.border}`,
    },
    elevated: {
      boxShadow: theme.shadows.elevated,
      border: `1px solid ${theme.colors.borderLight}`,
    },
    bordered: {
      border: `2px solid ${theme.colors.borderLight}`,
    },
  };

  const paddingStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '16px' },
    md: { padding: '24px' },
    lg: { padding: '32px' },
  };

  const combinedStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...style,
  };

  return (
    <div className={`card ${className}`} style={combinedStyle}>
      {children}
    </div>
  );
};

export default Card;