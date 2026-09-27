import { db } from '../db';
import { deletePhoto, photoTable, putPhoto, type Photo } from '../photos';
import { parseItem, type Item, type ItemFields } from './item';

export const itemTable = db.items;

export async function listItems(): Promise<Item[]> {
  const records = await db.items.orderBy('createdAt').reverse().toArray();
  return records.map(parseItem);
}

export async function readItem(id: string): Promise<Item | null> {
  const record = await db.items.get(id);
  return record === undefined ? null : parseItem(record);
}

export async function addItem(fields: ItemFields, photo: Photo): Promise<Item> {
  const now = Date.now();
  const item = parseItem({ ...fields, id: crypto.randomUUID(), photoId: photo.id, createdAt: now, updatedAt: now });
  await db.transaction('rw', db.items, photoTable, async () => {
    await putPhoto(photo);
    await db.items.add(item);
  });
  return item;
}

export async function updateItemFields(id: string, fields: Omit<ItemFields, 'wishlist'>): Promise<void> {
  await changeItem(id, (item) => ({ ...item, ...fields }));
}

export async function setWishlist(id: string, wishlist: boolean): Promise<void> {
  await changeItem(id, (item) => ({ ...item, wishlist }));
}

export async function replaceItemPhoto(id: string, photo: Photo): Promise<void> {
  await db.transaction('rw', db.items, photoTable, async () => {
    const old = await requireItem(id);
    await putPhoto(photo);
    await db.items.put(parseItem({ ...old, photoId: photo.id, updatedAt: Date.now() }));
    await deletePhoto(old.photoId);
  });
}

/** Removes the item and its photo. Must run inside the caller's transaction that also cleans up outfits. */
export async function removeItemAndPhoto(id: string): Promise<void> {
  const item = await requireItem(id);
  await db.items.delete(id);
  await deletePhoto(item.photoId);
}

async function changeItem(id: string, change: (item: Item) => Item): Promise<void> {
  await db.transaction('rw', db.items, async () => {
    const item = await requireItem(id);
    await db.items.put(parseItem({ ...change(item), updatedAt: Date.now() }));
  });
}

async function requireItem(id: string): Promise<Item> {
  const item = await readItem(id);
  if (!item) throw new Error(`Item ${id} does not exist`);
  return item;
}
