import { STYLES, STYLE_LABELS, type StyleTag } from './item';

export type StyleFilterValue = StyleTag | 'all';

export function matchesStyle(style: StyleTag, filter: StyleFilterValue): boolean {
  return filter === 'all' || style === filter;
}

export function StyleFilter({ value, onChange }: { value: StyleFilterValue; onChange: (value: StyleFilterValue) => void }) {
  return (
    <div className="segmented" role="group" aria-label="Style filter">
      {(['all', ...STYLES] as const).map((option) => (
        <button key={option} aria-pressed={value === option} onClick={() => onChange(option)}>
          {option === 'all' ? 'All' : STYLE_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
