import { useState } from 'react';
import type { Item } from '../items';
import { StoredPhoto } from '../photos';

interface Props {
  options: Item[];
  chosen: Item[];
  onChange: (ids: string[]) => void;
}

export function AccessoriesRow({ options, chosen, onChange }: Props) {
  const [picking, setPicking] = useState(false);
  const chosenIds = chosen.map((item) => item.id);
  const toggle = (id: string) =>
    onChange(chosenIds.includes(id) ? chosenIds.filter((other) => other !== id) : [...chosenIds, id]);

  return (
    <section className="swipe-row" aria-label="Accessories">
      <header>
        <h2>Accessories</h2>
      </header>
      <ul className="accessory-strip">
        {chosen.map((item) => (
          <li key={item.id} className="accessory">
            <StoredPhoto photoId={item.photoId} size="thumb" alt={item.name} />
            <button className="remove" aria-label={`Remove ${item.name}`} onClick={() => toggle(item.id)}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M7 7l10 10M17 7 7 17" />
              </svg>
            </button>
          </li>
        ))}
        <li>
          <button className="accessory add" aria-label="Choose accessories" onClick={() => setPicking(true)}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </li>
      </ul>
      {picking && (
        <div className="picker" role="dialog" aria-label="Choose accessories">
          {options.length === 0 && <p className="muted">No accessories match this filter.</p>}
          <ul className="picker-grid">
            {options.map((item) => (
              <li key={item.id}>
                <label className="picker-option">
                  <input type="checkbox" checked={chosenIds.includes(item.id)} onChange={() => toggle(item.id)} />
                  <StoredPhoto photoId={item.photoId} size="thumb" alt="" />
                  <span>{item.name}</span>
                  {item.wishlist && <span className="badge">wishlist</span>}
                </label>
              </li>
            ))}
          </ul>
          <button className="button" onClick={() => setPicking(false)}>
            Done
          </button>
        </div>
      )}
    </section>
  );
}
