import { useLiveQuery } from 'dexie-react-hooks';
import { BlobImage } from './BlobImage';
import { readPhoto } from './photoStore';

export function StoredPhoto({ photoId, size, alt }: { photoId: string; size: 'full' | 'thumb'; alt: string }) {
  const photo = useLiveQuery(() => readPhoto(photoId), [photoId]);
  if (!photo) return <div className="photo" role="img" aria-label={alt} />;
  return <BlobImage blob={photo[size]} alt={alt} />;
}
