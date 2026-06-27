import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import {
  TrendingUp, ShoppingCart, Users, DollarSign, Package,
  TrendingDown, Award,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ── helpers ────────────────────────────────────────────────────────────

function toman(v: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(v / 10)) + " ت";
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return dayKey(d);
  });
}

function fa(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

// ── SVG Bar Chart ──────────────────────────────────────────────────────

function BarChart({
  days,
  values,
  colorClass,
  unit,
}: {
  days: string[];
  values: number[];
  colorClass: string;
  unit: string;
}) {
  const max = Math.max(1, ...values);
  const W = 720, H = 120, BOTTOM = 24, PAD = 4;
  const barW = (W - PAD * (days.length - 1)) / days.length;

  return (
    <svg
      viewBox={`0 0 ${W} ${H + BOTTOM}`}
      className="w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      {values.map((v, i) => {
        const bh = Math.max(2, (v / max) * H);
        const x = i * (barW + PAD);
        const y = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="3" className={colorClass} />
            {/* date label for every 3rd bar */}
            {i % 3 === 0 && (
              <text
                x={x + barW / 2}
                y={H + BOTTOM - 4}
                textAnchor="middle"
                fontSize="9"
                className="fill-dz-a-fg-ghost dark:fill-dz-a-night-faint"
              >
                {days[i].slice(5)}
              </text>
            )}
            <title>{days[i]}: {fa(v)} {unit}</title>
          </g>
        );
      })}
    </svg>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, value, label, sub, color,
}: {
  icon: React.FC<{ className?: string }>;
  value: string;
  label: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <div className="text-2xl font-extrabold leading-none text-dz-a-fg dark:text-dz-a-night-fg">{value}</div>
        <div className="mt-1 text-xs font-medium text-dz-a-fg-muted dark:text-dz-a-night-muted">{label}</div>
        {sub && <div className="mt-0.5 text-[10px] text-dz-a-fg-ghost dark:text-dz-a-night-faint">{sub}</div>}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default async function ReportsPage() {
  await requireAdmin();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentOrders, allUsers, topItems, ordersByStatus] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total_rial: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count(),
    prisma.orderItem.groupBy({
      by: ["productId", "title"],
      _sum: { quantity: true, lineTotal_rial: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { total_rial: true },
    }),
  ]);

  // Build daily buckets for charts
  const days30 = lastNDays(30);
  const ordersByDay = new Map<string, number>();
  const revenueByDay = new Map<string, number>();
  days30.forEach((d) => { ordersByDay.set(d, 0); revenueByDay.set(d, 0); });

  for (const o of recentOrders) {
    const k = dayKey(o.createdAt);
    ordersByDay.set(k, (ordersByDay.get(k) ?? 0) + 1);
    if (["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status)) {
      revenueByDay.set(k, (revenueByDay.get(k) ?? 0) + o.total_rial);
    }
  }

  const orderCounts = days30.map((d) => ordersByDay.get(d) ?? 0);
  const revenueVals = days30.map((d) => revenueByDay.get(d) ?? 0);

  // Aggregate stats
  const paidOrders = recentOrders.filter((o) =>
    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status)
  );
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total_rial, 0);
  const totalOrders30 = recentOrders.length;

  const last7 = recentOrders.filter((o) => o.createdAt >= sevenDaysAgo);
  const last7Paid = last7.filter((o) =>
    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status)
  );
  const prev7Start = new Date(sevenDaysAgo);
  prev7Start.setDate(prev7Start.getDate() - 7);
  const prev7 = recentOrders.filter(
    (o) => o.createdAt >= prev7Start && o.createdAt < sevenDaysAgo
  );

  const growthOrders =
    prev7.length === 0
      ? null
      : Math.round(((last7.length - prev7.length) / prev7.length) * 100);

  const avgOrderValue =
    paidOrders.length > 0
      ? Math.round(totalRevenue / paidOrders.length)
      : 0;

  return (
    <div className="flex flex-col gap-7">
      <AdminPageHeader
        title="گزارش‌ها و آمار"
        description="تحلیل فروش، سفارش‌ها و کاربران در ۳۰ روز گذشته."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "گزارش‌ها" },
        ]}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          value={fa(totalOrders30)}
          label="سفارش (۳۰ روز)"
          sub={growthOrders != null ? (growthOrders >= 0 ? `+${growthOrders}٪ نسبت به هفتهٔ قبل` : `${growthOrders}٪ نسبت به هفتهٔ قبل`) : undefined}
          color="bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-400"
        />
        <StatCard
          icon={DollarSign}
          value={toman(totalRevenue)}
          label="درآمد پرداخت‌شده (۳۰ روز)"
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
        />
        <StatCard
          icon={TrendingUp}
          value={toman(avgOrderValue)}
          label="میانگین ارزش سفارش"
          color="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
        />
        <StatCard
          icon={Users}
          value={fa(allUsers)}
          label="کل کاربران ثبت‌نام‌شده"
          sub={`${fa(last7Paid.length)} سفارش این هفته`}
          color="bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <h3 className="mb-1 text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">تعداد سفارش‌ها — ۳۰ روز گذشته</h3>
          <p className="mb-4 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">
            هر نوار = یک روز · بیشینه: {fa(Math.max(...orderCounts))} سفارش
          </p>
          <BarChart
            days={days30}
            values={orderCounts}
            colorClass="fill-dz-a-primary-400 dark:fill-dz-a-primary-500"
            unit="سفارش"
          />
        </div>

        <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <h3 className="mb-1 text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">درآمد روزانه — ۳۰ روز گذشته</h3>
          <p className="mb-4 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">
            سفارش‌های پرداخت‌شده · بر اساس ریال
          </p>
          <BarChart
            days={days30}
            values={revenueVals}
            colorClass="fill-emerald-400 dark:fill-emerald-500"
            unit="ریال"
          />
        </div>
      </div>

      {/* Order status breakdown + Top products */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        {/* status breakdown */}
        <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <h3 className="mb-4 text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">توزیع وضعیت سفارش‌ها</h3>
          {ordersByStatus.length === 0 ? (
            <p className="text-sm text-dz-a-fg-muted">داده‌ای وجود ندارد.</p>
          ) : (
            <dl className="flex flex-col gap-3">
              {ordersByStatus
                .sort((a, b) => (b._count.id ?? 0) - (a._count.id ?? 0))
                .map(({ status, _count, _sum }) => {
                const STATUS_FA: Record<string, string> = {
                  PENDING: "در انتظار",
                  PAID: "پرداخت‌شده",
                  PROCESSING: "در حال پردازش",
                  SHIPPED: "ارسال‌شده",
                  DELIVERED: "تحویل‌داده‌شده",
                  CANCELLED: "لغوشده",
                  REFUNDED: "بازگشت وجه",
                };
                const STATUS_COLOR: Record<string, string> = {
                  PAID: "bg-emerald-500",
                  PROCESSING: "bg-blue-500",
                  SHIPPED: "bg-violet-500",
                  DELIVERED: "bg-emerald-600",
                  PENDING: "bg-amber-400",
                  CANCELLED: "bg-red-400",
                  REFUNDED: "bg-gray-400",
                };
                const cnt = _count.id ?? 0;
                const total2 = ordersByStatus.reduce((s, r) => s + (r._count.id ?? 0), 0);
                const pct = total2 > 0 ? Math.round((cnt / total2) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-dz-a-fg dark:text-dz-a-night-fg">
                        {STATUS_FA[status] ?? status}
                      </span>
                      <span className="text-dz-a-fg-muted dark:text-dz-a-night-muted">
                        {fa(cnt)} · {pct}٪
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-dz-a-primary-50 dark:bg-white/5">
                      <div
                        className={`h-full rounded-full ${STATUS_COLOR[status] ?? "bg-gray-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </dl>
          )}
        </div>

        {/* top products */}
        <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <h3 className="mb-4 text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">
            پرفروش‌ترین محصولات
          </h3>
          {topItems.length === 0 ? (
            <p className="text-sm text-dz-a-fg-muted">سفارشی ثبت نشده است.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topItems.map((item, i) => {
                const qty = item._sum.quantity ?? 0;
                const revenue = item._sum.lineTotal_rial ?? 0;
                const maxQty = topItems[0]._sum.quantity ?? 1;
                const pct = Math.round((qty / maxQty) * 100);
                return (
                  <div key={item.productId} className="flex items-center gap-3">
                    <span className={`w-5 shrink-0 text-center text-xs font-black ${i === 0 ? "text-amber-500" : "text-dz-a-fg-ghost dark:text-dz-a-night-faint"}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-medium text-dz-a-fg dark:text-dz-a-night-fg">
                          {item.title}
                        </span>
                        <span className="ms-2 shrink-0 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">
                          {fa(qty)} عدد
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-dz-a-primary-50 dark:bg-white/5">
                        <div
                          className={`h-full rounded-full ${i === 0 ? "bg-amber-400" : "bg-dz-a-primary-300 dark:bg-dz-a-primary-600"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-0.5 text-[10px] text-dz-a-fg-ghost dark:text-dz-a-night-faint">
                        درآمد: {toman(revenue)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
