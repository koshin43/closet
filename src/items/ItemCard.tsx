import { Badge, Group, Stack, Text } from '@mantine/core';
import { PhotoFrame, StoredPhoto } from '../photos';
import type { Item } from './item';

interface Props {
  item: Item;
  ratio?: number;
  showWishlist?: boolean;
}

export function ItemCard({ item, ratio, showWishlist = false }: Props) {
  return (
    <Stack gap={8}>
      <PhotoFrame ratio={ratio}>
        <StoredPhoto photoId={item.photoId} size="thumb" alt={item.name} />
        <Group gap={4} pos="absolute" top={8} left={8}>
          {item.style === 'traditional' && (
            <Badge variant="white" color="dark" size="sm" radius="sm">
              Traditional
            </Badge>
          )}
          {showWishlist && item.wishlist && (
            <Badge variant="light" size="sm" radius="sm">
              wishlist
            </Badge>
          )}
        </Group>
      </PhotoFrame>
      <div>
        <Text size="sm" lineClamp={1}>
          {item.name}
        </Text>
        {item.color && (
          <Text size="xs" c="dimmed">
            {item.color}
          </Text>
        )}
      </div>
    </Stack>
  );
}
