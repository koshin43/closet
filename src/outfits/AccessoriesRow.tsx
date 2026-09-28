import { ActionIcon, Box, Button, Checkbox, CloseButton, Drawer, Group, ScrollArea, SimpleGrid, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { ItemCard, type Item } from '../items';
import { PhotoFrame, StoredPhoto } from '../photos';

interface Props {
  options: Item[];
  chosen: Item[];
  onChange: (ids: string[]) => void;
}

export function AccessoriesRow({ options, chosen, onChange }: Props) {
  const [picking, setPicking] = useState(false);
  const chosenIds = chosen.map((item) => item.id);
  const toggle = (id: string) =>
    onChange(chosenIds.includes(id) ? chosenIds.filter((other) => other !== id) : [...chosenIds, id]);

  return (
    <Stack component="section" aria-label="Accessories" gap="xs">
      <Text fw={600}>Accessories</Text>
      <ScrollArea type="never">
        <Group gap="sm" wrap="nowrap">
          {chosen.map((item) => (
            <Box key={item.id} w={84} pos="relative" style={{ flex: 'none' }}>
              <PhotoFrame ratio={1}>
                <StoredPhoto photoId={item.photoId} size="thumb" alt={item.name} />
              </PhotoFrame>
              <CloseButton
                size="sm"
                radius="xl"
                variant="white"
                pos="absolute"
                top={4}
                right={4}
                aria-label={`Remove ${item.name}`}
                onClick={() => toggle(item.id)}
              />
            </Box>
          ))}
          <ActionIcon
            size={84}
            radius="md"
            variant="default"
            aria-label="Choose Accessories"
            style={{ borderStyle: 'dashed', flex: 'none' }}
            onClick={() => setPicking(true)}
          >
            <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </ActionIcon>
        </Group>
      </ScrollArea>
      <Drawer
        opened={picking}
        onClose={() => setPicking(false)}
        position="bottom"
        size="80%"
        title="Choose Accessories"
        radius="md"
      >
        <Stack>
          {options.length === 0 && <Text c="dimmed">No accessories match this filter.</Text>}
          <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="sm">
            {options.map((item) => (
              <Checkbox.Card
                key={item.id}
                checked={chosenIds.includes(item.id)}
                onChange={() => toggle(item.id)}
                radius="md"
                p={6}
                aria-label={item.name}
              >
                <ItemCard item={item} ratio={1} showWishlist />
              </Checkbox.Card>
            ))}
          </SimpleGrid>
          <Button onClick={() => setPicking(false)}>Done</Button>
        </Stack>
      </Drawer>
    </Stack>
  );
}
