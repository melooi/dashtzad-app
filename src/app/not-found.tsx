import Link from "next/link";
import { ArrowRight, PackageX, Search } from "lucide-react";
import { StoreStatusPage } from "@/components/storefront/StoreStatusPage";

export default function NotFound() {
  return (
    <StoreStatusPage
      icon={<PackageX className="size-9" aria-hidden />}
      tone="neutral"
      title="صفحه پیدا نشد"
      description="صفحه‌ای که دنبالش بودید وجود ندارد یا منتقل شده است. می‌توانید به خانه برگردید یا محصولات دشت‌زاد را ببینید."
      actions={
        <>
          <Link href="/" className="store-btn store-btn-primary">
            <ArrowRight className="size-4" aria-hidden />
            بازگشت به خانه
          </Link>
          <Link href="/products" className="store-btn store-btn-secondary">
            <Search className="size-4" aria-hidden />
            مشاهده‌ی محصولات
          </Link>
        </>
      }
    />
  );
}
