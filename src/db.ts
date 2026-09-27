import Dexie, { type Table } from 'dexie';

export const db = new Dexie('closet') as Dexie & {
  items: Table<unknown, string>;
  photos: Table<unknown, string>;
  outfits: Table<unknown, string>;
};

db.version(1).stores({
  items: 'id, createdAt',
  photos: 'id',
  outfits: 'id, updatedAt',
});
