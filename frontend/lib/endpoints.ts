export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const endpoints = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    refresh: '/auth/refresh/',
    me: '/profile/',
  },
  profile: {
    me: '/profile/',
    claim: '/claim/',
  },
  cards: {
    myCards: '/my-cards/',
  },
  market: {
    list: '/market/list/',
    listings: '/market/',
    buy: (listingId: number) => `/market/buy/${listingId}/`,
  },
  packs: {
    list: '/packs/',
    open: '/open-pack/',
  },
  leaderboard: {
    list: '/leaderboard/',
  },
} as const;

export function buildApiUrl(path: string): string {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}
