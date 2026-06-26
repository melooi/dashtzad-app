import { redirect } from "next/navigation";

// تنظیمات چت به تب تنظیمات در صفحه اصلی منتقل شده
export default function ChatSettingsRedirect() {
  redirect("/admin/chat?tab=settings");
}
