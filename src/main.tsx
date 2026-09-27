import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
import { routes } from './app';

void navigator.storage.persist();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={createHashRouter(routes)} />
  </StrictMode>,
);
