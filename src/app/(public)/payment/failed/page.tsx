import type { Metadata } from "next";
import Link from "next/link";
import { Headset, RotateCcw, XCircle } from "lucide-react";
import { StoreStatusPage } from "@/components/storefront/StoreStatusPage";

// Display-only state page. No transaction/order data is fabricated here.
export const metadata: Metadata = {
  title: "پرداخت ناموفق | دشت‌زاد",
  robots: { index: false, follow: true },
};

export default function PaymentFailedPage() {
  return (
    <StoreStatusPage
      icon={<XCircle className="size-10" aria-hidden />}
      tone="danger"
      title="پرداخت ناموفق بود"
      description="تراکنش شما کامل نشد. اگر مبلغی از حساب شما کسر شده باشد، طی مدت کوتاهی به‌صورت خودکار بازگردانده می‌شود. می‌توانید دوباره تلاش کنید یا با پشتیبانی در تماس باشید."
      actions={
        <>
          <Link href="/cart" className="store-btn store-btn-primary">
            <RotateCcw className="size-4" aria-hidden />
            تلاش دوباره
          </Link>
          <Link href="/contact" className="store-btn store-btn-secondary">
            <Headset className="size-4" aria-hidden />
            تماس با پشتیبانی
          </Link>
        </>
      }
    />
  );
}
