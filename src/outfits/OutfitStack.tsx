import { AspectRatio, Box, Center, Group, Stack, Text } from '@mantine/core';
import type { Item } from '../items';
import { StoredPhoto } from '../photos';
import type { OutfitPicks } from './outfit';

interface Props {
  picks: OutfitPicks;
  items: Map<string, Item>;
  size: 'full' | 'thumb';
}

export function OutfitStack({ picks, items, size }: Props) {
  const main = [picks.topId, picks.bottomId, picks.onePieceId, picks.footwearId].filter((id) => id !== null);
  return (
    <AspectRatio ratio={3 / 4}>
      <Stack bg="gray.1" bdrs="md" p={size === 'full' ? 'md' : 6} gap={size === 'full' ? 'sm' : 4}>
        {main.map((id) => (
          <Piece key={id} item={items.get(id)} size={size} />
        ))}
        {picks.accessoryIds.length > 0 && (
          <Group gap={4} h={size === 'full' ? 72 : 36} wrap="nowrap" style={{ flex: 'none' }}>
            {picks.accessoryIds.map((id) => (
              <Box key={id} h="100%" style={{ aspectRatio: '1' }}>
                <Piece item={items.get(id)} size="thumb" />
              </Box>
            ))}
          </Group>
        )}
      </Stack>
    </AspectRatio>
  );
}

function Piece({ item, size }: { item: Item | undefined; size: 'full' | 'thumb' }) {
  return (
    <Box flex={1} mih={0} h="100%" bdrs="sm" style={{ overflow: 'hidden' }}>
      {item ? (
        <StoredPhoto photoId={item.photoId} size={size} alt={item.name} />
      ) : (
        <Center h="100%">
          <Text size="xs" c="dimmed">
            Missing
          </Text>
        </Center>
      )}
    </Box>
  );
}
