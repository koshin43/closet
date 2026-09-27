import { AspectRatio, Box } from '@mantine/core';
import type { ReactNode } from 'react';

export function PhotoFrame({ ratio = 3 / 4, children }: { ratio?: number; children: ReactNode }) {
  return (
    <AspectRatio ratio={ratio}>
      <Box pos="relative" bg="gray.1" bdrs="md" style={{ overflow: 'hidden' }}>
        {children}
      </Box>
    </AspectRatio>
  );
}
