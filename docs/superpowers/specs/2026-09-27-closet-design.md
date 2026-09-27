# Closet — Design Spec

Date: 2026-09-27
Status: Draft for review

## 1. Purpose

A personal digital closet. The owner (and optionally a few friends, each on their own device) photographs the clothes they own, keeps a wishlist of clothes they are considering, puts outfits together from those items, and then wears the saved outfit in real life.

Success looks like:

- Adding a new item takes under 30 seconds; adding a first batch of dozens of photos is comfortable in one sitting.
- Building an outfit on the phone while getting dressed is quick and pleasant.
- The app looks like a boutique catalog, not a spreadsheet.

## 2. Decisions already made

| Topic | Decision |
|---|---|
| App type | Installable web app (PWA). Primary device: phone. Also usable in a laptop browser with a wider layout. |
| Data location | On the device only. No accounts, no server, no sync, no backup in v1. |
| Photo editing | Done **outside** the app (the owner uses AI tools to produce catalog-style images). The app only stores and displays photos. No AI, no background removal, no API keys in the app. |
| Visual style | Mix of "Clean boutique" and "Warm and playful": warm off-white background, rounded tiles and buttons, one terracotta accent, friendly wording. |
| Slots | Top, Bottom, One-piece, Footwear, Accessories. |
| Style tag | Every item is Western or Traditional. Traditional wear fits the same slots (blouse = Top, saree/lehenga skirt/salwar = Bottom, kurta = Top, anarkali = One-piece, dupatta = Accessory). |
| One-pieces | Separate category; when chosen in the outfit builder it replaces both Top and Bottom. |
| Wishlist | Items can be marked Wishlist. They live in a separate Wishlist area, and appear in the outfit builder with a "wishlist" badge. |
| Adding items | Single add, plus bulk add (pick many photos, then tag them one after another). |
| Dress-up figure | Explored and rejected. |

## 3. Visual language

- Background `#faf8f5`, text `#2b2522`, muted text `#9a8f88`, tile `#f0ebe5`, accent `#e07a5f`, soft accent `#fbe3d8`, hairlines `#eee7e0`.
- Sans-serif system font stack. Titles in sentence case and friendly ("Let's get dressed", "My closet").
- Rounded corners: tiles 14–16px, pills and buttons fully rounded.
- Photos are always shown whole (`object-fit: contain`) centered on the tile color, so differences between AI-generated backgrounds are softened and nothing is cropped.
- One accent color only, used for primary buttons, the active tab, and the add button.

## 4. Navigation

- **Phone:** bottom bar with four tabs: Closet, Wishlist, Style, Outfits.
- **Laptop (≥ 900px wide):** the same four entries in a left side menu; content area uses wider grids.

## 5. Screens

### 5.1 Closet

- Title "My closet" with an item count.
- Slot tabs: All, Tops, Bottoms, One-piece, Footwear, Accessories.
- Style filter under the tabs: All / Western / Traditional.
- Grid of owned items (2 columns on phone, 5+ on laptop). Tile = photo + name. A small "Trad" tag on traditional items.
- Floating "+" button opens Add (with a choice: one photo, or several photos).
- Tapping a tile opens Item detail.
- Empty state: friendly message and a big "Add your first item" button.

### 5.2 Wishlist

- Same layout, filters and add button as Closet, but only wishlist items.
- Items added from this screen default to Wishlist.
- Each tile has a quick "I bought it" action that moves the item into the Closet.

### 5.3 Add item (single)

- Pick one photo from the gallery (or camera, where the browser offers it).
- Fields:
  - Name (required, free text, e.g. "red silk saree").
  - Goes in (required): Top / Bottom / One-piece / Footwear / Accessory.
  - Style (required): Western / Traditional. Defaults to the last value used.
  - Color (optional): one of a fixed palette (white, off-white, black, grey, beige, brown, red, maroon, pink, orange, yellow, gold, silver, green, blue, navy, purple, multicolor).
  - Notes (optional).
  - Wishlist toggle (defaults on when opened from Wishlist, off otherwise).
- "Add to closet" / "Add to wishlist" button.

### 5.4 Bulk add

- Pick many photos at once.
- The app walks through them one by one ("3 of 12"): photo on top, the same fields as single add below, then "Save and next". "Skip" drops a photo.
- Slot, style and wishlist carry over from the previous photo to speed up runs of similar items; name is always fresh.
- Leaving midway keeps what has been saved so far.

### 5.5 Item detail / edit

- Large photo, all fields editable, "Replace photo".
- "Move to closet" / "Move to wishlist".
- Shows how many saved outfits use this item.
- Delete: asks for confirmation; if the item is used in outfits, the warning says how many. After deletion those outfits show an empty placeholder in that slot.

### 5.6 Style an outfit (outfit builder)

- Title "Let's get dressed", a Shuffle button, and the All / Western / Traditional filter.
- Rows, each swipeable left/right (arrows as well, for laptop):
  - **Top** — with a "Wear a one-piece instead" link.
  - **Bottom**
  - In one-piece mode, Top and Bottom merge into a single tall **One-piece** row, with "Back to top + bottom".
  - **Footwear**
  - **Accessories** — a strip of chosen accessories plus a "+" that opens a multi-select picker. Any number, including none.
- Each swipe row also has a "none" position, so any slot can be left empty.
- Rows contain owned items plus wishlist items; wishlist items carry a "wishlist" badge.
- Filter narrows every row (e.g. Traditional shows only traditional items). "All" allows mixing (kurta with jeans).
- Shuffle picks a random item for each non-accessory row within the current filter; accessories are left as they are.
- Laptop: each row also shows the neighbouring items, and a preview column on the right stacks the current outfit.
- "Save outfit" asks for a name (prefilled suggestion such as "Outfit 7"). Opening a saved outfit in the builder and saving again updates it; "Save as new" is also available.

### 5.7 Outfits

- Grid of saved outfits. Each card stacks its item photos vertically (top, bottom or one-piece, footwear) with accessories as small thumbnails, plus the outfit name.
- Outfits that include wishlist items show a small "includes wishlist" badge.
- Tapping a card opens the outfit: full view, "Edit in builder", rename, delete.

## 6. Data model

Stored in IndexedDB via Dexie.

```ts
type Slot = 'top' | 'bottom' | 'onepiece' | 'footwear' | 'accessory';
type StyleTag = 'western' | 'traditional';

interface Item {
  id: string;            // uuid
  name: string;
  slot: Slot;
  style: StyleTag;
  color?: string;        // palette key
  notes?: string;
  wishlist: boolean;
  photoId: string;       // -> Photo
  createdAt: number;
  updatedAt: number;
}

interface Photo {
  id: string;
  full: Blob;            // long edge ≤ 1200px, WebP (JPEG fallback)
  thumb: Blob;           // long edge ≤ 400px, used in grids and rows
}

interface Outfit {
  id: string;
  name: string;
  mode: 'separates' | 'onepiece';
  topId?: string;
  bottomId?: string;
  onePieceId?: string;
  footwearId?: string;
  accessoryIds: string[];
  createdAt: number;
  updatedAt: number;
}
```

Rules:

- Deleting an item deletes its photo; outfit references to it are left in place and rendered as "missing".
- In `onepiece` mode `topId`/`bottomId` are ignored (and cleared on save); in `separates` mode `onePieceId` is ignored.
- Indexes: items by `slot`, `style`, `wishlist`, `createdAt`; outfits by `updatedAt`.

## 7. Photos

- On upload the app decodes the image, scales it to a 1200px long edge for `full` and 400px for `thumb`, and encodes both as WebP (quality ~0.85), falling back to JPEG where WebP encoding is unavailable.
- The original upload is not stored (the owner keeps it in their gallery).
- Grids and builder rows use `thumb`; detail views use `full`.
- Object URLs are created on demand and revoked when no longer shown.

## 8. Storage and offline

- On first launch the app calls `navigator.storage.persist()` so the browser doesn't evict data under storage pressure.
- The app shell is cached by a service worker, so the app opens and works fully offline.
- Known risk, accepted for v1: with no backup, losing or resetting the phone, or clearing browser data, loses the closet.

## 9. Tech stack

- React + TypeScript, built with Vite.
- `vite-plugin-pwa` for the manifest, icons and service worker.
- Dexie for IndexedDB.
- React Router for the four sections and detail screens.
- Plain CSS (CSS variables for the palette), no UI framework.
- Hosting: any free static host (GitHub Pages or Cloudflare Pages). Hosting serves the app only; no user data leaves the device.

## 10. Testing

- **Unit (Vitest):** data layer against `fake-indexeddb` (create/update/delete items, wishlist move, outfit save rules, delete-with-references), image resize helper, shuffle and filter logic.
- **Component (React Testing Library):** add item, bulk add flow, builder one-piece toggle and filter, saving an outfit.
- **Manual:** install on the owner's Android phone, add real photos, check offline behavior, swipe feel and storage persistence.

## 11. Out of scope for v1

- Any in-app photo editing or AI.
- Dress-up figure / outfit illustration.
- Accounts, sync between devices, backup/export, sharing.
- Calendar, wear log, outfit history.
- Color filtering, search, sub-categories (e.g. Sarees vs Blouses) and tagging beyond the fields above.
