import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const theme = {
  colors: {
    primary: '#e58e26',
    background: '#121110',
    surface: '#1c1b18',
    border: '#2d2b27',
    textPrimary: '#ffffff',
    textSecondary: '#bab4ab',
    textMuted: '#78736c',
    danger: '#c93434',
    success: '#629924',
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '18px',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  style = {},
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.2s',
    fontFamily: 'var(--sans)',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: '#161512',
      boxShadow: '0 0 20px rgba(229, 142, 38, 0.25)',
    },
    secondary: {
      backgroundColor: theme.colors.background,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.border}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.textSecondary,
      border: `1px solid ${theme.colors.border}`,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: '#ffffff',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '8px 16px',
      fontSize: '13px',
      borderRadius: theme.borderRadius.sm,
    },
    md: {
      padding: '12px 24px',
      fontSize: '15px',
      borderRadius: theme.borderRadius.md,
    },
    lg: {
      padding: '14px 28px',
      fontSize: '16px',
      borderRadius: theme.borderRadius.md,
    },
  };

  const combinedStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;