import { User, CardInstance, MarketListing, Pack, UserProfile } from './types';

export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value &&
    'profile' in value
  );
};

export const isCard = (value: unknown): value is CardInstance => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'card_name' in value &&
    'rarity' in value
  );
};

export const isMarketListing = (value: unknown): value is MarketListing => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'card_instance' in value &&
    'price' in value
  );
};

export const isPack = (value: unknown): value is Pack => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'cost' in value
  );
};

export const isUserProfile = (value: unknown): value is UserProfile => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'coins' in value &&
    'gems' in value &&
    'vow_fragments' in value &&
    'level' in value
  );
};

export const isNonEmptyArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

export const isErrorWithMessage = (value: unknown): value is { message: string } => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
};