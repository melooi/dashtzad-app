// ============================================================
// Media Library — browser-side upload helper (MEDIA-CP1).
// Uses only browser APIs (fetch, Image) — import from client components only.
// ============================================================

import type { MediaAssetDTO } from "@/lib/admin/media";

export type ClientUploadResult =
  | { ok: true; asset: MediaAssetDTO }
  | { ok: false; error: string };

/** Read intrinsic pixel dimensions in the browser (server can't decode in CP1). */
export function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims.width && dims.height ? dims : null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/** Upload one file to the admin endpoint and return the created asset. */
export async function uploadMediaFile(
  file: File,
  usage?: string | null,
): Promise<ClientUploadResult> {
  const form = new FormData();
  form.append("file", file);
  if (usage) form.append("usage", usage);

  const dims = await readImageDimensions(file);
  if (dims) {
    form.append("width", String(dims.width));
    form.append("height", String(dims.height));
  }

  try {
    const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; asset?: MediaAssetDTO; error?: string }
      | null;
    if (!res.ok || !json?.ok || !json.asset) {
      return { ok: false, error: json?.error ?? "آپلود ناموفق بود." };
    }
    return { ok: true, asset: json.asset };
  } catch {
    return { ok: false, error: "ارتباط با سرور برقرار نشد." };
  }
}
