export const Rarity = {
  COMMON: 'COMMON',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY',
} as const;

export type Rarity = (typeof Rarity)[keyof typeof Rarity];

export const Currency = {
  COINS: 'COINS',
  GEMS: 'GEMS',
  FRAGMENTS: 'FRAGMENTS',
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];

export const SlotType = {
  HEAD: 'HEAD',
  CHEST: 'CHEST',
  HANDS: 'HANDS',
  LEGS: 'LEGS',
  WEAPON: 'WEAPON',
  ACCESSORY: 'ACCESSORY',
} as const;

export type SlotType = (typeof SlotType)[keyof typeof SlotType];

export const EquipmentType = {
  PICKAXE: 'PICKAXE',
  ARMOR: 'ARMOR',
  RING: 'RING',
  AMULET: 'AMULET',
  OTHER: 'OTHER',
} as const;

export type EquipmentType = (typeof EquipmentType)[keyof typeof EquipmentType];

export interface Avatar {
  id: number;
  name: string;
  image_url: string;
  description?: string;
}

export interface UserProfile {
  coins: number;
  gems: number;
  vow_fragments: number;
  level: number;
  current_mining_rate: number;
  avatar_url?: string;
  xp?: number;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  profile: UserProfile;
}

export interface Card {
  id: number;
  card_name: string;
  image?: string | null;
  mining_rate: number;
  rarity: Rarity;
  description?: string;
}

export interface CardInstance {
  id: number;
  card_name: string;
  image?: string | null;
  mining_rate: number;
  rarity: Rarity;
  serial_number: number;
  is_listed_in_market: boolean;
  card_template_id?: number;
  equipment?: Equipment[];
}

export interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  slot: SlotType;
  rarity: Rarity;
  level?: number;
  bonus_mining_rate?: number;
  bonus_xp_rate?: number;
}

export interface Pack {
  id: number;
  name: string;
  description: string;
  cost_currency: 'COINS' | 'GEMS';
  cost: number;
  guaranteed_rarity: Rarity;
}

export interface MarketListing {
  id: number;
  card_instance: CardInstance;
  seller_name: string;
  price: number;
  currency: Currency;
  created_at: string;
  is_active: boolean;
}

export type TransactionType = 'BUY' | 'SELL' | 'CLAIM' | 'OPEN_PACK' | 'EXCHANGE' | 'LIST';

export interface Transaction {
  id: string;
  type: TransactionType;
  created_at: string;
  description?: string;
  amount?: number;
  currency?: Currency;
  meta?: Record<string, unknown>;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  total_cards: number;
}

export interface GameState {
  cards: CardInstance[];
  marketListings: MarketListing[];
  packs: Pack[];
  leaderboard: LeaderboardEntry[];
  selectedCard: CardInstance | null;
}

export interface GameError {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export type ErrorFieldMap = Record<string, string[] | string>;

export interface ApiErrorResponse {
  error?: string;
  detail?: string;
  message?: string;
  non_field_errors?: string[];
  errors?: ErrorFieldMap;
  [key: string]: unknown;
}

export interface AuthResponse {
  token: string;
  user: User;
}
