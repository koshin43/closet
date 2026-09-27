export interface Photo {
  id: string;
  full: Blob;
  thumb: Blob;
}

const KEYS = ['full', 'id', 'thumb'].join();

export function parsePhoto(value: unknown): Photo {
  if (typeof value !== 'object' || value === null || Object.keys(value).sort().join() !== KEYS) {
    throw new Error('Malformed photo record');
  }
  const photo = value as Photo;
  if (typeof photo.id !== 'string' || !(photo.full instanceof Blob) || !(photo.thumb instanceof Blob)) {
    throw new Error('Malformed photo record');
  }
  return photo;
}
