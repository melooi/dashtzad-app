import { AlertCircle } from "lucide-react";

/** Inline server/validation error banner. */
export function AdminFormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dz-a-error/30 bg-dz-a-error/5 dark:bg-dz-a-error/10 px-4 py-3 text-sm text-dz-a-error dark:text-dz-a-error-300">
      <AlertCircle className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
