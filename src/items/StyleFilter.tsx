import { SegmentedControl } from '@mantine/core';
import { STYLES, STYLE_LABELS, type StyleTag } from './item';

export type StyleFilterValue = StyleTag | 'all';

export function matchesStyle(style: StyleTag, filter: StyleFilterValue): boolean {
  return filter === 'all' || style === filter;
}

const OPTIONS: { value: StyleFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  ...STYLES.map((style) => ({ value: style, label: STYLE_LABELS[style] })),
];

export function StyleFilter({ value, onChange }: { value: StyleFilterValue; onChange: (value: StyleFilterValue) => void }) {
  return (
    <SegmentedControl
      aria-label="Style filter"
      size="sm"
      style={{ alignSelf: 'flex-start' }}
      data={OPTIONS}
      value={value}
      onChange={(next) => onChange(OPTIONS.find((option) => option.value === next)!.value)}
    />
  );
}
