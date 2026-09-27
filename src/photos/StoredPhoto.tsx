import { Box } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { readPhoto } from './photoStore';
import { PhotoView } from './PhotoView';

export function StoredPhoto({ photoId, size, alt }: { photoId: string; size: 'full' | 'thumb'; alt: string }) {
  const photo = useLiveQuery(() => readPhoto(photoId), [photoId]);
  if (!photo) return <Box w="100%" h="100%" role="img" aria-label={alt} />;
  return <PhotoView photo={photo} size={size} alt={alt} />;
}
