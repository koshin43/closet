import { Box } from '@mantine/core';
import { BlobImage } from './BlobImage';
import type { Photo } from './photo';

export function PhotoView({ photo, size, alt }: { photo: Photo; size: 'full' | 'thumb'; alt: string }) {
  return (
    <Box w="100%" h="100%" bg={photo.backdrop ?? undefined}>
      <BlobImage blob={photo[size]} alt={alt} />
    </Box>
  );
}
