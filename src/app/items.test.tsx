import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { db } from '../db';
import { image, notAnImage, renderApp } from './testApp';

type User = ReturnType<typeof renderApp>['user'];

async function storedPhotos() {
  const photos = (await db.photos.toArray()) as { full: Blob; thumb: Blob; backdrop: string | null }[];
  return Promise.all(photos.map(async (photo) => [await photo.full.text(), await photo.thumb.text(), photo.backdrop]));
}

async function storedItems() {
  const items = (await db.items.toArray()) as { name: string; slot: string; style: string; wishlist: boolean }[];
  return items
    .map(({ name, slot, style, wishlist }) => ({ name, slot, style, wishlist }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function addOne(user: User, file: File, name: string, slot: string) {
  await user.upload(await screen.findByLabelText('Choose Photos'), file);
  await user.type(await screen.findByLabelText('Name'), name);
  await user.click(screen.getByRole('radio', { name: slot }));
  await user.click(screen.getByRole('button', { name: 'Add To Closet' }));
  await user.click(await screen.findByRole('link', { name: 'Done' }));
}

describe('closet', () => {
  test('adding one item stores resized photos with their edge color and shows it under the right filters', async () => {
    const { user } = renderApp('/closet');
    await user.click(await screen.findByRole('link', { name: 'Add Your First Item' }));
    expect(screen.getByRole('heading', { name: 'Add Items' })).toBeTruthy();

    await user.upload(screen.getByLabelText('Choose Photos'), image('kurta.jpg', 3000, 2000, '#f4efe9'));
    await user.type(await screen.findByLabelText('Name'), 'red silk kurta');
    await user.click(screen.getByRole('radio', { name: 'Top' }));
    await user.click(screen.getByRole('radio', { name: 'Traditional' }));
    await user.selectOptions(screen.getByLabelText('Color'), 'maroon');
    await user.click(screen.getByRole('button', { name: 'Add To Closet' }));

    expect(await screen.findByText('1 item added to your closet.')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Done' }));

    const tile = await screen.findByRole('link', { name: 'red silk kurta' });
    expect(within(tile).getByText('Traditional')).toBeTruthy();
    expect(within(tile).getByText('maroon')).toBeTruthy();
    expect(screen.getByText('1 item')).toBeTruthy();
    expect(await storedPhotos()).toEqual([['1200x800', '400x267', '#f4efe9']]);
    expect(await db.items.toArray()).toMatchObject([{ name: 'red silk kurta', color: 'maroon', notes: null, wishlist: false }]);

    await user.click(screen.getByRole('radio', { name: 'Bottoms' }));
    expect(screen.queryByText('red silk kurta')).toBeNull();
    await user.click(screen.getByRole('radio', { name: 'Tops' }));
    expect(screen.getByText('red silk kurta')).toBeTruthy();
    await user.click(screen.getByRole('radio', { name: 'Western' }));
    expect(screen.queryByText('red silk kurta')).toBeNull();

    await user.click(screen.getByRole('link', { name: /Wishlist/ }));
    expect(await screen.findByText('Nothing on your wishlist yet.')).toBeTruthy();
  });

  test('small photos are stored at their own size, and transparent edges get no backdrop', async () => {
    const { user } = renderApp('/closet/add');
    await addOne(user, image('ring.png', 300, 200, 'transparent'), 'ring', 'Accessory');
    await screen.findByText('ring');
    expect(await storedPhotos()).toEqual([['300x200', '300x200', null]]);
  });

  test('style defaults to the last added style; editing an item does not change it', async () => {
    const { user } = renderApp('/closet');
    await user.click(await screen.findByRole('link', { name: 'Add Items' }));
    await user.upload(await screen.findByLabelText('Choose Photos'), image('saree.jpg'));
    expect(await screen.findByRole('radio', { name: 'Western' })).toHaveProperty('checked', true);
    await user.type(screen.getByLabelText('Name'), 'saree');
    await user.click(screen.getByRole('radio', { name: 'Bottom' }));
    await user.click(screen.getByRole('radio', { name: 'Traditional' }));
    await user.click(screen.getByRole('button', { name: 'Add To Closet' }));
    await user.click(await screen.findByRole('link', { name: 'Done' }));

    await user.click(await screen.findByText('saree'));
    await user.click(await screen.findByRole('radio', { name: 'Western' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(async () => expect(await db.items.toArray()).toMatchObject([{ style: 'western' }]));

    await user.click(screen.getByRole('link', { name: 'Back' }));
    await user.click(await screen.findByRole('link', { name: 'Add Items' }));
    await user.upload(await screen.findByLabelText('Choose Photos'), image('blouse.jpg'));
    expect(await screen.findByRole('radio', { name: 'Traditional' })).toHaveProperty('checked', true);
  });
});

describe('wishlist', () => {
  test('items added from the wishlist default to wishlist, and "I Bought It" moves them to the closet', async () => {
    const { user } = renderApp('/wishlist');
    await user.click(await screen.findByRole('link', { name: 'Add Your First Item' }));
    await user.upload(screen.getByLabelText('Choose Photos'), image('lehenga.jpg'));
    expect(await screen.findByRole('switch', { name: 'Wishlist' })).toHaveProperty('checked', true);
    await user.type(screen.getByLabelText('Name'), 'green lehenga');
    await user.click(screen.getByRole('radio', { name: 'One-piece' }));
    await user.click(screen.getByRole('button', { name: 'Add To Wishlist' }));
    expect(await screen.findByText('1 item added to your wishlist.')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Done' }));

    expect(await screen.findByText('green lehenga')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'My Wishlist' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'I Bought It' }));
    expect(await screen.findByText('Nothing on your wishlist yet.')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: /Closet/ }));
    expect(await screen.findByText('green lehenga')).toBeTruthy();
  });
});

describe('adding several items', () => {
  test('unreadable files are left out, fields carry over, photos can be removed, and more can be added at the end', async () => {
    const { user } = renderApp('/closet/add');
    await user.upload(await screen.findByLabelText('Choose Photos'), [
      image('a.jpg'),
      notAnImage('b.pdf'),
      image('c.jpg'),
      image('d.jpg'),
    ]);

    expect(await screen.findByText('Photo 1 of 3')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toBe("1 file couldn't be read and was left out.");

    await user.type(screen.getByLabelText('Name'), 'blue jeans');
    await user.click(screen.getByRole('radio', { name: 'Bottom' }));
    await user.click(screen.getByRole('radio', { name: 'Traditional' }));
    await user.click(screen.getByRole('switch', { name: 'Wishlist' }));
    await user.click(screen.getByRole('button', { name: 'Save And Next' }));

    expect(await screen.findByText('Photo 2 of 3')).toBeTruthy();
    expect(screen.getByLabelText('Name')).toHaveProperty('value', '');
    expect(screen.getByRole('radio', { name: 'Bottom' })).toHaveProperty('checked', true);
    expect(screen.getByRole('radio', { name: 'Traditional' })).toHaveProperty('checked', true);
    expect(screen.getByRole('switch', { name: 'Wishlist' })).toHaveProperty('checked', true);
    expect(screen.queryByRole('button', { name: 'Remove Photo 1' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Remove Photo 2' }));
    expect(await screen.findByText('Photo 2 of 2')).toBeTruthy();
    await user.type(screen.getByLabelText('Name'), 'salwar');
    await user.click(screen.getByRole('button', { name: 'Add To Wishlist' }));
    expect(await screen.findByText('2 items added to your wishlist.')).toBeTruthy();

    await user.upload(screen.getByLabelText('Add More'), image('e.jpg'));
    expect(await screen.findByText('Photo 3 of 3')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Bottom' })).toHaveProperty('checked', true);
    await user.type(screen.getByLabelText('Name'), 'lehenga skirt');
    await user.click(screen.getByRole('button', { name: 'Add To Wishlist' }));
    expect(await screen.findByText('3 items added to your wishlist.')).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'Done' }));
    await screen.findByRole('heading', { name: 'My Closet' });
    expect(await storedItems()).toEqual([
      { name: 'blue jeans', slot: 'bottom', style: 'traditional', wishlist: true },
      { name: 'lehenga skirt', slot: 'bottom', style: 'traditional', wishlist: true },
      { name: 'salwar', slot: 'bottom', style: 'traditional', wishlist: true },
    ]);
    expect(await db.photos.count()).toBe(3);
  });

  test('when no file is readable, nothing starts and nothing is stored', async () => {
    const { user } = renderApp('/closet/add');
    await user.upload(await screen.findByLabelText('Choose Photos'), [notAnImage('a.pdf'), notAnImage('b.txt')]);
    expect((await screen.findByRole('alert')).textContent).toBe("2 files couldn't be read and were left out.");
    expect(screen.getByLabelText('Choose Photos')).toBeTruthy();
    expect(screen.queryByLabelText('Name')).toBeNull();
    expect(await db.photos.count()).toBe(0);
  });
});

describe('item detail', () => {
  async function addTop(user: User) {
    await addOne(user, image('tee.jpg'), 'white tee', 'Top');
    await user.click(await screen.findByText('white tee'));
    await screen.findByLabelText('Replace Photo');
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
    await user.click(screen.getByRole('link', { name: 'Back' }));
    expect(confirm).toHaveBeenCalledWith('Discard changes?');
    expect(router.state.location.pathname).toMatch(/^\/items\//);

    await user.click(screen.getByRole('link', { name: 'Back' }));
    await screen.findByRole('heading', { name: 'My Closet' });
    expect(await db.items.toArray()).toMatchObject([{ notes: null }]);
  });

  test('move to wishlist and replace photo act immediately; an unreadable replacement keeps the old photo', async () => {
    const { user } = renderApp('/closet/add');
    await addTop(user);

    await user.click(screen.getByRole('button', { name: 'Move To Wishlist' }));
    expect(await screen.findByRole('button', { name: 'Move To Closet' })).toBeTruthy();
    expect(await db.items.toArray()).toMatchObject([{ wishlist: true }]);

    const [before] = (await db.items.toArray()) as { photoId: string }[];
    await user.upload(screen.getByLabelText('Replace Photo'), notAnImage('scan.pdf'));
    expect((await screen.findByRole('alert')).textContent).toContain(`"scan.pdf" isn't a photo the app can read.`);
    expect(await db.items.toArray()).toMatchObject([{ photoId: before!.photoId }]);

    await user.upload(screen.getByLabelText('Replace Photo'), image('better.jpg'));
    await waitFor(async () => expect(await db.items.toArray()).not.toMatchObject([{ photoId: before!.photoId }]));
    const [after] = (await db.items.toArray()) as { photoId: string }[];
    expect(await db.photos.toCollection().primaryKeys()).toEqual([after!.photoId]);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
