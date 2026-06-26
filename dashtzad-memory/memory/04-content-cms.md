# 04 — Content / CMS
**آخرین تأیید:** ۲۶ ژوئن ۲۰۲۶ (bootstrap واقعی) · **وضعیت:** 🟡 ساخته‌شده، commit نشده

## هدف
مقاله، دستورپخت، پرونده‌های علمی، ویرایشگر متن حرفه‌ای، Media Library، امتیازدهی محتوا.

## تصمیم‌های قفل‌شده
- Payload نصب نشود — آرشیو/مرده.
- Rich text: Tiptap-based در `src/components/admin/editor/` — پلتفرم عوض نشود.
- Media Library از Prisma `Media` model — نه S3/CDN جداگانه.
- `src/lib/blog/` برای storefront، `src/lib/admin/articles.ts` برای ادمین — جدا بمانند.

## فایل‌های کلیدی

### Rich Text Editor (کامل)
- `src/components/admin/editor/RichTextEditor.tsx` — ادیتور اصلی
- `src/components/admin/editor/RichTextToolbar.tsx` — نوار ابزار
- `src/components/admin/editor/extensions.ts`, `media-extensions.ts`, `structured-extensions.ts`
- `src/components/admin/editor/CardView.tsx`, `FaqView.tsx`, `MediaGalleryView.tsx`
- `src/components/admin/editor/MediaImageView.tsx`, `SpeechQuoteView.tsx`, `TimelineView.tsx`
- `src/components/admin/editor/HtmlSourceEditor.tsx`, `editor-utils.ts`
- `src/components/admin/ui/AdminRichTextField.tsx` — wrapper ساده‌تر برای فرم‌ها
- `src/lib/richtext/fields.ts`, `sanitize.ts`

### Content Admin Pages
- `src/app/admin/content/articles/` — لیست، جدید، ویرایش
- `src/app/admin/content/case-files/` — لیست، جدید، ویرایش
- `src/app/admin/content/recipe-ratings/` — مدیریت امتیازها
- `src/app/admin/content/recipe-suggestions/` — مدیریت پیشنهادها

### Services
- `src/lib/admin/articles.ts`, `article-types.ts`, `content-series.ts`
- `src/lib/admin/recipe.ts`
- `src/lib/admin/media.ts`, `media-actions.ts`
- `src/lib/blog/` — storefront reader
- `src/lib/media/` — پردازش رسانه

### Media Library
- `src/app/admin/media/page.tsx`
- `src/components/admin/media/`

## وضعیت فعلی
- ✅ Rich Text Editor کامل (7 view type + toolbar + extensions) — commit نشده
- ✅ Media Library — commit نشده
- ✅ Articles/case-files/recipes admin pages — commit نشده
- ✅ Schema: magazine_content_system، recipe_cp1، recipe_anon_engagement، recipe_rating_moderation، add_media_library — migrate شده
- 🟡 بلاگ storefront `/blog/[slug]/` — خطای tsc (CardVariantLite)
- ⏳ Preview public محتوا — نشده

## threadهای باز
- Rich text editor با محتوای واقعی تست شود.
- Media Library آپلود واقعی تست شود.
- خطای tsc بلاگ صفحه حل شود.

## Gotchas
- Payload نصب نشود — حتی اگه کسی پیشنهاد بدهد. این تصمیم قفل است.
- `AdminRichTextField` wrapper است، نه کپی از RichTextEditor — مستقل نگه‌شان دار.
- `src/components/admin/content/MultiSelectField.tsx`, `RecipeMetaFields.tsx`, `SourcesField.tsx`, `TypeMetaFields.tsx` — فیلدهای اختصاصی content.
