import { Chip, Group, Input, NativeSelect, SegmentedControl, Stack, Switch, Textarea, TextInput } from '@mantine/core';
import { COLORS, SLOTS, SLOT_LABELS, STYLES, STYLE_LABELS, type Color, type ItemFields, type Slot, type StyleTag } from './item';

export interface ItemDraft {
  name: string;
  slot: Slot | null;
  style: StyleTag;
  color: Color | null;
  notes: string;
  wishlist: boolean;
}

export function draftToFields(draft: ItemDraft): ItemFields | null {
  if (draft.name.trim() === '' || draft.slot === null) return null;
  return {
    name: draft.name,
    slot: draft.slot,
    style: draft.style,
    color: draft.color,
    notes: draft.notes.trim() === '' ? null : draft.notes,
    wishlist: draft.wishlist,
  };
}

export function ItemForm({
  draft,
  onChange,
  showWishlist,
}: {
  draft: ItemDraft;
  onChange: (draft: ItemDraft) => void;
  showWishlist: boolean;
}) {
  const set = (change: Partial<ItemDraft>) => onChange({ ...draft, ...change });
  return (
    <Stack gap="lg">
      <TextInput
        label="Name"
        placeholder="e.g. red silk saree"
        value={draft.name}
        onChange={(e) => set({ name: e.currentTarget.value })}
      />
      <Input.Wrapper label="Goes in">
        <Chip.Group value={draft.slot ?? ''} onChange={(value) => set({ slot: SLOTS.find((slot) => slot === value) ?? null })}>
          <Group gap="xs" mt={6}>
            {SLOTS.map((slot) => (
              <Chip key={slot} value={slot} type="radio" variant="outline">
                {SLOT_LABELS[slot].one}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Input.Wrapper>
      <Input.Wrapper label="Style">
        <SegmentedControl
          display="flex"
          mt={6}
          value={draft.style}
          onChange={(value) => set({ style: STYLES.find((style) => style === value) ?? draft.style })}
          data={STYLES.map((style) => ({ value: style, label: STYLE_LABELS[style] }))}
        />
      </Input.Wrapper>
      <NativeSelect
        label="Color"
        value={draft.color ?? ''}
        onChange={(e) => set({ color: COLORS.find((color) => color === e.currentTarget.value) ?? null })}
        data={[{ value: '', label: 'No color' }, ...COLORS.map((color) => ({ value: color, label: color }))]}
      />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        value={draft.notes}
        onChange={(e) => set({ notes: e.currentTarget.value })}
      />
      {showWishlist && (
        <Switch label="Wishlist" checked={draft.wishlist} onChange={(e) => set({ wishlist: e.currentTarget.checked })} />
      )}
    </Stack>
  );
}
