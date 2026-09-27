import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { listItems } from '../items';
import { includesWishlist } from './outfit';
import { OutfitStack } from './OutfitStack';
import { deleteOutfit, readOutfit, updateOutfit } from './outfitStore';

export function OutfitDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const outfit = useLiveQuery(() => readOutfit(id), [id]);
  const items = useLiveQuery(listItems);
  const [newName, setNewName] = useState<string | null>(null);
  if (outfit === undefined || !items) return null;
  if (outfit === null) {
    return (
      <main className="screen narrow">
        <p>This outfit no longer exists.</p>
        <Link to="/outfits">Back to my outfits</Link>
      </main>
    );
  }
  const itemsById = new Map(items.map((item) => [item.id, item]));

  async function rename(event: FormEvent) {
    event.preventDefault();
    if (newName === null || newName.trim() === '') return;
    await updateOutfit(id, { name: newName });
    setNewName(null);
  }

  async function remove() {
    if (!window.confirm('Delete this outfit?')) return;
    await deleteOutfit(id);
    navigate('/outfits');
  }

  return (
    <main className="screen narrow">
      <header className="screen-header">
        <Link to="/outfits" className="text-button">
          ‹ Back
        </Link>
        {includesWishlist(outfit, itemsById) && <span className="badge">includes wishlist</span>}
      </header>
      {newName === null ? (
        <h1>{outfit.name}</h1>
      ) : (
        <form className="name-form" onSubmit={rename}>
          <label className="field">
            <span>Outfit name</span>
            <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} />
          </label>
          <div className="actions">
            <button type="button" className="button secondary" onClick={() => setNewName(null)}>
              Cancel
            </button>
            <button className="button" disabled={newName.trim() === ''}>
              Save name
            </button>
          </div>
        </form>
      )}
      <OutfitStack picks={outfit} items={itemsById} size="full" />
      <div className="actions">
        <Link to={`/style/${outfit.id}`} className="button">
          Edit in builder
        </Link>
        <button className="button secondary" onClick={() => setNewName(outfit.name)}>
          Rename
        </button>
        <button className="button danger" onClick={remove}>
          Delete
        </button>
      </div>
    </main>
  );
}
