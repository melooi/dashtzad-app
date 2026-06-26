# FRONT-PAGE-LOCK-02-HOMEPAGE — Audit

> Part‑1 AUDIT only. **No code in this part.** This document captures the reference homepage, the current homepage, the admin block builder, and the data wiring as ground truth, then lays out an implementation-ready plan. Where a fact could not be confirmed from the merged readings, it is marked **"unknown — verify before coding"**.

---

## 1. Reference Audit

### 1.1 design-export homepage files found & inspected

| # | File | Role |
|---|------|------|
| 1 | `/Users/mim/Documents/dashtzad all/dashtzadpro/design-export/pages/home-preview.html` | Static reference homepage markup (sections, copy, order). Contains preview-only `.pv-card` scaffolding + inline `<style>` + a disclaimer note — preview-only, not site copy. |
| 2 | `/Users/mim/Documents/dashtzad all/dashtzadpro/design-export/assets/css/pages/home.css` | Homepage section styles (`.dz-home-*`): hero band, cats rail, products rail, story band, collections, recipes, trust band, final CTA, plus the `.dz-home-recipes__empty` empty-state. |
| 3 | `/Users/mim/Documents/dashtzad all/dashtzadpro/design-export/assets/css/app.css` | Global design tokens (`--color-dz-*`, type, spacing, radii, shadows) — the source values to port verbatim into store‑* token names. |

### 1.2 Reference section map

| # | Section (CSS) | Purpose | Contents (summary) |
|---|---------------|---------|--------------------|
| 1 | HERO `.dz-home-hero` | Brand-intro band; heritage + value proposition | Full-bleed soft-green band, **no image** (pure typographic). Kicker pill «روایت یک نسل از ۱۳۱۳» (ri-seedling-line); H1 «طعمی اصل از سرزمینِ نجیبِ ایران»; lead; two CTAs («مشاهدهٔ محصولات» / «دربارهٔ دشت‌زاد»); 4 category chips. |
| 2 | CATEGORY RAIL `.dz-home-cats` | Top-level category navigation | H2 «دسته‌بندی محصولات». Tiles = circular primary-soft media + remix icon + name + «N محصول». Mobile scroll-rail → ≥48rem 4-col → ≥64rem 8-col. *(8 demo cats = direction only.)* |
| 3 | FEATURED PRODUCTS `.dz-home-products` | "Picked by Dashtzad" merchandising rail | Kicker «پیشنهادِ دشت‌زاد» + H2 «محصولات منتخب». Horizontal product-card rail (minmax 14–15rem). **Real site MUST use official product-card + real DB products.** |
| 4 | STORY BAND `.dz-home-story` | Brand-heritage editorial band | Two-column warm card. H2 «دشت‌زاد، ادامهٔ همان نسل» + lead + link «روایتِ کامل دشت‌زاد». 2×2 pillar grid: ریشه / خاک / سفره / ۱۳۱۳. |
| 5 | COLLECTIONS `.dz-home-collections` | Themed/seasonal collection cards (gold accent) | H2 «کالکشن‌های دشت‌زاد». 5-up grid; amber-soft icon bg + gold-deep icon (the **only** gold accent on the page). *(Demo collections fabricated — direction only.)* |
| 6 | RECIPES PREVIEW `.dz-home-recipes` | Editorial recipe teasers | Row head: kicker «دستور پخت» + H2 «از آشپزخانهٔ دشت‌زاد» + pill CTA «امروز چی بپزم؟». 3-col recipe cards (16:10 media). Defines `.dz-home-recipes__empty` graceful empty-state. |
| 7 | TRUST BAND `.dz-home-trust` | Service-promise strip (process-based, not fake badges) | 5-up grid. Items: انتخابِ دقیقِ محصول / بسته‌بندیِ تمیز / ارسالِ امن / پشتیبانیِ پیش از خرید / خانگی و عمده. Primary-soft icon tiles. |
| 8 | FINAL CTA `.dz-home-cta` | Closing conversion band | Centered deep-green card (primary-deep, inverse text). H2 «به سفرهٔ دشت‌زاد بپیوندید» + text + two CTAs («مشاهدهٔ فروشگاه» / «سفارش عمده»). |

### 1.3 Reference visual language → store‑* mapping

The design-export uses `--color-dz-*` token **names** that belong to the design system's source; for the storefront homepage these **values port verbatim** but must be **re-expressed under store‑* names** (palette-scoping rule: storefront/homepage = store‑*, admin = dz‑* olive). The literal `--color-dz-*` names below are the design-export source, not the admin olive of the same prefix.

**Palette (port values, rename to store‑*):**

| Role | Value | Notes |
|------|-------|-------|
| primary | `#15803d` | forest green |
| primary-hover | `#166534` | icon color in primary tiles |
| primary-soft | `#dcfce7` | hero band bg + icon tile bg |
| primary-deep | `#14532d` | final-CTA card bg |
| primary-deepest | `#0c3a1f` | H1 color |
| primary-tint | `#f0fdf4` | subtle section bg option |
| bg (canvas) | `#fdfcf9` | warm off-white |
| surface | `#ffffff` | cards |
| surface-soft / surface-warm | `#f5f5f4` / `#fafaf9` | alt section bands |
| cream | `#f5efe0` | warm accent |
| text / muted / faint | `#292524` / `#57534e` / `#78716c` | |
| text-inverse | `#ffffff` | on deep-green CTA |
| border / strong / soft | `#e7e5e4` / `#d6d3d1` / `#ece3d4` | hairline 0.0625rem |
| gold / gold-deep / honey / amber-soft | `#f59e0b` / `#b45309` / `#fbbf24` / `#fef3c7` | **collections only** |
| clay family | `#c2410c` / `#ffedd5` / `#9a3412` | sparing accents/status |
| secondary (brown) / accent | `#7a5538` / `#b45309` | |

**Type:** body `Yekan Bakh`; display/headings `Kalameh` (fallback Yekan Bakh). Section titles/hero/story/CTA/collection titles = display, weight **800** (700 for card/collection titles). Fluid clamp scale — hero `clamp(1.9rem,1.2rem+3.5vw,3.25rem)` LH 1.25; section title `clamp(1.35rem,1rem+1.5vw,1.9rem)`; story `clamp(1.4rem,1rem+1.6vw,2rem)`; CTA `clamp(1.5rem,1.1rem+1.8vw,2.25rem)`. Leading: tight 1.35 / normal 1.8 (leads) / relaxed 2.

**Spacing:** page rhythm `.dz-home` gap `clamp(2.5rem,6vw,4.5rem)`; padding-block `clamp(1.5rem,4vw,3rem)` top / `clamp(3rem,7vw,5rem)` bottom. Wrap max-inline **75rem**, padding-inline `clamp(0.9rem,4vw,1.5rem)`, centered. Section-head margin-block-end `clamp(1rem,2.5vw,1.75rem)`. Scale dz‑1..dz‑20 (0.25rem step).

**Radii:** card/xl 1.5rem, lg 1rem, md 0.75rem, sm 0.5rem, pill 999rem. Product/category cards = lg; story/CTA/recipes-empty = xl; chips/kicker/buttons/category-media = pill.

**Shadows (warm, brown-tinted — not neutral black):** xs `0 .125rem .5rem rgba(47,38,31,.06)`; card `0 .75rem 2rem rgba(47,38,31,.08)`; hover `0 1rem 2.75rem rgba(47,38,31,.12)`.

**Card style:** white surface, hairline border, generous radius, subtle warm shadow **only on hover**; hover lifts `translateY(-0.2rem)` + border turns primary green; transitions `.15s ease`.

**Warmth:** warm off-white canvas, warm stone borders, brown-tinted shadows, cream/amber accents — **editorial & calm, not clinical**.

**Editorial-vs-grid:** hybrid — full-bleed colored editorial bands (hero, story, CTA) **alternate** with clean responsive grids/rails (cats, products, collections, recipes, trust). Two horizontal scroll rails (cats, products) hide scrollbars. Motifs: agrarian Remix iconography in circular primary-soft tiles (collections flip to amber-soft + gold-deep); ZWNJ Persian copy; ۱۳۱۳ heritage; land-to-table narrative.

> **store‑* reuse note:** existing storefront primitives already encode much of this — `StoreSection`, `StorePageHero`, `StoreContainer`, `StoreTrustBand`, `StoreTrustCard`, `StoreBadge`, `StoreAccordion`, `product-card/ProductCard`. These are confirmed present under `src/components/storefront/` and already consumed by PLP/PDP/about/blog/faq/contact/terms pages, so the homepage should compose them rather than re-author bands.

### 1.4 Reference hero in detail

Full-bleed band `.dz-home-hero`, bg = primary-soft (`#dcfce7`), bottom hairline border. Inner is centered: max 75rem, padding-block `clamp(2.5rem,7vw,5rem)`, `text-align:center`, flex column, gap spacing-dz-4. **No hero image/photo** — purely typographic.

- **Kicker:** white-surface pill, shadow-xs, ri-seedling-line, «روایت یک نسل از ۱۳۱۳», color primary-hover, weight 700, 0.9rem, pill radius.
- **H1:** «طعمی اصل از سرزمینِ نجیبِ ایران» — display, weight 800, `clamp(1.9rem,1.2rem+3.5vw,3.25rem)`, LH 1.25, color primary-deepest, max-inline 22ch, `text-wrap:balance`.
- **Lead:** «برنج، آجیل و مغزها، خشکبار، چای و دمنوش و خوراکی‌های اصیل — با انتخابی دقیق و خریدی مطمئن، از زمین تا سفرهٔ شما.» — max-inline 52ch, leading 1.8, color text-muted.
- **CTAs:** primary «مشاهدهٔ محصولات» (ri-store-2-line) + soft «دربارهٔ دشت‌زاد» (ri-book-open-line), centered, gap dz-3.
- **Chips:** 4 white pill chips with border — «برنج» «آجیل و مغزها» «خشکبار» «چای و دمنوش», weight 600, 0.82rem.
- **No badges/ratings/trust-icons in hero.** Heritage cue = the ۱۳۱۳ kicker only.

> Note: the reference hero is **image-free**. The Hero block in the current admin supports `imageUrl`/`mobileImageUrl`; on this homepage those should default to empty and the typographic band should be the canonical look. Whether to support an optional hero image at all on the locked homepage is an **open question (4.8)**.

### 1.5 Homepage assets/images available

- `design-export/assets/img/dashtzad-logo.svg` (+ `.jpg` raster fallback) — brand logo.
- `design-export/assets/toman.svg` + `assets/img/toman.svg` — Toman currency mark for prices.
- `design-export/assets/products/p1.jpeg..p10.jpeg` (p1–p5, p7–p10) — 9 generic product photos; **demo/placeholder only**, real site uses DB product images.
- `design-export/assets/about/img-01.png..img-13.png` + `img-14.jpeg` — 14 brand/about lifestyle photos; candidate sources for story-band / heritage imagery.
- `design-export/assets/img/chat-bot-avatar.webp` + `AI-bot-with-hands.webp` — chat avatars, **not** homepage hero.
- Fonts: `assets/fonts/yekanbakh/*` (body 100–900), `assets/fonts/kalameh/*` (display 300–900), `assets/fonts/remixicon/remixicon.css`.
- **No dedicated hero image asset exists** — reference hero is image-free; `assets/img/.gitkeep` present (dir sparse).

### 1.6 Real Persian copy (and ۱۳۰۵ check)

- HERO kicker: «روایت یک نسل از ۱۳۱۳»
- HERO H1: «طعمی اصل از سرزمینِ نجیبِ ایران»
- HERO lead: «برنج، آجیل و مغزها، خشکبار، چای و دمنوش و خوراکی‌های اصیل — با انتخابی دقیق و خریدی مطمئن، از زمین تا سفرهٔ شما.»
- HERO CTAs: «مشاهدهٔ محصولات» / «دربارهٔ دشت‌زاد»; chips: «برنج» «آجیل و مغزها» «خشکبار» «چای و دمنوش»
- CATS title: «دسته‌بندی محصولات»
- PRODUCTS: kicker «پیشنهادِ دشت‌زاد» + title «محصولات منتخب»
- STORY title: «دشت‌زاد، ادامهٔ همان نسل»; lead «از باغ و دشت تا سفرهٔ امروز؛ با همان حرمتِ زمین و وسواسِ کیفیت.»; link «روایتِ کامل دشت‌زاد»
- STORY pillars: ریشه «برخاسته از خاک و کشاورزِ ایرانی.» / خاک «انتخاب از مبدأ، با کیفیتِ اصیل.» / سفره «طعم‌هایی که به خانهٔ شما می‌رسند.» / «۱۳۱۳» «روایتی که نسل‌به‌نسل ادامه دارد.»
- COLLECTIONS title: «کالکشن‌های دشت‌زاد»; link «مشاهده»
- RECIPES: kicker «دستور پخت» + title «از آشپزخانهٔ دشت‌زاد»; CTA «امروز چی بپزم؟»
- TRUST items: «انتخابِ دقیقِ محصول» / «دانه‌به‌دانه، از مبدأ مطمئن.» — «بسته‌بندیِ تمیز» / «بهداشتی و با حفظِ تازگی.» — «ارسالِ امن» / «به سراسرِ کشور.» — «پشتیبانیِ پیش از خرید» / «راهنمایی تا انتخابِ درست.» — «خانگی و عمده» / «مناسبِ مصرفِ خانه و سفارشِ عمده.»
- FINAL CTA title: «به سفرهٔ دشت‌زاد بپیوندید»; text «طعم‌های اصیلِ ایرانی، یک کلیک با شما فاصله دارند.»; CTAs «مشاهدهٔ فروشگاه» / «سفارش عمده»

**۱۳۰۵ check:** ✅ No instance of ۱۳۰۵ anywhere in the reference; all heritage references already use **۱۳۱۳** (compliant). **Keep ۱۳۱۳; never ۱۳۰۵.**

> **Preview-only copy to IGNORE (NOT site copy):** the disclaimer «پیش‌نمایشِ استاتیک — در سایتِ واقعی، ریل‌های محصول با کارتِ رسمیِ دشت‌زاد و دادهٔ ووکامرس پر می‌شوند.» mentions WooCommerce; this stack is Prisma/Next.js — ignore.

### 1.7 Direction-only (do NOT copy verbatim)

- **CATEGORY RAIL names/counts are fake** (8 cats incl. حبوبات/ادویه/دانه‌های خوراکی/تخمه with «۲۴ محصول» etc.). Real DB has **3** product categories: برنج / آجیل و خشکبار / زعفران و ادویه. Render **real categories + real counts** only; the layout is the direction.
- **FEATURED PRODUCTS cards are fake** (`.pv-card`: بِرنج هاشمی, پستهٔ اکبری, برگهٔ زردآلو, چای سیاه, لپه — with prices). Names/prices/icons are direction only. Use the **official ProductCard + the 5 real active products**. Do not invent prices/stock.
- **COLLECTIONS section is fabricated** (سرو ایرانی/شبِ دشت/یلدا/نوروز/عیدانه). Project rule = **no fake collections**. Build only if real collection data exists; otherwise **OMIT**. Style = direction only.
- **RECIPES titles are placeholder** (پلوی ایرانی/خورشِ قیمه/دمنوشِ زمستانی). Render only if real published recipe/"what to cook" posts exist (2 published posts available); use graceful empty-state otherwise.
- **TRUST copy = direction**: keep process/promise-based; must **not** become fake certifications/ratings/badges or invented numbers.
- **Do NOT port `.pv-card`** markup or its inline `<style>` — preview scaffolding only.
- **Ignore the WooCommerce note** (stack is Prisma/Next.js).
- **Section order + presence = direction, gated by honest-data**: hide any section lacking real data gracefully rather than filling with placeholders.
- **`--color-dz-*` / `dz-*` class names are design-export naming** — re-express as store‑* for the storefront homepage (values port verbatim, names change).

---

## 2. Current Homepage Audit

Files: `src/app/(public)/page.tsx` (force-dynamic) and `src/components/home/HomepageBlocks.tsx`.

### 2.1 Current blocks rendered

| Block (type) | Look (current) | Data source |
|--------------|----------------|-------------|
| Top banner strip (page.tsx, not a block) | Plain colored bar `bg-dz-primary-100`, image + title + subtitle | `getActiveBanners("HOME_TOP")` (site-data) |
| **Hero** | Tinted band `bg-dz-primary-50` + blurred radial blob, centered column: optional eyebrow pill, `<h1>`, subtitle, optional cover (`max-h-72`), up to 2 CTAs | Inline block fields (no query) |
| **FeaturedProducts** | Section wrapper + grid `grid-cols-2 md:grid-cols-4` of ProductCard | `prisma.product.findMany` by mode (MANUAL ids / CATEGORY / LATEST), `take:limit`, **images-only include**, hand-built minimal card object |
| **FeaturedCategories** | Text-only category links in white `rounded-2xl` cards (no image/icon) | `prisma.category.findMany({id in categoryIds})` — no type/isActive filter |
| **RichText** | Section + prose, `whitespace-pre-line`, `dz-primary-700` | Inline body |
| **ImageGallery** | Section + 2/3-col `aspect-video object-cover` grid | Inline images[] |
| **CTABanner** | Solid `dz-primary-700` card, optional top image `h-48`, white heading/text/button. **No empty-content guard** | Inline fields |
| **FAQGroup** | Section + native `<details>/<summary>` accordion + FAQPage JSON-LD | `getFaqGroupItems(faqGroupId)` (site-data) |
| **TrustIcons / ProductFeatures** (shared branch) | 1/2/3-col grid of cards, **single hardcoded `CheckCircle2`** + title + text | Inline items[] |
| **BlogPreview** | Section + 2-col grid of PostCard | `prisma.post.findMany(PUBLISHED [+categoryId])`, `take:limit`, author |
| **ProductStory** | 2-col card (text + optional `aspect-square` image) in white bordered box | Inline (+ optional product) |
| **ProductTasteProfile** | `max-w-2xl` label/value rows separated by borders | Inline items[] |
| **Unknown type** | Dashed-border box «این بخش به‌زودی نمایش داده می‌شود» | — (admin placeholder leaking to public) |
| **DefaultHome** (fallback, no active blocks) | Logo + eyebrow pill + h1 «اصالت طعم ایرانی، از سال ۱۳۱۳» + products grid (4) + blog grid (2) | Own Prisma queries (products take 4, posts take 2) |

### 2.2 Palette per block (store‑* vs dz‑*)

- **All page-authored homepage markup is `dz-primary-*` (ADMIN olive) — wrong palette.** Top banner, Hero, every Section head (bar+title+subtitle), FeaturedCategories cards, RichText, CTABanner, FAQGroup, Trust/Features, ProductStory, TasteProfile, and DefaultHome — **zero store‑* tokens**.
- **Exception (already store‑*):** the embedded `ProductCard` and `PostCard` components are forest-green store‑*; and the chrome (Header/Footer) is store‑*.
- **Net effect:** green chrome + green cards **sandwiching** an olive body — a direct palette mismatch on a single page. The brand spec requires the homepage body to be **store‑*** (forest green + warm stone + clay/gold); none of the warm-stone/clay/gold accents appear today.

### 2.3 Visual problems

**Disconnected-from-chrome**
- dz-olive section chrome wraps store-green ProductCard/PostCard → products look like a different brand than their section; two palettes fight even **inside a single FeaturedProducts section**.
- Hero band (`bg-dz-primary-50`) is the first thing under the green Header → immediate olive-vs-green seam at the top.
- No warm-stone/clay/gold from the store palette anywhere on the body.

**Placeholder-generic**
- Unknown-block fallback ships «این بخش به‌زودی نمایش داده می‌شود» to production — violates the no "coming soon" public text rule.
- Hero `h1` falls back to literal «دشت‌زاد»; CTA hrefs fall back to `/products` / `/`.
- FeaturedProducts/FeaturedCategories/BlogPreview titles fall back to generic «محصولات منتخب» / «دسته‌های منتخب» / «از بلاگ».
- FeaturedCategories = centered name in a white box, nothing else (cheap for a premium store).
- TrustIcons/ProductFeatures repeat **one** `CheckCircle2` for every item — templated.
- CTABanner with empty fields still renders a blank solid olive band (no guard).

**Admin-ish**
- Whole body painted in dz-* (admin olive) — clearest "admin-ish" tell on a public storefront.
- Identical "thin vertical bar + bold heading" motif on every section → default-theme look, no rhythm/variation.
- FeaturedCategories reads like an admin taxonomy list, not a merchandised grid.

**Responsive**
- Hero cover `max-h-72 w-full object-cover`, no aspect ratio → wide images hard-cropped, tall mobile images clipped.
- FeaturedProducts/FeaturedCategories grids jump `grid-cols-2 → md:grid-cols-4` with **no `sm` step** → weak 640–768px range.
- ImageGallery fixed `aspect-video`, portrait sources letter/pillar-boxed; two narrow tiles on small phones.
- CTABanner top image fixed `h-48` across all breakpoints.
- ProductStory `aspect-square` forced even when stacked full-width on mobile → very tall image block.
- Top banner fixed `h-12` image + flex `gap-4`; long title+subtitle wrap awkwardly, no truncation.
- Page assumes bottom-nav clearance (`pb-24`) handled by layout.

### 2.4 SEO currently present on homepage

- ✅ **`generateMetadata` PRESENT** (`page.tsx`): async, pulls `getSeoDefaults()` and returns `buildEntityMetadata("HOMEPAGE","homepage",{title,description,path:"/",image})` with Persian fallbacks and the correct ۱۳۱۳ year.
- ❌ **Organization JSON-LD: NOT present** on the homepage.
- ❌ **WebSite JSON-LD (incl. sitelinks search): NOT present** on the homepage.
- ⚠️ Only structured data emitted is **FAQPage JSON-LD**, and only conditionally inside the FAQGroup block.
- So the homepage is missing the two foundational site-level JSON-LD entities — **add them while preserving the existing metadata** (4.7).

---

## 3. Admin / Global Audit

### 3.1 Current homepage block types + fa labels

| Type | fa label |
|------|----------|
| Hero | هیرو (بنر اصلی) |
| FeaturedProducts | محصولات منتخب |
| FeaturedCategories | دسته‌های منتخب |
| RichText | متن غنی |
| ImageGallery | گالری تصاویر |
| CTABanner | بنر دعوت به اقدام |
| FAQGroup | سوالات متداول |
| TrustIcons | نمادهای اعتماد |
| BlogPreview | پیش‌نمایش بلاگ |
| ProductStory | داستان محصول |
| ProductFeatures | ویژگی‌های محصول |
| ProductTasteProfile | پروفایل طعم |

### 3.2 HOMEPAGE_BLOCK_FIELDS per block

Verbatim from `HOMEPAGE_BLOCK_FIELDS` (`src/lib/admin/globals.ts`, ≈L303–432), all `section:"b"`.

| Block | Fields (type) |
|-------|---------------|
| **Hero** | eyebrow(text), title(text), subtitle(textarea·2), imageUrl(image·ltr «تصویر دسکتاپ»), mobileImageUrl(image·ltr «تصویر موبایل»), primaryCtaLabel(text), primaryCtaHref(url·ltr), secondaryCtaLabel(text), secondaryCtaHref(url·ltr) |
| **FeaturedProducts** | title(text), subtitle(text), mode(select: MANUAL=دستی / LATEST=جدیدترین‌ها / CATEGORY=بر اساس دسته), productIds(products), categoryId(category), limit(number·ltr) |
| **FeaturedCategories** | title(text), subtitle(text), categoryIds(categories) |
| **RichText** | title(text), body(textarea·5) |
| **ImageGallery** | title(text), images(objectList → url[image·ltr], alt[text]) |
| **CTABanner** | title(text), text(textarea·2), imageUrl(image·ltr), buttonLabel(text), buttonHref(url·ltr) |
| **FAQGroup** | title(text), faqGroupId(faqGroup) |
| **TrustIcons** | title(text), items(objectList → icon[icon], title[text], text[text]) |
| **BlogPreview** | title(text), mode(select: LATEST / CATEGORY), categoryId(category), limit(number·ltr) |
| **ProductStory** | title(text), text(textarea·4), productId(product), imageUrl(image·ltr) |
| **ProductFeatures** | title(text), items(objectList → icon[icon], title[text], text[text]) |
| **ProductTasteProfile** | title(text), items(objectList → label[text], value[text]) |

### 3.3 GlobalFieldInput supported field types

text · textarea(rows) · url(ltr/mono) · number(digits-only) · color(swatch+hex) · checkbox · select(options) · menu(menuOptions, with «— بدون منو —») · **icon** (`AutoIconField` — auto-suggest or curated `NAV_ICON_OPTIONS` allow-list, not free text) · **image** (`MediaPicker` — Media Library dialog + manual URL; `inferUsage(name)` filters SEO/BRAND/GENERAL) · stringList(add/remove rows) · **objectList** (repeatable itemFields cards: add/remove/reorder; any field type allowed inside) · **product** (single-select `ctx.productOptions`) · **products** (`MultiChipCell`, maxChips 6) · **category** / **categories** · **faqGroup** (single-select `ctx.faqGroupOptions`).

- **Media picker:** YES — `src/components/admin/media/MediaPicker.tsx` (used by Hero/CTABanner/ProductStory image, ImageGallery item url, SEO/brand globals).
- **Icon picker:** YES — `src/components/admin/site/AutoIconField.tsx` (curated allow-list, "auto" stores empty so storefront auto-picks).
- **Relation pickers:** YES — single (product/category/faqGroup) + multi (products/categories). **No blog-post relation picker exists** (BlogPreview selects category or LATEST only — cannot hand-pick posts).
- **objectList:** YES — already used by ImageGallery/TrustIcons/ProductFeatures/ProductTasteProfile + footer trustBadges/socialLinks. Ideal for trust-band and collection cards.

### 3.4 HomepageBuilder capabilities

- **Add:** pick type from `HOMEPAGE_BLOCK_TYPES` + «افزودن بلوک» → `emptyHomepageBlock()`.
- **Remove:** per-block `Trash2`.
- **Duplicate:** `Copy` (clones with new id, inserts after).
- **Reorder:** `ChevronUp`/`ChevronDown` (no drag-and-drop).
- **Enable/disable:** `Eye`/`EyeOff` toggles `isActive` (inactive dimmed, kept in list).
- **Inline edit:** `Pencil` expands a 2-col `@container` editor rendering each field via `GlobalFieldInput`.
- **Save:** sticky save bar + dirty tracking → `saveGlobal("homepage",{blocks})` server action → `router.refresh()`.
- **Limits:** **no live visual preview** (text summary line only: `title || eyebrow || "—"`); **no drag-and-drop**.

### 3.5 Real data available (per RULES)

| Entity | Count / detail |
|--------|----------------|
| Active products | **5** (all have images; simple — no variant data wired on home) |
| Product categories | **3** (برنج / آجیل و خشکبار / زعفران و ادویه), type PRODUCT |
| Published posts | **2** |
| Active FAQ group | **1** |
| Active banner | **1** |
| Configured homepage blocks | **4** currently saved in GlobalSetting key="homepage" |

### 3.6 MISSING for desired sections + SCHEMA-FREE confirmation

| Desired section | Status | Notes |
|-----------------|--------|-------|
| hero | **COVERED** | existing Hero block |
| categoryGrid | **COVERED** | FeaturedCategories (categoryIds) — needs imagery/icon in render, not new fields |
| productSection | **COVERED** | FeaturedProducts (MANUAL/LATEST/CATEGORY) |
| brandStory | **COVERED** | RichText or ProductStory (no dedicated type needed) |
| trustBand | **COVERED** | TrustIcons (objectList icon/title/text) |
| collectionCards | **NEW block** | No dedicated type; add `CollectionCards` (objectList of image/title/text/href). FeaturedCategories lacks per-item href; ImageGallery lacks href. **Gated: build only if real collection data exists, else OMIT (honest-data).** |
| productHighlight | **PARTIAL** | ProductStory covers single highlighted product; richer version optional |
| magazinePreview | **PARTIAL** | BlogPreview exists but **cannot hand-pick posts** (no post relation field). LATEST/category only. |
| cookingAssistantTeaser | **DEFER** | No block type; trivially a CTABanner today — defer dedicated block to content-CP1 |
| faqPreview | **COVERED** | FAQGroup (faqGroupId) |
| finalCta | **COVERED** | CTABanner (title/text/image/button) |

**SCHEMA-FREE: YES — no DB migration.** The homepage is **one** `GlobalSetting` row (key="homepage") storing JSON `{ blocks: [...] }`. `homepageBlockSchema = z.object({id,type,isActive}).passthrough()`, so every block-specific field is passthrough JSON. Adding a block type = TS-config edits only in `src/lib/admin/globals.ts`: (1) add name to `HOMEPAGE_BLOCK_TYPES`, (2) add fa label to `HOMEPAGE_BLOCK_LABELS`, (3) add field defs to `HOMEPAGE_BLOCK_FIELDS`. `emptyHomepageBlock`, the builder, and `GlobalFieldInput` derive automatically. The **only** code (not DB) additions for full coverage: new block type(s) (`CollectionCards`; `CookingAssistantTeaser` only if not reusing CTABanner) and — for hand-picked magazine — a new `post`/`posts` field type in `GlobalFieldType` + a render case in `GlobalFieldInput` + `ctx.postOptions`. **No Prisma migration anywhere.**

---

## 4. Implementation Plan

### 4.1 Final homepage SECTION MAP (11 desired sections)

| # | Section | Block strategy | Data source | Hide-when-empty? |
|---|---------|----------------|-------------|------------------|
| 1 | **Hero** (typographic band) | Reuse **Hero** block, restyle store‑* via `StorePageHero` patterns | admin-global (inline) | Always render (brand intro). Image optional/empty by default. |
| 2 | **Category grid/rail** | Reuse **FeaturedCategories**, restyle to icon/media tiles + real counts | category DB (via new `getHomepageCategories`) | **Hide** if no real product categories. |
| 3 | **Featured products** | Reuse **FeaturedProducts** + official `ProductCard` at full fidelity | product DB (via new `getFeaturedProducts`) | **Hide** (returns null) if no products. |
| 4 | **Brand story band** | Reuse **RichText** or **ProductStory**, restyle store‑* two-col warm card + 2×2 pillars | admin-global | **Hide** if no text. |
| 5 | **Collections** | **NEW `CollectionCards`** block (gold-accent) | admin-global (objectList) | **OMIT entirely** unless admin supplies real collection cards (no fake collections). |
| 6 | **Recipes preview** | Reuse **BlogPreview** (recipe/"what to cook" posts), graceful empty-state | blog DB (via new `getLatestPosts`) | **Hide** if no published posts. |
| 7 | **Trust band** | Reuse **TrustIcons** → render via `StoreTrustBand`/`StoreTrustCard` | admin-global (objectList) | **Hide** if no items. |
| 8 | **Final CTA** | Reuse **CTABanner**, restyle deep-green card + **add empty-content guard** | admin-global | **Hide** if title+text+button all empty. |
| 9 | **Magazine preview** (= recipes/blog) | Same as #6 (BlogPreview); hand-pick deferred | blog DB | **Hide** if none. |
| 10 | **Cooking-assistant teaser** | **DEFER** (or CTABanner stopgap) | — | Deferred — not built this checkpoint. |
| 11 | **FAQ preview** | Reuse **FAQGroup** + FAQPage JSON-LD | FAQ DB (`getFaqGroupItems`) | **Hide** if no group/items. |

> The canonical default order (when admin has not customized) follows the reference: Hero → Categories → Featured products → Story → (Collections if real) → Recipes/Blog → Trust → FAQ → Final CTA. Admin reordering remains authoritative.

### 4.2 Section-by-section plan

All sections move to **store‑*** (forest green + warm stone + clay/gold), warm/premium/Dashtzad-specific, composing existing storefront primitives. **No new packages.**

1. **Hero** — Restyle to the image-free typographic band: store‑primary‑soft band, white-pill kicker «روایت یک نسل از ۱۳۱۳» (ri-seedling-line), display H1, lead, two CTAs, 4 real category chips. Use `StorePageHero` / `StoreContainer`. Keep `<h1>` count = 1.
2. **Category grid** — Replace text-only cards with circular store‑primary‑soft media tiles + auto icon + name + real «N محصول» count. Mobile scroll-rail → 4-col → up to grid; honest count from DB.
3. **Featured products** — Swap images-only include for the canonical `cardInclude` (images + category{title} + active variants) and feed `toProductCardData(p)` into the official `ProductCard` (`variant="featured"` optional). With current simple products this adds only `categoryTitle` (no fabricated data). Add `sm` grid step / use a rail.
4. **Brand story** — Two-col warm store‑* card (`radius-xl`), display H2 «دشت‌زاد، ادامهٔ همان نسل», lead, link «روایتِ کامل دشت‌زاد», 2×2 pillar grid (ریشه/خاک/سفره/۱۳۱۳) with primary-soft icon tiles. Heritage year **۱۳۱۳**.
5. **Collections** — Only if real data: gold/amber accent cards (the lone gold accent), `radius-xl`, display titles. Otherwise the block renders null and the section disappears.
6. **Recipes/Blog** — Restyle `PostCard`-based grid to store‑*; row head with kicker «دستور پخت» + «از آشپزخانهٔ دشت‌زاد»; graceful empty-state mirroring `.dz-home-recipes__empty`. Real 2 posts surface.
7. **Trust band** — Render through `StoreTrustBand` + `StoreTrustCard` with **per-item auto icons** (drop the hardcoded `CheckCircle2`); process/promise copy only.
8. **Final CTA** — Deep-green store‑primary‑deep card, inverse text, two CTAs; **add empty-content guard** so a blank block never ships.
9. **Section rhythm** — Alternate full-bleed editorial bands (hero/story/CTA) with clean grids/rails via `StoreSection`; warm off-white canvas, brown-tinted shadows, hover-only card shadow + green border + `translateY(-0.2rem)`.
10. **Kill the leak** — Replace the unknown-block dashed «به‌زودی» placeholder with a **silent null** (render nothing) for unknown types.

### 4.3 Files to edit (real paths)

- `src/app/(public)/page.tsx` — keep `generateMetadata`; add Organization + WebSite JSON-LD; restyle the top banner strip + DefaultHome to store‑*; ensure single `<h1>`.
- `src/components/home/HomepageBlocks.tsx` — restyle every block to store‑*; widen FeaturedProducts include + use `toProductCardData` + official ProductCard; category tiles with media/icon + real counts; route Trust through `StoreTrustBand`/`StoreTrustCard`; add CTABanner empty-content guard; remove the unknown-block placeholder text (render null); add `CollectionCards` render case.
- `src/lib/admin/globals.ts` — add `CollectionCards` to `HOMEPAGE_BLOCK_TYPES` + `HOMEPAGE_BLOCK_LABELS` + `HOMEPAGE_BLOCK_FIELDS`; (optional) `posts` field type wiring for hand-picked magazine.
- `src/components/admin/site/HomepageBuilder.tsx` — no structural change required (derives from config); verify new type appears + summary line.
- `GlobalFieldInput` (admin field renderer) — only if adding a `post`/`posts` relation field type (new render case + `ctx.postOptions`). Otherwise untouched.
- `src/lib/site-data.ts` — add additive helpers (4.5).
- Reuse (do not re-author): `src/components/storefront/StoreSection.tsx`, `StorePageHero.tsx`, `StoreContainer.tsx`, `StoreTrustBand.tsx`, `StoreTrustCard.tsx`, `StoreBadge.tsx`, `StoreAccordion.tsx`, `product-card/ProductCard.tsx`, `src/lib/storefront/product-card.ts` (`toProductCardData`).

### 4.4 Admin block types / fields to ADD (schema-free, backward-compatible)

- **`CollectionCards`** (new): label «کالکشن‌ها». Fields: `title`(text), `subtitle`(text), `items`(objectList → `imageUrl`[image·ltr], `title`[text], `text`[text], `href`[url·ltr], optional `icon`[icon]). Renders gold-accent cards; **renders null when `items` empty** → section hidden (no fake collections).
- **(Optional) magazine hand-pick:** add a `posts` field type (`MultiChipCell` + `ctx.postOptions`) to BlogPreview, or a `MANUAL` mode. Defer if curated selection isn't required this checkpoint.
- **Backward-compat for the 4 saved blocks:** because the schema is `.passthrough()`, the existing 4 configured blocks keep validating unchanged; new fields default to empty via `emptyHomepageBlock()` and `str()/arr()/num()` helpers. No data migration; no resave required. New defaults must be **safe-empty** so an un-edited block hides gracefully rather than rendering placeholder text.

### 4.5 Data helpers to add in `site-data.ts` (additive, no cart/checkout/SEO touch)

- `getFeaturedProducts({ mode, productIds?, categoryId?, limit })` → uses canonical `cardInclude` (images + category{title} + active variants) and returns `toProductCardData[]`. Lets FeaturedProducts + DefaultHome reuse **full** ProductCard fidelity. Honest-data safe (current products have no variants → price passes through, only `categoryTitle` added).
- `getHomepageCategories(ids?)` → when ids given, `findMany` by id preserving picker order; when omitted, all `type:"PRODUCT"`, `isActive`, `orderBy title`. Adds the missing **type/isActive guards** the inline query lacks; can carry a real product count for the «N محصول» label.
- `getLatestPosts({ limit, categoryId? })` → published posts (status PUBLISHED, author name, `createdAt desc`) in PostCard-ready shape; replaces two duplicated inline queries (BlogPreview + DefaultHome).
- (Optional) `getHomepageData()` aggregator mirroring `getHeaderData`/`getFooterData` to batch block relations — not required, but consistent with existing architecture.
- **No change** to `getActiveBanners` (reused as-is) or `getFaqGroupItems` (reference null-degrading pattern).

All helpers must be **null-degrading + `isActive`-respecting**, mirroring `getFaqGroupItems`, so every data-backed section hides gracefully.

### 4.6 Deferred (and why)

- **Cooking-assistant teaser logic / AI bot** — no homepage block; chat avatars are not hero assets. Defer to a later content/AI checkpoint; a CTABanner can stand in if a teaser is wanted now.
- **Recipe CMS / dedicated recipe content type** — recipes ride on existing published posts via BlogPreview; a true recipe model is out of scope (content-CP1).
- **Magazine hand-pick** (post relation field) — defer unless curated selection is explicitly required; LATEST/category covers the 2 real posts.
- **Drag-and-drop builder + live visual preview** — builder UX improvement, out of scope for the lock.
- **Collections as a real DB entity** — collections stay admin-authored JSON cards; no Collection table this checkpoint.

### 4.7 SEO preservation note

- **Keep** `generateMetadata` in `page.tsx` exactly (Persian fallbacks, ۱۳۱۳, `buildEntityMetadata("HOMEPAGE",…)`).
- **Add** site-level **Organization** + **WebSite** JSON-LD (the two currently-missing foundational entities), emitted once on the homepage (or in `(public)/layout.tsx` if site-wide) via the existing `StructuredData` component — **no new SEO architecture** (SEO module is closed per memory).
- **FAQPage JSON-LD** stays conditional — emitted **only** when a real FAQ group renders (honest-data). Never emit JSON-LD for hidden/empty sections.
- Do **not** alter `getSeoDefaults`, the SEO adapter, or entity-metadata builders.

### 4.8 Open questions / risks to confirm before coding

1. **Hero image:** reference hero is image-free. Confirm whether the locked homepage Hero should keep `imageUrl`/`mobileImageUrl` support (optional) or render text-only always. **unknown — verify before coding.**
2. **Collections data:** is there any real collection source (admin JSON only) to populate `CollectionCards`, or should the section be omitted at launch? Confirm so it doesn't ship empty. **unknown — verify before coding.**
3. **Recipe vs blog distinction:** do the 2 published posts qualify as "recipes/از آشپزخانه," or is a post-type/category filter needed to avoid mislabeling general blog posts as recipes? **unknown — verify before coding.**
4. **Category counts:** confirm the product-count source/definition for «N محصول» (active products in category) and that it's honest/real. **unknown — verify before coding.**
5. **The 4 existing saved blocks:** confirm their current types/order so the restyle is backward-compatible and the default order only applies when admin hasn't customized. **unknown — verify before coding.**
6. **Org/WebSite JSON-LD placement:** page-level vs `(public)/layout.tsx` — confirm to avoid duplicate emission with other routes. **unknown — verify before coding.**
7. **Toman currency mark** usage in product cards on home — confirm ProductCard already renders it (it should, being shared) so no home-specific price formatting is introduced.

---

## 5. Scope Guard

**NOT touched in this checkpoint:**

- **Chrome** (Header / Footer / MegaMenu / MobileDrawer / BottomNav) — LOCKED in FRONT-HF-LOCK-CP1; only verify it wraps the homepage. New chrome lives under `src/components/storefront/chrome/`.
- **PLP** (products list), **PDP** (product detail), **cart**, **checkout**, **payment**, **coupons**, **pricing logic**.
- **Rich text editor**, **blog body/content**, **media adapter**, **orders**.
- **SEO architecture** (module closed) — only add the two missing site-level JSON-LD entities and preserve existing metadata.
- **Admin dark mode / admin responsive** (UI-CP1.1) and the admin olive (dz‑*) palette.

**Confirmed for this checkpoint:**

- Homepage **body = store‑*** palette (forest green #15803d + warm stone + clay/gold). Storefront/homepage stays light; admin stays dz‑* olive.
- Heritage year **۱۳۱۳ only** — never ۱۳۰۵.
- **No fake data** — no invented products/reviews/ratings/discounts/stock/trust-badges/sales/collections; render only real DB/admin data; hide empty sections gracefully; no "coming soon" public text (remove the unknown-block placeholder).
- **No new packages.**
- **No schema migration** — all admin additions are schema-free passthrough JSON on the single `homepage` GlobalSetting row; backward-compatible with the 4 existing saved blocks.
