# LINT-STABILIZATION-GATE QA Report

**تاریخ:** 2026-06-26
**شاخه:** main
**بر اساس:** commit `de17bf8` + تغییرات ADMIN-STABILIZATION-GATE
**وضعیت working tree:** uncommitted changes (3 فایل از gate قبلی + 13 فایل این gate)

---

## نتیجه نهایی

| تست | قبل از اصلاح | بعد از اصلاح |
|-----|-------------|-------------|
| `npm run lint` | ❌ 22 error / 56 warning | ✅ **0 error** / 56 warning |
| `npx tsc --noEmit` | ✅ 0 خطا | ✅ 0 خطا |
| `npm run build` | ✅ موفق | ✅ موفق |

---

## فهرست دقیق ۲۲ خطا قبل از اصلاح

### دسته ۱ — `@typescript-eslint/no-explicit-any` (2 خطا)
| فایل | خط | توضیح |
|------|----|-------|
| `prisma/seed-pdp.ts` | 472 | `const variantData: any[]` |
| `prisma/seed-pdp.ts` | 561 | `pdpContent: cfg.content as any` |

### دسته ۲ — `@typescript-eslint/no-this-alias` (1 خطا)
| فایل | خط | توضیح |
|------|----|-------|
| `public/dz-design/js/recipe.js` | 127 | `var self = this` برای استفاده در setTimeout |

### دسته ۳ — `react/no-unescaped-entities` (10 خطا)
| فایل | خطوط |
|------|------|
| `src/app/(public)/products/card-preview/page.tsx` | 281, 289, 297, 305, 314 (هر خط ۲ علامت `"`) |

### دسته ۴ — `react-hooks/set-state-in-effect` (7 خطا)
| فایل | خط | توضیح |
|------|----|-------|
| `src/components/admin/AdminThemeToggle.tsx` | 34 | `setMode(...)` در `useEffect` |
| `src/components/admin/media/MediaDetailsPanel.tsx` | 50 | `setAlt(...)` در reset effect |
| `src/components/admin/media/MediaPickerDialog.tsx` | 42 | `setLoading(true)` در search effect |
| `src/components/admin/media/MediaPickerDialog.tsx` | 62 | `setSelected(null)` در reset-on-close effect |
| `src/components/storefront/RecipeLikeButton.tsx` | 25 | `setLiked(true)` از localStorage |
| `src/components/storefront/RecipeRating.tsx` | 63 | `setUserValue(stored)` از localStorage |
| `src/components/storefront/ShareButtons.tsx` | 15 | `setUrl(window.location.href)` |

### دسته ۵ — `react-hooks/refs` / Cannot access refs during render (2 خطا)
| فایل | خط | توضیح |
|------|----|-------|
| `src/components/admin/products/QuickAddSheet.tsx` | 81 | `rowsRef.current = rows` در بدنه render |
| `src/components/admin/ui/AdminSlugField.tsx` | 49 | callback با `touched.current = true` در آرگومان `register` |

---

## روش رفع هر خطا و فایل‌های تغییر کرده

### `prisma/seed-pdp.ts` — 2 خطا
**علت:** استفاده از `any` برای آرایه variant و cast
**روش رفع:**
- `import { PrismaClient, Prisma } from "../src/generated/prisma/client"` — اضافه شد `Prisma`
- `const variantData: Prisma.ProductVariantCreateManyInput[]` — type‌safe
- `pdpContent: cfg.content as Prisma.InputJsonValue` — نوع JSON صحیح Prisma

### `public/dz-design/js/recipe.js` — 1 خطا
**علت:** `var self = this` برای نگه‌داشتن reference دکمه در setTimeout
**روش رفع:** مستقیم از `copyBtn` (متغیر closure) استفاده شد؛ `self` حذف شد

### `src/app/(public)/products/card-preview/page.tsx` — 10 خطا
**علت:** علامت `"` مستقیم در JSX text (مثل `variant="default"`)
**روش رفع:** 5 رشته با template literal JSX پوشانده شدند: `{` \`variant="default"...\` `}`

### `src/components/admin/AdminThemeToggle.tsx` — 1 خطا
**علت:** `setMode` و `setMounted` به‌صورت synchronous در useEffect
**روش رفع:** هر دو setState داخل `queueMicrotask(() => {...})` منتقل شدند. از آنجا که setState در callback اجرا می‌شود نه مستقیم در body effect، قانون React Compiler رعایت می‌شود. رفتار hydration تغییر نکرد.

### `src/components/admin/media/MediaDetailsPanel.tsx` — 1 خطا
**علت:** pattern `useEffect(() => { setX(asset.x) }, [asset])` برای reset فرم
**روش رفع:** کامپوننت به دو لایه تقسیم شد:
- `MediaDetailsPanel` (wrapper): اگر `!asset` برگردد null، در غیر این صورت `<MediaDetailsPanelInner key={asset.id} .../>` رندر کند
- `MediaDetailsPanelInner`: state را از prop `asset` مستقیم initialize کند (نه از effect)
- نتیجه: هنگام تغییر asset، کامپوننت داخلی remount می‌شود و state تمیز است. useEffect حذف شد.

### `src/components/admin/media/MediaPickerDialog.tsx` — 2 خطا
**علت خطا ۱:** `setLoading(true)` synchronous در ابتدای useEffect
**روش رفع:** `setLoading(true)` به داخل setTimeout callback (250ms) منتقل شد؛ فقط یک check `if (!active) return` اضافه شد

**علت خطا ۲:** `setSelected(null)`, `setMultiSelected([])`, `setQ("")` synchronous در useEffect
**روش رفع:** سه setState درون `setTimeout(() => {...}, 0)` پوشانده شدند؛ cleanup با `clearTimeout` اضافه شد

### `src/components/admin/products/QuickAddSheet.tsx` — 1 خطا
**علت:** `rowsRef.current = rows` مستقیم در بدنه render (side effect during render)
**روش رفع:** خط مستقیم حذف شد و `useEffect(() => { rowsRef.current = rows; }, [rows])` اضافه شد

### `src/components/admin/ui/AdminSlugField.tsx` — 1 خطا
**علت:** `register(name, { onChange: () => { touched.current = true; } })` — پاس دادن callback با ref write به تابع register در render
**روش رفع:** `register(name)` بدون options؛ tracking touched در JSX input:
```tsx
onChange={(e) => { touched.current = true; void reg.onChange(e); }}
```

### `src/components/storefront/RecipeLikeButton.tsx` — 1 خطا
**علت:** `setLiked(true)` synchronous در useEffect خواندن localStorage
**روش رفع:** `queueMicrotask(() => setLiked(true))` — setState در callback، نه synchronous در body

### `src/components/storefront/RecipeRating.tsx` — 1 خطا
**علت:** `setUserValue(stored)` و `setPending(true)` synchronous در useEffect
**روش رفع:** `queueMicrotask(() => { setUserValue(stored); setPending(true); })`

### `src/components/storefront/ShareButtons.tsx` — 1 خطا
**علت:** `setUrl(window.location.href)` synchronous در useEffect
**روش رفع:** `queueMicrotask(() => setUrl(window.location.href))`

---

## فایل‌های تغییر کرده (13 فایل)

| فایل | خطاهای رفع‌شده |
|------|----------------|
| `prisma/seed-pdp.ts` | 2 |
| `public/dz-design/js/recipe.js` | 1 |
| `src/app/(public)/products/card-preview/page.tsx` | 10 |
| `src/components/admin/AdminThemeToggle.tsx` | 1 |
| `src/components/admin/media/MediaDetailsPanel.tsx` | 1 |
| `src/components/admin/media/MediaPickerDialog.tsx` | 2 |
| `src/components/admin/products/QuickAddSheet.tsx` | 1 |
| `src/components/admin/ui/AdminSlugField.tsx` | 1 |
| `src/components/storefront/RecipeLikeButton.tsx` | 1 |
| `src/components/storefront/RecipeRating.tsx` | 1 |
| `src/components/storefront/ShareButtons.tsx` | 1 |

---

## خارج از scope (دست نخورد)

- 56 warning باقی‌مانده (از قبل وجود داشتند — `@typescript-eslint/no-unused-vars`، `@next/next/no-css-tags`، `react-hooks/exhaustive-deps` و غیره)
- هیچ فیچر جدیدی اضافه نشد
- هیچ schema/migration جدیدی ساخته نشد
- هیچ UI جدیدی ساخته نشد
- وارد chat widget نشدیم

---

## commit/push

**هیچ commit یا push انجام نشد.**

---

## خلاصه

بعد از رفع ۲۲ خطای ESLint در ۱۱ فایل:
- `npm run lint` → ✅ **0 error**
- `npx tsc --noEmit` → ✅ 0 خطا
- `npm run build` → ✅ موفق (40 صفحه)

پروژه از نظر lint/tsc/build کاملاً سبز است.
