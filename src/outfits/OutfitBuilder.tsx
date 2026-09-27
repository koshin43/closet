import { Anchor, Box, Button, Grid, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { listItems, matchesStyle, StyleFilter, type Item, type Slot, type StyleFilterValue } from '../items';
import { AccessoriesRow } from './AccessoriesRow';
import type { Outfit, OutfitPicks } from './outfit';
import { OutfitStack } from './OutfitStack';
import { createOutfit, listOutfits, readOutfit, updateOutfit } from './outfitStore';
import { SwipeRow } from './SwipeRow';

type RowSlot = Exclude<Slot, 'accessory'>;
type Picks = Record<RowSlot, string | null>;

export function OutfitBuilder({ outfitId }: { outfitId: string | undefined }) {
  const items = useLiveQuery(listItems);
  const outfits = useLiveQuery(listOutfits);
  const outfit = useLiveQuery(async () => (outfitId ? readOutfit(outfitId) : null), [outfitId]);
  if (!items || !outfits || outfit === undefined) return null;
  if (outfitId && !outfit) {
    return (
      <Stack align="flex-start">
        <Text>This outfit no longer exists.</Text>
        <Anchor component={Link} to="/style">
          Start a new outfit
        </Anchor>
      </Stack>
    );
  }
  return <Builder key={outfitId ?? 'new'} items={items} outfit={outfit} outfitCount={outfits.length} />;
}

interface Naming {
  asNew: boolean;
  name: string;
}

function Builder({ items, outfit, outfitCount }: { items: Item[]; outfit: Outfit | null; outfitCount: number }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StyleFilterValue>('all');
  const [onePiece, setOnePiece] = useState(outfit?.onePieceId != null);
  const [picks, setPicks] = useState<Picks>({
    top: outfit?.topId ?? null,
    bottom: outfit?.bottomId ?? null,
    onepiece: outfit?.onePieceId ?? null,
    footwear: outfit?.footwearId ?? null,
  });
  const [accessoryIds, setAccessoryIds] = useState<string[]>(outfit?.accessoryIds ?? []);
  const [naming, setNaming] = useState<Naming | null>(null);

  const candidates = (slot: Slot) => items.filter((item) => item.slot === slot && matchesStyle(item.style, filter));
  const shown = (slot: RowSlot) => (candidates(slot).some((item) => item.id === picks[slot]) ? picks[slot] : null);
  const accessories = candidates('accessory').filter((item) => accessoryIds.includes(item.id));
  const rowSlots: RowSlot[] = onePiece ? ['onepiece', 'footwear'] : ['top', 'bottom', 'footwear'];

  const result: OutfitPicks = {
    topId: onePiece ? null : shown('top'),
    bottomId: onePiece ? null : shown('bottom'),
    onePieceId: onePiece ? shown('onepiece') : null,
    footwearId: shown('footwear'),
    accessoryIds: accessories.map((item) => item.id),
  };
  const canSave = rowSlots.some((slot) => shown(slot) !== null) || accessories.length > 0;

  const pick = (slot: RowSlot) => (id: string | null) => setPicks((current) => ({ ...current, [slot]: id }));

  function shuffle() {
    const next = { ...picks };
    for (const slot of rowSlots) {
      const options = candidates(slot);
      next[slot] = options[Math.floor(Math.random() * options.length)]?.id ?? null;
    }
    setPicks(next);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!naming || naming.name.trim() === '') return;
    let id = outfit?.id;
    if (outfit && !naming.asNew) await updateOutfit(outfit.id, { ...result, name: naming.name });
    else id = (await createOutfit(naming.name, result)).id;
    navigate(`/outfits/${id}`);
  }

  const suggestion = `Outfit ${outfitCount + 1}`;
  const itemsById = new Map(items.map((item) => [item.id, item]));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1}>Let’s Get Dressed</Title>
          {outfit && <Text c="dimmed">Editing {outfit.name}</Text>}
        </div>
        <Button variant="default" onClick={shuffle}>
          Shuffle
        </Button>
      </Group>
      <StyleFilter value={filter} onChange={setFilter} />
      <Grid gap={{ base: 'lg', md: 48 }}>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            {onePiece ? (
              <SwipeRow
                label="One-piece"
                tall
                options={candidates('onepiece')}
                value={shown('onepiece')}
                onChange={pick('onepiece')}
                action={
                  <Anchor component="button" size="sm" onClick={() => setOnePiece(false)}>
                    Back to top + bottom
                  </Anchor>
                }
              />
            ) : (
              <>
                <SwipeRow
                  label="Top"
                  options={candidates('top')}
                  value={shown('top')}
                  onChange={pick('top')}
                  action={
                    <Anchor component="button" size="sm" onClick={() => setOnePiece(true)}>
                      Wear a one-piece instead
                    </Anchor>
                  }
                />
                <SwipeRow label="Bottom" options={candidates('bottom')} value={shown('bottom')} onChange={pick('bottom')} />
              </>
            )}
            <SwipeRow label="Footwear" options={candidates('footwear')} value={shown('footwear')} onChange={pick('footwear')} />
            <AccessoriesRow options={candidates('accessory')} chosen={accessories} onChange={setAccessoryIds} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" pos="sticky" top={92}>
            <Box visibleFrom="md" aria-hidden>
              {canSave ? (
                <OutfitStack picks={result} items={itemsById} size="thumb" />
              ) : (
                <Text c="dimmed" size="sm">
                  Your outfit shows up here.
                </Text>
              )}
            </Box>
            <Button size="md" disabled={!canSave} onClick={() => setNaming({ asNew: false, name: outfit?.name ?? suggestion })}>
              Save outfit
            </Button>
            {outfit && (
              <Button variant="default" size="md" disabled={!canSave} onClick={() => setNaming({ asNew: true, name: suggestion })}>
                Save as new
              </Button>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
      <Modal opened={naming !== null} onClose={() => setNaming(null)} title="Name This Outfit" centered>
        {naming && (
          <form onSubmit={save}>
            <Stack>
              <TextInput
                label="Outfit name"
                data-autofocus
                value={naming.name}
                onChange={(e) => setNaming({ ...naming, name: e.currentTarget.value })}
              />
              <Group grow>
                <Button variant="default" onClick={() => setNaming(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={naming.name.trim() === ''}>
                  Save
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Stack>
  );
}
