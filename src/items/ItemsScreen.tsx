import { ActionIcon, Affix, Anchor, Button, Chip, Group, ScrollArea, SimpleGrid, Stack, Text, Title, useMatches } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router';
import { SLOTS, SLOT_LABELS, type Slot } from './item';
import { ItemCard } from './ItemCard';
import { listItems, setWishlist } from './itemStore';
import { matchesStyle, StyleFilter, type StyleFilterValue } from './StyleFilter';

export function ItemsScreen({ wishlist }: { wishlist: boolean }) {
  const all = useLiveQuery(listItems);
  const [slot, setSlot] = useState<Slot | 'all'>('all');
  const [style, setStyle] = useState<StyleFilterValue>('all');
  const fabOffset = useMatches({
    base: { bottom: 'calc(84px + env(safe-area-inset-bottom))', right: 20 },
    md: { bottom: 32, right: 32 },
  });
  const base = wishlist ? '/wishlist' : '/closet';

  if (!all) return null;
  const mine = all.filter((item) => item.wishlist === wishlist);
  const shown = mine.filter((item) => (slot === 'all' || item.slot === slot) && matchesStyle(item.style, style));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="baseline">
        <Title order={1}>{wishlist ? 'My Wishlist' : 'My Closet'}</Title>
        <Text c="dimmed" size="sm">
          {mine.length} {mine.length === 1 ? 'item' : 'items'}
        </Text>
      </Group>
      {mine.length === 0 ? (
        <Stack align="center" py={64} gap="md">
          <Text c="dimmed">{wishlist ? 'Nothing on your wishlist yet.' : 'Your closet is empty. Let’s fill it up!'}</Text>
          <Button component={Link} to={`${base}/add`} size="lg">
            Add Your First Item
          </Button>
        </Stack>
      ) : (
        <>
          <Group justify="space-between" gap="sm">
            <ScrollArea type="never" maw="100%">
              <Chip.Group value={slot} onChange={(value) => setSlot(SLOTS.find((s) => s === value) ?? 'all')}>
                <Group gap="xs" wrap="nowrap">
                  {(['all', ...SLOTS] as const).map((value) => (
                    <Chip key={value} value={value} type="radio" variant="outline">
                      {value === 'all' ? 'All' : SLOT_LABELS[value].many}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </ScrollArea>
            <StyleFilter value={style} onChange={setStyle} />
          </Group>
          {shown.length === 0 && <Text c="dimmed">Nothing here yet.</Text>}
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md" verticalSpacing="xl">
            {shown.map((item) => (
              <Stack key={item.id} gap="xs">
                <Anchor component={Link} to={`/items/${item.id}`} underline="never" c="inherit" aria-label={item.name}>
                  <ItemCard item={item} />
                </Anchor>
                {wishlist && (
                  <Button variant="light" size="xs" onClick={() => setWishlist(item.id, false)}>
                    I Bought It
                  </Button>
                )}
              </Stack>
            ))}
          </SimpleGrid>
        </>
      )}
      <Affix position={fabOffset}>
        <ActionIcon
          component={Link}
          to={`${base}/add`}
          size={60}
          aria-label="Add Items"
          variant="filled"
          style={{ boxShadow: 'var(--mantine-shadow-md)' }}
        >
          <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </ActionIcon>
      </Affix>
    </Stack>
  );
}
