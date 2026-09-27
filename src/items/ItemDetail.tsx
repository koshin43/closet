import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate } from 'react-router';
import { encodePhoto, StoredPhoto, UnreadablePhotoError } from '../photos';
import type { Item } from './item';
import { ItemForm, draftToFields, type ItemDraft } from './ItemForm';
import { readItem, replaceItemPhoto, setWishlist, updateItemFields } from './itemStore';

export interface OutfitUsage {
  usedIn: number;
  removedOnDelete: number;
}

interface Props {
  id: string;
  usage: OutfitUsage | undefined;
  onDelete: () => Promise<void>;
}

export function ItemDetail({ id, ...rest }: Props) {
  const item = useLiveQuery(() => readItem(id), [id]);
  if (item === undefined) return null;
  if (item === null) {
    return (
      <main className="screen narrow">
        <p>This item no longer exists.</p>
        <Link to="/closet">Back to my closet</Link>
      </main>
    );
  }
  return <ItemEditor key={item.id} item={item} {...rest} />;
}

function toDraft(item: Item): ItemDraft {
  const { name, slot, style, color, notes, wishlist } = item;
  return { name, slot, style, color, notes: notes ?? '', wishlist };
}

function ItemEditor({ item, usage, onDelete }: Omit<Props, 'id'> & { item: Item }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => toDraft(item));
  const [error, setError] = useState<string | null>(null);
  const deleting = useRef(false);
  const fields = draftToFields(draft);
  const saved = toDraft(item);
  const dirty = (['name', 'slot', 'style', 'color', 'notes'] as const).some((key) => draft[key] !== saved[key]);
  const blocker = useBlocker(() => dirty && !deleting.current);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Discard changes?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  async function save() {
    if (!fields) return;
    const { name, slot, style, color, notes } = fields;
    await updateItemFields(item.id, { name, slot, style, color, notes });
  }

  async function replace(file: File | undefined) {
    if (!file) return;
    try {
      await replaceItemPhoto(item.id, await encodePhoto(file));
      setError(null);
    } catch (e) {
      if (!(e instanceof UnreadablePhotoError)) throw e;
      setError(e.message);
    }
  }

  async function remove() {
    if (!usage) return;
    let message = 'Delete this item?';
    if (usage.usedIn > 0) message += ` It's used in ${plural(usage.usedIn, 'outfit')}.`;
    if (usage.removedOnDelete > 0) {
      message += ` ${plural(usage.removedOnDelete, 'outfit')} will also be deleted because nothing else is left in ${usage.removedOnDelete === 1 ? 'it' : 'them'}.`;
    }
    if (!window.confirm(message)) return;
    deleting.current = true;
    await onDelete();
    navigate(item.wishlist ? '/wishlist' : '/closet');
  }

  return (
    <main className="screen narrow">
      <header className="screen-header">
        <Link to={item.wishlist ? '/wishlist' : '/closet'} className="text-button">
          ‹ Back
        </Link>
        {item.wishlist && <span className="badge">Wishlist</span>}
      </header>
      <div className="detail-photo">
        <StoredPhoto photoId={item.photoId} size="full" alt={item.name} />
      </div>
      <label className="button secondary">
        Replace photo
        <input type="file" accept="image/*" hidden onChange={(e) => replace(e.target.files?.[0])} />
      </label>
      {error && <p role="alert" className="error">{error}</p>}
      <ItemForm draft={draft} onChange={setDraft} showWishlist={false} />
      <button className="button" disabled={!fields || !dirty} onClick={save}>
        Save
      </button>
      <button className="button secondary" onClick={() => setWishlist(item.id, !item.wishlist)}>
        {item.wishlist ? 'Move to closet' : 'Move to wishlist'}
      </button>
      {usage && <p className="muted">Used in {plural(usage.usedIn, 'saved outfit')}.</p>}
      <button className="button danger" onClick={remove}>
        Delete item
      </button>
    </main>
  );
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
