import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Outlet } from 'react-router';
import { theme } from './theme';

export function ThemeRoot() {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <Outlet />
    </MantineProvider>
  );
}
