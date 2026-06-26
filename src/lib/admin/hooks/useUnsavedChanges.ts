"use client";

import { useEffect } from "react";

/**
 * Warns the user before leaving (reload / tab close) while a form holds unsaved
 * edits. Generalized from the original ProductForm guard so every admin form can
 * opt in — wired centrally through AdminFormShell's <UnsavedGuard/>.
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
