import { Carousel } from '@mantine/carousel';
import { Alert, Anchor, Badge, Button, Center, CloseButton, FileButton, Grid, Group, Progress, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import type { EmblaCarouselType } from 'embla-carousel';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { encodePhoto, PhotoFrame, PhotoView, UnreadablePhotoError, type Photo } from '../photos';
import { ItemForm, draftToFields, type ItemDraft } from './ItemForm';
import { addItem } from './itemStore';
import { readLastStyle, rememberLastStyle } from './lastStyle';

interface Entry {
  photo: Photo;
  saved: boolean;
}

function freshDraft(template: Pick<ItemDraft, 'slot' | 'style' | 'wishlist'>): ItemDraft {
  return { ...template, name: '', color: null, notes: '' };
}

export function AddItems({ wishlist }: { wishlist: boolean }) {
  const back = wishlist ? '/wishlist' : '/closet';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [current, setCurrent] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>({});
  const [carry, setCarry] = useState<Pick<ItemDraft, 'slot' | 'style' | 'wishlist'>>(() => ({
    slot: null,
    style: readLastStyle(),
    wishlist,
  }));
  const [preparing, setPreparing] = useState<{ done: number; total: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);

  const entry = entries[current];
  const draft = entry ? (drafts[entry.photo.id] ?? freshDraft(carry)) : null;
  const fields = draft ? draftToFields(draft) : null;
  const savedCount = entries.filter((e) => e.saved).length;
  const othersUnsaved = entries.some((e, i) => i !== current && !e.saved);

  useEffect(() => {
    if (embla && embla.selectedScrollSnap() !== current) embla.scrollTo(current);
  }, [embla, current, entries.length]);

  async function addPhotos(files: File[]) {
    if (files.length === 0) return;
    const photos: Photo[] = [];
    let unreadable = 0;
    for (const [done, file] of files.entries()) {
      setPreparing({ done, total: files.length });
      try {
        photos.push(await encodePhoto(file));
      } catch (e) {
        if (!(e instanceof UnreadablePhotoError)) throw e;
        unreadable += 1;
      }
    }
    setPreparing(null);
    setNotice(
      unreadable === 0
        ? null
        : `${unreadable} ${unreadable === 1 ? "file couldn't be read and was" : "files couldn't be read and were"} left out.`,
    );
    if (photos.length === 0) return;
    setCurrent(entries.length);
    setEntries([...entries, ...photos.map((photo) => ({ photo, saved: false }))]);
  }

  async function save() {
    if (!entry || !fields) return;
    await addItem(fields, entry.photo);
    rememberLastStyle(fields.style);
    setCarry({ slot: fields.slot, style: fields.style, wishlist: fields.wishlist });
    const next = entries.map((e, i) => (i === current ? { ...e, saved: true } : e));
    setEntries(next);
    const after = next.findIndex((e, i) => i > current && !e.saved);
    const before = next.findIndex((e) => !e.saved);
    setCurrent(after !== -1 ? after : before !== -1 ? before : next.length);
  }

  function remove(index: number) {
    const next = entries.filter((_, i) => i !== index);
    setEntries(next);
    setCurrent(Math.min(index < current ? current - 1 : current, next.length));
  }

  function setDraft(value: ItemDraft) {
    if (entry) setDrafts({ ...drafts, [entry.photo.id]: value });
  }

  const addedMessage = `${savedCount} ${savedCount === 1 ? 'item' : 'items'} added to your ${carry.wishlist ? 'wishlist' : 'closet'}.`;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="baseline">
        <Title order={1}>Add Items</Title>
        {(entry || entries.length === 0) && (
          <Anchor component={Link} to={back}>
            {savedCount > 0 ? 'Done' : 'Cancel'}
          </Anchor>
        )}
      </Group>
      {notice && <Alert>{notice}</Alert>}
      {preparing && (
        <Stack gap="xs" maw={420} role="status">
          <Text c="dimmed" size="sm">
            Getting photos ready… {preparing.done} of {preparing.total}
          </Text>
          <Progress value={(preparing.done / preparing.total) * 100} />
        </Stack>
      )}
      {!preparing && entries.length === 0 && (
        <Stack maw={360}>
          <PhotoFrame>
            <Center h="100%" style={{ border: '1.5px dashed var(--mantine-color-gray-5)', borderRadius: 'var(--mantine-radius-md)' }}>
              <Stack align="center" gap="sm" p="md">
                <FileButton onChange={addPhotos} accept="image/*" multiple inputProps={{ 'aria-label': 'Choose Photos' }}>
                  {(props) => <Button {...props}>Choose Photos</Button>}
                </FileButton>
                <Text c="dimmed" size="sm" ta="center">
                  Pick one photo or several from your gallery.
                </Text>
              </Stack>
            </Center>
          </PhotoFrame>
        </Stack>
      )}
      {entries.length > 0 && (
        <Grid gap={{ base: 'lg', md: 48 }}>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Carousel
                getEmblaApi={setEmbla}
                initialSlide={current}
                onSlideChange={(i) => i !== current && setCurrent(i)}
                emblaOptions={{ align: 'center', containScroll: false }}
                slideSize="78%"
                slideGap="sm"
                controlsOffset="xs"
                previousControlProps={{ 'aria-label': 'Previous Photo' }}
                nextControlProps={{ 'aria-label': 'Next Photo' }}
              >
                {entries.map((e, i) => (
                  <Carousel.Slide key={e.photo.id} aria-current={i === current} style={{ opacity: i === current ? 1 : 0.45 }}>
                    <PhotoFrame>
                      <PhotoView photo={e.photo} size="full" alt={`Photo ${i + 1}`} />
                      {e.saved ? (
                        <Badge variant="light" radius="sm" pos="absolute" bottom={8} left={8}>
                          Saved
                        </Badge>
                      ) : (
                        <CloseButton
                          radius="xl"
                          variant="white"
                          pos="absolute"
                          top={8}
                          right={8}
                          aria-label={`Remove Photo ${i + 1}`}
                          onClick={() => remove(i)}
                        />
                      )}
                    </PhotoFrame>
                  </Carousel.Slide>
                ))}
                <Carousel.Slide aria-current={current === entries.length}>
                  <FileButton onChange={addPhotos} accept="image/*" multiple inputProps={{ 'aria-label': 'Add More' }}>
                    {(props) => (
                      <UnstyledButton {...props} w="100%">
                        <PhotoFrame>
                          <Center
                            h="100%"
                            style={{ border: '1.5px dashed var(--mantine-color-gray-5)', borderRadius: 'var(--mantine-radius-md)' }}
                          >
                            <Stack align="center" gap={4}>
                              <svg viewBox="0 0 24 24" width={32} height={32} aria-hidden fill="none" stroke="var(--mantine-color-dimmed)" strokeWidth={1.8} strokeLinecap="round">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                              <Text c="dimmed" size="sm">
                                Add More
                              </Text>
                            </Stack>
                          </Center>
                        </PhotoFrame>
                      </UnstyledButton>
                    )}
                  </FileButton>
                </Carousel.Slide>
              </Carousel>
              {entry && (
                <Text c="dimmed" size="sm" ta="center">
                  Photo {current + 1} of {entries.length}
                </Text>
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            {entry && draft && !entry.saved && (
              <Stack gap="xl">
                <ItemForm draft={draft} onChange={setDraft} showWishlist />
                <Button size="md" disabled={!fields} onClick={save}>
                  {othersUnsaved ? 'Save And Next' : draft.wishlist ? 'Add To Wishlist' : 'Add To Closet'}
                </Button>
              </Stack>
            )}
            {entry?.saved && <Text c="dimmed">Saved. To change it, open it from your list.</Text>}
            {!entry && (
              <Stack gap="md">
                <Text>{savedCount > 0 ? addedMessage : 'Add more photos or finish.'}</Text>
                <Button component={Link} to={back} size="md">
                  Done
                </Button>
              </Stack>
            )}
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}
