# ADMIN-STABILIZATION-GATE QA Report

**تاریخ:** 2026-06-26
**Commit بررسی‌شده:** `de17bf8` — Variant selector, cart, flash timer, home alignment, CP-B backend
**شاخه:** main
**وضعیت working tree:** clean (هیچ تغییر uncommit نشده‌ای وجود نداشت)

---

## نتیجه نهایی

| تست | قبل از اصلاح | بعد از اصلاح |
|-----|-------------|-------------|
| `npx tsc --noEmit` | ❌ 5 خطا | ✅ 0 خطا |
| `npm run build` | — (نشد، tsc fail بود) | ✅ موفق (40 صفحه) |
| `npm run lint` | ❌ 22 error / 56 warning | ❌ 22 error / 56 warning (pre-existing, خارج از scope) |

---

## خطاهای TypeScript — قبل از اصلاح (5 خطا)

```
src/app/api/admin-ai/reports/[id]/findings/[fid]/route.ts(2,15):
  error TS2305: Module '"next/server"' has no exported member 'RouteContext'.

src/app/api/admin-ai/reports/[id]/route.ts(2,15):
  error TS2305: Module '"next/server"' has no exported member 'RouteContext'.

src/lib/ai/analyst/scan-tools.ts(215,35):
  error TS2322: Type '{ score: true; }' is not assignable to type 'never'.

src/lib/ai/analyst/scan-tools.ts(223,37):
  error TS2339: Property '_avg' does not exist on type '...'.

src/lib/ai/analyst/scan-tools.ts(223,85):
  error TS2339: Property '_avg' does not exist on type '...'.
```

---

## فایل‌های تغییر کرده (3 فایل)

### 1. `src/app/api/admin-ai/reports/[id]/route.ts`
**علت خطا:** `RouteContext` در این نسخه از Next.js (16.2.9) از `next/server` export نمی‌شود.
**راه‌حل:** حذف `import type { RouteContext }` و `type Ctx`؛ inline typing مستقیم در signature تابع:
```typescript
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> })
```

### 2. `src/app/api/admin-ai/reports/[id]/findings/[fid]/route.ts`
**علت خطا:** همان — `RouteContext` وجود ندارد.
**راه‌حل:** همان رویکرد inline با `{ id: string; fid: string }`.

### 3. `src/lib/ai/analyst/scan-tools.ts`
**علت خطا:** کد `prisma.aiFeedback.aggregate({ _avg: { score: true }, ... })` فرض می‌کرد فیلد `score` عددی در مدل `AiFeedback` وجود دارد. در واقع، مدل فقط `rating: AiFeedbackRating` (enum UP/DOWN) دارد — هیچ فیلد عددی قابل avg ندارد. Prisma 7 این را `never` می‌داند.
**راه‌حل:** aggregate عوض شد به `prisma.aiFeedback.count()` ساده. `feedbackCount` مستقیم از عدد count پر می‌شود. `avgFeedbackScore` که در `ChatScan` interface هست `null` برمی‌گردد (چون UP/DOWN enum قابل میانگین نیست).

---

## وضعیت Lint

`npm run lint` با 22 error و 56 warning fail است — **همه pre-existing هستند** و هیچ‌کدام مربوط به commit فعلی نیستند:

| منشأ خطاها | نوع | تعداد |
|-----------|-----|-------|
| `prisma/seed-pdp.ts` | `@typescript-eslint/no-explicit-any` | 2 |
| `public/dz-design/js/recipe.js` | `no-this-alias` | 1 |
| `src/app/(public)/products/card-preview/page.tsx` | `react/no-unescaped-entities` | 10 |
| `src/components/storefront/RecipeRating.tsx` | `react-hooks/set-state-in-effect` | 1 |
| `src/components/storefront/ShareButtons.tsx` | `react-hooks/set-state-in-effect` | 1 |
| سایر فایل‌های storefront و admin | warnings مختلف | 56+ |

این خطاها در کامیت‌های قبلی وجود داشتند و در scope این gate نیستند.

---

## مسیرهای ادمین — وضعیت Placeholder

### نتیجه: **0 مسیر فعال nav به صفحه‌ی generic/placeholder می‌رود**

| نوع | تعداد کل | دارای صفحه اختصاصی | Generic fallback |
|-----|---------|-------------------|-----------------|
| Collections در nav | 13 | 13 | 0 |
| Globals در nav | 12 | 12 | 0 |

**فایل‌های fallback موجود (آینده‌نگر، نه placeholder فعال):**

- `/admin/collections/[collection]/page.tsx` — برای collections جدید آینده. فعلاً `users` و `posts` را از COLLECTION_LABELS هندل می‌کند ولی این دو در nav نیستند.
- `/admin/globals/[global]/page.tsx` — برای globals جدید آینده. هیچ key فعالی از این مسیر استفاده نمی‌کند.

---

## مسیرهای ادمین — لیست کامل صفحات dedicated

### Collections (همه ✅)
- `/admin/collections/banners` + `/new` + `/[id]`
- `/admin/collections/categories` + `/new` + `/[id]`
- `/admin/collections/comments`
- `/admin/collections/contact-messages`
- `/admin/collections/coupons` + `/new` + `/[id]`
- `/admin/collections/faqs` + `/new` + `/[id]`
- `/admin/collections/menus` + `/new` + `/[id]`
- `/admin/collections/orders` + `/[id]`
- `/admin/collections/pricing`
- `/admin/collections/products` + `/new` + `/[id]` + `/quick-add`
- `/admin/collections/redirects` + `/new` + `/[id]`
- `/admin/collections/reviews`
- `/admin/collections/weights-packaging` + `/weights` + `/packaging`

### Globals (همه ✅)
brand, business, contact, contact-page, faq, footer, header, homepage, seo, site, social, terms

### سایر صفحات admin
- `/admin/dashboard`, `/admin/activity`, `/admin/settings`
- `/admin/customers` + `/[id]`
- `/admin/media`
- `/admin/content/articles` + `/new` + `/[id]`
- `/admin/content/case-files` + `/new` + `/[id]`
- `/admin/content/recipe-ratings`, `/admin/content/recipe-suggestions`
- `/admin/seo/overview` + `/checklist` + `/issues` + `/settings` + `/sitemap` + `/robots` + `/merchant` + `/structured-data`
- `/admin/chat` + `/[id]` + `/departments` + `/settings`
- `/api/admin-ai/reports` + `/[id]` + `/[id]/findings/[fid]`

---

## خارج از scope (انجام نشد)

- هیچ فیچر جدیدی اضافه نشد
- هیچ migration/schema جدیدی ساخته نشد
- هیچ redesign در admin UI انجام نشد
- وارد chat widget (CP-D) نشدیم
- وارد storefront نشدیم
- خطاهای lint pre-existing رفع نشدند (خارج از scope)
- خطای `src/lib/account/cards.ts` رفع نشد (بدهی قدیمی‌تر، خارج از scope)

---

## commit/push

**هیچ commit یا push انجام نشد.** سه فایل تغییر کردند اما uncommitted باقی ماندند.

---

## خلاصه

پنل ادمین در commit `de17bf8` پایدار است. بعد از رفع ۵ خطای TypeScript در ماژول AI analyst:
- `tsc --noEmit` → ✅ سبز
- `npm run build` → ✅ موفق (40 صفحه compile شد)
- 0 مسیر nav به صفحه‌ی generic placeholder نمی‌رود
- هیچ فیچر یا schema جدیدی اضافه نشد
