"use client";

/* eslint-disable @next/next/no-img-element */
import { Check } from "lucide-react";
import type { MediaAssetDTO } from "@/lib/admin/media";
import { mimeLabel } from "@/lib/media/shared";
import { MediaUsageBadge } from "./MediaUsageBadge";

/** A single image tile in the grid. Fully keyboard-activatable. */
export function MediaCard({
  asset,
  selected,
  picking = false,
  onSelect,
}: {
  asset: MediaAssetDTO;
  selected: boolean;
  /** In picker mode the tile shows a check affordance instead of an edit hint. */
  picking?: boolean;
  onSelect: (asset: MediaAssetDTO) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      aria-pressed={selected}
      className={`focus-ring group relative flex flex-col overflow-hidden rounded-xl border bg-white text-start transition-colors dark:bg-dz-a-night-card ${
        selected
          ? "border-dz-a-primary-500 ring-2 ring-dz-a-primary-500/30 dark:border-dz-a-primary-400"
          : "border-dz-a-primary-100 hover:border-dz-a-primary-300 dark:border-dz-a-night-border dark:hover:border-dz-a-primary-500/50"
      }`}
    >
      <span className="relative block aspect-square w-full overflow-hidden bg-dz-a-primary-50/60 dark:bg-white/5">
        <img
          src={asset.url}
          alt={asset.alt ?? asset.originalName}
          loading="lazy"
          className="absolute inset-0 size-full object-contain"
        />
        {selected && (
          <span className="absolute inset-e-2 top-2 flex size-6 items-center justify-center rounded-full bg-dz-a-primary-600 text-white shadow-sm">
            <Check className="size-3.5" />
          </span>
        )}
        <span className="absolute bottom-1.5 inset-s-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {mimeLabel(asset.mimeType)}
        </span>
      </span>
      <span className="flex flex-col gap-1 p-2.5">
        <span className="truncate text-xs font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg" title={asset.originalName}>
          {asset.title || asset.originalName}
        </span>
        <span className="flex items-center justify-between gap-1">
          <MediaUsageBadge usage={asset.usage} />
          {!picking && asset.width && asset.height && (
            <span dir="ltr" className="text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">
              {asset.width}×{asset.height}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
