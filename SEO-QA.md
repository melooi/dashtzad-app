# SEO-QA — Dashtzad Advanced SEO (SEO-CP1)

وضعیت پیاده‌سازی و چک‌لیست کیفیت. این سند مرجعِ تأیید SEO است.

## معماری
- **مدل `SeoMeta`** (افزایشی، migration: `add_advanced_seo`) — اوریدِ هر موجودیت با کلید `(entityType, entityId)`. نبودِ ردیف = استفاده از پیش‌فرض‌های محاسبه‌شده.
- لایه‌بندی متادیتا: `SeoMeta override → entity fallback → seoDefaults global`.
- کتابخانه‌ی مرکزی: `src/lib/seo/{urls,text,meta,merchant}.ts` + `src/lib/jsonld.ts`.
- ادمین: `src/lib/admin/{seo,seo-service}.ts` + `src/components/admin/seo/SeoPanel.tsx`.

## قواعد قفل‌شده (رعایت‌شده)
- ✅ همه‌ی slug/URLها **لاتین**‌اند؛ ارقام فارسی/عربی در مسیر با `normalizePath` نرمال می‌شوند.
- ✅ Canonical همیشه **مطلق و تمیز** (بدون اسلش تکراری/انتهایی جز ریشه).
- ✅ `priceCurrency = IRR` (دیتابیس ریال ذخیره می‌کند؛ IRR واحد ISO ریال است).
- ✅ بدون داده‌ی جعلی: `aggregateRating` فقط با نظرات **APPROVED**؛ `Offer` فقط با قیمت/موجودیِ واقعی؛ بدون GTIN/MPN جعلی.
- ✅ سال میراث برند: **۱۳۱۳** (هیچ ۱۳۰۵).

## چک‌لیست

### متادیتا (`generateMetadata`)
- [x] خانه — از `seoDefaults` + اورید `HOMEPAGE`.
- [x] محصول — اورید `PRODUCT` → fallback عنوان/توضیح/تصویر محصول → پیش‌فرض. canonical از slug.
- [x] نوشته — اورید `POST`، نوع `article`، canonical از slug، OG از کاور.
- [x] لیست محصولات (`/products`) — متادیتای پایه (canonical ثابت).
- [ ] صفحه‌ی دسته‌ی اختصاصی — مسیر اختصاصی `/category/[slug]` وجود ندارد؛ دسته از `/products?cat=` سرو می‌شود (اورید CATEGORY آماده اما مسیر اختصاصی ندارد).
- [x] مسیرهای خصوصی (cart/account/orders/checkout/auth) — در `robots.txt` بلاک؛ کمکی `noindexMetadata()` آماده.

### JSON-LD
- [x] Product — با `Offer`/`AggregateOffer` از واریانت‌های فعالِ واقعی؛ `priceCurrency=IRR`؛ availability از stock.
- [x] AggregateRating — فقط وقتی نظرِ APPROVED وجود دارد.
- [x] BreadcrumbList — خانه › محصولات › دسته › محصول.
- [x] Article — نوشته‌ها (datePublished/dateModified/publisher).
- [x] FAQPage — بلوک FAQ خانه، فقط آیتم‌های فعال.
- [x] Organization — از globalها (نام/لوگو/تماس/sameAs/foundingDate=1313).
- [x] WebSite — با `SearchAction` (`/products?q=`).
- [~] Recipe — مدل/مسیر دستور پخت هنوز نیست؛ سازنده‌ی `recipeSchema` آماده و مستند (pending).
- [x] ItemList — سازنده آماده برای لیست/دسته.

### Sitemap (`/sitemap.xml`)
- [x] خانه + صفحات استاتیک (products/blog/about/contact/terms).
- [x] محصولات فعال + **image sitemap** (تا ۵ تصویر).
- [x] دسته‌های فعال محصول (`/products?cat=`).
- [x] نوشته‌های PUBLISHED.
- [x] `lastModified` از `updatedAt`؛ `changeFrequency`/`priority` متناسب.
- [x] حذف: admin/auth/api/account/orders/cart/checkout و محتوای inactive/draft.
- [ ] split sitemaps (`generateSitemaps`) — برای کاتالوگ بزرگ آینده مستند؛ الان لازم نیست.

### Robots (`/robots.txt`)
- [x] allow `/`؛ disallow admin/api/auth/account/orders/cart/checkout.
- [x] شامل `sitemap` و `host` با base از `seoDefaults.canonicalBase` یا env.

### Merchant feed (`/merchant/products.xml`)
- [x] RSS 2.0 + namespace `g:`؛ محصولات فعال + واریانت‌های فعال.
- [x] فیلدها: id/item_group_id، title، description، link، image_link (+additional)، availability، price (IRR)، brand، condition=new، product_type.
- [x] بدون GTIN/MPN جعلی؛ بدون stock جعلی؛ XML اسکیپ‌شده.

### Slug/URL
- [x] بدون تولید slug فارسی؛ ارقام فارسی نرمال می‌شوند؛ بدون ۱۳۰۵.

## تستِ دستی پس از دیپلوی
1. **Rich Results Test** (search.google.com/test/rich-results): URL محصول/نوشته/خانه → بررسی Product/Article/FAQ/Breadcrumb/Organization.
2. **Schema Markup Validator** (validator.schema.org) برای JSON-LD.
3. **Search Console**: ثبت دامنه، ارسال `sitemap.xml`، بررسی Coverage.
4. **Merchant Center**: افزودن فید `/merchant/products.xml`، بررسی خطاهای آیتم (به‌خصوص نبودِ GTIN → برندهای بدون GTIN باید `identifier_exists=no` بگیرند — مرحله‌ی بعد).

## SEO-CP1.1 — سخت‌سازی Structured Data و Merchant

### مدل structured data محصول (تصمیم)
- محصولات **متغیر** (دارای واریانتِ فعالِ واقعی) → **`ProductGroup` + `hasVariant[]`**؛ هر واریانت یک `Product` با `Offer` واقعیِ خودش (`itemCondition: NewCondition`).
  - `productGroupID` = slug · `variesBy` فقط وقتی واقعاً فرق دارند (`weight`/`packaging`) · هر واریانت `additionalProperty` برای وزن/بسته‌بندی.
- محصولات **تک** → `Product` ساده + `Offer`.
- **`AggregateOffer` حذف شد**: واریانت‌ها پیشنهادهای فروشندگانِ مجزا نیستند؛ AggregateOffer آن‌ها را اشتباه نمایش می‌داد و با راهنمای گوگل (ProductGroup برای variants) هم‌خوان نبود.
- فیلترِ ایمنی: واریانت‌های inactive یا بدون قیمتِ مثبتِ واقعی حذف می‌شوند.
- `priceCurrency=IRR`، price = ریالِ واقعی، availability از stock/isActive، AggregateRating فقط با نظراتِ APPROVED.

### foundingDate (سخت‌سازی)
- `foundingDate` از Organization JSON-LD **حذف شد**. سال میراثِ ۱۳۱۳ **جلالی و فقط نمایشی** است؛ هرگز به‌عنوان تاریخِ ماشین‌خوان خروجی نمی‌شود (وگرنه ۱۳۱۳ میلادی خوانده می‌شد). متنِ «از سال ۱۳۱۳» در UI باقی است.

### Merchant identifier_exists
- اسکیمای فعلی فیلد GTIN/MPN واقعی ندارد → هر آیتمِ فید **`<g:identifier_exists>no</g:identifier_exists>`** می‌گیرد. هیچ GTIN/MPN جعلی خروجی نمی‌شود.
- آینده: اگر GTIN/MPN واقعی اضافه شد، طبق قواعد گوگل باید `identifier_exists` حذف یا `yes` شود و فیلدهای واقعی اضافه شوند.

### schemaOverride (ایمنی)
- `SeoMeta.schemaOverride` ذخیره می‌شود اما **در JSON-LD عمومی رندر نمی‌شود** (برای جلوگیری از structured data نامعتبر/ناامن). فعال‌سازی نیازمند merge سخت‌گیرانه و اعتبارسنجی در فاز بعد است.

### چک‌لیست دستی Rich Results Test
- صفحه‌ی محصول → `ProductGroup` (+`hasVariant`) یا `Product`، `BreadcrumbList`.
- خانه → `Organization`، `WebSite`، `FAQPage`.
- اطمینان: بدون foundingDate ماشین‌خوانِ نامعتبر، بدون AggregateRating جعلی.

### چک‌لیست دستی Merchant Center
- URL فید: `/merchant/products.xml` · `g:price` با واحد **IRR** · `g:identifier_exists=no` · `g:image_link` · `g:availability` واقعی · **بدون** `g:gtin`/`g:mpn` جعلی.

## SEO-CP2 — مرکز مدیریت سئو (Admin SEO Control Center)

### مسیرهای ادمین (همه ADMIN-only via layout requireAdmin)
- `/admin/seo` → ریدایرکت به `/admin/seo/overview`
- `/admin/seo/overview` — داشبورد سلامتِ فنیِ **واقعی** (نه Google Search Console): شمارش‌های محصول/تصویر/توضیح/override/نوشته/FAQ/ریدایرکت + هشدارهای پیش‌فرض + دسترسی سریع.
- `/admin/seo/settings` — همان فرم `seoDefaults` (بدون تکرارِ ذخیره‌سازی) با پیش‌نمایش گوگل.
- `/admin/seo/structured-data` — فهرست انواع JSON-LD، منبع داده و وضعیت.
- `/admin/seo/sitemap` — ترکیب sitemap، مسیرهای حذف‌شده، وضعیت تصویر.
- `/admin/seo/robots` — پیش‌نمایش robots.txt + host/sitemap + هشدارها.
- `/admin/seo/merchant` — وضعیت فید، شمارش‌ها، نمونه آیتم‌ها، چک‌لیست Merchant Center.
- `/admin/seo/checklist` — چک‌لیست فارسیِ سئو با وضعیتِ محاسبه‌شده + مراحل دستیِ بعد از دیپلوی.
- سایدبار: گروه «سئو» به این مرکز به‌علاوه ریدایرکت‌ها لینک می‌دهد.
- **بدون داده/متریک جعلیِ گوگل**؛ همه‌ی شمارش‌ها از دیتابیس‌اند. دیسکلیمر فارسی در داشبورد.

### یکپارچه‌سازیِ SeoPanel با موجودیت‌ها
- ✅ **محصول** (CP1) · ✅ **دسته‌بندی** (`CATEGORY`، canonical از `?cat=`) · ✅ **گروه FAQ** (`FAQ_GROUP`).
- ⏳ **نوشته** و **صفحات استاتیک**: پنل ادمینِ اختصاصی هنوز وجود ندارد؛ سرویس/کامپوننتِ جنریک آماده است (فقط `entityType` لازم است). متادیتای نوشته از مسیرِ عمومی + override `POST` کار می‌کند، اما فرمِ ادمینِ نوشته برای ویرایش override هنوز نیست.

### تصمیمِ canonical دسته‌بندی
- مسیر اختصاصیِ `/category/[slug]` در این چک‌پوینت **ساخته نشد** (برای جلوگیری از over-build و ریسکِ مسیرِ عمومیِ جدید). دسته‌ها از `/products?cat=<slug>` سرو می‌شوند و canonical/sitemap هم از همین استفاده می‌کنند. در داشبورد سئو نوتیسِ شفاف نمایش داده می‌شود. (محدودیتِ شناخته‌شده، غیرمسدودکننده.)

### ریدایرکت‌ها
- مدیریت ریدایرکت در `/admin/collections/redirects` موجود است و از مرکز سئو لینک شده. **اجرای live middleware** (با احتیاط، به‌خاطر Edge/Prisma) جداگانه و در چک‌پوینتِ بعدی انجام می‌شود.

## محدودیت‌های باز (غیرمسدودکننده)
- مسیر عمومیِ دسته‌ی اختصاصی وجود ندارد؛ canonical دسته از `?cat=` است.
- SeoPanel فعلاً در فرم **محصول** یکپارچه شده؛ یکپارچه‌سازی در فرم دسته/نوشته با همان کامپوننت ساده است (entityType را عوض کنید) — pending.
- فید Merchant فاقد GTIN است (داده‌ی واقعی نداریم)؛ برای تأیید کامل Merchant باید `identifier_exists=no` یا GTIN واقعی اضافه شود.
- بدون Draft/Publish/Versioning برای SeoMeta (طبق اسکوپ).
