import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import { StoreStatusPage } from "@/components/storefront/StoreStatusPage";

// Display-only state page. No transaction/order data is fabricated here; the
// real order/payment flow (and any lookup) is a later checkpoint.
export const metadata: Metadata = {
  title: "پرداخت موفق | دشت‌زاد",
  robots: { index: false, follow: true },
};

export default function PaymentSuccessPage() {
  return (
    <StoreStatusPage
      icon={<CheckCircle2 className="size-10" aria-hidden />}
      tone="success"
      title="پرداخت با موفقیت انجام شد"
      description="از خرید شما سپاس‌گزاریم. جزئیات سفارش از طریق حساب کاربری و راه‌های ارتباطی در دسترس خواهد بود."
      actions={
        <>
          <Link href="/account" className="store-btn store-btn-primary">
            <ShoppingBag className="size-4" aria-hidden />
            سفارش‌های من
          </Link>
          <Link href="/" className="store-btn store-btn-secondary">
            <Home className="size-4" aria-hidden />
            بازگشت به خانه
          </Link>
        </>
      }
    />
  );
}
