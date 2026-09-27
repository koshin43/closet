import { Alert, Anchor, Button, FileButton, Grid, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { encodePhoto, PhotoFrame, PhotoView, UnreadablePhotoError, type Photo } from '../photos';
import { newDraft } from './AddItem';
import { ItemForm, draftToFields } from './ItemForm';
import { addItem } from './itemStore';
import { rememberLastStyle } from './lastStyle';

type Phase =
  | { name: 'pick' }
  | { name: 'preparing'; done: number; total: number }
  | { name: 'walk'; photos: Photo[]; index: number };

export function BulkAdd({ wishlist }: { wishlist: boolean }) {
  const navigate = useNavigate();
  const back = wishlist ? '/wishlist' : '/closet';
  const [phase, setPhase] = useState<Phase>({ name: 'pick' });
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => newDraft(wishlist));
  const fields = draftToFields(draft);
  const current = phase.name === 'walk' ? phase.photos[phase.index] : undefined;

  async function prepare(files: File[]) {
    if (files.length === 0) return;
    const photos: Photo[] = [];
    let unreadable = 0;
    for (const [done, file] of files.entries()) {
      setPhase({ name: 'preparing', done, total: files.length });
      try {
        photos.push(await encodePhoto(file));
      } catch (e) {
        if (!(e instanceof UnreadablePhotoError)) throw e;
        unreadable += 1;
      }
    }
    setNotice(
      unreadable === 0
        ? null
        : `${unreadable} ${unreadable === 1 ? "file couldn't be read and was" : "files couldn't be read and were"} left out.`,
    );
    setPhase(photos.length === 0 ? { name: 'pick' } : { name: 'walk', photos, index: 0 });
  }

  function next(photos: Photo[], index: number) {
    setDraft((previous) => ({ ...newDraft(previous.wishlist), slot: previous.slot, style: previous.style }));
    if (index + 1 < photos.length) setPhase({ name: 'walk', photos, index: index + 1 });
    else navigate(back);
  }

  async function saveAndNext(photos: Photo[], index: number, photo: Photo) {
    if (!fields) return;
    await addItem(fields, photo);
    rememberLastStyle(fields.style);
    next(photos, index);
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="baseline">
        <Title order={1}>{phase.name === 'walk' ? `${phase.index + 1} of ${phase.photos.length}` : 'Add Several Items'}</Title>
        <Anchor component={Link} to={back}>
          {phase.name === 'walk' ? 'Done' : 'Cancel'}
        </Anchor>
      </Group>
      {notice && <Alert>{notice}</Alert>}
      {phase.name === 'pick' && (
        <FileButton onChange={prepare} accept="image/*" multiple inputProps={{ 'aria-label': 'Choose photos' }}>
          {(props) => (
            <Button {...props} size="md" maw={320}>
              Choose photos
            </Button>
          )}
        </FileButton>
      )}
      {phase.name === 'preparing' && (
        <Stack gap="xs" maw={420} role="status">
          <Text c="dimmed" size="sm">
            Getting photos ready… {phase.done} of {phase.total}
          </Text>
          <Progress value={(phase.done / phase.total) * 100} />
        </Stack>
      )}
      {phase.name === 'walk' && current && (
        <Grid gap={{ base: 'lg', md: 48 }}>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <PhotoFrame>
              <PhotoView key={current.id} photo={current} size="full" alt={`Photo ${phase.index + 1}`} />
            </PhotoFrame>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xl">
              <ItemForm draft={draft} onChange={setDraft} showWishlist />
              <Group grow>
                <Button variant="default" size="md" onClick={() => next(phase.photos, phase.index)}>
                  Skip
                </Button>
                <Button size="md" disabled={!fields} onClick={() => saveAndNext(phase.photos, phase.index, current)}>
                  Save and next
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}
