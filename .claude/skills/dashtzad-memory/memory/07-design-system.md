# 07 — Design System
**آخرین تأیید:** 2026-06-26 · **وضعیت کلی:** ✅

## هدف
توکن‌های dz- و dz-night، IRANYekanX/Kalameh، RTL، هویت سینمایی/اپل‌گونه. رنگ store-* فقط storefront؛ admin از dz-* olive استفاده می‌کند.

## تصمیم‌های قفل‌شده
- توکن‌های `dz-*` در `@theme` و `:root` در `globals.css` تعریف می‌شوند.
- `store-*` namespace برای storefront (cards, PLP, PDP) — admin هرگز store-* مستقیم استفاده نمی‌کند.
- `dz-night-*` توکن‌های دارک‌مود admin — فقط via `.dark` utilities.
- `@custom-variant dark (&:where(.dark, .dark *))` در globals.css — کلاس `.dark` فقط روی `/admin` تنظیم می‌شود.
- فونت‌ها: IRANYekanX (body)، Kalameh (headings).

## فایل‌های کلیدی
- `src/app/globals.css` — base: tailwind import، font-face، @theme، :root bridge، body/base، dark utilities (~370 خط)
- `src/styles/storefront/product-card.css` — `.store-card*`, `.store-btn`, `.store-chip`, `.dz-sk`
- `src/styles/content/rich-text.css` — `.dz-rich` + dark variants + editor surface
- `src/styles/content/recipe-card.css` — `.dz-recipe-card`
- `src/styles/pages/faq.css` — `.dz-faq*`
- `src/styles/pages/terms.css` — `.dz-terms*`, `.dz-legal*`
- `src/styles/pages/contact.css` — `.dz-contact*`
- `src/styles/admin/admin-base.css` — placeholder (خالی)
- `src/styles/admin/chat-panel.css` — placeholder (خالی)

## وضعیت فعلی (واقعی، نه آرزویی)
- ✅ globals.css از ۳۱۲۴ به ۳۷۰ خط کاهش یافت
- ✅ همهٔ CSS بخش‌ها به فایل‌های جداگانه منتقل شدند (با @import)
- ✅ @import ها در بالای globals.css، قبل از @theme و :root
- ⚠️ `.next/types/validator.ts` یک خطای stale دارد (canned-replies page حذف شده ولی type هنوز هست) — نامربوط به CSS، نیاز به `next build` برای regenerate دارد

## threadهای باز
- `admin-base.css` و `chat-panel.css` هنوز خالی هستند — admin CSS موجود از Tailwind utilities است، نه custom CSS

## Gotchas (درس‌های گران)
- در Tailwind 4، `@import` باید قبل از `@custom-variant`، `@font-face`، `@theme` و `@utility` بیاید — وگرنه PostCSS/Lightning CSS خطا می‌دهد.
- CSS custom properties (vars) از :root inherited هستند و در all imported files در دسترس‌اند — import order روی variable resolution تأثیر ندارد.
- `.next/types` stale می‌شود اگر page جدیدی حذف یا اضافه شود بدون rebuild — `next build` یا حذف `.next` برای fix.
