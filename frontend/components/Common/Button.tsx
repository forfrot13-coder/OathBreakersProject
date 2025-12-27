'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;

  tooltip?: string;
  ariaLabel?: string;

  /** Example: "Ctrl+Enter" or "Escape" */
  shortcut?: string;
}

function matchesShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const normalized = shortcut
    .split('+')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const key = normalized[normalized.length - 1];
  const needCtrl = normalized.includes('ctrl') || normalized.includes('control');
  const needAlt = normalized.includes('alt');
  const needShift = normalized.includes('shift');
  const needMeta = normalized.includes('meta') || normalized.includes('cmd') || normalized.includes('command');

  if (needCtrl !== e.ctrlKey) return false;
  if (needAlt !== e.altKey) return false;
  if (needShift !== e.shiftKey) return false;
  if (needMeta !== e.metaKey) return false;

  return e.key.toLowerCase() === key;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  loadingText = 'درحال انجام...',
  type = 'button',
  className = '',
  tooltip,
  ariaLabel,
  shortcut,
}: ButtonProps) {
  useEffect(() => {
    if (!shortcut || !onClick) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      if (isTyping) return;

      if (disabled || loading) return;

      if (matchesShortcut(e, shortcut)) {
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcut, onClick, disabled, loading]);

  const baseStyles =
    'font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles: Record<Variant, string> = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600',
    ghost: 'bg-transparent hover:bg-tertiary text-primary focus:ring-primary',
  };

  const sizeStyles: Record<Size, string> = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[44px]',
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], loading ? 'cursor-wait' : 'cursor-pointer', className)}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      title={tooltip}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full spin" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
