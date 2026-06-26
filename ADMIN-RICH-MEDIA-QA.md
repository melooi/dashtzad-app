# ADMIN-RICH-MEDIA-CP1 — Audit & Plan

تاریخ: 2026-06-25 · پیش‌نیاز: ADMIN-RICH-EDITOR-CP1 (انجام‌شده)

افزودن بلوک‌های رسانه‌ای (تصویر تکی، گالری/آلبوم) به ویرایشگر غنی، با اتکا کامل به
**کتابخانه‌ی رسانه‌ی موجود** (بدون URL دستی به‌عنوان UX اصلی، بدون تصویر جعلی، بدون مسیر
مطلق). اسکرین‌شات‌های TinyMCE/WordPress فقط الهام — هیچ کدی کپی نشده.

---

## ۱) قابلیت‌های فعلی ویرایشگر (از CP1)

- TipTap v3، حالت **دیداری + کد**، RTL، دارک‌مود ادمین.
- بلوک‌ها: پاراگراف، h1–h6، bold/italic/underline، فهرست نقطه‌ای/عددی/برگ، نقل‌قول
  میراث/ادیتوریال/گوینده (speech)، کالاوت (نکته/هشدار/پیشنهاد/تجربه)، جداکننده، پیوند.
- نودهای سفارشی موجود: `Callout`, `DashtzadSpeechQuote` (figure/figcaption + React NodeView)،
  و global-attributes برای blockquote/bulletList.
- Sanitizer (`lib/richtext/sanitize.ts`): allowlist سخت‌گیر (DOMPurify isomorphic)، روی
  **کلاینت + سرور** اجرا می‌شود. تگ‌های مجاز فعلی شامل `figure, figcaption` هست؛ **`img`
  هنوز مجاز نیست**.
- Renderer عمومی (`components/storefront/RichTextRenderer.tsx`): سرور-کامپوننت، sanitize +
  سازگار با متن سادهٔ قدیمی.

## ۲) قابلیت‌های فعلی Media Picker

- `MediaPicker` (تک‌انتخابی، bound به URL رشته‌ای) — `onPickAsset(asset: MediaAssetDTO)`.
- `MediaPickerDialog` (مودال: جستجو + آپلود + فیلتر usage + انتخاب **تکی**).
- `MediaGrid` / `MediaCard` — هایلایت تک‌انتخابی (`selectedId`)، `selected: boolean`.
- `MediaAssetDTO`: `id, url, alt, caption, title, width, height, originalName, usage…` — همهٔ
  چیزی که برای بلوک تصویر/گالری لازم است.
- `searchMedia` server action + `MediaUploader` (آپلود داخل مودال).
- `MediaUsage`: PRODUCT, BANNER, HOMEPAGE, BRAND, SEO, BLOG, RECIPE, GENERAL.
  («CONTENT» وجود ندارد → از GENERAL استفاده می‌شود.)
- URLها نسبی‌اند (`/uploads/media/YYYY/MM/...`) و `path` هرگز مطلق نیست. ✅

**کمبود:** Dialog فقط تک‌انتخابی است → برای گالری باید **multi-select** اضافه شود (بدون
شکستن استفاده‌های تک‌انتخابی موجود مثل بنر، محصول، SEO).

## ۳) فیلدهایی که به رسانه/گالری نیاز دارند

| فیلد | وضعیت | رسانه/گالری |
|---|---|---|
| Category.description | ویرایشگر غنی دارد | تصویر تکی بله، گالری بزرگ نه‌چندان (طبق Part 7) |
| Product.description / story | ویرایشگر غنی دارد | تصویر + گالری «فقط در بدنهٔ محتوا» — نه جایگزین گالری ساختاری محصول |
| FAQItem.answer | ویرایشگر غنی دارد | معمولاً متن؛ تصویر مجاز ولی نه گالری بزرگ |
| Post (بلاگ) | **ادیتور ادمین ندارد** | بلوک تصویر/گالری آماده می‌شود، ولی فیلد بلاگ در CONTENT-CP1 وصل می‌شود |
| Recipe step | **ادیتور ادمین ندارد** | بلوک «تصویر مرحله‌ای» → **معلق (CONTENT-CP1)** |

> همان `RichTextEditor` همه‌جا استفاده می‌شود، پس بلوک‌های رسانه به‌صورت سراسری در دسترس
> فیلدهای فعلی (Category/Product/FAQ) قرار می‌گیرند. محدودیت محصول طبق Part 7 رعایت می‌شود
> (گالری ویرایشگر جایگزین گالری ساختاری محصول نمی‌شود — این چک‌پوینت گالری محصول را لمس نمی‌کند).

## ۴) ریسک‌ها

1. **امنیت `img`**: باید `img` به allowlist اضافه شود ولی `src` فقط به URLهای نسبی کتابخانه
   محدود شود (نه `http(s)://` خارجی، نه `javascript:`). Hook اختصاصی DOMPurify.
2. **`data-media-id`**: DOMPurify با `ALLOW_DATA_ATTR:false` باید این data-attr خاص را allow کند؛
   باید تست شود. اگر امن نشد → id را در public HTML نمی‌گذاریم و items را از خود `<img>`ها بازسازی می‌کنیم.
3. **JSON شکننده در attribute**: طبق Part 5 از ذخیرهٔ JSON خام در `data-gallery` پرهیز می‌کنیم؛
   به‌جای آن گالری به‌صورت `<figure>`های فرزند با `<img>` واقعی serialize می‌شود (قابل sanitize).
4. **شکستن تک‌انتخابی موجود**: multi-select باید افزایشی و اختیاری باشد.
5. **layout shift**: `width/height` روی `<img>` + `loading="lazy"` برای کاهش CLS.
6. **lightbox**: کامل نمی‌سازیم → کلیک روی تصویر فعلاً لینک به URL تصویر (در تب جدید)؛ lightbox
   کامل **معلق**.

## ۵) برنامهٔ پیاده‌سازی

1. **Sanitizer**: افزودن `img` (attrs: `src, alt, loading, width, height`) + کلاس‌های
   `dz-media*` / `dz-gallery*`؛ hook برای محدودکردن `src` به نسبی؛ تست `data-media-id`.
2. **MediaPickerDialog**: حالت `multiple` (افزایشی) + `onPickMany`. `MediaGrid` با
   `selectedIds?` (اختیاری، non-breaking). یک هِلپر `MediaMultiPicker` سبک برای باز/بستن.
3. **نود `dzImage`** (atom block): attrs `mediaId, src, alt, caption, align, href`. React
   NodeView: انتخاب/تعویض از کتابخانه، alt/caption، چیدمان (وسط/راست/چپ/تمام‌عرض)، لینک امن.
   renderHTML: `figure.dz-media--image[.dz-media--{align}]` + `img` + `figcaption`.
4. **نود `dzGallery`** (atom block): attrs `items[] {id,src,alt,caption}, layout, title`.
   NodeView: افزودن چندتایی، ترتیب‌دهی (جابه‌جایی)، حذف، کپشن هر تصویر، انتخاب layout
   (grid-2/grid-3/featured/scroll-mobile). serialize به `<figure class="dz-gallery dz-gallery--{layout}">`
   با `<figure class="dz-gallery__item">` فرزند.
5. **Toolbar**: دو dropdown منظم — «رسانه» (تصویر / گالری) و «بلوک‌های دشت‌زاد» (نقل‌قول‌ها /
   کالاوت‌ها / بولت‌ها) — برای جلوگیری از شلوغی. هر آیتم: لیبل فارسی + aria-label + tooltip + آیکن.
6. **Renderer + CSS**: رندر امن تصویر/گالری در `.dz-rich`؛ گرید ریسپانسیو، RTL، دارک‌مود،
   `dz-gallery--grid-2/3/featured/scroll-mobile`.
7. **تست**: prisma validate, tsc, build، تست sanitizer (script/iframe/onclick/external-img)،
   و round-trip گالری.

**معلق (CONTENT-CP1):** بلوک تصویر مرحله‌ای دستور پخت (ادیتور recipe وجود ندارد)؛ lightbox کامل؛
اتصال بلاگ.

**بدون نصب پکیج** — همه با TipTap موجود + MediaPicker موجود ساخته می‌شود.

---

# CP1.1 Completion Audit (2026-06-25)

CP1 زیرساخت را ساخت ولی کاربر آن را «کامل» تأیید نکرد. این بخش وضعیت واقعیِ ۲۴ معیار
«کامل بودن» را ثبت می‌کند.

## فیلدهای آزمایش‌شده (runtime، روی DB واقعی + سرور dev :3000)
- صفحهٔ عمومی محصول `saffron-sargol-1-mesghal` → HTTP 200، `.dz-rich` رندر، بدون خطا.
- صفحهٔ عمومی `/faq` → HTTP 200، `.dz-rich` رندر، بدون خطا.
- مسیرهای ادمین (محصول/دسته/FAQ/داشبورد/رسانه) → HTTP 307 (ریدایرکت لاگین، بدون ۵۰۰).
- رندر عمومی (React renderToStaticMarkup با URL رسانهٔ واقعی): تصویر تکی + گالری featured +
  نقل‌قول + کالاوت رندر شد؛ script/onclick/external-img حذف شد.

> یادداشت: بلاگ/مقاله ادیتور ادمین مستقل ندارد (CONTENT-CP1 جداگانه در حال ساخت موازی است)؛
> بنابراین آزمایش «فیلد بلاگ» در این چک‌پوینت ادعا نمی‌شود.

## وضعیت ۲۴ معیار
| # | معیار | وضعیت | شاهد |
|---|---|---|---|
| 1 | درج تصویر تکی | ✅ | toolbar «رسانه»→تصویر؛ `dzImage` |
| 2 | آپلود از پیکر | ✅ | `MediaUploader` داخل `MediaPickerDialog` |
| 3 | ویرایش پس از درج | ✅ | کنترل‌های inline در `MediaImageView` (همیشه فعال) |
| 4 | تغییر alt | ✅ | input alt در image view |
| 5 | تغییر caption | ✅ | input caption |
| 6 | تغییر چیدمان | ✅ | ۴ دکمه وسط/راست/چپ/تمام‌عرض |
| 7 | افزودن/حذف لینک امن | ✅ | دکمهٔ لینک + unlink |
| 8 | حذف بلوک تصویر | ✅ | `deleteNode` |
| 9 | درج گالری | ✅ | «رسانه»→گالری/شبکه‌ای/شاخص؛ `dzGallery` |
| 10 | انتخاب چندتایی | ✅ | `MediaPickerDialog multiple` + `onPickMany` |
| 11 | آپلود حین انتخاب | ✅ | uploader در حالت multiple به انتخاب اضافه می‌کند |
| 12 | ترتیب‌دهی | ✅ | دکمه‌های جابه‌جایی ‹ › |
| 13 | کپشن هر تصویر | ✅ | input کپشن per-item |
| 14 | **alt هر تصویر** | ✅ (در CP1.1 اضافه شد) | input alt per-item در `MediaGalleryView` |
| 15 | تغییر layout | ✅ | select: grid-2/grid-3/featured/scroll-mobile |
| 16 | حذف یک تصویر | ✅ | `removeAt` |
| 17 | حذف کل گالری | ✅ | `deleteNode` |
| 18 | ویرایش مجدد گالری | ✅ | کنترل‌ها همیشه فعال‌اند (نه بلوک مرده) |
| 19 | visual→code→visual | ✅ | renderHTML↔parseHTML round-trip + sanitize روی switch |
| 20 | sanitizer ناایمن را حذف | ✅ | تست واحد + render test |
| 21 | رندر عمومی تصویر/گالری | ✅ | renderToStaticMarkup + curl زنده |
| 22 | موبایل ۳۹۰ | ✅ (کد) | toolbar flex-wrap، گرید ریسپانسیو، dropdown w-56 |
| 23 | دارک‌مود | ✅ (کد) | `dark:` + `.dark .dz-rich` |
| 24 | تولبار شلوغ نباشد | ✅ | dropdownهای «رسانه» و «بلوک‌های دشت‌زاد» |

## چه چیزی ناقص بود و در CP1.1 رفع شد
- «رسانه» فقط ۲ آیتم داشت → به ۵ آیتم گسترش یافت (تصویر، تصویر با کپشن، گالری/آلبوم،
  گالری شبکه‌ای، گالری با تصویر شاخص).
- **alt هر تصویر گالری** غایب بود → افزوده شد (معیار ۱۴).
- تأیید runtime واقعی (build + curl زنده + render SSR) که در CP1 (به‌خاطر پایین‌بودن DB) ممکن نشده بود.

## شکست‌ها / محدودیت‌ها
- **اسکرین‌شات‌ها گرفته نشد**: ابزار اتوماسیون مرورگر (Playwright/Puppeteer/Docker) موجود نیست و
  نصب تأیید نشده. شاهدِ headless + چک‌لیست QA دستی در
  `scratchpad/admin-rich-media-cp1-1/README.md`.
- **تست تعاملیِ کلیکیِ ادیتور** (درج/ترتیب‌دهی واقعی) نیاز به مرورگر دارد → با code-review و
  پیاده‌سازی NodeView تأیید شد، نه با کلیک زنده.
- lightbox کامل و اتصال بلاگ کماکان معلق (CONTENT-CP1).
