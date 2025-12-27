'use client';

import { create } from 'zustand';
import { apiFetchJson } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import type {
  CardInstance,
  Currency,
  LeaderboardEntry,
  MarketListing,
  Pack,
  Rarity,
  Transaction,
} from '@/lib/types';

export type { Currency, LeaderboardEntry, MarketListing, Pack, Rarity };
export type Card = CardInstance;

interface GameError {
  code: 'INSUFFICIENT_BALANCE' | 'CARD_NOT_FOUND' | 'SERVER_ERROR' | 'NETWORK_ERROR';
  message: string;
}

interface GameStore {
  cards: CardInstance[];
  selectedCard: CardInstance | null;
  marketListings: MarketListing[];
  packs: Pack[];
  leaderboard: LeaderboardEntry[];

  transactions: Transaction[];
  past: CardInstance[][];
  future: CardInstance[][];

  isLoading: boolean;
  error: GameError | null;
  isOnline: boolean;

  fetchCards: () => Promise<void>;
  selectCard: (card: CardInstance | null) => void;
  updateCards: (cards: CardInstance[]) => void;

  fetchMarketListings: (options?: { force?: boolean }) => Promise<void>;
  buyCard: (listingId: number) => Promise<void>;
  listCard: (cardId: number, price: number, currency: Currency) => Promise<void>;

  fetchPacks: () => Promise<void>;
  openPack: (packId: number) => Promise<CardInstance[]>;

  fetchLeaderboard: () => Promise<void>;

  undo: () => void;
  redo: () => void;

  hydrateFromCache: () => void;
  clearError: () => void;
}

const STORAGE = {
  cards: 'cache:cards:v1',
  market: 'cache:market:v1',
  packs: 'cache:packs:v1',
  leaderboard: 'cache:leaderboard:v1',
  tx: 'cache:tx:v1',
} as const;

const MARKET_TTL_MS = 60_000;
const HISTORY_LIMIT = 20;

function readCache<T>(key: string): { data: T; storedAt: number } | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { data: T; storedAt: number };
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify({ data, storedAt: Date.now() }));
}

function addTx(tx: Omit<Transaction, 'id' | 'created_at'>): Transaction {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: new Date().toISOString(),
    ...tx,
  };
}

export const useGameStore = create<GameStore>((set, get) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => set({ isOnline: true }));
    window.addEventListener('offline', () => set({ isOnline: false }));
  }

  return {
    cards: [],
    selectedCard: null,
    marketListings: [],
    packs: [],
    leaderboard: [],
    transactions: [],
    past: [],
    future: [],

    isLoading: false,
    error: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

    hydrateFromCache: () => {
      const cachedCards = readCache<CardInstance[]>(STORAGE.cards);
      const cachedMarket = readCache<MarketListing[]>(STORAGE.market);
      const cachedPacks = readCache<Pack[]>(STORAGE.packs);
      const cachedLeaderboard = readCache<LeaderboardEntry[]>(STORAGE.leaderboard);
      const cachedTx = readCache<Transaction[]>(STORAGE.tx);

      set({
        cards: cachedCards?.data ?? get().cards,
        marketListings: cachedMarket?.data ?? get().marketListings,
        packs: cachedPacks?.data ?? get().packs,
        leaderboard: cachedLeaderboard?.data ?? get().leaderboard,
        transactions: cachedTx?.data ?? get().transactions,
      });
    },

    fetchCards: async () => {
      set({ isLoading: true, error: null });

      try {
        const data = await apiFetchJson<CardInstance[]>(endpoints.cards.myCards, {
          useCache: true,
          cacheStorage: 'localStorage',
          cacheTtlMs: 10_000,
        });

        set({ cards: data, isLoading: false });
        writeCache(STORAGE.cards, data);
      } catch (err) {
        set({
         isLoading: false,
         error: {
           code: 'SERVER_ERROR',
           message: err instanceof Error ? err.message : 'Failed to fetch cards'
         }
        });
        throw err;
      }
    },

    selectCard: (card) => set({ selectedCard: card }),

    updateCards: (cards) => {
      set((state) => {
        const nextPast = [...state.past, state.cards].slice(-HISTORY_LIMIT);

        writeCache(STORAGE.cards, cards);

        return {
          cards,
          past: nextPast,
          future: [],
        };
      });
    },

    fetchMarketListings: async (options) => {
      const cached = readCache<MarketListing[]>(STORAGE.market);
      const isFresh = cached ? Date.now() - cached.storedAt < MARKET_TTL_MS : false;

      if (!options?.force && isFresh) {
        set({ marketListings: cached!.data });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const data = await apiFetchJson<MarketListing[]>(endpoints.market.listings, {
          useCache: true,
          cacheStorage: 'localStorage',
          cacheTtlMs: MARKET_TTL_MS,
        });

        set({ marketListings: data, isLoading: false });
        writeCache(STORAGE.market, data);
      } catch (err) {
        set({
         isLoading: false,
         error: {
           code: 'SERVER_ERROR',
           message: err instanceof Error ? err.message : 'Failed to fetch marketplace'
         }
        });
        throw err;
      }
    },

    buyCard: async (listingId) => {
      set({ isLoading: true, error: null });
      try {
        await apiFetchJson<{ success?: boolean }>(endpoints.market.buy(listingId), {
          method: 'POST',
        });

        set((state) => ({
          isLoading: false,
          transactions: [
            addTx({ type: 'BUY', description: `Buy listing #${listingId}` }),
            ...state.transactions,
          ].slice(0, 100),
        }));

        writeCache(STORAGE.tx, get().transactions);
      } catch (err) {
        set({
         isLoading: false,
         error: {
           code: 'INSUFFICIENT_BALANCE',
           message: err instanceof Error ? err.message : 'Failed to buy card'
         }
        });
        throw err;
      }
    },

    listCard: async (cardId, price, currency) => {
      set({ isLoading: true, error: null });
      try {
        await apiFetchJson<{ success?: boolean }>(endpoints.market.list, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card_id: cardId, price, currency }),
        });

        set((state) => ({
          isLoading: false,
          transactions: [
            addTx({
              type: 'LIST',
              description: `List card #${cardId} for ${price} ${currency}`,
              amount: price,
              currency,
            }),
            ...state.transactions,
          ].slice(0, 100),
        }));

        writeCache(STORAGE.tx, get().transactions);
      } catch (err) {
        set({
         isLoading: false,
         error: {
           code: 'CARD_NOT_FOUND',
           message: err instanceof Error ? err.message : 'Failed to list card'
         }
        });
        throw err;
      }
    },

    fetchPacks: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiFetchJson<Pack[]>(endpoints.packs.list, {
          useCache: true,
          cacheStorage: 'localStorage',
          cacheTtlMs: 60_000,
        });
        set({ packs: data, isLoading: false });
        writeCache(STORAGE.packs, data);
      } catch (err) {
        set({
         isLoading: false,
         error: {
           code: 'SERVER_ERROR',
           message: err instanceof Error ? err.message : 'Failed to fetch packs'
         }
        });
        throw err;
      }
    },

    openPack: async (packId) => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiFetchJson<{ cards: CardInstance[] }>(endpoints.packs.open, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack_id: packId }),
        });

        set((state) => ({
          isLoading: false,
          transactions: [
            addTx({ type: 'OPEN_PACK', description: `Open pack #${packId}` }),
            ...state.transactions,
          ].slice(0, 100),
        }));
        writeCache(STORAGE.tx, get().transactions);

        return data.cards;
      } catch (err) {
        set({
         isLoading: false,
         error: {
           code: 'SERVER_ERROR',
           message: err instanceof Error ? err.message : 'Failed to open pack'
         }
        });
        throw err;
      }
    },

    fetchLeaderboard: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await apiFetchJson<LeaderboardEntry[]>(endpoints.leaderboard.list, {
          useCache: true,
          cacheStorage: 'localStorage',
          cacheTtlMs: 60_000,
        });
        set({ leaderboard: data, isLoading: false });
        writeCache(STORAGE.leaderboard, data);
      } catch (err) {
        set({
         isLoading: false,
         error: {
           code: 'SERVER_ERROR',
           message: err instanceof Error ? err.message : 'Failed to fetch leaderboard'
         }
        });
        throw err;
      }
    },

    undo: () => {
      set((state) => {
        if (state.past.length === 0) return state;

        const previous = state.past[state.past.length - 1];
        const nextPast = state.past.slice(0, -1);
        const nextFuture = [state.cards, ...state.future].slice(0, HISTORY_LIMIT);

        writeCache(STORAGE.cards, previous);

        return {
          ...state,
          cards: previous,
          past: nextPast,
          future: nextFuture,
        };
      });
    },

    redo: () => {
      set((state) => {
        if (state.future.length === 0) return state;

        const next = state.future[0];
        const nextFuture = state.future.slice(1);
        const nextPast = [...state.past, state.cards].slice(-HISTORY_LIMIT);

        writeCache(STORAGE.cards, next);

        return {
          ...state,
          cards: next,
          past: nextPast,
          future: nextFuture,
        };
      });
    },

    clearError: () => set({ error: null }),
  };
});
