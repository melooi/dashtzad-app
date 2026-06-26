// ============================================================
// Media Library — storage adapter contract (MEDIA-CP1).
//
// The Media Library never talks to a filesystem or cloud SDK directly; it goes
// through a StorageAdapter. CP1 ships LOCAL only. To add Vercel Blob / S3 later,
// implement this interface and register it in storage.ts — no other code changes.
// ============================================================

import type { MediaStorage } from "@/generated/prisma/enums";

/** A validated, ready-to-persist binary about to be stored. */
export type SaveInput = {
  /** Raw bytes of the file. */
  buffer: Buffer;
  /** Safe, generated, latin-only filename WITH extension (e.g. "a1b2.webp"). */
  filename: string;
  /** Logical bucket, "YYYY/MM" (e.g. "2026/06"). */
  folder: string;
  mimeType: string;
};

/** The location of a stored file, as it should be persisted on MediaAsset. */
export type SavedFile = {
  storage: MediaStorage;
  /** Storage-relative key, NEVER an absolute machine path (e.g. "media/2026/06/a1b2.webp"). */
  path: string;
  /** Public, relative URL the browser can request (e.g. "/uploads/media/2026/06/a1b2.webp"). */
  url: string;
  /** Provider object id for remote storage; null for LOCAL. */
  publicId: string | null;
};

/** Minimal info needed to locate and remove a stored file. */
export type DeleteTarget = {
  storage: MediaStorage;
  path: string;
  publicId?: string | null;
};

export interface StorageAdapter {
  readonly kind: MediaStorage;
  /** Persist bytes and return where they live. */
  save(input: SaveInput): Promise<SavedFile>;
  /** Remove a previously stored file. Throws if it cannot guarantee safety. */
  remove(target: DeleteTarget): Promise<void>;
}
