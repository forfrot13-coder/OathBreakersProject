import type { Rarity, Currency } from './types';

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('fa-IR');
}

// Format currency amount
export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    COINS: '🪙',
    GEMS: '💎',
    FRAGMENTS: '💫',
  };
  return `${symbols[currency]} ${formatNumber(amount)}`;
}

// Get rarity color class
export function getRarityClass(rarity: Rarity): string {
  const classes: Record<Rarity, string> = {
    COMMON: 'rarity-common',
    RARE: 'rarity-rare',
    EPIC: 'rarity-epic',
    LEGENDARY: 'rarity-legendary',
  };
  return classes[rarity];
}

// Get rarity border color
export function getRarityBorderColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    COMMON: 'border-gray-500',
    RARE: 'border-blue-500',
    EPIC: 'border-purple-500',
    LEGENDARY: 'border-amber-500',
  };
  return colors[rarity];
}

// Get rarity glow effect
export function getRarityGlow(rarity: Rarity): string {
  const glows: Record<Rarity, string> = {
    COMMON: 'shadow-gray-500/20',
    RARE: 'shadow-blue-500/30',
    EPIC: 'shadow-purple-500/30',
    LEGENDARY: 'shadow-amber-500/40',
  };
  return glows[rarity];
}

// Format time since
export function formatTimeSince(date: string | Date): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'همین حالا';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} دقیقه پیش`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ساعت پیش`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} روز پیش`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ماه پیش`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} سال پیش`;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// Calculate progress percentage
export function calculateProgress(current: number, max: number): number {
  return Math.min((current / max) * 100, 100);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate username (3-20 characters, alphanumeric and underscores only)
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

// Validate password (min 8 characters)
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Get random item from array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Parse card rarity from API response
export function parseRarity(rarity: string): Rarity {
  const upperRarity = rarity.toUpperCase();
  if (['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(upperRarity)) {
    return upperRarity as Rarity;
  }
  return 'COMMON';
}

// Calculate mining time for reward
export function calculateMiningTime(miningRate: number): number {
  // Base: 1000 coins per hour at rate 1
  const baseRate = 1000;
  const hourlyRate = baseRate * miningRate;
  const minutesPerCoin = 60 / hourlyRate;
  return Math.round(minutesPerCoin);
}

// Format mining time display
export function formatMiningTime(miningRate: number): string {
  const minutesPerCoin = calculateMiningTime(miningRate);
  if (minutesPerCoin < 1) {
    const coinsPerMinute = Math.round(1000 / calculateMiningTime(1 / miningRate));
    return `~${coinsPerCoin} سکه/دقیقه`;
  }
  return `~${minutesPerCoin} دقیقه/سکه`;
}

// Clamp number between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Lerp between two values
export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    return fallback;
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

// Get current page from URL
export function getCurrentPage(): string {
  return window.location.pathname;
}

// Check if user is on mobile
export function isMobile(): boolean {
  return window.innerWidth < 768;
}

// Check if user prefers dark mode
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Format XP progress
export function formatXPProgress(currentXP: number, nextLevelXP: number): string {
  return `${formatNumber(currentXP)} / ${formatNumber(nextLevelXP)} XP`;
}

// Calculate level progress percentage
export function calculateLevelProgress(currentXP: number, nextLevelXP: number): number {
  return calculateProgress(currentXP, nextLevelXP);
}

// Persian number converter
export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}
