import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { formatJalali } from "@/lib/date";
import { toPersianNumbers } from "@/lib/price";
import { MessageSquare } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { ContactMessagesInbox, type InboxMessage } from "@/components/admin/contact/ContactMessagesInbox";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "all", label: "همه" },
  { id: "NEW", label: "جدید" },
  { id: "READ", label: "خوانده‌شده" },
  { id: "REPLIED", label: "پاسخ‌داده‌شده" },
  { id: "ARCHIVED", label: "بایگانی" },
] as const;

export default async function ContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const active = TABS.find((t) => t.id === sp.status)?.id ?? "all";

  const where: Prisma.ContactMessageWhereInput =
    active === "all" ? {} : { status: active as Exclude<typeof active, "all"> };

  const [list, newCount] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  const messages: InboxMessage[] = list.map((m) => ({
    id: m.id,
    name: m.name,
    phone: m.phone,
    subject: m.subject,
    type: m.type,
    message: m.message,
    status: m.status,
    createdAtLabel: formatJalali(m.createdAt),
  }));

  return (
    <div>
      <AdminPageHeader
        title="پیام‌های فرم تماس"
        description="پیام‌های دریافتی از فرم «تماس با ما» را این‌جا ببینید و وضعیتشان را مدیریت کنید."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "پیام‌های تماس" }]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "all" ? "/admin/collections/contact-messages" : `/admin/collections/contact-messages?status=${t.id}`}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              active === t.id
                ? "bg-dz-primary-600 text-white"
                : "border border-dz-primary-200 text-dz-primary-700 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-fg"
            }`}
          >
            {t.label}
            {t.id === "NEW" && newCount > 0 && (
              <span className={`rounded-full px-1.5 text-xs ${active === t.id ? "bg-white/20" : "bg-dz-warning/15 text-dz-warning"}`}>
                {toPersianNumbers(newCount)}
              </span>
            )}
          </Link>
        ))}
      </div>

      {messages.length === 0 ? (
        <AdminListEmptyState
          mode={active === "all" ? "empty" : "no-results"}
          icon={<MessageSquare className="size-7" />}
          title="هنوز پیامی دریافت نشده است"
          description="پیام‌هایی که مشتریان از فرم «تماس با ما» ارسال می‌کنند این‌جا نمایش داده می‌شوند."
          clearFiltersHref="/admin/collections/contact-messages"
        />
      ) : (
        <ContactMessagesInbox messages={messages} />
      )}
    </div>
  );
}
