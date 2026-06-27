// ============================================================
// Media Library — admin read helpers & client-safe DTO (MEDIA-CP1).
// ============================================================

import { prisma } from "@/lib/prisma";
import type { MediaAsset, MediaStorage, MediaUsage } from "@/generated/prisma/client";

/** Plain, serializable shape passed to client components (Dates → ISO strings). */
export type MediaAssetDTO = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  title: string | null;
  caption: string | null;
  storage: MediaStorage;
  path: string;
  url: string;
  folder: string | null;
  tags: string[];
  usage: MediaUsage | null;
  createdAt: string;
};

export function serializeAsset(a: MediaAsset): MediaAssetDTO {
  return {
    id: a.id,
    filename: a.filename,
    originalName: a.originalName,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    width: a.width,
    height: a.height,
    alt: a.alt,
    title: a.title,
    caption: a.caption,
    storage: a.storage,
    path: a.path,
    url: a.url,
    folder: a.folder,
    tags: a.tags,
    usage: a.usage,
    createdAt: a.createdAt.toISOString(),
  };
}

export type MediaQuery = {
  q?: string;
  usage?: MediaUsage;
  /** "image/png" etc., or "image" for any image type. */
  mime?: string;
  take?: number;
};

/** List media assets (newest first), optionally filtered. Server-side use. */
export async function listMediaAssets(query: MediaQuery = {}): Promise<MediaAssetDTO[]> {
  const q = query.q?.trim();
  const rows = await prisma.mediaAsset.findMany({
    where: {
      deletedAt: null,
      ...(query.usage ? { usage: query.usage } : {}),
      ...(query.mime
        ? query.mime.includes("/")
          ? { mimeType: query.mime }
          : { mimeType: { startsWith: `${query.mime}/` } }
        : {}),
      ...(q
        ? {
            OR: [
              { originalName: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
              { alt: { contains: q, mode: "insensitive" } },
              { caption: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(query.take ?? 500, 1000),
  });
  return rows.map(serializeAsset);
}

/** Count + total size for the library header summary. */
export async function getMediaStats(): Promise<{ count: number; totalBytes: number }> {
  const [count, agg] = await Promise.all([
    prisma.mediaAsset.count({ where: { deletedAt: null } }),
    prisma.mediaAsset.aggregate({ _sum: { sizeBytes: true } }),
  ]);
  return { count, totalBytes: agg._sum.sizeBytes ?? 0 };
}
