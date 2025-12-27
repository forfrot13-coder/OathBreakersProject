import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseStyles = `
    font-semibold rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${loading ? 'cursor-wait' : 'cursor-pointer'}
  `;

  const variantStyles: Record<string, string> = {
    primary: `
      bg-primary hover:bg-primary-dark
      text-white
      focus:ring-primary
    `,
    secondary: `
      bg-secondary hover:bg-secondary-dark
      text-white
      focus:ring-secondary
    `,
    danger: `
      bg-red-600 hover:bg-red-700
      text-white
      focus:ring-red-600
    `,
    success: `
      bg-green-600 hover:bg-green-700
      text-white
      focus:ring-green-600
    `,
    ghost: `
      bg-transparent hover:bg-tertiary
      text-primary
      focus:ring-primary
    `,
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full spin" />
          <span>درحال انجام...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
