# 06 — Integrations
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (bootstrap واقعی) · **وضعیت:** 🟡 بخشی فعال

## هدف
اتصالات خارجی: Kavenegar (OTP/SMS)، Zarinpal/IDPay (پرداخت)، OpenAI (AI)، Google، Shipping (pending). صفحهٔ وضعیت در ادمین بدون نمایش کلید.

## تصمیم‌های قفل‌شده
- کلیدها فقط در env — هرگز client bundle یا log.
- صفحهٔ وضعیت: فقط ✅/❌ بر اساس وجود env متغیر.
- همهٔ فراخوانی AI از `src/lib/ai/openai-client.ts`.
- Kavenegar تنها از `src/lib/kavenegar.ts`.

## فایل‌های کلیدی
- `src/lib/kavenegar.ts`
- `src/lib/ai/openai-client.ts`, `env.ts`
- `src/lib/admin/integrations.ts` — وضعیت همهٔ اتصال‌ها
- `src/app/admin/settings/page.tsx` — صفحهٔ تنظیمات

## وضعیت فعلی
- ✅ Kavenegar OTP — در production
- ✅ OpenAI Responses API — CP-A تست زنده شد
- 🟡 Zarinpal — در کد، sandbox نشده
- ⏳ IDPay — fallback، تأییدنشده
- ⏳ Google — ساختار موجود، تأییدنشده
- ⏳ Shipping — placeholder

## threadهای باز
- Zarinpal sandbox تست شود.
- صفحهٔ وضعیت (`/admin/settings/`) با env واقعی بررسی شود.

## Gotchas
- `OPENAI_API_KEY` خالی = همهٔ AI/chat fail بدون خطای واضح.
- Kavenegar IP-restricted روی ایران — dev خارج از ایران OTP fail می‌کند.
- `integrations.ts` env وجود را چک می‌کند، نه ping — کلید می‌تواند باشد ولی سرویس down.
