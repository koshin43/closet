import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router';
import { listItems } from '../items';
import { includesWishlist } from './outfit';
import { OutfitStack } from './OutfitStack';
import { listOutfits } from './outfitStore';

export function OutfitsScreen() {
  const outfits = useLiveQuery(listOutfits);
  const items = useLiveQuery(listItems);
  if (!outfits || !items) return null;
  const itemsById = new Map(items.map((item) => [item.id, item]));

  return (
    <main className="screen">
      <header className="screen-header">
        <h1>My outfits</h1>
        <span className="muted">
          {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'}
        </span>
      </header>
      {outfits.length === 0 ? (
        <div className="empty">
          <p>No outfits yet.</p>
          <Link to="/style" className="button big">
            Let’s get dressed
          </Link>
        </div>
      ) : (
        <ul className="grid outfits">
          {outfits.map((outfit) => (
            <li key={outfit.id} className="tile">
              <Link to={`/outfits/${outfit.id}`}>
                <OutfitStack picks={outfit} items={itemsById} size="thumb" />
                <span className="tile-name">{outfit.name}</span>
                {includesWishlist(outfit, itemsById) && <span className="badge">includes wishlist</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
