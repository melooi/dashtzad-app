import { AlertCircle } from "lucide-react";

/** Inline server/validation error banner. */
export function AdminFormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dz-error/30 bg-dz-error/5 dark:bg-dz-error/10 px-4 py-3 text-sm text-dz-error dark:text-dz-error-300">
      <AlertCircle className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
