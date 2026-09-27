export const SLOTS = ['top', 'bottom', 'onepiece', 'footwear', 'accessory'] as const;
export type Slot = (typeof SLOTS)[number];

export const SLOT_LABELS: Record<Slot, { one: string; many: string }> = {
  top: { one: 'Top', many: 'Tops' },
  bottom: { one: 'Bottom', many: 'Bottoms' },
  onepiece: { one: 'One-piece', many: 'One-piece' },
  footwear: { one: 'Footwear', many: 'Footwear' },
  accessory: { one: 'Accessory', many: 'Accessories' },
};

export const STYLES = ['western', 'traditional'] as const;
export type StyleTag = (typeof STYLES)[number];

export const STYLE_LABELS: Record<StyleTag, string> = { western: 'Western', traditional: 'Traditional' };

export const COLORS = [
  'white', 'off-white', 'black', 'grey', 'beige', 'brown', 'red', 'maroon', 'pink',
  'orange', 'yellow', 'gold', 'silver', 'green', 'blue', 'navy', 'purple', 'multicolor',
] as const;
export type Color = (typeof COLORS)[number];

export interface ItemFields {
  name: string;
  slot: Slot;
  style: StyleTag;
  color: Color | null;
  notes: string | null;
  wishlist: boolean;
}

export interface Item extends ItemFields {
  id: string;
  photoId: string;
  createdAt: number;
  updatedAt: number;
}

const KEYS = ['color', 'createdAt', 'id', 'name', 'notes', 'photoId', 'slot', 'style', 'updatedAt', 'wishlist'].join();

export function parseItem(value: unknown): Item {
  if (typeof value !== 'object' || value === null || Object.keys(value).sort().join() !== KEYS) {
    throw new Error('Malformed item record');
  }
  const item = value as Item;
  const valid =
    typeof item.id === 'string' &&
    typeof item.photoId === 'string' &&
    typeof item.name === 'string' &&
    item.name.trim() !== '' &&
    SLOTS.includes(item.slot) &&
    STYLES.includes(item.style) &&
    (item.color === null || COLORS.includes(item.color)) &&
    (item.notes === null || (typeof item.notes === 'string' && item.notes.trim() !== '')) &&
    typeof item.wishlist === 'boolean' &&
    Number.isInteger(item.createdAt) &&
    Number.isInteger(item.updatedAt);
  if (!valid) throw new Error('Malformed item record');
  return item;
}
