import { Sparkles } from "lucide-react";
import { navItem, PLACEHOLDER_COPY, type ViewId } from "../nav";
import { SectionHead } from "../SectionHead";

/**
 * Honest "coming soon" state for sections whose backend isn't built yet
 * (Phase 1+). Never shows fake data (SKILL §H3).
 */
export function PlaceholderSection({ view }: { view: ViewId }) {
  const item = navItem(view);
  const Icon = item.icon;
  const desc = PLACEHOLDER_COPY[view]?.desc ?? "این بخش به‌زودی فعال می‌شود.";

  return (
    <div>
      <SectionHead title={item.label} />
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-store-border bg-store-surface p-12 text-center">
        <span className="relative grid size-16 place-items-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
          <Icon className="size-7" />
          <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-store-gold text-store-text-inverse">
            <Sparkles className="size-3" />
          </span>
        </span>
        <div className="font-heading text-lg font-bold text-store-text">به‌زودی فعال می‌شود</div>
        <p className="max-w-md text-sm leading-7 text-store-text-faint">{desc}</p>
      </div>
    </div>
  );
}
