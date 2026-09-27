import { Alert, Anchor, Button, Center, FileButton, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { encodePhoto, PhotoFrame, PhotoView, UnreadablePhotoError, type Photo } from '../photos';
import { ItemForm, draftToFields, type ItemDraft } from './ItemForm';
import { addItem } from './itemStore';
import { readLastStyle, rememberLastStyle } from './lastStyle';

export function newDraft(wishlist: boolean): ItemDraft {
  return { name: '', slot: null, style: readLastStyle(), color: null, notes: '', wishlist };
}

export function AddItem({ wishlist }: { wishlist: boolean }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => newDraft(wishlist));
  const fields = draftToFields(draft);
  const back = wishlist ? '/wishlist' : '/closet';

  async function choose(file: File | null) {
    if (!file) return;
    try {
      setPhoto(await encodePhoto(file));
      setError(null);
    } catch (e) {
      if (!(e instanceof UnreadablePhotoError)) throw e;
      setError(e.message);
    }
  }

  async function save() {
    if (!fields || !photo) return;
    await addItem(fields, photo);
    rememberLastStyle(fields.style);
    navigate(fields.wishlist ? '/wishlist' : '/closet');
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="baseline">
        <Title order={1}>Add an Item</Title>
        <Anchor component={Link} to={back}>
          Cancel
        </Anchor>
      </Group>
      <Grid gap={{ base: 'lg', md: 48 }}>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Stack gap="sm">
            <PhotoFrame>
              {photo ? (
                <PhotoView photo={photo} size="full" alt="Chosen photo" />
              ) : (
                <Center h="100%">
                  <Text c="dimmed" size="sm">
                    No photo yet
                  </Text>
                </Center>
              )}
            </PhotoFrame>
            <FileButton onChange={choose} accept="image/*" inputProps={{ 'aria-label': 'Choose photo' }}>
              {(props) => (
                <Button {...props} variant="default">
                  {photo ? 'Change photo' : 'Choose photo'}
                </Button>
              )}
            </FileButton>
            {error && <Alert>{error}</Alert>}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Stack gap="xl">
            <ItemForm draft={draft} onChange={setDraft} showWishlist />
            <Button size="md" disabled={!fields || !photo} onClick={save}>
              {draft.wishlist ? 'Add to wishlist' : 'Add to closet'}
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
