import type { Photo } from './photo';

const FULL_EDGE = 1200;
const THUMB_EDGE = 400;
const QUALITY = 0.85;

export class UnreadablePhotoError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" isn't a photo the app can read.`);
  }
}

export async function encodePhoto(file: File): Promise<Photo> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UnreadablePhotoError(file.name);
  }
  try {
    return {
      id: crypto.randomUUID(),
      full: await encode(bitmap, FULL_EDGE),
      thumb: await encode(bitmap, THUMB_EDGE),
    };
  } finally {
    bitmap.close();
  }
}

async function encode(bitmap: ImageBitmap, longEdge: number): Promise<Blob> {
  const scale = Math.min(1, longEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable');
  context.drawImage(bitmap, 0, 0, width, height);
  const webp = await canvas.convertToBlob({ type: 'image/webp', quality: QUALITY });
  if (webp.type === 'image/webp') return webp;
  return canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY });
}
