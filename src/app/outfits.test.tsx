import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { db } from '../db';
import { currentCard, renderApp, seedItem, seedOutfit } from './testApp';

describe('outfit builder', () => {
  test('toggling one-piece keeps hidden picks, but only the rows on screen are saved', async () => {
    await seedItem({ name: 'white kurta', slot: 'top', style: 'traditional' });
    await seedItem({ name: 'jeans', slot: 'bottom' });
    const anarkali = await seedItem({ name: 'anarkali', slot: 'onepiece', style: 'traditional', wishlist: true });
    const juttis = await seedItem({ name: 'juttis', slot: 'footwear', style: 'traditional' });
    const { user, router } = renderApp('/style');

    expect(await screen.findByRole('button', { name: 'Save Outfit' })).toHaveProperty('disabled', true);
    await user.click(screen.getByRole('button', { name: 'Next Top' }));
    await user.click(screen.getByRole('button', { name: 'Next Bottom' }));
    await user.click(screen.getByRole('button', { name: 'Next Footwear' }));
    expect(currentCard('Top')).toContain('white kurta');
    expect(currentCard('Bottom')).toContain('jeans');

    await user.click(screen.getByRole('button', { name: 'Wear A One-Piece Instead' }));
    expect(screen.queryByRole('region', { name: 'Top' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Next One-piece' }));
    expect(currentCard('One-piece')).toContain('anarkali');
    expect(currentCard('One-piece')).toContain('wishlist');

    await user.click(screen.getByRole('button', { name: 'Back To Top + Bottom' }));
    expect(currentCard('Top')).toContain('white kurta');
    await user.click(screen.getByRole('button', { name: 'Wear A One-Piece Instead' }));
    expect(currentCard('One-piece')).toContain('anarkali');

    await user.click(screen.getByRole('button', { name: 'Save Outfit' }));
    expect(screen.getByLabelText('Outfit name')).toHaveProperty('value', 'Outfit 1');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByRole('heading', { name: 'Outfit 1' });
    expect(screen.getByText('includes wishlist')).toBeTruthy();
    expect(router.state.location.pathname).toMatch(/^\/outfits\//);
    expect(await db.outfits.toArray()).toMatchObject([
      { name: 'Outfit 1', topId: null, bottomId: null, onePieceId: anarkali, footwearId: juttis, accessoryIds: [] },
    ]);
  });

  test('the style filter narrows every row; shuffle picks within it and leaves accessories alone', async () => {
    await seedItem({ name: 'graphic tee', slot: 'top' });
    const kurta = await seedItem({ name: 'white kurta', slot: 'top', style: 'traditional' });
    await seedItem({ name: 'jeans', slot: 'bottom' });
    const dupatta = await seedItem({ name: 'dupatta', slot: 'accessory', style: 'traditional' });
    await seedItem({ name: 'cap', slot: 'accessory' });
    const { user } = renderApp('/style');

    await user.click(await screen.findByRole('radio', { name: 'Traditional' }));
    const topRow = screen.getByRole('region', { name: 'Top' });
    expect(within(topRow).queryByText('graphic tee')).toBeNull();
    expect(within(screen.getByRole('region', { name: 'Bottom' })).queryByText('jeans')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Choose Accessories' }));
    const picker = screen.getByRole('dialog', { name: 'Choose Accessories' });
    expect(within(picker).queryByText('cap')).toBeNull();
    await user.click(within(picker).getByRole('checkbox', { name: /dupatta/ }));
    await user.click(within(picker).getByRole('button', { name: 'Done' }));

    vi.spyOn(Math, 'random').mockReturnValue(0);
    await user.click(screen.getByRole('button', { name: 'Shuffle' }));
    expect(currentCard('Top')).toContain('white kurta');
    expect(currentCard('Bottom')).toContain('None');
    expect(screen.getByRole('button', { name: 'Remove dupatta' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Save Outfit' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('heading', { name: 'Outfit 1' });
    expect(await db.outfits.toArray()).toMatchObject([
      { topId: kurta, bottomId: null, onePieceId: null, footwearId: null, accessoryIds: [dupatta] },
    ]);
  });

  test('a saved one-piece outfit reopens in one-piece mode; Save updates it and Save as new copies it', async () => {
    const anarkali = await seedItem({ name: 'anarkali', slot: 'onepiece', style: 'traditional' });
    const juttis = await seedItem({ name: 'juttis', slot: 'footwear', style: 'traditional' });
    const id = await seedOutfit({ name: 'Diwali look', onePieceId: anarkali });
    const { user } = renderApp(`/outfits/${id}`);

    await user.click(await screen.findByRole('link', { name: 'Edit In Builder' }));
    expect(await screen.findByText('Editing Diwali look')).toBeTruthy();
    expect(currentCard('One-piece')).toContain('anarkali');
    expect(screen.queryByRole('region', { name: 'Top' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Next Footwear' }));
    await user.click(screen.getByRole('button', { name: 'Save Outfit' }));
    expect(screen.getByLabelText('Outfit name')).toHaveProperty('value', 'Diwali look');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('heading', { name: 'Diwali look' });
    expect(await db.outfits.toArray()).toMatchObject([{ id, onePieceId: anarkali, footwearId: juttis }]);

    await user.click(screen.getByRole('link', { name: 'Edit In Builder' }));
    await user.click(await screen.findByRole('button', { name: 'Save As New' }));
    expect(screen.getByLabelText('Outfit name')).toHaveProperty('value', 'Outfit 2');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('heading', { name: 'Outfit 2' });
    expect(await db.outfits.count()).toBe(2);
  });
});

describe('outfits', () => {
  test('rename and delete an outfit', async () => {
    const tee = await seedItem({ name: 'tee', slot: 'top' });
    await seedOutfit({ name: 'Outfit 1', topId: tee });
    const { user } = renderApp('/outfits');

    await user.click(await screen.findByText('Outfit 1'));
    await user.click(await screen.findByRole('button', { name: 'Rename' }));
    const name = screen.getByLabelText('Outfit name');
    await user.clear(name);
    await user.type(name, 'Brunch');
    await user.click(screen.getByRole('button', { name: 'Save Name' }));
    expect(await screen.findByRole('heading', { name: 'Brunch' })).toBeTruthy();

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('No outfits yet.')).toBeTruthy();
    expect(await db.outfits.count()).toBe(0);
  });

  test('deleting an item warns about its outfits, deletes outfits left empty and shows the rest as missing', async () => {
    const kurta = await seedItem({ name: 'kurta', slot: 'top' });
    const jeans = await seedItem({ name: 'jeans', slot: 'bottom' });
    const kept = await seedOutfit({ name: 'Casual', topId: kurta, bottomId: jeans });
    await seedOutfit({ name: 'Just the kurta', topId: kurta });
    const { user } = renderApp(`/items/${kurta}`);

    expect(await screen.findByText('Used in 2 saved outfits.')).toBeTruthy();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete Item' }));
    expect(confirm).toHaveBeenCalledWith(
      "Delete this item? It's used in 2 outfits. 1 outfit will also be deleted because nothing else is left in it.",
    );

    await screen.findByRole('heading', { name: 'My Closet' });
    expect(await db.outfits.toCollection().primaryKeys()).toEqual([kept]);
    expect(await db.items.toCollection().primaryKeys()).toEqual([jeans]);
    expect(await db.photos.count()).toBe(1);

    await user.click(screen.getByRole('link', { name: /Outfits/ }));
    const card = (await screen.findByText('Casual')).closest('a')!;
    expect(within(card).getByText('Missing')).toBeTruthy();
  });

  test('cancelling an item delete changes nothing', async () => {
    const kurta = await seedItem({ name: 'kurta', slot: 'top' });
    await seedOutfit({ name: 'Just the kurta', topId: kurta });
    const { user } = renderApp(`/items/${kurta}`);
    await screen.findByText('Used in 1 saved outfit.');
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.click(screen.getByRole('button', { name: 'Delete Item' }));
    await waitFor(async () => expect(await db.outfits.count()).toBe(1));
    expect(await db.items.count()).toBe(1);
  });
});

describe('stored data', () => {
  test.each([
    ['an item missing a field', 'items', { id: 'x', name: 'tee', slot: 'top', style: 'western', wishlist: false, photoId: 'p', color: null, createdAt: 1, updatedAt: 1 }, '/closet', 'Malformed item record'],
    ['an outfit with both a one-piece and a top', 'outfits', { id: 'o', name: 'Odd', topId: 'a', bottomId: null, onePieceId: 'b', footwearId: null, accessoryIds: [], createdAt: 1, updatedAt: 1 }, '/outfits', 'Malformed outfit record'],
    ['an outfit with no items', 'outfits', { id: 'o', name: 'Empty', topId: null, bottomId: null, onePieceId: null, footwearId: null, accessoryIds: [], createdAt: 1, updatedAt: 1 }, '/outfits', 'Malformed outfit record'],
  ] as const)('rejects %s instead of showing it', async (_, table, record, path, message) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await db.table(table).add(record);
    renderApp(path);
    expect(await screen.findByRole('heading', { name: 'Something Went Wrong' })).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
  });
});
