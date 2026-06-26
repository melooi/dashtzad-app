# ADMIN-RICH-EDITOR-CP1 — Field Audit & QA

تاریخ: ۱۴۰۵/۰۴/۰۴ (2026-06-25) · وضعیت: پیاده‌سازی‌شده، در انتظار تأیید

ویرایشگر متن غنی حرفه‌ای برای فیلدهای متن بلندِ ادمین. مبتنی بر **TipTap v3** با
حالت **دیداری + کد**، پاک‌سازی امن HTML با **DOMPurify**، RTL فارسی، و بلوک‌های
سفارشی دشت‌زاد (نقل‌قول، فهرست برگ، کالاوت/نکته).

> مرجع `tinymce-advanced.zip` فقط به‌عنوان الهام برای قابلیت‌ها استفاده شد؛ هیچ کد
> وردپرس/PHP کپی یا نصب نشده است.

---

## ۱) فیلدهای متنی ادمین — یافته‌ها

جدول کامل فیلدهای متن چندخطی که در ادمین پیدا شدند:

| موجودیت | فیلد | محل | طول قبلی | تصمیم |
|---|---|---|---|---|
| **Category** | `description` | `collections.ts` + `CategoryForm` | textarea، ≤۱۰۰۰ | ✅ تبدیل شد |
| **Product** | `description` | `ProductForm.tsx` | textarea | ✅ تبدیل شد |
| **Product** | `story` | `ProductForm.tsx` | textarea، ≤۲۰۰۰ | ✅ تبدیل شد |
| **FAQItem** | `answer` | `FaqItemsManager.tsx` | textarea، ≤۳۰۰۰ | ✅ تبدیل شد |
| FAQGroup | `description` | `FaqGroupForm.tsx` | textarea، ≤۶۰۰ | متن ساده (کوتاه) |
| Banner | `description` | `BannerForm.tsx` | textarea، ≤۶۰۰ | متن ساده (کوتاه) |
| Media | `caption` | `MediaDetailsPanel.tsx` | textarea | متن ساده (کوتاه) |
| Globals | `businessDescription` | `globals.ts` | textarea | متن ساده (CONTENT-CP1) |
| Globals | `aboutShortText` | `globals.ts` | textarea | متن ساده (CONTENT-CP1) |
| Globals | `contactPageIntro` | `globals.ts` | textarea | متن ساده (CONTENT-CP1) |
| Globals | `footerBrandText`, `trustStatement`, `newsletterDescription`, `maintenanceMessage`, `addressText`, `address` | `globals.ts` | textarea | متن ساده (کوتاه/تک‌خطی) |
| Globals | `enamadHtml`, `samandehiHtml` | `globals.ts` | textarea کد | **هرگز** — کد خام نماد/ساماندهی |
| Homepage | `RichText.body`, `ProductStory.text`, `CTABanner.text`, `Hero.subtitle` | `globals.ts` (بلوک‌ها) | textarea | CONTENT-CP1 (سیستم بلوک جدا) |
| Post (بلاگ) | `text` | — | — | ادیتور ادمین بلاگ هنوز وجود ندارد → CONTENT-CP1 |

### فیلدهایی که عمداً **متن ساده** ماندند (طبق محدودهٔ چک‌پوینت)
- همهٔ فیلدهای **SEO** (`SeoPanel`): `title`, `description`, `ogTitle`, `ogDescription`,
  `twitterTitle`, `twitterDescription`, `canonicalUrl` — این‌ها سقف نویسه دارند و باید
  متن خالص بمانند. **هیچ فیلد SEO تبدیل نشد.**
- فیلدهای کوتاه: عنوان، نامک (slug)، برچسب، برند، لیبل دکمه، URL، تلفن، ایمیل، قیمت.
- `enamadHtml` / `samandehiHtml`: این‌ها کدِ خام شخص ثالث‌اند و نباید از فیلتر بلوک‌های
  مجاز عبور کنند؛ پس به‌صورت textarea کد می‌مانند.

---

## ۲) فیلدهای تبدیل‌شده در این چک‌پوینت

| فیلد | کامپوننت ادمین | اسکیمای Zod | نوع | سقف جدید HTML |
|---|---|---|---|---|
| `Category.description` | `AdminRichTextField` (از طریق `type: "richtext"` در `collections.ts`) | `optionalRichHtml` | nullable | ۱۲٬۰۰۰ |
| `Product.description` | `AdminRichTextField` | `richHtmlString` | non-null، «» مجاز | ۵۰٬۰۰۰ |
| `Product.story` | `AdminRichTextField` | `optionalRichHtml` | nullable | ۲۰٬۰۰۰ |
| `FAQItem.answer` | `AdminRichTextField` | `requiredRichHtml` | required | ۲۰٬۰۰۰ |

> سقف نویسه‌ها بالاتر برده شد چون مارک‌آپ HTML طول را زیاد می‌کند (سقف قدیمی برای متن
> خالص بود). این فقط منطق اعتبارسنجی Zod است؛ **اسکیمای دیتابیس تغییر نکرد** (ستون‌ها از
> قبل `String`/`String?` = `text` در PostgreSQL، بدون محدودیت طول).

نمایش عمومی این فیلدها هم به `RichTextRenderer` امن وصل شد:
- صفحهٔ محصول: «معرفی محصول» و «داستان محصول».
- صفحهٔ پرسش‌های متداول: پاسخ هر سوال (داخل آکاردئون).

---

## ۳) فیلدهایی که برای CONTENT-CP1 می‌مانند

- بدنهٔ نوشتهٔ بلاگ (`Post.text`) — نیازمند ساخت ادیتور ادمین بلاگ.
- متن‌های بلند Globals: `businessDescription`, `aboutShortText`, `contactPageIntro` —
  وقتی صفحات «دربارهٔ ما/تماس» به محتوای مدیریت‌شده وصل شدند.
- بلوک‌های صفحهٔ خانه (`RichText`, `ProductStory`, `CTABanner`) — سیستم بلوک جداست؛ اگر
  لازم شد همان `RichTextEditor` در `GlobalFieldInput` قابل استفاده است.

---

## ۴) امنیت — قواعد پاک‌سازی (allowlist)

تگ‌های مجاز: `p, br, strong, b, em, i, u, a, h2, h3, ul, ol, li, blockquote, hr, div, span`
ویژگی‌های مجاز: `href, target, rel, class` (فقط کلاس‌های `dz-*` مجاز).

مسدود همیشه: `script, style, iframe, object, embed, form, input, button, svg, math`،
هر هندلر `on*`، ویژگی `style`/`id`، و پروتکل‌های ناامن (`javascript:`). لینک‌های امن
به‌صورت خودکار `rel="noopener noreferrer nofollow"` و `target="_blank"` می‌گیرند.

پاک‌سازی **هم سمت کلاینت (resolver) و هم سمت سرور (action)** اجرا می‌شود (دفاع لایه‌ای)؛
پس HTML خطرناک هرگز به دیتابیس نمی‌رسد، حتی اگر از حالت کد وارد شود.

نتایج تست واقعی sanitizer (۱۳ کیس) و تست اسکیماها: همه پاس — `<script>`, `onclick`,
`style`, `<iframe>`, `javascript:`، `<img onerror>`, `<svg onload>` حذف؛ بلوک‌های سفارشی
و لینک امن حفظ شدند.

---

## ۵) بلوک‌های سفارشی دشت‌زاد

| بلوک | خروجی HTML |
|---|---|
| نقل‌قول میراث | `<blockquote class="dz-quote dz-quote--heritage">` — کارت گرم + خط عمودی سبز |
| نقل‌قول تحریریه | `<blockquote class="dz-quote dz-quote--editorial">` — وسط‌چین، Kalameh، اکسنت کلِی/طلایی |
| فهرست برگ دشت‌زاد | `<ul class="dz-list--leaf">` — نشانگر برگ + فاصله‌گذاری فارسی |
| فهرست عددی | `<ol>` با ارقام فارسی (`@counter-style`) |
| کالاوت | `<div class="dz-callout dz-callout--{note|warning|tip|experience}">` — نکته/هشدار/پیشنهاد/تجربه دشت‌زاد |
| جداکننده | `<hr>` |

استایل‌ها در `globals.css` زیر کلاس `.dz-rich` (مشترک ادمین و فروشگاه) با پشتیبانی کامل
از دارک‌مود ادمین و RTL.

---

## ۶) سازگاری با محتوای قدیمی (migration)

`RichTextRenderer` تشخیص می‌دهد محتوا HTML است یا متن سادهٔ قدیمی:
- HTML → پاک‌سازی + رندر امن.
- متن سادهٔ قدیمی (بدون تگ) → `whitespace-pre-line` دقیقاً مثل قبل.

پس رکوردهای موجود (که متن ساده‌اند) **بدون شکستن** رندر می‌شوند و هیچ migration دیتابیسی
لازم نیست. هنگام باز شدن در ادیتور هم متن ساده به پاراگراف HTML ارتقا می‌یابد.

---

## ۷) دکمهٔ «مشاهده در سایت» (درخواست کاربر)

طبق درخواست، در صفحهٔ ویرایش محصول (حالت edit) دکمه‌ای کنار ناحیهٔ ذخیره اضافه شد که
صفحهٔ عمومی محصول را در تب جدید باز می‌کند (`AdminViewOnSiteButton`). چون **ادیتور ادمین
برای نوشته/بلاگ هنوز وجود ندارد**، این دکمه فعلاً فقط روی محصول است؛ با ساخت ادیتور بلاگ
در CONTENT-CP1 همان کامپوننت آنجا هم استفاده می‌شود.

---

## ۸) نتایج بیلد و تست

- `npx tsc --noEmit` → **exit 0** (بدون خطا)
- `npx prisma validate` → **valid** (بدون تغییر اسکیما)
- `npm run build` → **Compiled successfully**، همهٔ مسیرها + ۱۹ صفحهٔ استاتیک
- `npm run lint` → فایل‌های جدید **پاک**؛ مشکلات موجود همگی از پیش بوده‌اند
- تست‌های واقعی sanitizer + اسکیما (sanitize-on-save) → پاس

محدودیت محیط: PostgreSQL در این محیط بالا نبود، پس تست مرورگری زنده (باز شدن صفحهٔ ویرایش،
سوییچ دارک‌مود، رپ‌شدن تولبار موبایل، رندر صفحهٔ عمومی) اجرا نشد؛ به‌جای آن با build کامل +
type-check + تست‌های واحد sanitizer/schema تأیید شد. نیازمند تست دستی نهایی توسط کاربر.
