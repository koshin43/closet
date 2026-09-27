# Closet Repository Policy

## Authority

- `docs/superpowers/specs/2026-09-27-closet-design.md` is the sole product and design authority.
- This file defines how changes must be made.
- Tests describe only the current contract. Existing code, old plans, and Git history are not requirements.
- When code and the spec disagree, change the code. Never weaken the spec to preserve an old implementation.
- A product change starts as a spec change. Update the spec first, then code, tests, and docs together.

## Greenfield Only

- Treat this repository as a greenfield system.
- Never add backward compatibility, compatibility shims, legacy aliases, fallback readers, dual reads or writes, migrations, version bridges, deprecation periods, or support for obsolete schemas, routes, storage layouts, or workflows.
- The Dexie database is declared exactly once, as `version(1)`, with no `upgrade()` functions. Changing a store changes that single declaration.
- Reject malformed or obsolete persisted records. Never interpret them as current state.
- Update code, tests, fixtures, and documentation together.
- Delete superseded behavior. Do not retain dormant branches, flags, aliases, components, or tests.

## Every Line Must Earn Its Place

- Solve the current requirement directly. Do not build speculative extension points.
- Prefer deletion and simplification over another layer.
- Introduce an abstraction only for a real external boundary (IndexedDB, image decoding, the file picker) or a required test seam.
- Do not create pass-through wrappers, generic repository layers, service locators, registries, event buses, plugin systems, or generic `Base*` components.
- Do not create `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `lib/`, or generic `manager.ts` dumping grounds.
- Do not duplicate types, validation rules, palette values, or slot and style lists. Each has one owner.
- Use the browser platform and React when sufficient. Prefer native elements, CSS, `crypto.randomUUID()`, `createImageBitmap`, and canvas over libraries.
- Components own their local state with React state and hooks. Do not add a global state library, context-as-store, or reducers for data that already lives in IndexedDB; read it with `useLiveQuery`.
- Catch errors only at real boundaries (file decoding, storage calls, the top-level error boundary). Never silently guess or continue with corrupted state.

### Dependency Budget

Runtime: `react`, `react-dom`, `react-router`, `dexie`, `dexie-react-hooks`.
Build and test: `typescript`, `vite`, `vite-plugin-pwa`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `fake-indexeddb`, `eslint`.

Adding any other dependency requires a stated reason tied to a spec requirement. No UI kits, CSS frameworks, animation libraries, form libraries, date libraries, or state managers.

## Fixed Product Boundary

Closet is a single-user, on-device, installable web app. All data lives in the browser's IndexedDB on one device. The hosted site serves static files only.

The app has four sections: Closet, Wishlist, Style (outfit builder), and Outfits.

Do not add a backend, accounts, authentication, sync, backup or export, sharing, analytics, telemetry, remote logging, feature flags, AI features, image editing, background removal, API keys, or any network request beyond loading the app itself. Photos are edited outside the app; the app only stores and displays them.

## Required Package Shape

Use feature-first folders:

```text
src/
├── items/      Item model and validation, persistence, Closet and Wishlist screens, add, bulk add, item detail
├── outfits/    Outfit model and validation, persistence, outfit builder, Outfits screens
├── photos/     resize and encode, Photo persistence, displaying stored photos
├── app/        routes, navigation shell, theme CSS variables
├── db.ts       the single Dexie database declaration
└── main.tsx    the only composition root
```

Rules:

- Each feature owns its model, behavior, persistence, screens, styles, and tests.
- Each feature exposes its public API through its `index.ts`. Cross-feature callers import only from that file. Never deep-import another feature's internals.
- Dependency direction: `outfits` → `items` → `photos`. `photos` imports no feature. `app` composes features and is imported by none.
- Wishlist is a flag on items, not a separate feature or store.
- `db.ts` declares the database and nothing else. Only feature persistence modules touch its tables.
- Theme values (colors, radii) are defined once as CSS variables in `app/`. Components use the variables, never literal palette values.
- Filenames describe one concrete capability. Components use `PascalCase.tsx`; other modules use `camelCase.ts`.

## Storage Rules

- IndexedDB via Dexie is the only persistent store for items, photos, and outfits. Do not put domain data in `localStorage`, cookies, or the Cache API. `localStorage` may hold only UI preferences listed in the spec, such as the last-used style.
- Records are strictly validated on write and on read. Unknown and missing fields are errors.
- Do not add schema-version fields or migration machinery.
- Use `crypto.randomUUID()` for identity and `Date.now()` epoch milliseconds for timestamps.
- Photos are stored as resized `Blob`s (full and thumbnail) exactly as the spec defines. Original uploads are not stored.
- Deleting an item deletes its photo in the same transaction. Multi-table changes use one Dexie transaction.
- Object URLs are created where a photo is displayed and revoked when it is no longer displayed.
- Request persistent storage once at startup as the spec defines.

## Trust Model

- Selected files are untrusted. Decode them through the photo pipeline; anything that fails to decode as an image is rejected with a clear message and never stored.
- User-entered text is stored as typed and rendered as text, never as HTML.
- Persisted records are untrusted on read and pass the owning feature's validation.

## Testing

- Tests live beside the code they test, mirroring feature structure (`*.test.ts`, `*.test.tsx`).
- Test public behavior first: persistence rules, screen flows, and the outfit builder. Unit-test internals only where logic is independently complex (shuffle, filtering, resize dimensions).
- Standard tests are deterministic, offline, and hermetic. Use `fake-indexeddb` with a fresh database per test.
- Run tests outside the sandbox by default, requesting execution approval when required.
- Never retain tests for superseded behavior.
- A change is incomplete until focused tests, the full test suite, `tsc --noEmit`, and ESLint pass.

## Change Discipline

Before finishing a change:

1. Remove the superseded implementation.
2. Search for stale names, types, routes, CSS classes, and documentation.
3. Confirm dependency direction and public feature boundaries.
4. Confirm no compatibility code, speculative infrastructure, or unbudgeted dependency was introduced.
5. Report intentionally unsupported behavior plainly.
