import { Anchor, Badge, Box, Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router';
import { listItems } from '../items';
import { includesWishlist } from './outfit';
import { OutfitStack } from './OutfitStack';
import { listOutfits } from './outfitStore';

export function OutfitsScreen() {
  const outfits = useLiveQuery(listOutfits);
  const items = useLiveQuery(listItems);
  if (!outfits || !items) return null;
  const itemsById = new Map(items.map((item) => [item.id, item]));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="baseline">
        <Title order={1}>My outfits</Title>
        <Text c="dimmed" size="sm">
          {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'}
        </Text>
      </Group>
      {outfits.length === 0 ? (
        <Stack align="center" py={64} gap="md">
          <Text c="dimmed">No outfits yet.</Text>
          <Button component={Link} to="/style" size="lg">
            Let’s get dressed
          </Button>
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md" verticalSpacing="xl">
          {outfits.map((outfit) => (
            <Anchor key={outfit.id} component={Link} to={`/outfits/${outfit.id}`} underline="never" c="inherit">
              <Stack gap={8}>
                <Box pos="relative">
                  <OutfitStack picks={outfit} items={itemsById} size="thumb" />
                  {includesWishlist(outfit, itemsById) && (
                    <Badge variant="light" size="sm" radius="sm" pos="absolute" top={8} left={8}>
                      includes wishlist
                    </Badge>
                  )}
                </Box>
                <Text size="sm">{outfit.name}</Text>
              </Stack>
            </Anchor>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
