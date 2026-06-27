# 04 — Content / CMS
**آخرین تأیید:** 2026-06-27 · **وضعیت کلی:** 🟡

## هدف
مقاله (Post)، دستورپخت (RECIPE type)، ویرایشگر متن حرفه‌ای (TipTap)، Media Library. Payload CMS فقط scope شده، نصب‌نشده.

## تصمیم‌های قفل‌شده
- محتوا روی Prisma `Post` model ذخیره می‌شود (نه Payload).
- `additionalCategoryIds` در DB = دسته‌های ثانوی (بدون primary). UI باید union با `categoryId` حساب کند.
- `accessType` فیلد: `FREE | PREMIUM` — در schema هست و در publish panel نشان داده می‌شود.

## فایل‌های کلیدی
- `src/components/admin/content/ArticleForm.tsx` — فرم اصلی با sidebar panel
- `src/components/admin/content/TagChipInput.tsx` — chip input برچسب‌ها
- `src/components/admin/content/ArticleSeoSection.tsx` — بخش SEO
- `src/components/admin/content/TypeMetaFields.tsx` — فیلدهای اختصاصی نوع مقاله
- `src/components/admin/content/RecipeMetaFields.tsx` — فیلدهای دستورپخت
- `src/lib/admin/articles.ts` — schema + helpers (postToArticleForm, toArticleData)
- `src/lib/admin/article-types.ts` — تعریف انواع مقاله (TASTE_STORY, RECIPE, ...)
- `src/app/admin/content/articles/actions.ts` — server actions
- `src/app/admin/content/articles/[id]/page.tsx` — صفحه ویرایش
- `src/app/admin/content/articles/new/page.tsx` — صفحه ایجاد

## وضعیت فعلی (واقعی، نه آرزویی)
- ✅ taxonomy panel: دو تب + checkbox RTL + دایره radio primary + لینک افزودن دسته (2026-06-27)
- ✅ media panel: full-width 16:9 image + hover overlay + dashed placeholder + MediaPickerDialog (2026-06-27)
- ✅ publish panel: ذخیره بزرگ بالا + info rows با آیکون + readiness + adminNote + انصراف/حذف پایین (2026-06-27)
- ✅ ArticleSeoSection: focus keyword + score X/100 + 4 گروه تحلیل (سئو پایه‌ای، اضافی، خوانایی) (2026-06-27)
- ✅ TipTap keyboard shortcuts: Ctrl+Alt+1-6 برای H1-H6، +0 برای paragraph (2026-06-27)
- ✅ Readiness checklist: همه موارد + hint + اختیاری با RTL-correct margin
- ✅ SEO placeholder card روی صفحه create (بعد از save، redirect به edit با SEO کامل)
- ✅ Dead code حذف شد: Sparkles/Loader2 imports، watchedText تکراری، missing variable
- ✅ tsc pass (2026-06-27)
- 🟡 Media Library: موجود است ولی کامل بررسی نشده
- ⏳ Storefront article pages: PostCard/HomepageBlocks دارای bug `<img src="">` خالی

## threadهای باز
- bug `<img src="">` خالی در `PostCard`/HomepageBlocks → نیاز به fix جداگانه

## Gotchas (درس‌های گران)
- `additionalCategoryIds` در DB فقط دسته‌های ثانوی است، نه شامل primary. UI باید با `Array.from(new Set([...additionalCategoryIds, categoryId]))` کار کند.
- `border-dz-a-primary-150` توکن معتبری نیست؛ از `primary-100` یا `primary-200` استفاده کنید.
- `overflow-hidden` روی panel wrapper باعث می‌شود dropdown‌های position:absolute داخل کارت کلیپ شوند. از `rounded-t-xl` روی header و `rounded-b-xl` روی content استفاده کنید.
- focus keyword در ArticleSeoSection فقط client-state است — در DB ذخیره نمی‌شود. اگر آینده نیاز به persistence شد، به `SeoMeta` model در Prisma اضافه کنید.
- `contentText` (plain HTML از `form.watch("text")`) به `ArticleSeoSection` پاس می‌شود — تحلیل روی HTML خام انجام می‌شود (regex-based)، نه pure text.
- در TipTap `addKeyboardShortcuts()`: `Mod` = Ctrl روی Windows، Cmd روی Mac. `Mod-Alt-1` = Ctrl+Alt+1 / Cmd+Option+1.
