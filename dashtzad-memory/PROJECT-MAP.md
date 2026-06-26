# PROJECT-MAP — نقشهٔ مرکزی دشت‌زاد
**به‌روزرسانی:** ۲۶ ژوئن ۲۰۲۶ (bootstrap واقعی — git+tsc+scan) · این فایل همیشه اول خوانده می‌شود. کوچک و قابل‌اسکن بماند.

---

## استک قفل‌شده (جزئیات: `memory/00-architecture.md`)
Next.js 16.2.9 · React 19 · TypeScript strict · Tailwind 4 (توکن‌های `dz-`) · PostgreSQL 18 · Prisma 7 + `@prisma/adapter-pg` · OTP/Kavenegar · database sessions · Zod · TanStack Query v5 · react-hook-form · dayjs/jalaliday · Node 24.
مسیر: `/Users/mim/Documents/dashtzad all/dashtzadpro/dashtzad-app/` · port 3000/3001.

---

## دامنه‌ها و وضعیت

| # | دامنه | وضعیت | memory | خلاصهٔ واقعی |
|---|---|---|---|---|
| 01 | **پنل ادمین** | 🟡 | `01-admin-panel.md` | UX فاز۱+۱.۵ ✅ commit (`326ce58`, `4d48b86`). Dark mode، Rich Editor، SEO، Media، Customers، Coupons ✅ ساخته، commit نشده. Chat Center 🟡 تأییدنشده. Visual lock ⏳. |
| 02 | **storefront** | 🟡 | `02-storefront.md` | Header ✅ قفل. PDP جدید ✅. Customer CP1 ✅ 12/12 QA. Footer 🟡 نیمه‌کاره. چت‌بات 🟡 تأییدنشده. ⚠️ tsc خطا در blog/[slug] (CardVariantLite). |
| 03 | **چت + AI** | 🟡 | `03-chat-ai.md` | CP-A ✅ تست زنده. CP-B (chat-engine، intent، handoff) 🟡 فایل‌ها موجود، end-to-end تست نشده. جداول ai_* ✅ migrate. |
| 04 | **محتوا/CMS** | 🟡 | `04-content-cms.md` | Rich Text Editor کامل (7 view type) ✅. Media Library ✅. Articles/case-files/recipes ✅. همه commit نشده. Payload 🗄️ نصب نشود. |
| 05 | **commerce** | 🟡 | `05-commerce.md` | Cart/Checkout/Payment ✅. Customer CP1 ✅. Coupons + Pricing inline ✅ commit نشده. Zarinpal ⏳ sandbox نشده. |
| 06 | **اتصالات** | 🟡 | `06-integrations.md` | Kavenegar ✅. OpenAI ✅ CP-A. Zarinpal 🟡 کد هست، sandbox نشده. Shipping ⏳. |
| 07 | **دیزاین‌سیستم** | 🟡 | `07-design-system.md` | dz- tokens ✅ قفل. IRANYekanX/Kalameh/Remixicon ✅. Admin dark ✅ commit نشده. PDP dz-design ✅. Visual lock ⏳. |
| 08 | **مدل داده** | ⚠️ | `08-data-model.md` | ⚠️ tsc FAIL: 3 خطا در `cards.ts`+`blog/[slug]` (CardVariantLite missing id/gramValue). ⚠️ drift محصول بدون migration. 16 migration اعمال‌شده. |

---

## بدهی‌های فعال (باید جدا حل شوند)
- ⚠️ **tsc FAIL (3 خطا):** `src/lib/account/cards.ts:58,69` + `src/app/(public)/blog/[slug]/page.tsx:445` — همه از `CardVariantLite` کم‌فیلد (missing `id`/`gramValue`). یک ریشه، دو محل.
- ⚠️ drift `Product.latinTitle/pdpContent` — `migrate dev` می‌خواهد reset کند. از `migrate diff` + `migrate deploy` استفاده شود.
- ⚠️ `<img src="">` خالی در `PostCard`/HomepageBlocks — به null یا conditional render تبدیل شود.
- 🟡 `Footer.tsx` بازنویسی data-driven نیمه‌کاره.
- ⚠️ **بزرگ‌ترین ریسک:** تمام کارهای بعد از commit `4d48b86` (dark mode، editor، SEO، media، customers، coupons، pricing، chat، AI) هنوز commit نشده‌اند.

---

## 🗄️ آرشیو / مرده (دیگر به پروژهٔ فعلی منتقل نمی‌شود)
- تم وردپرس/Blade دشت‌زاد (PHP، WooCommerce، فایل‌های زبان، پالت رنگ Blade) — استکِ قبلی، کنار گذاشته شده.
- ماشین تولید محتوا (ماژول جدا، فعلاً مستقل).
- Dashtzad Center / ERP (VoIP، HesabFa، WooCommerce sync) — معوق.
- Payload CMS — scope شده ولی **نصب‌نشده**؛ اگر روزی نصب شد فقط headless در schema جدا.

---

## کارهای واقعیِ غیرکدی
- ✅ ثبت شرکت «دشت زاد کشت و تجارت ایرانیان» (سهامی) — تأیید شده.
- 🟡 هویت بصری/عکس محصول (ظرف سفالی، سبز دشت، نماهای بالا/روبه‌رو/میانه).

---

## یادآوری‌های همیشگی
- قبل از هر کار: همین map + فقط memory دامنهٔ مربوط. **کل پروژه را نخوان.**
- «done» فقط با tsc/build واقعی.
- تصمیم قفل‌شده را خودسرانه باز نکن؛ flag کن.
- بعد از هر کار: log بزن، memory دامنه را قوی‌تر کن، همین map را تازه کن.
