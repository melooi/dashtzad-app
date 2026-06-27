"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { emptyTrash } from "./actions";

export function EmptyTrashButton({ disabled }: { disabled?: boolean }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => {
        if (!confirm("تمام آیتم‌های سطل زباله برای همیشه پاک می‌شوند. مطمئنید؟")) return;
        start(async () => { await emptyTrash(); });
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-dz-a-error/40 bg-white dark:bg-dz-a-night-card px-4 py-2.5 text-sm font-medium text-dz-a-error dark:text-dz-a-error-300 hover:bg-dz-a-error/10 disabled:opacity-40 transition-colors"
    >
      <Trash2 className="size-4" />
      {pending ? "در حال پاکسازی…" : "خالی‌کردن سطل زباله"}
    </button>
  );
}
