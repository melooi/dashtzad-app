# 02 — Storefront
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (bootstrap واقعی) · **وضعیت:** 🟡 پایه قفل، بخشی نیمه‌کاره

## هدف
فروشگاه عمومی: خانه، محصول (PDP)، دسته، بلاگ، سبد، تسویه، حساب، FAQ، تماس، Header/Footer، کارت محصول، چت (موبایل=نوار پایین، دسکتاپ=راست).

## تصمیم‌های قفل‌شده
- Header: props-based، قفل شده — دست نزن.
- ProductCard: چندمدل، `src/components/storefront/product-card/`.
- چت storefront: موبایل=نوار پایین، دسکتاپ=سمت راست — جابه‌جا نکن.
- storefront همیشه روشن — `dz-night` وارد نشود.
- فایل‌های طراحی فقط با گزارش صریح تغییر کنند.

## فایل‌های کلیدی
- `src/app/(public)/layout.tsx` — layout اصلی storefront
- `src/components/Header.tsx` — هدر (قفل)
- `src/components/Footer.tsx` — فوتر (بازنویسی نیمه‌کاره)
- `src/components/storefront/product-card/` — کارت محصول جدید
- `src/components/storefront/chrome/` — UI chrome مشترک
- `src/components/storefront/chat/` — چت‌بات storefront
- `src/components/home/HomepageBlocks.tsx` — بلاک‌های خانه
- `src/views/product/single-design/` — PDP دیزاین جدید
- `src/views/account/` + `panel/` — حساب کاربری

## صفحات (از scan واقعی)
- `/` — خانه
- `/products/` — لیست، `/products/[slug]/` — PDP، `/products/card-preview/` — preview
- `/blog/` — لیست، `/blog/[slug]/` — مقاله، `/blog/category/`, `/blog/case-files/`
- `/cart/`, `/checkout/`, `/orders/[id]/`, `/payment/`
- `/account/` (+ panel/), `/auth/`
- `/faq/`, `/contact/`, `/about/`, `/terms/`

## وضعیت فعلی
- ✅ Header — props-based، قفل، commit شده
- ✅ PDP دیزاین جدید — `views/product/single-design/`، CSS در `public/dz-design/` scoped
- ✅ ProductCard چندمدل — `storefront/product-card/`
- ✅ Customer account CP1 — wishlist+cart، 12/12 browser QA (مموری جداگانه در .claude/projects)
- ✅ FAQ صفحه — `/faq/`
- ✅ Contact صفحه — `/faq/`
- 🟡 Footer — بازنویسی data-driven ناتمام
- 🟡 چت‌بات storefront — `components/storefront/chat/`، تأییدنشده
- ⚠️ `src/app/(public)/blog/[slug]/page.tsx:445` — خطای TS (CardVariantLite missing id/gramValue)
- ⚠️ `<img src="">` خالی در PostCard/HomepageBlocks

## threadهای باز
- Footer data-driven کامل شود.
- خطای tsc بلاگ صفحه حل شود (ریشه: CardVariantLite type).
- `<img src="">` خالی باید به null یا conditional render تبدیل شود.

## Gotchas
- `src/lib/storefront/` پوشه جدید — محتوایش در bootstrap کامل بررسی نشد.
- بلاگ صفحه دقیقاً همان خطای CardVariantLite است که cards.ts — یک ریشه، دو محل.
- `views/product/ProductPurchaseBox.tsx`, `ProductVariantSelector.tsx`, `ShareButton.tsx` جدید هستند.
