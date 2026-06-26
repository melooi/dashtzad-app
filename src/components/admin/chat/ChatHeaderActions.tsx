import Link from "next/link";
import { Settings, Building2 } from "lucide-react";

const cls =
  "focus-ring inline-flex items-center gap-2 rounded-xl border border-dz-a-primary-200 px-4 py-2.5 text-sm font-medium text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5";

/** Shared action buttons for the chat workspace page headers. */
export function ChatHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/admin/chat/departments" className={cls}>
        <Building2 className="size-4" aria-hidden />
        دپارتمان‌ها
      </Link>
      <Link href="/admin/chat/settings" className={cls}>
        <Settings className="size-4" aria-hidden />
        تنظیمات چت
      </Link>
    </div>
  );
}
