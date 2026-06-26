"use client";

/* eslint-disable @next/next/no-img-element */
import type { MediaAssetDTO } from "@/lib/admin/media";
import { formatBytes, mimeLabel } from "@/lib/media/shared";
import { MediaCard } from "./MediaCard";
import { MediaUsageBadge } from "./MediaUsageBadge";

/** Renders the asset collection as a responsive grid or a compact list. */
export function MediaGrid({
  assets,
  selectedId,
  selectedIds,
  view,
  picking = false,
  onSelect,
}: {
  assets: MediaAssetDTO[];
  selectedId: string | null;
  /** Multi-select highlight (optional). When set, takes precedence over selectedId. */
  selectedIds?: string[];
  view: "grid" | "list";
  picking?: boolean;
  onSelect: (asset: MediaAssetDTO) => void;
}) {
  const isSelected = (id: string) =>
    selectedIds ? selectedIds.includes(id) : id === selectedId;
  if (view === "list") {
    return (
      <ul className="overflow-hidden rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border">
        {assets.map((asset, i) => (
          <li key={asset.id}>
            <button
              type="button"
              onClick={() => onSelect(asset)}
              aria-pressed={isSelected(asset.id)}
              className={`focus-ring flex w-full items-center gap-3 px-3 py-2.5 text-start transition-colors ${
                i > 0 ? "border-t border-dz-a-primary-100 dark:border-dz-a-night-line" : ""
              } ${
                isSelected(asset.id)
                  ? "bg-dz-a-primary-50 dark:bg-white/5"
                  : "bg-white hover:bg-dz-a-primary-50/50 dark:bg-dz-a-night-card dark:hover:bg-white/5"
              }`}
            >
              <img
                src={asset.url}
                alt={asset.alt ?? asset.originalName}
                loading="lazy"
                className="size-11 shrink-0 rounded-lg object-cover ring-1 ring-dz-a-primary-100 dark:ring-dz-a-night-border"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg" title={asset.originalName}>
                  {asset.title || asset.originalName}
                </span>
                <span className="mt-0.5 flex items-center gap-2 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                  <span>{mimeLabel(asset.mimeType)}</span>
                  <span aria-hidden>·</span>
                  <span>{formatBytes(asset.sizeBytes)}</span>
                  {asset.width && asset.height && (
                    <>
                      <span aria-hidden>·</span>
                      <span dir="ltr">{asset.width}×{asset.height}</span>
                    </>
                  )}
                </span>
              </span>
              <MediaUsageBadge usage={asset.usage} />
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {assets.map((asset) => (
        <MediaCard
          key={asset.id}
          asset={asset}
          selected={isSelected(asset.id)}
          picking={picking}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
