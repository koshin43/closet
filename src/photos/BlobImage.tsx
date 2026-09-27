import { Image } from '@mantine/core';
import { useCallback } from 'react';

export function BlobImage({ blob, alt }: { blob: Blob; alt: string }) {
  const attach = useCallback(
    (img: HTMLImageElement) => {
      const url = URL.createObjectURL(blob);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [blob],
  );
  return <Image ref={attach} alt={alt} fit="contain" w="100%" h="100%" />;
}
