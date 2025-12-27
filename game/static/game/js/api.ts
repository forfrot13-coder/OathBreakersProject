import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { APIError, PaginatedResponse } from './types';

const API_BASE_URL = '/api';

// Get CSRF token from cookies
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

// Set auth token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('token', token);
  }
}

// Remove auth token from localStorage
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('token');
  }
}

// Circuit breaker for API calls
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

const circuit = {
  state: 'CLOSED' as CircuitState,
  failures: 0,
  openedAt: 0,
  failureThreshold: 5,
  cooldownMs: 30000,
};

function isCircuitOpen(): boolean {
  if (circuit.state !== 'OPEN') return false;
  return Date.now() - circuit.openedAt < circuit.cooldownMs;
}

function recordSuccess(): void {
  circuit.failures = 0;
  circuit.state = 'CLOSED';
}

function recordFailure(): void {
  circuit.failures += 1;
  if (circuit.failures >= circuit.failureThreshold) {
    circuit.state = 'OPEN';
    circuit.openedAt = Date.now();
  }
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isCircuitOpen()) {
      return Promise.reject({
        message: 'Circuit open: too many recent failures',
        code: 'CIRCUIT_OPEN',
      } as APIError);
    }

    const token = getAuthToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Token ${token}`;
    }

    const csrfToken = getCsrfToken();
    if (csrfToken && (config.method === 'post' || config.method === 'put' || config.method === 'patch' || config.method === 'delete')) {
      config.headers = config.headers ?? {};
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    recordSuccess();
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    if (!status || status >= 500 || status === 429) {
      recordFailure();
    }

    if (status === 401) {
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login/';
      }
    }

    return Promise.reject(error);
  }
);

// Parse error from API response
export function parseError(error: unknown): APIError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; message?: string; code?: string } | undefined;
    return {
      message: data?.detail ?? data?.message ?? error.message ?? 'An error occurred',
      code: data?.code ?? error.code ?? 'UNKNOWN_ERROR',
      details: error.response?.data as Record<string, unknown> | undefined,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

// API endpoints
export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const response = await apiClient.post<{ token: string; user: any }>('/auth/login/', { username, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await apiClient.post<{ token: string; user: any }>('/auth/register/', { username, email, password });
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout/');
  },

  // Profile
  getProfile: async () => {
    const response = await apiClient.get('/game/profile/me/');
    return response.data;
  },

  updateProfile: async (data: { username?: string; avatar_id?: number }) => {
    const response = await apiClient.patch('/game/profile/me/', data);
    return response.data;
  },

  // Mining
  claimMiningReward: async () => {
    const response = await apiClient.post('/game/mining/claim/');
    return response.data;
  },

  exchangeCurrency: async (amount: number) => {
    const response = await apiClient.post('/game/mining/exchange/', { amount });
    return response.data;
  },

  // Cards
  getMyCards: async () => {
    const response = await apiClient.get<PaginatedResponse<any>>('/game/cards/my/');
    return response.data.results;
  },

  equipCard: async (cardId: number, slot: number) => {
    const response = await apiClient.post('/game/cards/equip/', { card_id: cardId, slot });
    return response.data;
  },

  unequipCard: async (slot: number) => {
    const response = await apiClient.post('/game/cards/unequip/', { slot });
    return response.data;
  },

  // Packs
  getPacks: async () => {
    const response = await apiClient.get('/game/packs/');
    return response.data;
  },

  openPack: async (packId: number) => {
    const response = await apiClient.post('/game/packs/open/', { pack_id: packId });
    return response.data;
  },

  // Marketplace
  getMarketListings: async () => {
    const response = await apiClient.get('/game/marketplace/listings/');
    return response.data;
  },

  listCard: async (cardId: number, price: number, currency: string) => {
    const response = await apiClient.post('/game/marketplace/list/', { card_id: cardId, price, currency });
    return response.data;
  },

  buyListing: async (listingId: number) => {
    const response = await apiClient.post('/game/marketplace/buy/', { listing_id: listingId });
    return response.data;
  },

  // Leaderboard
  getLeaderboard: async () => {
    const response = await apiClient.get('/game/leaderboard/');
    return response.data;
  },

  // Avatars
  getAvatars: async () => {
    const response = await apiClient.get('/game/avatars/');
    return response.data;
  },
};

export default apiClient;
