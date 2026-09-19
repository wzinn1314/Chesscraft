import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

const theme = {
  colors: {
    primary: '#e58e26',
    success: '#629924',
    danger: '#c93434',
    warning: '#e58e26',
    background: '#121110',
    surface: '#1c1b18',
    border: '#2d2b27',
    textPrimary: '#ffffff',
    textSecondary: '#bab4ab',
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '999px',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  style = {},
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 700,
    fontFamily: 'var(--sans)',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: theme.colors.background,
      color: theme.colors.textSecondary,
      border: `1px solid ${theme.colors.border}`,
    },
    primary: {
      backgroundColor: `${theme.colors.primary}20`,
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}40`,
    },
    success: {
      backgroundColor: `${theme.colors.success}20`,
      color: theme.colors.success,
      border: `1px solid ${theme.colors.success}40`,
    },
    danger: {
      backgroundColor: `${theme.colors.danger}20`,
      color: theme.colors.danger,
      border: `1px solid ${theme.colors.danger}40`,
    },
    warning: {
      backgroundColor: `${theme.colors.warning}20`,
      color: theme.colors.warning,
      border: `1px solid ${theme.colors.warning}40`,
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '4px 10px',
      fontSize: '11px',
      borderRadius: theme.borderRadius.sm,
    },
    md: {
      padding: '6px 14px',
      fontSize: '12px',
      borderRadius: theme.borderRadius.lg,
    },
  };

  const combinedStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <span className={`badge ${className}`} style={combinedStyle}>
      {children}
    </span>
  );
};

export default Badge;