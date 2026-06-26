"use client";

import { useMemo, useRef, useState } from "react";
import { ImageIcon, HardDrive } from "lucide-react";
import type { MediaAssetDTO } from "@/lib/admin/media";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { formatBytes, type MediaSort } from "@/lib/media/shared";
import type { MediaUsage } from "@/generated/prisma/client";
import { MediaUploader } from "./MediaUploader";
import { MediaToolbar } from "./MediaToolbar";
import { MediaGrid } from "./MediaGrid";
import { MediaEmptyState } from "./MediaEmptyState";
import { MediaDetailsPanel } from "./MediaDetailsPanel";

/** The full /admin/media experience: upload, browse, filter, edit, delete. */
export function MediaLibraryPage({ initialAssets }: { initialAssets: MediaAssetDTO[] }) {
  const [assets, setAssets] = useState<MediaAssetDTO[]>(initialAssets);
  const [q, setQ] = useState("");
  const [usage, setUsage] = useState<MediaUsage | "">("");
  const [mime, setMime] = useState("");
  const [sort, setSort] = useState<MediaSort>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);

  const selected = assets.find((a) => a.id === selectedId) ?? null;

  const onUploaded = (asset: MediaAssetDTO) =>
    setAssets((list) => [asset, ...list.filter((a) => a.id !== asset.id)]);
  const onUpdated = (asset: MediaAssetDTO) =>
    setAssets((list) => list.map((a) => (a.id === asset.id ? asset : a)));
  const onDeleted = (id: string) => {
    setAssets((list) => list.filter((a) => a.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const clearFilters = () => {
    setQ("");
    setUsage("");
    setMime("");
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = assets.filter((a) => {
      if (usage && a.usage !== usage) return false;
      if (mime && a.mimeType !== mime) return false;
      if (needle) {
        const hay = `${a.originalName} ${a.title ?? ""} ${a.alt ?? ""} ${a.caption ?? ""} ${a.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    out.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "largest":
          return b.sizeBytes - a.sizeBytes;
        case "name":
          return a.originalName.localeCompare(b.originalName, "fa");
        case "newest":
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return out;
  }, [assets, q, usage, mime, sort]);

  const totalBytes = useMemo(() => assets.reduce((s, a) => s + a.sizeBytes, 0), [assets]);
  const isFiltering = Boolean(q.trim() || usage || mime);

  return (
    <div>
      <AdminPageHeader
        title="رسانه‌ها"
        description="کتابخانه‌ی تصاویر فروشگاه — یک‌بار آپلود، استفاده در همه‌جای پنل."
        actions={
          <div className="flex items-center gap-3 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="size-3.5" /> {assets.length.toLocaleString("fa-IR")} فایل
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HardDrive className="size-3.5" /> {formatBytes(totalBytes)}
            </span>
          </div>
        }
      />

      {/* Dev-storage notice */}
      <div className="mb-5 rounded-xl border border-dz-a-warning/30 bg-dz-a-warning/5 px-4 py-2.5 text-xs leading-5 text-dz-a-warning dark:text-dz-a-warning-300 dark:bg-dz-a-warning/10">
        فایل‌ها روی فضای ذخیره‌سازی محلی (پوشه‌ی <code dir="ltr" className="font-mono">public/uploads</code>) ذخیره می‌شوند. این حالت فقط برای توسعه و میزبانی شخصی است؛ برای استقرار روی Vercel باید بعداً به Vercel Blob یا S3 منتقل شود.
      </div>

      <div ref={uploaderRef} className="mb-5">
        <MediaUploader onUploaded={onUploaded} />
      </div>

      <div className="mb-4">
        <MediaToolbar
          q={q}
          onQ={setQ}
          usage={usage}
          onUsage={setUsage}
          mime={mime}
          onMime={setMime}
          sort={sort}
          onSort={setSort}
          view={view}
          onView={setView}
        />
      </div>

      {filtered.length === 0 ? (
        <MediaEmptyState
          filtered={isFiltering}
          onClearFilters={clearFilters}
          onUploadClick={() => uploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
        />
      ) : (
        <MediaGrid assets={filtered} selectedId={selectedId} view={view} onSelect={(a) => setSelectedId(a.id)} />
      )}

      {/* Details drawer */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-dz-a-primary-900/40 backdrop-blur-sm dark:bg-black/60"
            onClick={() => setSelectedId(null)}
            aria-hidden
          />
          <div className="fixed inset-y-0 inset-e-0 z-50 w-full max-w-sm border-s border-dz-a-primary-100 bg-white shadow-2xl dark:border-dz-a-night-border dark:bg-dz-a-night-card">
            <MediaDetailsPanel
              asset={selected}
              onClose={() => setSelectedId(null)}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
            />
          </div>
        </>
      )}
    </div>
  );
}
