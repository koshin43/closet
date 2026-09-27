import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { listItems, matchesStyle, StyleFilter, type Item, type Slot, type StyleFilterValue } from '../items';
import { AccessoriesRow } from './AccessoriesRow';
import type { Outfit, OutfitPicks } from './outfit';
import { OutfitStack } from './OutfitStack';
import { createOutfit, listOutfits, readOutfit, updateOutfit } from './outfitStore';
import { SwipeRow } from './SwipeRow';

type RowSlot = Exclude<Slot, 'accessory'>;
type Picks = Record<RowSlot, string | null>;

export function OutfitBuilder({ outfitId }: { outfitId: string | undefined }) {
  const items = useLiveQuery(listItems);
  const outfits = useLiveQuery(listOutfits);
  const outfit = useLiveQuery(async () => (outfitId ? readOutfit(outfitId) : null), [outfitId]);
  if (!items || !outfits || outfit === undefined) return null;
  if (outfitId && !outfit) {
    return (
      <main className="screen">
        <p>This outfit no longer exists.</p>
        <Link to="/style">Start a new outfit</Link>
      </main>
    );
  }
  return <Builder key={outfitId ?? 'new'} items={items} outfit={outfit} outfitCount={outfits.length} />;
}

interface Naming {
  asNew: boolean;
  name: string;
}

function Builder({ items, outfit, outfitCount }: { items: Item[]; outfit: Outfit | null; outfitCount: number }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StyleFilterValue>('all');
  const [onePiece, setOnePiece] = useState(outfit?.onePieceId != null);
  const [picks, setPicks] = useState<Picks>({
    top: outfit?.topId ?? null,
    bottom: outfit?.bottomId ?? null,
    onepiece: outfit?.onePieceId ?? null,
    footwear: outfit?.footwearId ?? null,
  });
  const [accessoryIds, setAccessoryIds] = useState<string[]>(outfit?.accessoryIds ?? []);
  const [naming, setNaming] = useState<Naming | null>(null);

  const candidates = (slot: Slot) => items.filter((item) => item.slot === slot && matchesStyle(item.style, filter));
  const shown = (slot: RowSlot) => (candidates(slot).some((item) => item.id === picks[slot]) ? picks[slot] : null);
  const accessories = candidates('accessory').filter((item) => accessoryIds.includes(item.id));
  const rowSlots: RowSlot[] = onePiece ? ['onepiece', 'footwear'] : ['top', 'bottom', 'footwear'];

  const result: OutfitPicks = {
    topId: onePiece ? null : shown('top'),
    bottomId: onePiece ? null : shown('bottom'),
    onePieceId: onePiece ? shown('onepiece') : null,
    footwearId: shown('footwear'),
    accessoryIds: accessories.map((item) => item.id),
  };
  const canSave = rowSlots.some((slot) => shown(slot) !== null) || accessories.length > 0;

  const pick = (slot: RowSlot) => (id: string | null) => setPicks({ ...picks, [slot]: id });

  function shuffle() {
    const next = { ...picks };
    for (const slot of rowSlots) {
      const options = candidates(slot);
      next[slot] = options[Math.floor(Math.random() * options.length)]?.id ?? null;
    }
    setPicks(next);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!naming || naming.name.trim() === '') return;
    let id = outfit?.id;
    if (outfit && !naming.asNew) await updateOutfit(outfit.id, { ...result, name: naming.name });
    else id = (await createOutfit(naming.name, result)).id;
    navigate(`/outfits/${id}`);
  }

  const suggestion = `Outfit ${outfitCount + 1}`;
  const itemsById = new Map(items.map((item) => [item.id, item]));

  return (
    <main className="screen builder">
      <header className="screen-header">
        <div>
          <h1>Let’s get dressed</h1>
          {outfit && <p className="muted">Editing {outfit.name}</p>}
        </div>
        <button className="button secondary" onClick={shuffle}>
          Shuffle
        </button>
      </header>
      <StyleFilter value={filter} onChange={setFilter} />
      <div className="builder-layout">
        <div className="builder-rows">
          {onePiece ? (
            <SwipeRow
              label="One-piece"
              tall
              options={candidates('onepiece')}
              value={shown('onepiece')}
              onChange={pick('onepiece')}
              action={
                <button className="text-button" onClick={() => setOnePiece(false)}>
                  Back to top + bottom
                </button>
              }
            />
          ) : (
            <>
              <SwipeRow
                label="Top"
                options={candidates('top')}
                value={shown('top')}
                onChange={pick('top')}
                action={
                  <button className="text-button" onClick={() => setOnePiece(true)}>
                    Wear a one-piece instead
                  </button>
                }
              />
              <SwipeRow label="Bottom" options={candidates('bottom')} value={shown('bottom')} onChange={pick('bottom')} />
            </>
          )}
          <SwipeRow label="Footwear" options={candidates('footwear')} value={shown('footwear')} onChange={pick('footwear')} />
          <AccessoriesRow options={candidates('accessory')} chosen={accessories} onChange={setAccessoryIds} />
        </div>
        <aside className="builder-preview" aria-hidden>
          {canSave ? (
            <OutfitStack picks={result} items={itemsById} size="thumb" />
          ) : (
            <p className="muted">Your outfit shows up here.</p>
          )}
        </aside>
      </div>
      {naming ? (
        <form className="name-form" onSubmit={save}>
          <label className="field">
            <span>Outfit name</span>
            <input autoFocus value={naming.name} onChange={(e) => setNaming({ ...naming, name: e.target.value })} />
          </label>
          <div className="actions">
            <button type="button" className="button secondary" onClick={() => setNaming(null)}>
              Cancel
            </button>
            <button className="button" disabled={naming.name.trim() === ''}>
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="actions">
          {outfit && (
            <button className="button secondary" disabled={!canSave} onClick={() => setNaming({ asNew: true, name: suggestion })}>
              Save as new
            </button>
          )}
          <button
            className="button"
            disabled={!canSave}
            onClick={() => setNaming({ asNew: false, name: outfit?.name ?? suggestion })}
          >
            Save outfit
          </button>
        </div>
      )}
    </main>
  );
}
