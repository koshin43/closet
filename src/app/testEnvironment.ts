/// <reference types="node" />
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';
import 'fake-indexeddb/auto';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { db } from '../db';

// jsdom's Blob cannot be structured-cloned into fake-indexeddb; Node's can.
globalThis.Blob = NodeBlob as typeof Blob;
globalThis.File = NodeFile as typeof File;

// Test images are files whose text is "img:<width>x<height>:<edge>", where edge is "#rrggbb" or
// "transparent"; anything else fails to decode.
globalThis.createImageBitmap = (async (source: Blob) => {
  const match = /^img:(\d+)x(\d+):(#[0-9a-f]{6}|transparent)$/.exec(await source.text());
  if (!match) throw new DOMException('The source image could not be decoded.', 'InvalidStateError');
  return { width: Number(match[1]), height: Number(match[2]), edge: match[3], close() {} };
}) as unknown as typeof createImageBitmap;

// Encoded blobs record the size they were drawn at, so tests can check resizing; every pixel
// reads back as the drawn image's edge color.
globalThis.OffscreenCanvas = class {
  constructor(
    public width: number,
    public height: number,
  ) {}
  getContext() {
    let edge = 'transparent';
    return {
      drawImage(bitmap: { edge: string }) {
        edge = bitmap.edge;
      },
      getImageData: (_x: number, _y: number, width: number, height: number) => {
        const rgba = edge === 'transparent' ? [0, 0, 0, 0] : [1, 3, 5].map((i) => parseInt(edge.slice(i, i + 2), 16)).concat(255);
        return { data: Uint8ClampedArray.from({ length: width * height * 4 }, (_, i) => rgba[i % 4]!) };
      },
    };
  }
  async convertToBlob({ type }: { type: string }) {
    return new Blob([`${this.width}x${this.height}`], { type });
  }
} as unknown as typeof OffscreenCanvas;

configure({ asyncUtilTimeout: 3000 });

URL.createObjectURL = () => 'blob:test';
URL.revokeObjectURL = () => {};

// Phone-sized, reduced-motion screen: Mantine skips transitions so overlays open synchronously.
window.matchMedia = (query: string) =>
  ({
    matches: query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

Object.defineProperty(document, 'fonts', { value: new EventTarget() });

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

globalThis.IntersectionObserver = class {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;

beforeEach(async () => {
  await db.delete();
  await db.open();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
