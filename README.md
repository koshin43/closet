# Closet

A personal digital closet that looks like an online clothing store. Photograph the clothes you own, keep a wishlist of ones you're considering, put outfits together from both, and save them for when you get dressed.

**Open:** https://koshin43.github.io/closet/

It is an installable web app (PWA), built for the phone and also usable in a laptop browser. Add it to your home screen and it works offline. Everything is stored on the device only: there are no accounts, no server and no sync.

## Features

- **Closet and Wishlist:** product-card grids of your items, filtered by slot (Tops, Bottoms, One-piece, Footwear, Accessories) and by style (Western or Traditional). "I Bought It" moves a wishlist item into the closet.
- **Add Items:** pick one photo or a whole batch, then name and tag each one in a carousel.
- **Style an outfit:** swipe through rows of tops, bottoms (or a one-piece), footwear and accessories. Shuffle for ideas, then save the outfit.
- **Outfits:** your saved outfits as cards, ready to open, edit, rename or delete.

Photos are edited outside the app. The app scales each one down, stores it, and fills the space around it with the photo's own edge color so every card looks uniform.

> **No backup.** Clearing browser data or losing the phone loses the closet. The app asks the browser for persistent storage so it isn't evicted under storage pressure.

The full behavior lives in the [design spec](docs/superpowers/specs/2026-09-27-closet-design.md).

## Development

Requires Node 22.

```sh
npm install
npm run dev        # local dev server
npm test           # Vitest with React Testing Library and fake-indexeddb
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run build      # type-check and production build into dist/
```

Built with React, TypeScript and Vite. Mantine (with Embla) provides the UI components and carousels, Dexie stores items, outfits and photos in IndexedDB, React Router handles hash-based navigation, and `vite-plugin-pwa` provides the manifest and offline service worker.

How changes are made is described in [AGENTS.md](AGENTS.md).

## Deployment

Every push to `master` runs the tests, lint and build, then deploys `dist/` to GitHub Pages ([workflow](.github/workflows/deploy.yml)).

## License

[Apache License 2.0](LICENSE)
