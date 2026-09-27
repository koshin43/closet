import { Alert, Anchor, Badge, Button, Divider, FileButton, Grid, Group, Stack, Text } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate } from 'react-router';
import { encodePhoto, PhotoFrame, StoredPhoto, UnreadablePhotoError } from '../photos';
import type { Item } from './item';
import { ItemForm, draftToFields, type ItemDraft } from './ItemForm';
import { readItem, replaceItemPhoto, setWishlist, updateItemFields } from './itemStore';

export interface OutfitUsage {
  usedIn: number;
  removedOnDelete: number;
}

interface Props {
  id: string;
  usage: OutfitUsage | undefined;
  onDelete: () => Promise<void>;
}

export function ItemDetail({ id, ...rest }: Props) {
  const item = useLiveQuery(() => readItem(id), [id]);
  if (item === undefined) return null;
  if (item === null) {
    return (
      <Stack align="flex-start">
        <Text>This item no longer exists.</Text>
        <Anchor component={Link} to="/closet">
          Back to my closet
        </Anchor>
      </Stack>
    );
  }
  return <ItemEditor key={item.id} item={item} {...rest} />;
}

function toDraft(item: Item): ItemDraft {
  const { name, slot, style, color, notes, wishlist } = item;
  return { name, slot, style, color, notes: notes ?? '', wishlist };
}

function ItemEditor({ item, usage, onDelete }: Omit<Props, 'id'> & { item: Item }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => toDraft(item));
  const [saved, setSaved] = useState(draft);
  const [error, setError] = useState<string | null>(null);
  const deleting = useRef(false);
  const fields = draftToFields(draft);
  const dirty = (['name', 'slot', 'style', 'color', 'notes'] as const).some((key) => draft[key] !== saved[key]);
  const blocker = useBlocker(() => dirty && !deleting.current);
  const list = item.wishlist ? '/wishlist' : '/closet';

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Discard changes?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  async function save() {
    if (!fields) return;
    const { name, slot, style, color, notes } = fields;
    await updateItemFields(item.id, { name, slot, style, color, notes });
    setSaved(draft);
  }

  async function replace(file: File | null) {
    if (!file) return;
    try {
      await replaceItemPhoto(item.id, await encodePhoto(file));
      setError(null);
    } catch (e) {
      if (!(e instanceof UnreadablePhotoError)) throw e;
      setError(e.message);
    }
  }

  async function remove() {
    if (!usage) return;
    let message = 'Delete this item?';
    if (usage.usedIn > 0) message += ` It's used in ${plural(usage.usedIn, 'outfit')}.`;
    if (usage.removedOnDelete > 0) {
      message += ` ${plural(usage.removedOnDelete, 'outfit')} will also be deleted because nothing else is left in ${usage.removedOnDelete === 1 ? 'it' : 'them'}.`;
    }
    if (!window.confirm(message)) return;
    deleting.current = true;
    await onDelete();
    navigate(list);
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Anchor component={Link} to={list}>
          Back
        </Anchor>
        {item.wishlist && <Badge variant="light">Wishlist</Badge>}
      </Group>
      <Grid gap={{ base: 'lg', md: 48 }}>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Stack gap="sm">
            <PhotoFrame>
              <StoredPhoto photoId={item.photoId} size="full" alt={item.name} />
            </PhotoFrame>
            <FileButton onChange={replace} accept="image/*" inputProps={{ 'aria-label': 'Replace photo' }}>
              {(props) => (
                <Button {...props} variant="default">
                  Replace photo
                </Button>
              )}
            </FileButton>
            {error && <Alert>{error}</Alert>}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Stack gap="xl">
            <ItemForm draft={draft} onChange={setDraft} showWishlist={false} />
            <Button size="md" disabled={!fields || !dirty} onClick={save}>
              Save
            </Button>
            <Divider />
            <Stack gap="sm">
              <Button variant="default" onClick={() => setWishlist(item.id, !item.wishlist)}>
                {item.wishlist ? 'Move to closet' : 'Move to wishlist'}
              </Button>
              <Button variant="subtle" onClick={remove}>
                Delete item
              </Button>
              {usage && (
                <Text c="dimmed" size="sm" ta="center">
                  Used in {plural(usage.usedIn, 'saved outfit')}.
                </Text>
              )}
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
