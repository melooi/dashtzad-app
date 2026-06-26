"use client";

import { useState, useTransition, type KeyboardEvent, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PRICE_MESSAGES } from "@/lib/admin/pricing-input";
import { useGridNav } from "./PricingGrid";

type ToggleResult = { ok: boolean; error?: string };

/**
 * A boolean cell (price-lock / active) that toggles + saves on click, joins the
 * spreadsheet Tab order, and reflects saving/error state. Space/Enter toggles.
 */
export function PricingToggleCell({
  active,
  onToggle,
  onLabel,
  offLabel,
  onIcon: OnIcon,
  offIcon: OffIcon,
  tone = "primary",
  title,
}: {
  active: boolean;
  onToggle: (next: boolean) => Promise<ToggleResult>;
  onLabel: string;
  offLabel: string;
  onIcon: ComponentType<{ className?: string }>;
  offIcon: ComponentType<{ className?: string }>;
  tone?: "primary" | "warning";
  title?: string;
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { move } = useGridNav();

  const toggle = () => {
    setError(null);
    startSaving(async () => {
      const res = await onToggle(!active);
      if (res.ok) router.refresh();
      else setError(res.error ?? PRICE_MESSAGES.saveFailed);
    });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      move(e.currentTarget.closest<HTMLElement>("[data-pcell]"), e.shiftKey ? -1 : 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const onTone = tone === "warning"
    ? "border-dz-warning/40 bg-dz-warning/10 text-dz-warning dark:bg-dz-warning/15 dark:text-dz-warning-300"
    : "border-dz-primary-300 bg-dz-primary-50 text-dz-primary-700 dark:border-dz-primary-400/30 dark:bg-dz-primary-400/15 dark:text-dz-primary-300";
  const offTone =
    "border-dz-primary-200 text-dz-primary-400 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5";

  const Icon = active ? OnIcon : OffIcon;

  return (
    <div data-pcell className="inline-flex">
      <button
        type="button"
        onClick={toggle}
        onKeyDown={onKey}
        title={error ?? title}
        aria-pressed={active}
        className={`focus-ring inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] transition-colors ${
          error ? "border-dz-error/60 text-dz-error" : active ? onTone : offTone
        }`}
      >
        {saving ? <Loader2 className="size-3 animate-spin" /> : <Icon className="size-3" />}
        {active ? onLabel : offLabel}
      </button>
    </div>
  );
}
