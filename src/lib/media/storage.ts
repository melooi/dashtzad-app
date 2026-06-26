// ============================================================
// Media Library — storage adapter resolver (MEDIA-CP1, server-only).
//
// Single place that picks the active StorageAdapter. CP1 implements LOCAL only;
// VERCEL_BLOB / S3 throw a clear error until their adapters are added (a future
// checkpoint). To enable one, implement StorageAdapter and return it here.
// ============================================================

import { getStorageKind } from "./config";
import { LocalStorageAdapter } from "./local-storage";
import type { StorageAdapter } from "./types";

let cached: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (cached) return cached;

  const kind = getStorageKind();
  switch (kind) {
    case "LOCAL":
      cached = new LocalStorageAdapter();
      return cached;
    case "VERCEL_BLOB":
    case "S3":
      // Intentionally not implemented in CP1.
      throw new Error(
        `MEDIA_STORAGE="${kind}" is not implemented yet. Only LOCAL is available in MEDIA-CP1.`,
      );
    default:
      cached = new LocalStorageAdapter();
      return cached;
  }
}
