import { useEffect, useRef, type ReactNode } from 'react';
import type { Item } from '../items';
import { StoredPhoto } from '../photos';

const SETTLE_MS = 120;

interface Props {
  label: string;
  options: Item[];
  value: string | null;
  onChange: (id: string | null) => void;
  tall?: boolean;
  action?: ReactNode;
}

export function SwipeRow({ label, options, value, onChange, tall = false, action }: Props) {
  const positions = [null, ...options.map((item) => item.id)];
  const index = Math.max(0, positions.indexOf(value));
  const scroller = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = scroller.current;
    const card = el?.children[index];
    if (!el || !(card instanceof HTMLElement)) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
  }, [index, positions.length]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  function onScroll() {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = scroller.current;
      if (!el) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      const cards = [...el.children] as HTMLElement[];
      const nearest = cards.reduce(
        (best, card, i) =>
          Math.abs(card.offsetLeft + card.offsetWidth / 2 - center) <
          Math.abs(cards[best]!.offsetLeft + cards[best]!.offsetWidth / 2 - center)
            ? i
            : best,
        0,
      );
      if (nearest !== index) onChange(positions[nearest] ?? null);
    }, SETTLE_MS);
  }

  const step = (delta: number) => onChange(positions[(index + delta + positions.length) % positions.length] ?? null);

  return (
    <section className={tall ? 'swipe-row tall' : 'swipe-row'} aria-label={label}>
      <header>
        <h2>{label}</h2>
        {action}
      </header>
      <div className="swipe-track">
        <button className="arrow" aria-label={`Previous ${label}`} onClick={() => step(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="swipe-scroller" ref={scroller} onScroll={onScroll}>
          {positions.map((id, i) => {
            const item = options.find((option) => option.id === id);
            return (
              <div key={id ?? 'none'} className="swipe-card" aria-current={i === index}>
                {item ? (
                  <>
                    <StoredPhoto photoId={item.photoId} size="thumb" alt={item.name} />
                    <span className="swipe-name">{item.name}</span>
                    {item.wishlist && <span className="badge">wishlist</span>}
                  </>
                ) : (
                  <span className="muted">None</span>
                )}
              </div>
            );
          })}
        </div>
        <button className="arrow" aria-label={`Next ${label}`} onClick={() => step(1)}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
