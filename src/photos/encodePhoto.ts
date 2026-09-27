import type { Photo } from './photo';

const FULL_EDGE = 1200;
const THUMB_EDGE = 400;
const SAMPLE_EDGE = 64;
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
      backdrop: sampleBackdrop(bitmap),
    };
  } finally {
    bitmap.close();
  }
}

function draw(bitmap: ImageBitmap, longEdge: number) {
  const scale = Math.min(1, longEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable');
  context.drawImage(bitmap, 0, 0, width, height);
  return { canvas, context, width, height };
}

async function encode(bitmap: ImageBitmap, longEdge: number): Promise<Blob> {
  const { canvas } = draw(bitmap, longEdge);
  const webp = await canvas.convertToBlob({ type: 'image/webp', quality: QUALITY });
  if (webp.type === 'image/webp') return webp;
  return canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY });
}

/** Average color of the outermost pixels, or null when most of them are transparent. */
function sampleBackdrop(bitmap: ImageBitmap): string | null {
  const { context, width, height } = draw(bitmap, SAMPLE_EDGE);
  const { data } = context.getImageData(0, 0, width, height);
  const edge: number[] = [];
  for (let x = 0; x < width; x++) edge.push(x, (height - 1) * width + x);
  for (let y = 1; y < height - 1; y++) edge.push(y * width, y * width + width - 1);

  const sum = [0, 0, 0];
  let opaque = 0;
  for (const pixel of edge) {
    if (data[pixel * 4 + 3]! < 128) continue;
    opaque += 1;
    for (let channel = 0; channel < 3; channel++) sum[channel]! += data[pixel * 4 + channel]!;
  }
  if (opaque < edge.length / 2) return null;
  return `#${sum.map((total) => Math.round(total / opaque).toString(16).padStart(2, '0')).join('')}`;
}
