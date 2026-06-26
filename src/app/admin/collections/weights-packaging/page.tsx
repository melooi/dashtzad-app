import Link from "next/link";
import { Scale, Boxes } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { toPersianNumbers } from "@/lib/price";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function WeightsPackagingOverview() {
  await requireAdmin();
  const [weights, packagings] = await Promise.all([
    prisma.weightPreset.count(),
    prisma.packagingOption.count(),
  ]);

  const cards = [
    { href: "/admin/collections/weights-packaging/weights", title: "وزن‌ها", count: weights, icon: Scale, desc: "وزن‌های ازپیش‌تعریف‌شده برای مدل‌های فروش." },
    { href: "/admin/collections/weights-packaging/packaging", title: "بسته‌بندی‌ها", count: packagings, icon: Boxes, desc: "گزینه‌های بسته‌بندی و هزینه‌ی هرکدام." },
  ];

  return (
    <div>
      <AdminPageHeader
        title="وزن‌ها و بسته‌بندی‌ها"
        description="پایه‌ی مدل‌های فروش محصولات: وزن‌ها و گزینه‌های بسته‌بندی."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "وزن‌ها و بسته‌بندی‌ها" }]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className="flex items-center gap-4 rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-5 transition-shadow hover:shadow-md">
              <div className="flex size-12 items-center justify-center rounded-xl bg-dz-primary-50 dark:bg-white/5 text-dz-primary-600 dark:text-dz-primary-300">
                <Icon className="size-6" />
              </div>
              <div>
                <div className="font-heading text-lg font-bold text-dz-primary-800 dark:text-dz-night-fg">{c.title}</div>
                <div className="text-sm text-dz-primary-500 dark:text-dz-night-muted">{c.desc}</div>
                <div className="mt-1 text-xs text-dz-primary-400 dark:text-dz-night-faint">{toPersianNumbers(c.count)} مورد</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
