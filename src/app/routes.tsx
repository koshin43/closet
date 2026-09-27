import { useLiveQuery } from 'dexie-react-hooks';
import { Navigate, useParams, type RouteObject } from 'react-router';
import { AddItem, BulkAdd, ItemDetail, ItemsScreen } from '../items';
import { deleteItem, OutfitBuilder, OutfitDetail, OutfitsScreen, outfitUsage } from '../outfits';
import { ErrorScreen } from './ErrorScreen';
import { Shell } from './Shell';

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
    element: <Shell />,
    errorElement: <ErrorScreen />,
    children: [
      { index: true, element: <Navigate to="/closet" replace /> },
      { path: 'closet', element: <ItemsScreen key="closet" wishlist={false} /> },
      { path: 'closet/add', element: <AddItem wishlist={false} /> },
      { path: 'closet/bulk', element: <BulkAdd wishlist={false} /> },
      { path: 'wishlist', element: <ItemsScreen key="wishlist" wishlist /> },
      { path: 'wishlist/add', element: <AddItem wishlist /> },
      { path: 'wishlist/bulk', element: <BulkAdd wishlist /> },
      { path: 'items/:id', element: <ItemDetailPage /> },
      { path: 'style', element: <StylePage /> },
      { path: 'style/:outfitId', element: <StylePage /> },
      { path: 'outfits', element: <OutfitsScreen /> },
      { path: 'outfits/:id', element: <OutfitDetailPage /> },
      { path: '*', element: <Navigate to="/closet" replace /> },
    ],
  },
];
