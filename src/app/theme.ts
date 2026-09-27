import { createTheme, type MantineColorsTuple } from '@mantine/core';

const terracotta: MantineColorsTuple = [
  '#fdf1ed', '#fbe3d8', '#f3c1b1', '#eca188', '#e68767',
  '#e07a5f', '#c9644a', '#a9513b', '#8a412f', '#6b3224',
];

// Warm greys: [1] is the photo backdrop, [3] hairlines, [6] muted text, [9] body text.
const gray: MantineColorsTuple = [
  '#faf8f6', '#f5f2ee', '#efebe6', '#ebe6e1', '#d9d1ca',
  '#b3aaa3', '#756c66', '#5c544f', '#3f3935', '#1f1b18',
];

export const theme = createTheme({
  colors: { terracotta, gray },
  primaryColor: 'terracotta',
  primaryShade: 6,
  black: gray[9],
  white: '#ffffff',
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  headings: {
    fontWeight: '600',
    sizes: { h1: { fontSize: 'clamp(1.75rem, 1.5rem + 1vw, 2rem)', lineHeight: '1.2' } },
  },
  defaultRadius: 'md',
  radius: { md: '8px' },
  breakpoints: { xs: '36em', sm: '48em', md: '56.25em', lg: '75em', xl: '88em' },
  cursorType: 'pointer',
  respectReducedMotion: true,
  components: {
    Button: { defaultProps: { radius: 'xl' } },
    ActionIcon: { defaultProps: { radius: 'xl' } },
    Chip: {
      defaultProps: { radius: 'xl' },
      styles: { iconWrapper: { display: 'none' } },
      vars: () => ({ root: { '--chip-checked-padding': 'var(--chip-padding)' } }),
    },
    Badge: { styles: { root: { textTransform: 'none', fontWeight: 500 } } },
    SegmentedControl: { defaultProps: { radius: 'xl' } },
  },
});
