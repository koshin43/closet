import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { db } from '../db';
import { image, notAnImage, renderApp } from './testApp';

async function storedPhotoSizes() {
  const photos = (await db.photos.toArray()) as { full: Blob; thumb: Blob }[];
  return Promise.all(photos.map(async (photo) => [await photo.full.text(), await photo.thumb.text()]));
}

describe('closet', () => {
  test('adding an item stores resized photos and shows it under the right filters', async () => {
    const { user } = renderApp('/closet');
    await user.click(await screen.findByRole('link', { name: 'Add your first item' }));

    await user.upload(screen.getByLabelText('Choose photo'), image('kurta.jpg', 3000, 2000));
    await user.type(screen.getByLabelText('Name'), 'red silk kurta');
    await user.click(screen.getByRole('radio', { name: 'Top' }));
    await user.click(screen.getByRole('radio', { name: 'Traditional' }));
    await user.selectOptions(screen.getByLabelText('Color'), 'maroon');
    await user.click(screen.getByRole('button', { name: 'Add to closet' }));

    const tile = (await screen.findByText('red silk kurta')).closest('li')!;
    expect(within(tile).getByText('Trad')).toBeTruthy();
    expect(screen.getByText('1 item')).toBeTruthy();
    expect(await storedPhotoSizes()).toEqual([['1200x800', '400x267']]);
    expect(await db.items.toArray()).toMatchObject([{ name: 'red silk kurta', color: 'maroon', notes: null, wishlist: false }]);

    await user.click(screen.getByRole('button', { name: 'Bottoms' }));
    expect(screen.queryByText('red silk kurta')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Tops' }));
    expect(screen.getByText('red silk kurta')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Western' }));
    expect(screen.queryByText('red silk kurta')).toBeNull();

    await user.click(screen.getByRole('link', { name: /Wishlist/ }));
    expect(await screen.findByText('Nothing on your wishlist yet.')).toBeTruthy();
  });

  test('small photos are stored at their own size, never upscaled', async () => {
    const { user } = renderApp('/closet/add');
    await user.upload(await screen.findByLabelText('Choose photo'), image('ring.jpg', 300, 200));
    await user.type(screen.getByLabelText('Name'), 'ring');
    await user.click(screen.getByRole('radio', { name: 'Accessory' }));
    await user.click(screen.getByRole('button', { name: 'Add to closet' }));
    await screen.findByText('ring');
    expect(await storedPhotoSizes()).toEqual([['300x200', '300x200']]);
  });

  test('a file that is not an image is rejected and nothing is stored', async () => {
    const { user } = renderApp('/closet/add');
    await user.upload(await screen.findByLabelText('Choose photo'), notAnImage('receipt.pdf'));
    await user.type(screen.getByLabelText('Name'), 'mystery');
    await user.click(screen.getByRole('radio', { name: 'Top' }));

    expect((await screen.findByRole('alert')).textContent).toContain(`"receipt.pdf" isn't a photo the app can read.`);
    expect(screen.getByRole('button', { name: 'Add to closet' })).toHaveProperty('disabled', true);
    expect(await db.photos.count()).toBe(0);
  });

  test('style defaults to the last added style; editing an item does not change it', async () => {
    const { user } = renderApp('/closet/add');
    expect(await screen.findByRole('radio', { name: 'Western' })).toHaveProperty('checked', true);

    await user.upload(screen.getByLabelText('Choose photo'), image('saree.jpg'));
    await user.type(screen.getByLabelText('Name'), 'saree');
    await user.click(screen.getByRole('radio', { name: 'Bottom' }));
    await user.click(screen.getByRole('radio', { name: 'Traditional' }));
    await user.click(screen.getByRole('button', { name: 'Add to closet' }));

    await user.click(await screen.findByText('saree'));
    await user.click(await screen.findByRole('radio', { name: 'Western' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(async () => expect(await db.items.toArray()).toMatchObject([{ style: 'western' }]));

    await user.click(screen.getByRole('link', { name: '‹ Back' }));
    await user.click(await screen.findByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('menuitem', { name: 'One photo' }));
    expect(await screen.findByRole('radio', { name: 'Traditional' })).toHaveProperty('checked', true);
  });
});

describe('wishlist', () => {
  test('items added from the wishlist default to wishlist, and "I bought it" moves them to the closet', async () => {
    const { user } = renderApp('/wishlist');
    await user.click(await screen.findByRole('link', { name: 'Add your first item' }));
    expect(screen.getByRole('checkbox', { name: 'Wishlist' })).toHaveProperty('checked', true);

    await user.upload(screen.getByLabelText('Choose photo'), image('lehenga.jpg'));
    await user.type(screen.getByLabelText('Name'), 'green lehenga');
    await user.click(screen.getByRole('radio', { name: 'One-piece' }));
    await user.click(screen.getByRole('button', { name: 'Add to wishlist' }));

    expect(await screen.findByText('green lehenga')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'My wishlist' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'I bought it' }));
    expect(await screen.findByText('Nothing on your wishlist yet.')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: /Closet/ }));
    expect(await screen.findByText('green lehenga')).toBeTruthy();
  });
});

describe('bulk add', () => {
  test('unreadable files are left out up front; slot, style and wishlist carry over; skip drops a photo', async () => {
    const { user } = renderApp('/closet/bulk');
    await user.upload(await screen.findByLabelText('Choose photos'), [
      image('a.jpg'),
      notAnImage('b.pdf'),
      image('c.jpg'),
      image('d.jpg'),
    ]);

    expect(await screen.findByRole('heading', { name: '1 of 3' })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toBe("1 file couldn't be read and was left out.");

    await user.type(screen.getByLabelText('Name'), 'blue jeans');
    await user.click(screen.getByRole('radio', { name: 'Bottom' }));
    await user.click(screen.getByRole('radio', { name: 'Traditional' }));
    await user.click(screen.getByRole('checkbox', { name: 'Wishlist' }));
    await user.click(screen.getByRole('button', { name: 'Save and next' }));

    expect(await screen.findByRole('heading', { name: '2 of 3' })).toBeTruthy();
    expect(screen.getByLabelText('Name')).toHaveProperty('value', '');
    expect(screen.getByRole('radio', { name: 'Bottom' })).toHaveProperty('checked', true);
    expect(screen.getByRole('radio', { name: 'Traditional' })).toHaveProperty('checked', true);
    expect(screen.getByRole('checkbox', { name: 'Wishlist' })).toHaveProperty('checked', true);

    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(await screen.findByRole('heading', { name: '3 of 3' })).toBeTruthy();
    await user.type(screen.getByLabelText('Name'), 'salwar');
    await user.click(screen.getByRole('button', { name: 'Save and next' }));

    await screen.findByRole('heading', { name: 'My closet' });
    const items = (await db.items.toArray()) as { name: string; slot: string; style: string; wishlist: boolean }[];
    expect(items.map(({ name, slot, style, wishlist }) => ({ name, slot, style, wishlist })).sort((a, b) => a.name.localeCompare(b.name))).toEqual([
      { name: 'blue jeans', slot: 'bottom', style: 'traditional', wishlist: true },
      { name: 'salwar', slot: 'bottom', style: 'traditional', wishlist: true },
    ]);
    expect(await db.photos.count()).toBe(2);
  });

  test('when no file is readable, nothing starts', async () => {
    const { user } = renderApp('/closet/bulk');
    await user.upload(await screen.findByLabelText('Choose photos'), [notAnImage('a.pdf'), notAnImage('b.txt')]);
    expect((await screen.findByRole('alert')).textContent).toBe("2 files couldn't be read and were left out.");
    expect(screen.getByLabelText('Choose photos')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save and next' })).toBeNull();
  });
});

describe('item detail', () => {
  async function addTop(user: ReturnType<typeof renderApp>['user']) {
    await user.upload(await screen.findByLabelText('Choose photo'), image('tee.jpg'));
    await user.type(screen.getByLabelText('Name'), 'white tee');
    await user.click(screen.getByRole('radio', { name: 'Top' }));
    await user.click(screen.getByRole('button', { name: 'Add to closet' }));
    await user.click(await screen.findByText('white tee'));
    await screen.findByLabelText('Replace photo');
  }

  test('edits need Save, a blank name cannot be saved, and leaving with edits asks first', async () => {
    const { user, router } = renderApp('/closet/add');
    await addTop(user);

    const name = screen.getByLabelText('Name');
    await user.clear(name);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('disabled', true);
    await user.type(name, 'white linen tee');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(async () => expect(await db.items.toArray()).toMatchObject([{ name: 'white linen tee' }]));

    await user.type(screen.getByLabelText('Notes'), 'runs small');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    await user.click(screen.getByRole('link', { name: '‹ Back' }));
    expect(confirm).toHaveBeenCalledWith('Discard changes?');
    expect(router.state.location.pathname).toMatch(/^\/items\//);

    await user.click(screen.getByRole('link', { name: '‹ Back' }));
    await screen.findByRole('heading', { name: 'My closet' });
    expect(await db.items.toArray()).toMatchObject([{ notes: null }]);
  });

  test('move to wishlist and replace photo act immediately; an unreadable replacement keeps the old photo', async () => {
    const { user } = renderApp('/closet/add');
    await addTop(user);

    await user.click(screen.getByRole('button', { name: 'Move to wishlist' }));
    expect(await screen.findByRole('button', { name: 'Move to closet' })).toBeTruthy();
    expect(await db.items.toArray()).toMatchObject([{ wishlist: true }]);

    const [before] = (await db.items.toArray()) as { photoId: string }[];
    await user.upload(screen.getByLabelText('Replace photo'), notAnImage('scan.pdf'));
    expect((await screen.findByRole('alert')).textContent).toContain(`"scan.pdf" isn't a photo the app can read.`);
    expect(await db.items.toArray()).toMatchObject([{ photoId: before!.photoId }]);

    await user.upload(screen.getByLabelText('Replace photo'), image('better.jpg'));
    await waitFor(async () => expect(await db.items.toArray()).not.toMatchObject([{ photoId: before!.photoId }]));
    const [after] = (await db.items.toArray()) as { photoId: string }[];
    expect(await db.photos.toCollection().primaryKeys()).toEqual([after!.photoId]);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
