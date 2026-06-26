import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { CouponFormInput } from "@/lib/admin/coupons";
import { couponsCollection } from "@/lib/admin/collections";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { CouponForm } from "@/components/admin/coupons/CouponForm";

export const dynamic = "force-dynamic";

/** Date → "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
function toDatetimeLocal(d: Date): string {
  return new Date(d).toISOString().slice(0, 16);
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const c = await prisma.coupon.findUnique({ where: { id } });
  if (!c) notFound();

  // Stored Rial → displayed Toman (SKILL §D).
  const defaultValues: CouponFormInput = {
    code: c.code,
    title: c.title ?? "",
    description: c.description ?? "",
    type: c.type,
    value: String(c.type === "PERCENT" ? c.amount : Math.round(c.amount / 10)),
    maxDiscount: c.maxDiscount_rial == null ? "" : String(Math.round(c.maxDiscount_rial / 10)),
    minOrder: c.minOrder_rial == null ? "" : String(Math.round(c.minOrder_rial / 10)),
    usageLimit: String(c.usageLimit),
    perUserLimit: c.perUserLimit == null ? "" : String(c.perUserLimit),
    firstOrderOnly: c.firstOrderOnly,
    startsAt: c.startsAt ? toDatetimeLocal(c.startsAt) : "",
    expiresAt: toDatetimeLocal(c.expiresAt),
    isActive: c.isActive,
  };

  return (
    <div>
      <AdminPageHeader
        title={c.code}
        description={c.title ?? "ویرایش کوپن"}
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: couponsCollection.label, href: couponsCollection.route },
          { label: c.code },
        ]}
      />
      <CouponForm mode="edit" couponId={c.id} defaultValues={defaultValues} usageCount={c.usageCount} />
    </div>
  );
}
