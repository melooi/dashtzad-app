import type { MediaUsage } from "@/generated/prisma/client";
import { MEDIA_USAGE_LABELS } from "@/lib/media/shared";

/** Small pill showing an asset's usage bucket. */
export function MediaUsageBadge({ usage }: { usage: MediaUsage | null }) {
  if (!usage) return null;
  return (
    <span className="inline-flex items-center rounded-md bg-dz-primary-50 px-2 py-0.5 text-[11px] font-medium text-dz-primary-600 ring-1 ring-dz-primary-100 dark:bg-white/5 dark:text-dz-primary-300 dark:ring-dz-night-border">
      {MEDIA_USAGE_LABELS[usage]}
    </span>
  );
}
