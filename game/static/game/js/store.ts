import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, UserProfile, CardInstance, Pack, MarketListing, LeaderboardEntry, Avatar, Notification } from './types';
import { api, parseError } from './api';

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.login(username, password);
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const parsedError = parseError(error);
          set({ error: parsedError.message, isLoading: false });
          throw parsedError;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            error: null,
          });
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.register(username, email, password);
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const parsedError = parseError(error);
          set({ error: parsedError.message, isLoading: false });
          throw parsedError;
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        set({ isLoading: true });
        try {
          const profile = await api.getProfile();
          set({
            isAuthenticated: true,
            user: { id: 0, username: profile.username || '', profile },
            token,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

interface GameStore {
  profile: UserProfile | null;
  cards: CardInstance[];
  packs: Pack[];
  marketListings: MarketListing[];
  leaderboard: LeaderboardEntry[];
  avatars: Avatar[];
  selectedCard: CardInstance | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  fetchCards: () => Promise<void>;
  fetchPacks: () => Promise<void>;
  fetchMarketListings: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchAvatars: () => Promise<void>;
  equipCard: (cardId: number, slot: number) => Promise<void>;
  unequipCard: (slot: number) => Promise<void>;
  openPack: (packId: number) => Promise<void>;
  listCard: (cardId: number, price: number, currency: string) => Promise<void>;
  buyListing: (listingId: number) => Promise<void>;
  updateProfile: (data: { username?: string; avatar_id?: number }) => Promise<void>;
  claimMiningReward: () => Promise<void>;
  exchangeCurrency: (amount: number) => Promise<void>;
  setSelectedCard: (card: CardInstance | null) => void;
  clearError: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  profile: null,
  cards: [],
  packs: [],
  marketListings: [],
  leaderboard: [],
  avatars: [],
  selectedCard: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const cards = await api.getMyCards();
      set({ cards, isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  fetchPacks: async () => {
    set({ isLoading: true, error: null });
    try {
      const packs = await api.getPacks();
      set({ packs, isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  fetchMarketListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const listings = await api.getMarketListings();
      set({ marketListings: listings, isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  fetchLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const leaderboard = await api.getLeaderboard();
      set({ leaderboard, isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  fetchAvatars: async () => {
    set({ isLoading: true, error: null });
    try {
      const avatars = await api.getAvatars();
      set({ avatars, isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  equipCard: async (cardId: number, slot: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.equipCard(cardId, slot);
      await Promise.all([api.getProfile(), api.getMyCards()]);
      set({ isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  unequipCard: async (slot: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.unequipCard(slot);
      await Promise.all([api.getProfile(), api.getMyCards()]);
      set({ isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  openPack: async (packId: number) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.openPack(packId);
      await Promise.all([api.getProfile(), api.getMyCards()]);
      set({ isLoading: false });
      return result;
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  listCard: async (cardId: number, price: number, currency: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.listCard(cardId, price, currency);
      await Promise.all([api.getMyCards(), api.getMarketListings()]);
      set({ isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  buyListing: async (listingId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.buyListing(listingId);
      await Promise.all([api.getProfile(), api.getMyCards(), api.getMarketListings()]);
      set({ isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  updateProfile: async (data: { username?: string; avatar_id?: number }) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.updateProfile(data);
      set({ profile, isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  claimMiningReward: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.claimMiningReward();
      const profile = await api.getProfile();
      set({ profile, isLoading: false });
      return result;
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  exchangeCurrency: async (amount: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.exchangeCurrency(amount);
      const profile = await api.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      const parsedError = parseError(error);
      set({ error: parsedError.message, isLoading: false });
      throw parsedError;
    }
  },

  setSelectedCard: (card: CardInstance | null) => set({ selectedCard: card }),

  clearError: () => set({ error: null }),
}));

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    const duration = notification.duration || 3000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, duration);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));
