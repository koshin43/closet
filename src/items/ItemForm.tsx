import { COLORS, SLOTS, SLOT_LABELS, STYLES, STYLE_LABELS, type Color, type ItemFields, type Slot, type StyleTag } from './item';

export interface ItemDraft {
  name: string;
  slot: Slot | null;
  style: StyleTag;
  color: Color | null;
  notes: string;
  wishlist: boolean;
}

export function draftToFields(draft: ItemDraft): ItemFields | null {
  if (draft.name.trim() === '' || draft.slot === null) return null;
  return {
    name: draft.name,
    slot: draft.slot,
    style: draft.style,
    color: draft.color,
    notes: draft.notes.trim() === '' ? null : draft.notes,
    wishlist: draft.wishlist,
  };
}

export function ItemForm({
  draft,
  onChange,
  showWishlist,
}: {
  draft: ItemDraft;
  onChange: (draft: ItemDraft) => void;
  showWishlist: boolean;
}) {
  const set = (change: Partial<ItemDraft>) => onChange({ ...draft, ...change });
  return (
    <div className="item-form">
      <label className="field">
        <span>Name</span>
        <input value={draft.name} placeholder="e.g. red silk saree" onChange={(e) => set({ name: e.target.value })} />
      </label>
      <fieldset className="field">
        <legend>Goes in</legend>
        <div className="pills">
          {SLOTS.map((slot) => (
            <label key={slot} className="pill">
              <input type="radio" name="slot" checked={draft.slot === slot} onChange={() => set({ slot })} />
              {SLOT_LABELS[slot].one}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="field">
        <legend>Style</legend>
        <div className="pills">
          {STYLES.map((style) => (
            <label key={style} className="pill">
              <input type="radio" name="style" checked={draft.style === style} onChange={() => set({ style })} />
              {STYLE_LABELS[style]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span>Color</span>
        <select
          value={draft.color ?? ''}
          onChange={(e) => set({ color: COLORS.find((color) => color === e.target.value) ?? null })}
        >
          <option value="">No color</option>
          {COLORS.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Notes</span>
        <textarea value={draft.notes} rows={2} onChange={(e) => set({ notes: e.target.value })} />
      </label>
      {showWishlist && (
        <label className="toggle">
          <input type="checkbox" checked={draft.wishlist} onChange={(e) => set({ wishlist: e.target.checked })} />
          Wishlist
        </label>
      )}
    </div>
  );
}
