import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  Mail,
  Calendar,
  Package,
  Wallet,
  MapPin,
  MessageSquare,
  Star,
  Heart,
  History,
  StickyNote,
  ShieldCheck,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getCustomer360 } from "@/lib/admin/customer";
import { ORDER_STATUS_LABEL, orderStatusTone } from "@/lib/admin/orders";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import {
  CreditAdjustForm,
  CustomerNoteForm,
} from "@/components/admin/customers/CustomerAdminPanels";
import { formatToman, toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";

export const dynamic = "force-dynamic";

function Toman({ rial }: { rial: number }) {
  return (
    <span className="whitespace-nowrap">
      {formatToman(rial)} <span className="store-toman" aria-label="تومان" />
    </span>
  );
}

const card = "rounded-2xl border border-dz-primary-100 bg-white p-5 dark:border-dz-night-border dark:bg-dz-night-card";
const cardTitle = "mb-3 flex items-center gap-2 font-bold text-dz-primary-800 dark:text-dz-night-fg";

export default async function Customer360Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const data = await getCustomer360(id);
  if (!data) notFound();
  const { profile } = data;

  return (
    <div>
      <AdminPageHeader
        title={profile.name ?? "مشتری"}
        breadcrumbs={[
          { label: "مشتریان", href: "/admin/customers" },
          { label: profile.name ?? "مشتری" },
        ]}
        actions={
          <div className="flex gap-2">
            {profile.isAdmin && <AdminStatusBadge tone="blue">مدیر</AdminStatusBadge>}
            <AdminStatusBadge tone={profile.isActive ? "green" : "gray"}>
              {profile.isActive ? "فعال" : "غیرفعال"}
            </AdminStatusBadge>
          </div>
        }
      />

      {/* profile + KPIs */}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-5">
          <div className={card}>
            <div className="grid gap-3 text-sm text-dz-primary-700 sm:grid-cols-2 dark:text-dz-night-muted">
              <span className="flex items-center gap-2" dir="ltr">
                <Phone className="size-4 text-dz-primary-400" /> {toPersianNumbers(profile.phoneNumber)}
              </span>
              <span className="flex items-center gap-2">
                <Mail className="size-4 text-dz-primary-400" /> {profile.email || "—"}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="size-4 text-dz-primary-400" /> عضو از {formatJalali(profile.createdAtISO)}
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-dz-primary-400" /> کد ملی:{" "}
                {profile.nationalId ? toPersianNumbers(profile.nationalId) : "—"}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-dz-primary-500 dark:text-dz-night-muted">
                <span>تکمیل پروفایل</span>
                <span>{toPersianNumbers(data.completion)}٪</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-dz-primary-100 dark:bg-dz-night-elevated">
                <div className="h-full rounded-full bg-dz-primary-500" style={{ width: `${data.completion}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className={`${card} text-center`}>
              <Package className="mx-auto size-5 text-dz-primary-500" />
              <div className="mt-1 font-heading text-xl font-bold text-dz-primary-800 dark:text-dz-night-fg">
                {toPersianNumbers(data.orderCount)}
              </div>
              <div className="text-xs text-dz-primary-400">سفارش</div>
            </div>
            <div className={`${card} text-center`}>
              <Wallet className="mx-auto size-5 text-dz-primary-500" />
              <div className="mt-1 font-heading text-sm font-bold text-dz-primary-800 dark:text-dz-night-fg">
                <Toman rial={data.totalSpentRial} />
              </div>
              <div className="text-xs text-dz-primary-400">مجموع خرید</div>
            </div>
            <div className={`${card} text-center`}>
              <Wallet className="mx-auto size-5 text-dz-primary-500" />
              <div className="mt-1 font-heading text-sm font-bold text-dz-primary-800 dark:text-dz-night-fg">
                <Toman rial={data.credit.balanceRial} />
              </div>
              <div className="text-xs text-dz-primary-400">اعتبار</div>
            </div>
          </div>

          {/* orders */}
          <div className={card}>
            <h2 className={cardTitle}>
              <Package className="size-[18px]" /> سفارش‌ها ({toPersianNumbers(data.orders.length)})
            </h2>
            {data.orders.length === 0 ? (
              <p className="text-sm text-dz-primary-400">سفارشی ندارد.</p>
            ) : (
              <ul className="divide-y divide-dz-primary-50 dark:divide-dz-night-line">
                {data.orders.slice(0, 10).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                    <Link href={`/admin/collections/orders/${o.id}`} className="font-bold text-dz-primary-700 hover:underline dark:text-dz-primary-300">
                      #{toPersianNumbers(o.orderNumber)}
                    </Link>
                    <span className="text-dz-primary-400">{formatJalali(o.createdAtISO)}</span>
                    <AdminStatusBadge tone={orderStatusTone(o.status)}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </AdminStatusBadge>
                    <Toman rial={o.totalRial} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* conversations */}
          <div className={card}>
            <h2 className={cardTitle}>
              <MessageSquare className="size-[18px]" /> گفتگوها ({toPersianNumbers(data.conversations.length)})
            </h2>
            {data.conversations.length === 0 ? (
              <p className="text-sm text-dz-primary-400">گفتگویی ندارد.</p>
            ) : (
              <ul className="divide-y divide-dz-primary-50 dark:divide-dz-night-line">
                {data.conversations.slice(0, 8).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                    <Link href={`/admin/chat/${c.id}`} className="truncate font-medium text-dz-primary-700 hover:underline dark:text-dz-primary-300">
                      {c.subject || "گفتگو"}
                    </Link>
                    <span className="shrink-0 text-dz-primary-400">{formatJalali(c.lastMessageAtISO)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* reviews + questions */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className={card}>
              <h2 className={cardTitle}>
                <Star className="size-[18px]" /> دیدگاه‌ها ({toPersianNumbers(data.reviews.length)})
              </h2>
              {data.reviews.length === 0 ? (
                <p className="text-sm text-dz-primary-400">دیدگاهی ندارد.</p>
              ) : (
                <ul className="space-y-2 text-sm text-dz-primary-700 dark:text-dz-night-muted">
                  {data.reviews.slice(0, 5).map((r) => (
                    <li key={r.id} className="truncate">
                      {toPersianNumbers(r.rating)}★ — {r.productTitle}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className={card}>
              <h2 className={cardTitle}>
                <MessageSquare className="size-[18px]" /> پرسش‌ها ({toPersianNumbers(data.questions.length)})
              </h2>
              {data.questions.length === 0 ? (
                <p className="text-sm text-dz-primary-400">پرسشی ندارد.</p>
              ) : (
                <ul className="space-y-2 text-sm text-dz-primary-700 dark:text-dz-night-muted">
                  {data.questions.slice(0, 5).map((qq) => (
                    <li key={qq.id} className="truncate">
                      {qq.productTitle}: {qq.question}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* recent + wishlist counts */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className={card}>
              <h2 className={cardTitle}>
                <Heart className="size-[18px]" /> علاقه‌مندی‌ها ({toPersianNumbers(data.wishlist.length)})
              </h2>
              <ul className="space-y-1.5 text-sm text-dz-primary-700 dark:text-dz-night-muted">
                {data.wishlist.slice(0, 6).map((p) => (
                  <li key={p.productId} className="truncate">{p.title}</li>
                ))}
                {data.wishlist.length === 0 && <li className="text-dz-primary-400">موردی ندارد.</li>}
              </ul>
            </div>
            <div className={card}>
              <h2 className={cardTitle}>
                <History className="size-[18px]" /> بازدیدهای اخیر ({toPersianNumbers(data.recent.length)})
              </h2>
              <ul className="space-y-1.5 text-sm text-dz-primary-700 dark:text-dz-night-muted">
                {data.recent.slice(0, 6).map((p) => (
                  <li key={p.productId} className="truncate">{p.title}</li>
                ))}
                {data.recent.length === 0 && <li className="text-dz-primary-400">موردی ندارد.</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* right column: credit, addresses, notes */}
        <div className="flex flex-col gap-5">
          <div className={card}>
            <h2 className={cardTitle}>
              <Wallet className="size-[18px]" /> اعتبار دشت‌زاد
            </h2>
            <div className="mb-3 font-heading text-2xl font-bold text-dz-primary-800 dark:text-dz-night-fg">
              <Toman rial={data.credit.balanceRial} />
            </div>
            <CreditAdjustForm userId={profile.id} />
            {data.credit.entries.length > 0 && (
              <ul className="mt-4 max-h-48 space-y-1.5 overflow-y-auto border-t border-dz-primary-50 pt-3 text-xs text-dz-primary-600 dark:border-dz-night-line dark:text-dz-night-muted">
                {data.credit.entries.slice(0, 12).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2">
                    <span>{t.direction === "IN" ? "+ " : "− "}<Toman rial={t.amountRial} /></span>
                    <span className="text-dz-primary-400">{formatJalali(t.createdAtISO)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={card}>
            <h2 className={cardTitle}>
              <MapPin className="size-[18px]" /> آدرس‌ها ({toPersianNumbers(data.addresses.length)})
            </h2>
            {data.addresses.length === 0 ? (
              <p className="text-sm text-dz-primary-400">آدرسی ندارد.</p>
            ) : (
              <ul className="space-y-2 text-sm text-dz-primary-700 dark:text-dz-night-muted">
                {data.addresses.map((a) => (
                  <li key={a.id} className="leading-6">
                    <span className="font-medium text-dz-primary-800 dark:text-dz-night-fg">
                      {a.title || "آدرس"}
                      {a.isDefault ? " (پیش‌فرض)" : ""}:
                    </span>{" "}
                    {a.city}، {a.line}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={card}>
            <h2 className={cardTitle}>
              <StickyNote className="size-[18px]" /> یادداشت‌های داخلی
            </h2>
            <CustomerNoteForm userId={profile.id} />
            {data.notes.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-dz-primary-50 pt-3 text-sm dark:border-dz-night-line">
                {data.notes.map((n) => (
                  <li key={n.id} className="rounded-xl bg-dz-primary-50/60 p-2.5 dark:bg-dz-night-elevated">
                    <p className="text-dz-primary-800 dark:text-dz-night-fg">{n.body}</p>
                    <p className="mt-1 text-xs text-dz-primary-400">
                      {n.authorName} · {formatJalali(n.createdAtISO)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
