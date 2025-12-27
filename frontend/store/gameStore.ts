import { create } from 'zustand';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Card {
  id: number;
  card_name: string;
  image?: string;
  mining_rate: number;
  rarity: Rarity;
  serial_number: number;
  is_listed_in_market: boolean;
}

export interface MarketListing {
  id: number;
  card_instance: Card;
  seller_name: string;
  price: number;
  currency: 'COINS' | 'GEMS' | 'FRAGMENTS';
  created_at: string;
  is_active: boolean;
}

export interface Pack {
  id: number;
  name: string;
  description: string;
  cost_currency: 'COINS' | 'GEMS';
  cost: number;
  guaranteed_rarity: Rarity;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  total_cards: number;
}

interface GameStore {
  cards: Card[];
  selectedCard: Card | null;
  marketListings: MarketListing[];
  packs: Pack[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  fetchCards: () => Promise<void>;
  selectCard: (card: Card | null) => void;
  updateCards: (cards: Card[]) => void;
  
  fetchMarketListings: () => Promise<void>;
  buyCard: (listingId: number) => Promise<void>;
  listCard: (cardId: number, price: number, currency: 'COINS' | 'GEMS' | 'FRAGMENTS') => Promise<void>;
  
  fetchPacks: () => Promise<void>;
  openPack: (packId: number) => Promise<Card[]>;
  
  fetchLeaderboard: () => Promise<void>;
  
  clearError: () => void;
}

const getAuthHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Token ${token}` } : {};
};

export const useGameStore = create<GameStore>((set) => ({
  cards: [],
  selectedCard: null,
  marketListings: [],
  packs: [],
  leaderboard: [],
  isLoading: false,
  error: null,

  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/my-cards/`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      set({ cards: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch cards' });
      throw error;
    }
  },

  selectCard: (card) => set({ selectedCard: card }),
  updateCards: (cards) => set({ cards }),

  fetchMarketListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/market/`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch marketplace');
      }

      const data = await response.json();
      set({ marketListings: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch marketplace' });
      throw error;
    }
  },

  buyCard: async (listingId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/market/buy/${listingId}/`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to buy card');
      }

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to buy card' });
      throw error;
    }
  },

  listCard: async (cardId, price, currency) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/market/list/`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ card_id: cardId, price, currency }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list card');
      }

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to list card' });
      throw error;
    }
  },

  fetchPacks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/packs/`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch packs');
      }

      const data = await response.json();
      set({ packs: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch packs' });
      throw error;
    }
  },

  openPack: async (packId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/open-pack/`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pack_id: packId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to open pack');
      }

      const data = await response.json();
      set({ isLoading: false });
      return data.cards;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to open pack' });
      throw error;
    }
  },

  fetchLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leaderboard/`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      set({ leaderboard: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch leaderboard' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
