import { type ClassValue, clsx } from 'clsx';
import type { CardInstance, Currency, Rarity } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(
  num: number,
  options?: {
    compact?: boolean;
    locale?: string;
    maximumFractionDigits?: number;
  }
): string {
  const { compact = true, locale = 'fa-IR', maximumFractionDigits = 1 } = options ?? {};

  if (!Number.isFinite(num)) return '0';

  if (!compact) return num.toLocaleString(locale);

  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  const fmt = (value: number, suffix: string) =>
    `${sign}${value.toLocaleString(locale, { maximumFractionDigits })}${suffix}`;

  if (abs >= 1_000_000_000) return fmt(abs / 1_000_000_000, 'B');
  if (abs >= 1_000_000) return fmt(abs / 1_000_000, 'M');
  if (abs >= 1_000) return fmt(abs / 1_000, 'K');

  return `${sign}${abs.toLocaleString(locale)}`;
}

export function getRarityWeight(rarity: Rarity | string): number {
  switch (rarity) {
    case 'LEGENDARY':
      return 8;
    case 'EPIC':
      return 4;
    case 'RARE':
      return 2;
    case 'COMMON':
    default:
      return 1;
  }
}

export function calculateCardRank(card: Pick<CardInstance, 'mining_rate' | 'rarity'>): number {
  const weight = getRarityWeight(card.rarity);

  // A simple, stable score that grows with rarity and mining rate.
  // Output range is not capped to keep sorting intuitive.
  return Math.round(card.mining_rate * weight);
}

export function calculateMarketingPrice(
  card: Pick<CardInstance, 'mining_rate' | 'rarity'>,
  currency: Currency | 'COINS' | 'GEMS' | 'FRAGMENTS' = 'COINS'
): number {
  const weight = getRarityWeight(card.rarity);

  const base = card.mining_rate * weight;
  const multiplier = currency === 'GEMS' ? 0.2 : currency === 'FRAGMENTS' ? 0.5 : 10;

  return Math.max(1, Math.round(base * multiplier));
}

export function formatCurrency(
  amount: number,
  currency: Currency | 'COINS' | 'GEMS' | 'FRAGMENTS',
  options?: { compact?: boolean }
): string {
  const icon = getCurrencyIcon(currency);
  return `${icon} ${formatNumber(amount, { compact: options?.compact ?? true })}`;
}

export function getRarityColor(rarity: Rarity | string): string {
  const colors: Record<string, string> = {
    COMMON: '#9CA3AF',
    RARE: '#60A5FA',
    EPIC: '#A78BFA',
    LEGENDARY: '#FBBF24',
  };
  return colors[rarity] || '#9CA3AF';
}

export function getRarityGradient(rarity: Rarity | string): string {
  const gradients: Record<string, string> = {
    COMMON: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
    RARE: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
    EPIC: 'linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)',
    LEGENDARY: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
  };
  return gradients[rarity] || gradients.COMMON;
}

export function getCurrencyIcon(currency: Currency | string): string {
  const icons: Record<string, string> = {
    COINS: '🪙',
    GEMS: '💎',
    FRAGMENTS: '🔮',
  };
  return icons[currency] || '💰';
}

export function isValidUsername(username: string): boolean {
  const normalized = username.trim();
  if (normalized.length < 3 || normalized.length > 20) return false;

  // Allows latin/persian letters + numbers + underscore.
  // Note: Unicode property escapes require modern runtimes (supported by Next.js).
  return /^[\p{L}\p{N}_]+$/u.test(normalized);
}

export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;

  const hasLetter = /[A-Za-z\p{L}]/u.test(password);
  const hasNumber = /\d/.test(password);

  return hasLetter && hasNumber;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'همین الان';
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 30) return `${diffDays} روز پیش`;
  return date.toLocaleDateString('fa-IR');
}
