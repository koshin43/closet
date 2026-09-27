export interface Photo {
  id: string;
  full: Blob;
  thumb: Blob;
  backdrop: string | null;
}

const KEYS = ['backdrop', 'full', 'id', 'thumb'].join();

export function parsePhoto(value: unknown): Photo {
  if (typeof value !== 'object' || value === null || Object.keys(value).sort().join() !== KEYS) {
    throw new Error('Malformed photo record');
  }
  const photo = value as Photo;
  const valid =
    typeof photo.id === 'string' &&
    photo.full instanceof Blob &&
    photo.thumb instanceof Blob &&
    (photo.backdrop === null || (typeof photo.backdrop === 'string' && /^#[0-9a-f]{6}$/.test(photo.backdrop)));
  if (!valid) throw new Error('Malformed photo record');
  return photo;
}
