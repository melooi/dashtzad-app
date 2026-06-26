"use client";

import type { ReactNode } from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";

/**
 * Wraps a form in RHF context so the field components (AdminTextField, etc.)
 * can use useFormContext. The actual submit logic lives in the collection form.
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
  return (
    <FormProvider {...form}>
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
