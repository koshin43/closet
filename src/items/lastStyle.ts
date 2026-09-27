import { STYLES, type StyleTag } from './item';

const KEY = 'closet.lastStyle';

export function readLastStyle(): StyleTag {
  const stored = localStorage.getItem(KEY);
  return STYLES.find((style) => style === stored) ?? 'western';
}

export function rememberLastStyle(style: StyleTag): void {
  localStorage.setItem(KEY, style);
}
