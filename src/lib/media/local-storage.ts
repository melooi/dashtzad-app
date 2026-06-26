// ============================================================
// Media Library — LOCAL filesystem storage adapter (MEDIA-CP1, server-only).
//
// DEV / SELF-HOSTED ONLY. Files are written under public/uploads/media and
// served statically by Next. On serverless (Vercel) the filesystem is ephemeral
// and read-only at runtime — production must switch to Blob/S3 (see storage.ts).
// ============================================================

import { mkdir, writeFile, unlink, access } from "node:fs/promises";
import path from "node:path";
import {
  LOCAL_MEDIA_ROOT,
  MEDIA_PATH_PREFIX,
  MEDIA_PUBLIC_PREFIX,
} from "./config";
import type { DeleteTarget, SaveInput, SavedFile, StorageAdapter } from "./types";

/** Resolve a storage-relative key (e.g. "media/2026/06/x.webp") to an absolute
 *  path, GUARANTEEING it stays inside LOCAL_MEDIA_ROOT (anti path-traversal). */
function resolveWithinRoot(storagePath: string): string {
  // Strip the leading "media/" prefix the DB stores; what remains is relative.
  const rel = storagePath.replace(new RegExp(`^${MEDIA_PATH_PREFIX}/`), "");
  const abs = path.resolve(LOCAL_MEDIA_ROOT, rel);
  const rootWithSep = LOCAL_MEDIA_ROOT.endsWith(path.sep)
    ? LOCAL_MEDIA_ROOT
    : LOCAL_MEDIA_ROOT + path.sep;
  if (abs !== LOCAL_MEDIA_ROOT && !abs.startsWith(rootWithSep)) {
    throw new Error("PATH_OUTSIDE_ROOT");
  }
  return abs;
}

export class LocalStorageAdapter implements StorageAdapter {
  readonly kind = "LOCAL" as const;

  async save({ buffer, filename, folder }: SaveInput): Promise<SavedFile> {
    const dir = path.join(LOCAL_MEDIA_ROOT, folder);
    // Confirm the target dir resolves inside the root before creating it.
    const rootWithSep = LOCAL_MEDIA_ROOT + path.sep;
    if (!path.resolve(dir).startsWith(rootWithSep) && path.resolve(dir) !== LOCAL_MEDIA_ROOT) {
      throw new Error("PATH_OUTSIDE_ROOT");
    }
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    return {
      storage: "LOCAL",
      path: `${MEDIA_PATH_PREFIX}/${folder}/${filename}`,
      url: `${MEDIA_PUBLIC_PREFIX}/${folder}/${filename}`,
      publicId: null,
    };
  }

  async remove(target: DeleteTarget): Promise<void> {
    const abs = resolveWithinRoot(target.path);
    try {
      await access(abs);
    } catch {
      // Already gone — treat as success (idempotent delete).
      return;
    }
    await unlink(abs);
  }
}
