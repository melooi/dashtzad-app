import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionItem = {
  id?: string;
  question: string;
  answer: ReactNode;
};

/**
 * Native <details>-based accordion — server-renderable, keyboard accessible,
 * no client JS. Mirrors the homepage FAQ treatment for visual consistency.
 */
export function StoreAccordion({
  items,
  defaultOpenFirst = false,
}: {
  items: AccordionItem[];
  defaultOpenFirst?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => (
        <details
          key={it.id ?? i}
          open={defaultOpenFirst && i === 0}
          className="group rounded-xl border border-store-border bg-store-surface p-4 shadow-store-xs transition-colors open:border-store-primary/40 hover:border-store-primary/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg font-medium text-store-text marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary [&::-webkit-details-marker]:hidden">
            {it.question}
            <ChevronDown
              className="size-4 shrink-0 text-store-text-faint transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="mt-3 whitespace-pre-line border-t border-store-border pt-3 text-sm leading-7 text-store-text-muted">
            {it.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
