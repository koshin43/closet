/// <reference types="node" />
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { db } from '../db';

// jsdom's Blob cannot be structured-cloned into fake-indexeddb; Node's can.
globalThis.Blob = NodeBlob as typeof Blob;
globalThis.File = NodeFile as typeof File;

// Test images are files whose text is "img:<width>x<height>"; anything else fails to decode.
globalThis.createImageBitmap = (async (source: Blob) => {
  const match = /^img:(\d+)x(\d+)$/.exec(await source.text());
  if (!match) throw new DOMException('The source image could not be decoded.', 'InvalidStateError');
  return { width: Number(match[1]), height: Number(match[2]), close() {} };
}) as unknown as typeof createImageBitmap;

// Encoded blobs record the size they were drawn at, so tests can check resizing.
globalThis.OffscreenCanvas = class {
  constructor(
    public width: number,
    public height: number,
  ) {}
  getContext() {
    return { drawImage() {} };
  }
  async convertToBlob({ type }: { type: string }) {
    return new Blob([`${this.width}x${this.height}`], { type });
  }
} as unknown as typeof OffscreenCanvas;

URL.createObjectURL = () => 'blob:test';
URL.revokeObjectURL = () => {};
Element.prototype.scrollTo = () => {};

beforeEach(async () => {
  await db.delete();
  await db.open();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
