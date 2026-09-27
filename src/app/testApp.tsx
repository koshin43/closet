import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { db } from '../db';
import { routes } from './routes';

export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return { router, user: userEvent.setup({ applyAccept: false }) };
}

export function image(name: string, width = 800, height = 1000, edge = '#ffffff'): File {
  return new File([`img:${width}x${height}:${edge}`], name, { type: 'image/jpeg' });
}

export function notAnImage(name: string): File {
  return new File(['%PDF-1.7'], name, { type: 'application/pdf' });
}

export function currentCard(row: string): string {
  const card = screen.getByRole('region', { name: row }).querySelector('[aria-current="true"]');
  return card?.textContent ?? '';
}

interface SeedItem {
  name: string;
  slot: 'top' | 'bottom' | 'onepiece' | 'footwear' | 'accessory';
  style?: 'western' | 'traditional';
  wishlist?: boolean;
}

export async function seedItem({ name, slot, style = 'western', wishlist = false }: SeedItem): Promise<string> {
  const id = crypto.randomUUID();
  const photoId = crypto.randomUUID();
  const now = Date.now();
  await db.photos.add({
    id: photoId,
    full: new Blob(['full'], { type: 'image/webp' }),
    thumb: new Blob(['thumb'], { type: 'image/webp' }),
    backdrop: '#ffffff',
  });
  await db.items.add({ id, photoId, name, slot, style, color: null, notes: null, wishlist, createdAt: now, updatedAt: now });
  return id;
}

interface SeedOutfit {
  name: string;
  topId?: string;
  bottomId?: string;
  onePieceId?: string;
  footwearId?: string;
  accessoryIds?: string[];
}

export async function seedOutfit(outfit: SeedOutfit): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db.outfits.add({
    id,
    name: outfit.name,
    topId: outfit.topId ?? null,
    bottomId: outfit.bottomId ?? null,
    onePieceId: outfit.onePieceId ?? null,
    footwearId: outfit.footwearId ?? null,
    accessoryIds: outfit.accessoryIds ?? [],
    createdAt: now,
    updatedAt: now,
  });
  return id;
}
