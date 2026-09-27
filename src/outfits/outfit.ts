import type { Item } from '../items';

export interface OutfitPicks {
  topId: string | null;
  bottomId: string | null;
  onePieceId: string | null;
  footwearId: string | null;
  accessoryIds: string[];
}

export interface Outfit extends OutfitPicks {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export function outfitItemIds(picks: OutfitPicks): string[] {
  return [picks.topId, picks.bottomId, picks.onePieceId, picks.footwearId, ...picks.accessoryIds].filter(
    (id): id is string => id !== null,
  );
}

export function includesWishlist(picks: OutfitPicks, items: Map<string, Item>): boolean {
  return outfitItemIds(picks).some((id) => items.get(id)?.wishlist);
}

const KEYS = ['accessoryIds', 'bottomId', 'createdAt', 'footwearId', 'id', 'name', 'onePieceId', 'topId', 'updatedAt'].join();

export function parseOutfit(value: unknown): Outfit {
  if (typeof value !== 'object' || value === null || Object.keys(value).sort().join() !== KEYS) {
    throw new Error('Malformed outfit record');
  }
  const outfit = value as Outfit;
  const optionalId = (id: unknown) => id === null || typeof id === 'string';
  const valid =
    typeof outfit.id === 'string' &&
    typeof outfit.name === 'string' &&
    outfit.name.trim() !== '' &&
    optionalId(outfit.topId) &&
    optionalId(outfit.bottomId) &&
    optionalId(outfit.onePieceId) &&
    optionalId(outfit.footwearId) &&
    Array.isArray(outfit.accessoryIds) &&
    outfit.accessoryIds.every((id) => typeof id === 'string') &&
    new Set(outfit.accessoryIds).size === outfit.accessoryIds.length &&
    (outfit.onePieceId === null || (outfit.topId === null && outfit.bottomId === null)) &&
    outfitItemIds(outfit).length > 0 &&
    Number.isInteger(outfit.createdAt) &&
    Number.isInteger(outfit.updatedAt);
  if (!valid) throw new Error('Malformed outfit record');
  return outfit;
}
