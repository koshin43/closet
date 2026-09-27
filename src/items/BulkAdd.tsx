import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BlobImage, encodePhoto, UnreadablePhotoError, type Photo } from '../photos';
import { newDraft } from './AddItem';
import { ItemForm, draftToFields } from './ItemForm';
import { addItem } from './itemStore';
import { rememberLastStyle } from './lastStyle';

type Phase =
  | { name: 'pick' }
  | { name: 'preparing'; done: number; total: number }
  | { name: 'walk'; photos: Photo[]; index: number };

export function BulkAdd({ wishlist }: { wishlist: boolean }) {
  const navigate = useNavigate();
  const back = wishlist ? '/wishlist' : '/closet';
  const [phase, setPhase] = useState<Phase>({ name: 'pick' });
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => newDraft(wishlist));
  const fields = draftToFields(draft);
  const current = phase.name === 'walk' ? phase.photos[phase.index] : undefined;

  async function prepare(files: File[]) {
    if (files.length === 0) return;
    const photos: Photo[] = [];
    let unreadable = 0;
    for (const [done, file] of files.entries()) {
      setPhase({ name: 'preparing', done, total: files.length });
      try {
        photos.push(await encodePhoto(file));
      } catch (e) {
        if (!(e instanceof UnreadablePhotoError)) throw e;
        unreadable += 1;
      }
    }
    setNotice(
      unreadable === 0
        ? null
        : `${unreadable} ${unreadable === 1 ? "file couldn't be read and was" : "files couldn't be read and were"} left out.`,
    );
    setPhase(photos.length === 0 ? { name: 'pick' } : { name: 'walk', photos, index: 0 });
  }

  function next(photos: Photo[], index: number) {
    setDraft((previous) => ({ ...newDraft(previous.wishlist), slot: previous.slot, style: previous.style }));
    if (index + 1 < photos.length) setPhase({ name: 'walk', photos, index: index + 1 });
    else navigate(back);
  }

  async function saveAndNext(photos: Photo[], index: number, photo: Photo) {
    if (!fields) return;
    await addItem(fields, photo);
    rememberLastStyle(fields.style);
    next(photos, index);
  }

  return (
    <main className="screen narrow">
      <header className="screen-header">
        <h1>{phase.name === 'walk' ? `${phase.index + 1} of ${phase.photos.length}` : 'Add several items'}</h1>
        <Link to={back} className="text-button">
          {phase.name === 'walk' ? 'Done' : 'Cancel'}
        </Link>
      </header>
      {notice && <p role="alert" className="error">{notice}</p>}
      {phase.name === 'pick' && (
        <label className="button">
          Choose photos
          <input type="file" accept="image/*" multiple hidden onChange={(e) => prepare([...(e.target.files ?? [])])} />
        </label>
      )}
      {phase.name === 'preparing' && (
        <p className="muted" role="status">
          Getting photos ready… {phase.done} of {phase.total}
        </p>
      )}
      {phase.name === 'walk' && current && (
        <>
          <div className="add-photo">
            <BlobImage key={current.id} blob={current.full} alt={`Photo ${phase.index + 1}`} />
          </div>
          <ItemForm draft={draft} onChange={setDraft} showWishlist />
          <div className="actions">
            <button className="button secondary" onClick={() => next(phase.photos, phase.index)}>
              Skip
            </button>
            <button className="button" disabled={!fields} onClick={() => saveAndNext(phase.photos, phase.index, current)}>
              Save and next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
