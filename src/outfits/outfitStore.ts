import { db } from '../db';
import { itemTable, listItems, removeItemAndPhoto, type OutfitUsage } from '../items';
import { photoTable } from '../photos';
import { outfitItemIds, parseOutfit, type Outfit, type OutfitPicks } from './outfit';

export async function listOutfits(): Promise<Outfit[]> {
  const records = await db.outfits.orderBy('updatedAt').reverse().toArray();
  return records.map(parseOutfit);
}

export async function readOutfit(id: string): Promise<Outfit | null> {
  const record = await db.outfits.get(id);
  return record === undefined ? null : parseOutfit(record);
}

export async function createOutfit(name: string, picks: OutfitPicks): Promise<Outfit> {
  const now = Date.now();
  const outfit = parseOutfit({ ...picks, id: crypto.randomUUID(), name, createdAt: now, updatedAt: now });
  await db.outfits.add(outfit);
  return outfit;
}

export async function updateOutfit(id: string, change: Partial<OutfitPicks> & { name?: string }): Promise<void> {
  await db.transaction('rw', db.outfits, async () => {
    const outfit = await readOutfit(id);
    if (!outfit) throw new Error(`Outfit ${id} does not exist`);
    await db.outfits.put(parseOutfit({ ...outfit, ...change, updatedAt: Date.now() }));
  });
}

export async function deleteOutfit(id: string): Promise<void> {
  await db.outfits.delete(id);
}

export async function outfitUsage(itemId: string): Promise<OutfitUsage> {
  const affected = await outfitsEmptiedBy(itemId);
  return { usedIn: affected.using.length, removedOnDelete: affected.emptied.length };
}

export async function deleteItem(itemId: string): Promise<void> {
  await db.transaction('rw', itemTable, photoTable, db.outfits, async () => {
    const { emptied } = await outfitsEmptiedBy(itemId);
    await removeItemAndPhoto(itemId);
    await db.outfits.bulkDelete(emptied.map((outfit) => outfit.id));
  });
}

async function outfitsEmptiedBy(itemId: string): Promise<{ using: Outfit[]; emptied: Outfit[] }> {
  const outfits = await listOutfits();
  const items = await listItems();
  const existing = new Set(items.map((item) => item.id));
  const using = outfits.filter((outfit) => outfitItemIds(outfit).includes(itemId));
  const emptied = using.filter((outfit) =>
    outfitItemIds(outfit).every((id) => id === itemId || !existing.has(id)),
  );
  return { using, emptied };
}
