import type { Item } from '../items';
import { StoredPhoto } from '../photos';
import type { OutfitPicks } from './outfit';

interface Props {
  picks: OutfitPicks;
  items: Map<string, Item>;
  size: 'full' | 'thumb';
}

export function OutfitStack({ picks, items, size }: Props) {
  const main = [picks.topId, picks.bottomId, picks.onePieceId, picks.footwearId].filter((id) => id !== null);
  return (
    <div className="outfit-stack">
      {main.map((id) => (
        <Piece key={id} item={items.get(id)} size={size} />
      ))}
      {picks.accessoryIds.length > 0 && (
        <div className="outfit-accessories">
          {picks.accessoryIds.map((id) => (
            <Piece key={id} item={items.get(id)} size="thumb" />
          ))}
        </div>
      )}
    </div>
  );
}

function Piece({ item, size }: { item: Item | undefined; size: 'full' | 'thumb' }) {
  return (
    <div className="outfit-piece">
      {item ? <StoredPhoto photoId={item.photoId} size={size} alt={item.name} /> : <span className="missing">Missing</span>}
    </div>
  );
}
