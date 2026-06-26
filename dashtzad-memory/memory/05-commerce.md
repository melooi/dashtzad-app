# 05 — Commerce
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (bootstrap واقعی) · **وضعیت:** 🟡 پایه ساخته‌شده

## هدف
سفارش، سبد خرید، تسویه حساب، پرداخت (Zarinpal/IDPay)، credit/کیف پول، کوپن. روی Prisma قفل.

## تصمیم‌های قفل‌شده
- همهٔ commerce روی Prisma — نه Payload، نه سیستم دیگری.
- پرداخت: Zarinpal اصلی، IDPay fallback.
- قیمت: عدد صحیح ریال (`_rial`) در DB، نمایش تومان در UI (`src/lib/price.ts`).
- Credit/کیف پول: `src/lib/credit/` — ماژول جدا، دست‌نخورده.
- کوپن: `src/lib/admin/coupons.ts` + `coupon-service.ts`.

## فایل‌های کلیدی
- `src/lib/cart.ts` — منطق سبد
- `src/lib/order.ts` — منطق سفارش storefront
- `src/lib/admin/orders.ts`, `order-status.ts` — ادمین
- `src/lib/credit/` — کیف پول
- `src/lib/admin/coupons.ts`, `coupon-service.ts`
- `src/lib/price.ts` — تبدیل ریال/تومان
- `src/app/(public)/cart/page.tsx`, `checkout/page.tsx`, `payment/`, `orders/[id]/`
- `src/app/api/orders/route.ts`
- `src/views/checkout/CheckoutForm.tsx`
- `src/app/admin/collections/orders/[id]/` — ادمین جزئیات سفارش
- `src/app/admin/collections/coupons/` + `src/components/admin/coupons/CouponsTable.tsx`
- `src/components/admin/pricing/` — قیمت‌گذاری inline

## وضعیت فعلی
- ✅ Cart + Checkout + Payment pages — ساخته
- ✅ Order detail storefront — ساخته
- ✅ Customer Account CP1 (wishlist+cart) — 12/12 QA
- ✅ Coupons admin — ساخته، commit نشده
- ✅ Pricing inline workspace — ساخته، commit نشده
- ✅ Admin order detail — ساخته، commit نشده
- 🟡 Credit/کیف پول — `src/lib/credit/` موجود، وضعیت کامل نامعلوم
- ⏳ پرداخت Zarinpal sandbox — تأییدنشده

## threadهای باز
- Zarinpal با sandbox تست شود.
- `src/lib/credit/` بررسی شود چه چیزی ساخته شده.

## Gotchas
- `src/lib/admin/order-status.ts` برای ادمین است، `src/lib/order.ts` برای storefront — جدا بمانند.
- قیمت همیشه ریال در DB — تبدیل فقط در `src/lib/price.ts`.
- `src/views/account/ReorderButton.tsx` و `RecordView.tsx` — views جدید account.
