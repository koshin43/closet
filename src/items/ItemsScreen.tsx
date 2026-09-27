import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router';
import { StoredPhoto } from '../photos';
import { SLOTS, SLOT_LABELS, type Slot } from './item';
import { listItems, setWishlist } from './itemStore';
import { matchesStyle, StyleFilter, type StyleFilterValue } from './StyleFilter';

export function ItemsScreen({ wishlist }: { wishlist: boolean }) {
  const all = useLiveQuery(listItems);
  const [slot, setSlot] = useState<Slot | 'all'>('all');
  const [style, setStyle] = useState<StyleFilterValue>('all');
  const [adding, setAdding] = useState(false);
  const base = wishlist ? '/wishlist' : '/closet';

  if (!all) return null;
  const mine = all.filter((item) => item.wishlist === wishlist);
  const shown = mine.filter((item) => (slot === 'all' || item.slot === slot) && matchesStyle(item.style, style));

  return (
    <main className="screen">
      <header className="screen-header">
        <h1>{wishlist ? 'My wishlist' : 'My closet'}</h1>
        <span className="muted">
          {mine.length} {mine.length === 1 ? 'item' : 'items'}
        </span>
      </header>
      {mine.length === 0 ? (
        <div className="empty">
          <p>{wishlist ? 'Nothing on your wishlist yet.' : 'Your closet is empty. Let’s fill it up!'}</p>
          <Link to={`${base}/add`} className="button big">
            Add your first item
          </Link>
        </div>
      ) : (
        <>
          <nav className="tabs" aria-label="Slot">
            {(['all', ...SLOTS] as const).map((value) => (
              <button key={value} aria-pressed={slot === value} onClick={() => setSlot(value)}>
                {value === 'all' ? 'All' : SLOT_LABELS[value].many}
              </button>
            ))}
          </nav>
          <StyleFilter value={style} onChange={setStyle} />
          {shown.length === 0 && <p className="muted">Nothing here yet.</p>}
          <ul className="grid">
            {shown.map((item) => (
              <li key={item.id} className="tile">
                <Link to={`/items/${item.id}`}>
                  <div className="tile-photo">
                    <StoredPhoto photoId={item.photoId} size="thumb" alt={item.name} />
                    {item.style === 'traditional' && <span className="tag">Trad</span>}
                  </div>
                  <span className="tile-name">{item.name}</span>
                </Link>
                {wishlist && (
                  <button className="chip" onClick={() => setWishlist(item.id, false)}>
                    I bought it
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {adding && (
        <div className="add-menu" role="menu">
          <Link role="menuitem" to={`${base}/add`}>
            One photo
          </Link>
          <Link role="menuitem" to={`${base}/bulk`}>
            Several photos
          </Link>
        </div>
      )}
      <button className="fab" aria-label="Add" aria-expanded={adding} onClick={() => setAdding(!adding)}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </main>
  );
}