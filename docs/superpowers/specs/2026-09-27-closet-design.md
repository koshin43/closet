# Closet — Design Spec

Date: 2026-09-27
Status: Approved

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
  - Style (required): Western / Traditional. Defaults to the style of the last item added (single or bulk add; editing an item does not change it), or Western if none has been recorded.
  - Color (optional): one of a fixed palette (white, off-white, black, grey, beige, brown, red, maroon, pink, orange, yellow, gold, silver, green, blue, navy, purple, multicolor).
  - Notes (optional).
  - Wishlist toggle (defaults on when opened from Wishlist, off otherwise).
- "Add to closet" / "Add to wishlist" button.

### 5.4 Bulk add

- Pick many photos at once.
- Right after picking, the app decodes and resizes every file up front, showing progress. Files that cannot be decoded as images are left out, with a message saying how many ("2 files couldn't be read and were left out"). The walkthrough count covers only readable photos. If none are readable, the message is shown and nothing starts.
- The app walks through them one by one ("3 of 12"): photo on top, the same fields as single add below, then "Save and next". "Skip" drops a photo.
- The first photo's style starts from the last-added style, as in single add.
- Slot, style and wishlist carry over from the previous photo to speed up runs of similar items; name is always fresh.
- Leaving midway keeps what has been saved so far.

### 5.5 Item detail / edit

- Large photo, all fields editable, "Replace photo".
- Field edits (name, slot, style, color, notes) are kept only when the user taps "Save". Save is disabled while the name is blank. Leaving with unsaved edits asks "Discard changes?".
- "Move to closet" / "Move to wishlist", "Replace photo" and Delete act immediately and do not need Save.
- "Replace photo" takes effect as soon as a new photo is picked: the new photo is stored and the old one deleted in the same transaction. If the picked file cannot be decoded as an image, a clear message is shown and the old photo is kept.
- Shows how many saved outfits use this item.
- Delete: asks for confirmation; if the item is used in outfits, the warning says how many. After deletion those outfits show an empty placeholder in that slot. Outfits left with no remaining items are deleted along with the item, and the warning says how many outfits that will remove.

### 5.6 Style an outfit (outfit builder)

- Title "Let's get dressed", a Shuffle button, and the All / Western / Traditional filter.
- Rows, each swipeable left/right (arrows as well, for laptop):
  - **Top** — with a "Wear a one-piece instead" link.
  - **Bottom**
  - In one-piece mode, Top and Bottom merge into a single tall **One-piece** row, with "Back to top + bottom".
  - Toggling between the two keeps the picks in the hidden rows for the rest of the session, so switching back restores them. Only the rows on screen are saved.
  - Opening a saved outfit that has a one-piece starts in one-piece mode; otherwise it starts with Top and Bottom.
  - **Footwear**
  - **Accessories** — a strip of chosen accessories plus a "+" that opens a multi-select picker. Any number, including none.
- Each swipe row also has a "none" position, so any slot can be left empty.
- Rows contain owned items plus wishlist items; wishlist items carry a "wishlist" badge.
- Filter narrows every row (e.g. Traditional shows only traditional items). "All" allows mixing (kurta with jeans).
- Shuffle picks a random item for each non-accessory row within the current filter; accessories are left as they are.
- Laptop: each row also shows the neighbouring items, and a preview column on the right stacks the current outfit.
- "Save outfit" (and "Save as new") is disabled until at least one piece is picked; an accessory alone counts.
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
  color: string | null;  // palette key, null when not chosen
  notes: string | null;  // null when left blank
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
  topId: string | null;
  bottomId: string | null;
  onePieceId: string | null;
  footwearId: string | null;
  accessoryIds: string[];
  createdAt: number;
  updatedAt: number;
}
```

Rules:

- Every field is always present on a stored record. Optional values are stored as `null`, never omitted.
- An outfit references at least one item when saved.
- Replacing an item's photo deletes the old photo in the same transaction.
- Deleting an item deletes its photo; outfit references to it are left in place and rendered as "missing". Any outfit whose references would then all point to deleted items is deleted in the same transaction.
- An outfit holds either a one-piece or a top and bottom, never both: if `onePieceId` is set, `topId` and `bottomId` must be `null`. A record that breaks this is rejected as malformed. There is no stored mode; whether an outfit is a one-piece outfit follows from `onePieceId`.
- Indexes: items by `createdAt`; outfits by `updatedAt`. Slot, style and wishlist filtering happens in memory on the loaded list (IndexedDB cannot index booleans, and a personal closet is small).

## 7. Photos

- On upload the app decodes the image, scales it to a 1200px long edge for `full` and 400px for `thumb`, and encodes both as WebP (quality ~0.85), falling back to JPEG where WebP encoding is unavailable.
- The original upload is not stored (the owner keeps it in their gallery).
- Grids and builder rows use `thumb`; detail views use `full`.
- Object URLs are created on demand and revoked when no longer shown.

## 8. Storage and offline

- On first launch the app calls `navigator.storage.persist()` so the browser doesn't evict data under storage pressure.
- `localStorage` holds exactly one UI preference: the last-added style (`western` or `traditional`). Nothing else is stored there.
- The app shell is cached by a service worker, so the app opens and works fully offline.
- Known risk, accepted for v1: with no backup, losing or resetting the phone, or clearing browser data, loses the closet.

## 9. Tech stack

- React + TypeScript, built with Vite.
- `vite-plugin-pwa` for the manifest, icons and service worker.
- Dexie for IndexedDB.
- React Router for the four sections and detail screens, using hash URLs so any static host serves every screen without rewrite rules.
- Plain CSS (CSS variables for the palette), no UI framework.
- Hosting: any free static host (GitHub Pages or Cloudflare Pages). Hosting serves the app only; no user data leaves the device.

## 10. Testing

- **Unit (Vitest):** data layer against `fake-indexeddb` (create/update/delete items, wishlist move, outfit save rules, delete-with-references including removal of emptied outfits, photo replacement, rejection of malformed records), image resize helper, shuffle and filter logic.
- **Component (React Testing Library):** add item, bulk add flow including unreadable files, item edit save and discard, builder one-piece toggle and filter, saving an outfit.
- **Manual:** install on the owner's Android phone, add real photos, check offline behavior, swipe feel and storage persistence.

## 11. Out of scope for v1

- Any in-app photo editing or AI.
- Dress-up figure / outfit illustration.
- Accounts, sync between devices, backup/export, sharing.
- Calendar, wear log, outfit history.
- Color filtering, search, sub-categories (e.g. Sarees vs Blouses) and tagging beyond the fields above.
