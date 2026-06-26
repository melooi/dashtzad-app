# 01 — Admin Panel
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (bootstrap واقعی) · **وضعیت:** 🟡 ساخته‌شده، commit نشده

## هدف
پنل مدیریت دشت‌زاد: داشبورد، Collections، Globals، Content، Media، SEO، Chat، Customers، Coupons، Orders، Pricing. زبان طراحی واحد با dz- tokens. دارک مود اختصاصی ادمین.

## تصمیم‌های قفل‌شده
- توکن‌های `dz-` فقط — رنگ storefront وارد admin نشود.
- دارک مود admin با `dz-night` — storefront همیشه روشن.
- `AdminShell` → `AdminHeader` → `AdminBreadcrumbs` — سلسله‌مراتب ثابت layout.
- `AdminDataTable` + `AdminFormShell` — دو building block اصلی همهٔ صفحات.
- Server Actions برای همهٔ mutation ادمین (نه API Routes جدا برای ادمین).

## فایل‌های کلیدی
- `src/app/admin/layout.tsx` — shell + auth guard
- `src/app/admin/dashboard/page.tsx` — داشبورد اقدام‌محور
- `src/components/admin/AdminShell.tsx`, `AdminHeader.tsx` — layout اصلی
- `src/components/admin/ui/AdminDataTable.tsx` — جدول مشترک همه لیست‌ها
- `src/components/admin/ui/AdminFormShell.tsx` — shell فرم با ناوبری/ذخیره
- `src/components/admin/AdminThemeScript.tsx`, `AdminThemeToggle.tsx` — دارک مود
- `src/components/admin/editor/RichTextEditor.tsx` — ادیتور متن حرفه‌ای
- `src/lib/admin/nav.ts` — منوی ناوبری (staged، AM)
- `src/components/admin/ui/AdminReadinessChecklist.tsx` — چک‌لیست آمادگی
- `src/components/admin/ui/AdminRichTextField.tsx` — wrapper ادیتور در فرم

## صفحات موجود (از scan واقعی)

### Collections
- محصولات: لیست، جدید، ویرایش، quick-add
- دسته‌بندی: درختی، لیست، جدید، ویرایش
- بنر: لیست، جدید، ویرایش
- منو: لیست، جدید، ویرایش
- FAQ: لیست، جدید، ویرایش
- کوپن: لیست، جدید، ویرایش
- سفارش: `orders/[id]/` (جزئیات)
- redirect: لیست، جدید، ویرایش
- وزن/بسته‌بندی: weights + packaging جداگانه
- قیمت‌گذاری: inline editable workspace
- نقدوبررسی, پیام‌های تماس: فقط actions

### Globals
- site, header, footer, homepage, brand, business, contact, social, seo, faq, terms, contact-page

### Content
- مقاله: لیست، جدید، ویرایش (با RichTextEditor)
- پرونده‌ها: لیست، جدید، ویرایش
- امتیاز دستورپخت, پیشنهاد دستورپخت: مدیریت

### سایر
- `media/` — Media Library
- `seo/` — SEO overview + بهینه‌سازی
- `chat/` — مرکز چت اپراتور ([id]/, departments/, settings/)
- `customers/` — مدیریت مشتریان
- `activity/` — لاگ فعالیت
- `settings/` — تنظیمات و وضعیت اتصال‌ها

## وضعیت فعلی
- ✅ UX فاز۱ — commit `326ce58`
- ✅ UX فاز۱.۵ — commit `4d48b86`
- ✅ Dark mode admin (AdminThemeScript + AdminThemeToggle + lib/admin/theme.ts) — commit نشده
- ✅ Rich Text Editor کامل (7 view type, toolbar, extensions) — commit نشده
- ✅ SEO admin module — commit نشده
- ✅ Media Library — commit نشده
- ✅ Customers management — commit نشده
- ✅ Coupons — commit نشده
- 🟡 Chat Center (CP-B) — فایل‌ها موجود، تست تأییدنشده
- 🟡 Pricing CP1 inline-editable — commit نشده
- ⏳ Visual lock (قفل بصری) — هنوز نشده

## threadهای باز
- **بزرگ‌ترین ریسک:** همهٔ کارهای بعد از commit `4d48b86` commit نشده‌اند.
- Chat Center (CP-B) باید end-to-end تست شود.

## Gotchas
- `src/lib/admin/nav.ts` هم staged (AM) است — merge conflict احتمالی.
- AdminReadinessChecklist و AdminRichTextField جدید هستند — بررسی وابستگی‌هاشان قبل از commit.
