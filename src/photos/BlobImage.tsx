import { useCallback } from 'react';
import './photos.css';

export function BlobImage({ blob, alt }: { blob: Blob; alt: string }) {
  const attach = useCallback(
    (img: HTMLImageElement) => {
      const url = URL.createObjectURL(blob);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [blob],
  );
  return <img ref={attach} alt={alt} className="photo" />;
}
