import { requireAdmin } from "@/lib/auth/guards";
import { emptyCouponForm } from "@/lib/admin/coupons";
import { couponsCollection } from "@/lib/admin/collections";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { CouponForm } from "@/components/admin/coupons/CouponForm";

export const dynamic = "force-dynamic";

export default async function NewCouponPage() {
  await requireAdmin();

  return (
    <div>
      <AdminPageHeader
        title="افزودن کوپن"
        description="یک کد تخفیف جدید بسازید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: couponsCollection.label, href: couponsCollection.route },
          { label: "افزودن" },
        ]}
      />
      <CouponForm mode="create" defaultValues={emptyCouponForm} />
    </div>
  );
}
