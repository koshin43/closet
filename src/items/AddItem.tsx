import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BlobImage, encodePhoto, UnreadablePhotoError, type Photo } from '../photos';
import { ItemForm, draftToFields, type ItemDraft } from './ItemForm';
import { addItem } from './itemStore';
import { readLastStyle, rememberLastStyle } from './lastStyle';

export function newDraft(wishlist: boolean): ItemDraft {
  return { name: '', slot: null, style: readLastStyle(), color: null, notes: '', wishlist };
}

export function AddItem({ wishlist }: { wishlist: boolean }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => newDraft(wishlist));
  const fields = draftToFields(draft);
  const back = wishlist ? '/wishlist' : '/closet';

  async function choose(file: File | undefined) {
    if (!file) return;
    try {
      setPhoto(await encodePhoto(file));
      setError(null);
    } catch (e) {
      if (!(e instanceof UnreadablePhotoError)) throw e;
      setError(e.message);
    }
  }

  async function save() {
    if (!fields || !photo) return;
    await addItem(fields, photo);
    rememberLastStyle(fields.style);
    navigate(fields.wishlist ? '/wishlist' : '/closet');
  }

  return (
    <main className="screen narrow">
      <header className="screen-header">
        <h1>Add an item</h1>
        <Link to={back} className="text-button">
          Cancel
        </Link>
      </header>
      <div className="add-photo">{photo && <BlobImage blob={photo.full} alt="Chosen photo" />}</div>
      <label className="button secondary">
        {photo ? 'Change photo' : 'Choose photo'}
        <input type="file" accept="image/*" hidden onChange={(e) => choose(e.target.files?.[0])} />
      </label>
      {error && <p role="alert" className="error">{error}</p>}
      <ItemForm draft={draft} onChange={setDraft} showWishlist />
      <button className="button" disabled={!fields || !photo} onClick={save}>
        {draft.wishlist ? 'Add to wishlist' : 'Add to closet'}
      </button>
    </main>
  );
}
