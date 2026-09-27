import { db } from '../db';
import { parsePhoto, type Photo } from './photo';

export const photoTable = db.photos;

export async function putPhoto(photo: Photo): Promise<void> {
  await db.photos.add(parsePhoto(photo));
}

export async function deletePhoto(id: string): Promise<void> {
  await db.photos.delete(id);
}

export async function readPhoto(id: string): Promise<Photo | null> {
  const record = await db.photos.get(id);
  return record === undefined ? null : parsePhoto(record);
}
