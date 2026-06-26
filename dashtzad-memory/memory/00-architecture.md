# 00 — Architecture (استک و کانونشن‌ها)
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (seed) · **وضعیت:** ✅ قفل‌شده

## هدف
منبع حقیقتِ استک، کانونشن‌ها و تصمیم‌های قفل‌شده. هیچ دامنهٔ دیگری این‌ها را نباید نقض کند.

## تصمیم‌های قفل‌شده (بدون تأیید صریح کاربر باز نمی‌شوند)
- **فریم‌ورک:** Next.js 16.2.9 (App Router) · React 19 · TypeScript strict · ESM.
- **استایل:** Tailwind 4 با توکن‌های `dz-` · دارک با `dz-night`. رنگ‌های storefront وارد admin نشوند و برعکس.
- **دیتابیس/ORM:** PostgreSQL 18 · **Prisma 7 + `@prisma/adapter-pg`** (نه Drizzle، نه Payload-DB). client تولیدشده در `src/generated/prisma`.
- **Auth:** OTP سفارشی روی **Kavenegar** + **database sessions**. (نه next-auth، نه auth خارجی.)
- **کتابخانه‌ها:** Zod · TanStack Query v5 · react-hook-form · dayjs/jalaliday · lucide-react · Node 24.
- **تاریخ برند:** ۱۳۱۳ (هیچ‌جا ۱۳۰۵).
- **زبان کار:** فارسی برای توضیح/دستور؛ انگلیسی برای کد/نام‌فایل/شناسه.
- مسیر پروژه: `/Users/mim/Documents/dashtzad all/dashtzadpro/dashtzad-app/` · port 3000/3001.

## کانونشن‌ها
- قیمت‌ها: عدد صحیح ریال با پسوند `_rial`؛ نمایش به تومان.
- slug: latin lowercase kebab-case؛ ارقام فارسی normalize شوند.
- بعد از تغییر schema: `prisma generate` لازم است وگرنه client کهنه می‌شود (خطای `Property 'x' does not exist`).
- بعد از migration جدید: dev server را restart کن وگرنه Prisma client کهنه می‌ماند.

## Gotchas
- `migrate dev` به‌خاطر driftِ `Product.latinTitle/pdpContent` می‌خواهد DB را reset کند → به‌جایش `migrate diff` + `migrate deploy` استفاده شد. (جزئیات در `08-data-model.md`.)
- AGENTS.md پروژه می‌گوید Next.js 16 نسبت به training data تغییر دارد؛ قبل از نوشتن route، docs محلیِ `node_modules/next/dist/docs/` خوانده شود (مثلاً `params` یک Promise است).

## 🗄️ استک‌های مرده (منتقل نمی‌شوند)
وردپرس/Blade/WooCommerce · Laravel/PHP. کارِ آن دوره به این پروژه ربط ندارد.
