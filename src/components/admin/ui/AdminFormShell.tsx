"use client";

import { useEffect, type ReactNode } from "react";
import { FormProvider, useFormContext, type UseFormReturn } from "react-hook-form";
import { useUnsavedChanges } from "@/lib/admin/hooks/useUnsavedChanges";

/** Lives inside the RHF context so it can subscribe to isDirty reactively and
 * arm the "leave with unsaved changes" guard for every form. */
function UnsavedGuard() {
  const {
    formState: { isDirty },
  } = useFormContext();
  useUnsavedChanges(isDirty);
  return null;
}

/**
 * Wraps a form in RHF context so the field components (AdminTextField, etc.)
 * can use useFormContext. The actual submit logic lives in the collection form.
 * Also arms a universal unsaved-changes guard via <UnsavedGuard/>.
 */
export function AdminFormShell({
  form,
  onSubmit,
  children,
  className = "",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any, any, any>;
  onSubmit: () => void;
  children: ReactNode;
  className?: string;
}) {
  // Cmd/Ctrl+S saves the form from anywhere on the page (power-user shortcut).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSubmit]);

  return (
    <FormProvider {...form}>
      <UnsavedGuard />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={`flex flex-col gap-5 ${className}`}
      >
        {children}
      </form>
    </FormProvider>
  );
}
