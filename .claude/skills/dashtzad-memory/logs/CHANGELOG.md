## 2026-06-28 — admin-panel — trash (سطل زباله) کامل پیاده‌سازی شد
- چه شد: soft-delete + trash page. حذف در ادمین → سطل زباله. از سطل: بازگردانی یا حذف دائمی از DB.
- فایل‌های ساخته/تغییر: `prisma/schema.prisma` (deletedAt به ۱۱ مدل), `src/app/admin/trash/page.tsx`, `src/app/admin/trash/actions.ts`, `src/app/admin/trash/TrashRow.tsx`, `src/app/admin/trash/EmptyTrashButton.tsx`, `src/lib/admin/nav.ts` (Trash2 + سطل زباله nav item), `src/lib/admin/media-actions.ts` (permanentlyDeleteMediaAsset اضافه شد), plus همه delete actions در admin (9 فایل) → soft delete
- مدل‌ها: Product, Post, Category, Banner, Coupon, ContentSeries, Menu, MenuItem, FAQGroup, FAQItem, MediaAsset
- تأیید: tsc=pass ✅ db push=pass ✅ build=نشد
- وضعیت بعد: ✅

## 2026-06-28 — data-model — soft-delete filter: deletedAt: null به همه findMany/findFirst/count اضافه شد
- چه شد: فیلتر `deletedAt: null` به تمام `findMany`، `findFirst`، `count`، و `aggregate` مربوط به مدل‌های Product، Post، Category، Banner، Coupon، ContentSeries، Menu، MenuItem، FAQGroup، FAQItem، MediaAsset اضافه شد. پوشش کامل ادمین + storefront + AI tools + merchant feed + sitemap.
- فایل‌های تغییر (۲۶ فایل، ~۹۵ query): `app/sitemap.ts`, `app/llms.txt/route.ts`, `app/admin/content/case-files/page.tsx`, `app/admin/content/articles/page.tsx`, `app/admin/content/articles/new/page.tsx`, `app/admin/content/articles/[id]/page.tsx`, `app/admin/content/tags/page.tsx`, `app/admin/content/tags/actions.ts`, `app/admin/dashboard/page.tsx`, `app/admin/seo/structured-data/page.tsx`, `app/admin/seo/merchant/page.tsx`, `app/admin/seo/indexnow/actions.ts`, `app/admin/collections/products/page.tsx`, `app/admin/collections/products/new/page.tsx`, `app/admin/collections/products/quick-add/page.tsx`, `app/admin/collections/products/[id]/page.tsx`, `app/admin/collections/banners/page.tsx`, `app/admin/collections/faqs/page.tsx`, `app/admin/collections/faqs/actions.ts`, `app/admin/collections/coupons/page.tsx`, `app/admin/collections/menus/page.tsx`, `app/admin/collections/menus/actions.ts`, `app/admin/collections/categories/page.tsx`, `app/admin/collections/categories/new/page.tsx`, `app/admin/collections/categories/[id]/page.tsx`, `app/admin/collections/pricing/page.tsx`, `app/admin/collections/weights-packaging/weights/page.tsx`, `app/admin/collections/weights-packaging/packaging/page.tsx`, `app/admin/hesabfa/actions.ts`, `app/(public)/page.tsx`, `app/(public)/products/page.tsx`, `app/(public)/faq/page.tsx`, `app/(public)/blog/page.tsx`, `app/(public)/blog/category/[slug]/page.tsx`, `app/(public)/blog/case-files/page.tsx`, `app/(public)/blog/case-files/[slug]/page.tsx`, `app/(public)/blog/[slug]/page.tsx`, `app/api/admin/tags/route.ts`, `app/api/orders/route.ts`, `app/merchant/products.xml/route.ts`, `components/home/HomepageBlocks.tsx`, `lib/site-data.ts`, `lib/admin/seo-issues.ts`, `lib/admin/seo-overview.ts`, `lib/admin/global-service.ts`, `lib/admin/media.ts`, `lib/ai/tools/knowledge-tools.ts`, `lib/ai/tools/product-tools.ts`, `lib/ai/analyst/scan-tools.ts`, `lib/account/wishlist.ts`, `views/product/single-design/pdp-data.ts`
- تأیید: tsc=pass ✅ build=نشد
- وضعیت بعد: ✅
- نکته: findUnique توسط ID دست‌نخورده ماند (طبق قرار). wishlist.addWishlistSlugs هم فیلتر گرفت تا slug‌های حذف‌شده رزرو نشوند.

## 2026-06-27 — content-cms — ArticleForm sidebar redesign (WP-style) + SEO analysis + keyboard shortcuts
- چه شد: (۱) taxonomy panel: دو تب «همه دسته‌ها» | «انتخاب‌شده» + checkbox RTL + دایره radio برای primary + لینک «+ افزودن دسته». (۲) media panel: تصویر full-width 16:9 با hover overlay + «پاک کردن تصویر» + dashed placeholder + MediaPickerDialog (جایگزین MediaPicker). (۳) publish panel: دکمه ذخیره بزرگ بالا + ردیف‌های وضعیت/دسترسی/زمان با آیکون + readiness checklist + adminNote + انصراف/حذف پایین. (۴) ArticleSeoSection: focus keyword input + score badge (X/۱۰۰) + تحلیل خودکار در چهار گروه (سئو پایه‌ای، اضافی، خوانایی عنوان، خوانایی محتوا) بر اساس محتوای مقاله. (۵) TipTap keyboard shortcuts: Ctrl+Alt+1-6 برای H1-H6، Ctrl+Alt+0 برای paragraph، Ctrl+Shift+. برای blockquote.
- فایل‌های تغییر: `src/components/admin/content/ArticleForm.tsx`, `src/components/admin/content/ArticleSeoSection.tsx`, `src/components/admin/editor/editor-utils.ts`
- تأیید: tsc=pass ✅
- وضعیت بعد: ✅
- نکته: focus keyword در ArticleSeoSection فقط client-state است — در DB ذخیره نمی‌شود. `contentText` از `form.watch("text")` به ArticleSeoSection پاس می‌شود برای تحلیل keyword density در محتوا.

## 2026-06-27 — seo — SEO-CP4: PDP-OG-METADATA + AUDIT-FIX
- چه شد: (۱) `PdpData` type به `id: string` اضافه شد + `product.id` در return. (۲) PDP `generateMetadata` از plain object به `buildEntityMetadata("PRODUCT", data.id, {...})` تغییر یافت → حالا OG، Twitter card، canonical، و override ادمین همه active هستند. (۳) SeoPanel در ProductForm از قبل وجود داشت (قبلاً در audit نادیده گرفته شده بود).
- فایل‌های تغییر: `src/views/product/single-design/pdp-data.ts`, `src/app/(public)/products/[slug]/page.tsx`
- تأیید: tsc=pass · build=pass ✅
- وضعیت بعد: ✅ هر share محصول در تلگرام/واتساپ/توییتر preview کامل نشان می‌دهد
- نکته: PdpData.id الان موجود است — هر جای دیگری که از PdpData استفاده می‌شود می‌تواند product ID را از آن بگیرد

## 2026-06-27 — content-cms — ArticleForm cleanup + SEO placeholder + adminNote
- چه شد: (۱) import مرده Sparkles/Loader2 حذف شد؛ Search و NotebookPen اضافه شد. (۲) watchedText تکراری حذف شد؛ text مستقیم در useEffect. (۳) متغیر missing بی‌استفاده حذف شد. (۴) RTL: me-1 → ms-1 در label اختیاری. (۵) hint آیتم‌های checklist نمایش داده می‌شود. (۶) فیلد adminNote به publish panel اضافه شد. (۷) placeholder card برای دستیار سئو در حالت create اضافه شد.
- فایل تغییر: `src/components/admin/content/ArticleForm.tsx`
- تأیید: tsc=pass ✅
- وضعیت بعد: ✅

## 2026-06-27 — content-cms — ArticleForm sidebar UI/UX fixes
- چه شد: (۱) taxonomy panel: bug fix — وقتی مقاله لود می‌شد، `categoryId` در `additionalCategoryIds` نبود → دسته اصلی checked نشان نمی‌داد. حالا `allSelectedIds` = union هر دو فیلد → درست نشان می‌دهد. (۲) checklist آمادگی: قبلاً فقط موارد ناقص نشان می‌داد؛ حالا همه موارد با آیکون ✓/○. (۳) `accessType` select به publish panel اضافه شد (فیلد در schema بود ولی در UI نبود). (۴) `overflow-hidden` از panel wrapper برداشته شد و به header/content جداگانه `rounded-t-xl`/`rounded-b-xl` داده شد تا dropdown‌های داخل کارت کلیپ نشوند. (۵) `border-dz-a-primary-150` نامعتبر → `border-dz-a-primary-100`.
- فایل تغییر: `src/components/admin/content/ArticleForm.tsx`
- تأیید: tsc=pass ✅
- وضعیت بعد: ✅
- نکتهٔ جدید: `additionalCategoryIds` در DB فقط دسته‌های ثانوی است؛ UI باید همیشه با union `[...additionalCategoryIds, categoryId]` کار کند.

## 2026-06-27 — seo — SEO-CP3b: AUTO-INDEXNOW + PRODUCT-SCHEMA + BREADCRUMB-JSON-LD
- چه شد: سه بهبود SEO اضافه شد. (۱) Auto IndexNow: `notifyIndexNow` helper در `src/lib/seo/indexnow.ts` اضافه شد؛ product actions (create/update if isActive) و article actions (create/update if PUBLISHED) این helper رو fire-and-forget صدا می‌زنند. (۲) ProductGroup + Product JSON-LD: PDP page حالا `productJsonLd` + `breadcrumbSchema` رو output می‌کنه (قبلاً هیچ JSON-LD نداشت). (۳) IndexNow key verification file: `/indexnow-key.txt` route ساخته شد + `keyLocation` به POST body اضافه شد.
- فایل‌های تغییر: `src/lib/seo/indexnow.ts`, `src/app/admin/collections/products/actions.ts`, `src/app/admin/content/articles/actions.ts`, `src/app/(public)/products/[slug]/page.tsx`, `src/app/indexnow-key.txt/route.ts`, `src/app/admin/seo/indexnow/page.tsx`
- تأیید: tsc=pass · build=pass ✅
- وضعیت بعد: ✅
- نکته: PDP قبلاً هیچ structured data نداشت — حالا ProductGroup/Product + BreadcrumbList کامل دارد.

## 2026-06-27 — integrations/seo — SEO-CP3: 404-MONITOR + REDIRECT-ENGINE + LLMS.TXT + INDEXNOW
- چه شد: چهار فیچر SEO جدید ساخته شد. Prisma: مدل `Error404Log` اضافه شد (db push). proxy.ts: matcher به تمام non-static paths گسترش یافت و `x-pathname` header برای همه request‌ها تنظیم می‌شود. not-found.tsx: async server component — redirect lookup از DB + 404 logging به `error_404_logs`. Admin pages: `/admin/seo/404-monitor` (view + mark resolved + delete + quick-redirect)، `/admin/seo/indexnow` (bulk submit + manual URL submit). Service: `src/lib/seo/indexnow.ts`. `/llms.txt` route: dynamic generation از products + posts. SeoNav: دو tab جدید (مانیتور ۴۰۴، IndexNow). redirect new page: پشتیبانی از `?source=` query param.
- فایل‌های ساخت/تغییر: `prisma/schema.prisma`, `src/proxy.ts`, `src/app/not-found.tsx`, `src/app/admin/seo/404-monitor/page.tsx`, `src/app/admin/seo/404-monitor/actions.ts`, `src/app/admin/seo/indexnow/page.tsx`, `src/app/admin/seo/indexnow/IndexNowClient.tsx`, `src/app/admin/seo/indexnow/actions.ts`, `src/lib/seo/indexnow.ts`, `src/app/llms.txt/route.ts`, `src/components/admin/seo/SeoNav.tsx`, `src/app/admin/collections/redirects/new/page.tsx`
- تأیید: tsc=pass · build=pass ✅
- وضعیت بعد: ✅
- نکته برای memory: proxy.ts حالا روی تمام non-static paths اجرا می‌شه، نه فقط protected paths. `INDEXNOW_API_KEY` باید در `.env.local` تنظیم شود.

## 2026-06-26 — chat-ai — ROUTECONTEXT-FIX-CONVERSATIONS
- چه شد: حذف .next stale، رفع ۶ خطای RouteContext در مسیرهای ai conversations.
- فایل‌های تغییر/ساخت: `api/admin-ai/conversations/[id]/route.ts`, `api/chat/conversations/[id]/{route,close,feedback,handoff}/route.ts`
- تأیید: tsc=pass (0 error)
- وضعیت بعد: ✅ tsc کاملاً سبز
- نکتهٔ جدید: RouteContext هیچ‌جای next/server export نمی‌شود — همه route handlers باید inline `{ params: Promise<{ id: string }> }` داشته باشند.

## 2026-06-26 — design-system — CSS-SPLIT-REFACTOR
- چه شد: globals.css از ۳۱۲۴ به ۳۷۰ خط کاهش یافت. تمام CSS به فایل‌های جداگانه منتقل شد.
- فایل‌های تغییر/ساخت: `src/app/globals.css` (trim) + ۸ فایل جدید در `src/styles/`
- تأیید: tsc=⚠️ (یک خطای stale در .next/types برای canned-replies — پیش‌وجود، نامربوط به CSS)
- وضعیت بعد: ✅ ساختار CSS سامان‌دهی شده
- نکتهٔ جدید: @import در Tailwind 4 باید قبل از @theme/@utility بیاید. variable resolution از import order مستقل است.

## 2026-06-26 — all — LINT-STABILIZATION-GATE

- چه شد: رفع ۲۲ خطای ESLint. lint/tsc/build همه سبز شدند.
- فایل‌های تغییر/ساخت: 11 فایل + LINT-STABILIZATION-GATE-QA.md
- تأیید: lint=pass(0 error) tsc=pass build=pass
- وضعیت بعد: ✅ پروژه کاملاً سبز
- نکتهٔ جدید: set-state-in-effect → رفع با queueMicrotask(() => setState(v)); refs during render → rowsRef.current = rows را به useEffect منتقل کن؛ برای reset state when prop changes → inner component با key={prop.id}

## 2026-06-26 — admin-panel + chat-ai — ADMIN-STABILIZATION-GATE

- چه شد: رفع ۵ خطای TypeScript در ماژول AI analyst که با commit de17bf8 وارد main شده بودند. RouteContext از next/server حذف، inline param typing جایگزین شد. prisma.aiFeedback.aggregate با score فیلد موهوم → count() ساده شد.
- فایل‌های تغییر/ساخت: `src/app/api/admin-ai/reports/[id]/route.ts`, `src/app/api/admin-ai/reports/[id]/findings/[fid]/route.ts`, `src/lib/ai/analyst/scan-tools.ts`
- تأیید: tsc=pass build=pass (40 صفحه) lint=fail(pre-existing, خارج از scope)
- وضعیت بعد: ✅ (admin panel stable, 0 placeholder nav routes)
- نکتهٔ جدید: RouteContext از next/server اصلاً export نمی‌شود — همیشه inline `{ params: Promise<{...}> }` استفاده کن. AiFeedback مدل فقط rating enum (UP/DOWN) دارد، نه فیلد عددی score.
