import { useLiveQuery } from 'dexie-react-hooks';
import { Navigate, useParams, type RouteObject } from 'react-router';
import { AddItems, ItemDetail, ItemsScreen } from '../items';
import { deleteItem, OutfitBuilder, OutfitDetail, OutfitsScreen, outfitUsage } from '../outfits';
import { ErrorScreen } from './ErrorScreen';
import { Shell } from './Shell';
import { ThemeRoot } from './ThemeRoot';

function ItemDetailPage() {
  const id = useParams().id!;
  const usage = useLiveQuery(() => outfitUsage(id), [id]);
  return <ItemDetail id={id} usage={usage} onDelete={() => deleteItem(id)} />;
}

function StylePage() {
  return <OutfitBuilder outfitId={useParams().outfitId} />;
}

function OutfitDetailPage() {
  return <OutfitDetail id={useParams().id!} />;
}

export const routes: RouteObject[] = [
  {
    element: <ThemeRoot />,
    children: [
      {
        element: <Shell />,
        errorElement: <ErrorScreen />,
        children: [
          { index: true, element: <Navigate to="/closet" replace /> },
          { path: 'closet', element: <ItemsScreen key="closet" wishlist={false} /> },
          { path: 'closet/add', element: <AddItems wishlist={false} /> },
          { path: 'wishlist', element: <ItemsScreen key="wishlist" wishlist /> },
          { path: 'wishlist/add', element: <AddItems wishlist /> },
          { path: 'items/:id', element: <ItemDetailPage /> },
          { path: 'style', element: <StylePage /> },
          { path: 'style/:outfitId', element: <StylePage /> },
          { path: 'outfits', element: <OutfitsScreen /> },
          { path: 'outfits/:id', element: <OutfitDetailPage /> },
          { path: '*', element: <Navigate to="/closet" replace /> },
        ],
      },
    ],
  },
];
