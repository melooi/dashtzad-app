"use client";

import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";

// Spreadsheet-style keyboard navigation scoped to one table. Editable cells mark
// their wrapper with `data-pcell`; Tab/Shift+Tab move focus between them in DOM
// order, skipping non-cell focusables (title links, expand chevrons).
type GridNav = { move: (from: HTMLElement | null, dir: 1 | -1) => void };

const GridNavContext = createContext<GridNav | null>(null);

export function useGridNav(): GridNav {
  return useContext(GridNavContext) ?? { move: () => {} };
}

export function PricingGrid({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = useCallback((from: HTMLElement | null, dir: 1 | -1) => {
    const root = ref.current;
    if (!root || !from) return;
    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-pcell]"));
    const idx = cells.indexOf(from);
    if (idx < 0) return;
    const next = cells[idx + dir];
    if (!next) return;
    // Wait one frame so a cell leaving edit mode has re-rendered its button.
    requestAnimationFrame(() => {
      next.querySelector<HTMLElement>("button, input, [tabindex]")?.focus();
    });
  }, []);

  return (
    <GridNavContext.Provider value={{ move }}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </GridNavContext.Provider>
  );
}
