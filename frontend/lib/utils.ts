import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    COMMON: '#6b7280',
    RARE: '#3b82f6',
    EPIC: '#a855f7',
    LEGENDARY: '#f59e0b',
  };
  return colors[rarity] || '#6b7280';
}

export function getRarityGradient(rarity: string): string {
  const gradients: Record<string, string> = {
    COMMON: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    RARE: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    EPIC: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    LEGENDARY: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  };
  return gradients[rarity] || gradients.COMMON;
}

export function getCurrencyIcon(currency: string): string {
  const icons: Record<string, string> = {
    COINS: '🪙',
    GEMS: '💎',
    FRAGMENTS: '🔮',
  };
  return icons[currency] || '💰';
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
