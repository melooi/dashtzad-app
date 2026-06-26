# 07 — Design System
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (bootstrap واقعی) · **وضعیت:** 🟡 پایه قفل، بخشی در توسعه

## هدف
توکن‌های `dz-` و `dz-night` (دارک ادمین)، فونت‌ها (IRANYekanX/Kalameh/Remixicon)، RTL، هویت سینمایی/اپل‌گونه. رنگ store و admin کاملاً جدا.

## تصمیم‌های قفل‌شده
- Tailwind 4 + توکن‌های `dz-` — arbitrary value برای رنگ برند ممنوع.
- admin dark: `dz-night` / class `.dark` روی html — فقط admin.
- storefront همیشه روشن — `dz-night` وارد storefront نشود.
- RTL فارسی — `dir="rtl"`، فونت ایرانی اول.
- فونت‌ها: IRANYekanX (متن)، Kalameh (تیتر خاص)، Remixicon (آیکون).
- تاریخ برند: ۱۳۱۳ — هیچ‌جا ۱۳۰۵.
- `public/dz-design/` فقط برای PDP (scoped به `.dz-pdp-page`) — نشت نکند.

## فایل‌های کلیدی
- `src/app/globals.css` — توکن‌های dz-، فونت‌لودینگ، CSS globals
- `public/fonts/iran-yekan-x/` — ۱۲ وزن (woff2)
- `public/fonts/kalameh/` — ۱۰ وزن
- `public/fonts/remixicon/` — آیکون‌فونت (self-hosted)
- `src/components/admin/AdminThemeScript.tsx` — تشخیص دارک بدون flash
- `src/components/admin/AdminThemeToggle.tsx` — دکمهٔ تغییر تم
- `src/lib/admin/theme.ts` — ذخیره/خواندن تم
- `public/dz-design/` — CSS دیزاین PDP (scoped)
- `src/components/storefront/chrome/` — chrome مشترک storefront

## وضعیت فعلی
- ✅ Tailwind 4 + dz- tokens — در production
- ✅ فونت‌ها self-hosted (IRANYekanX، Kalameh، Remixicon)
- ✅ RTL فارسی — فعال
- ✅ PDP دیزاین جدید — CSS scoped به `.dz-pdp-page`، `width: 90rem`
- ✅ Admin dark mode — AdminThemeScript + AdminThemeToggle — commit نشده
- ⏳ Visual lock (قفل بصری کل storefront) — هنوز نشده

## threadهای باز
- Visual lock storefront.
- `src/lib/admin/theme.ts` localStorage/cookie strategy بررسی شود.

## Gotchas
- `public/dz-design/` فقط PDP — در صفحات دیگر leak نکند.
- Admin dark نباید به storefront نشت کند.
- Remixicon از `public/fonts/remixicon/` — نه CDN؛ offline کار می‌کند.
- `src/components/storefront/chrome/` — بررسی نشد چه چیزی داخل است.
