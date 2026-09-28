import { Anchor, Badge, Button, Grid, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { listItems } from '../items';
import { includesWishlist } from './outfit';
import { OutfitStack } from './OutfitStack';
import { deleteOutfit, readOutfit, updateOutfit } from './outfitStore';

export function OutfitDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const outfit = useLiveQuery(() => readOutfit(id), [id]);
  const items = useLiveQuery(listItems);
  const [newName, setNewName] = useState<string | null>(null);
  if (outfit === undefined || !items) return null;
  if (outfit === null) {
    return (
      <Stack align="flex-start">
        <Text>This outfit no longer exists.</Text>
        <Anchor component={Link} to="/outfits">
          Back To My Outfits
        </Anchor>
      </Stack>
    );
  }
  const itemsById = new Map(items.map((item) => [item.id, item]));

  async function rename(event: FormEvent) {
    event.preventDefault();
    if (newName === null || newName.trim() === '') return;
    await updateOutfit(id, { name: newName });
    setNewName(null);
  }

  async function remove() {
    if (!window.confirm('Delete this outfit?')) return;
    await deleteOutfit(id);
    navigate('/outfits');
  }

  return (
    <Stack gap="lg">
      <Anchor component={Link} to="/outfits">
        Back
      </Anchor>
      <Grid gap={{ base: 'lg', md: 48 }}>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <OutfitStack picks={outfit} items={itemsById} size="full" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Stack gap="lg">
            {newName === null ? (
              <Stack gap="xs" align="flex-start">
                <Title order={1}>{outfit.name}</Title>
                {includesWishlist(outfit, itemsById) && <Badge variant="light">includes wishlist</Badge>}
              </Stack>
            ) : (
              <form onSubmit={rename}>
                <Stack gap="sm">
                  <TextInput label="Outfit name" data-autofocus value={newName} onChange={(e) => setNewName(e.currentTarget.value)} />
                  <Group grow>
                    <Button variant="default" onClick={() => setNewName(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={newName.trim() === ''}>
                      Save Name
                    </Button>
                  </Group>
                </Stack>
              </form>
            )}
            <Button component={Link} to={`/style/${outfit.id}`} size="md">
              Edit In Builder
            </Button>
            <Group grow>
              <Button variant="default" onClick={() => setNewName(outfit.name)}>
                Rename
              </Button>
              <Button variant="subtle" onClick={remove}>
                Delete
              </Button>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
