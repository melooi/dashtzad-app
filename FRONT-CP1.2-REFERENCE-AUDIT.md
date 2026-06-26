# FRONT-CP1.2 — Reference Recovery & Product System Alignment Audit

## Part 1 — Reference path recovery (what happened)

- **Trailing-space folder existed.** The project root contained a directory literally named `design-refs ` (with a trailing space). `find design-refs` (no space) matched nothing, which is why FRONT-CP1 reported it "empty". The folder actually held 9 standalone HTML pages + a `tools.dashtzad.com (1)/` subfolder (67 entries).
  - **Action:** renamed `design-refs ` → `design-refs` (no conflicting `design-refs` existed). Renamed subfolder `tools.dashtzad.com (1)` → `tools.dashtzad.com`.
- **`design-export` was outside the project.** It lived at `~/Downloads/design-export` (user-confirmed). It is the authoritative "Dashtzad — Design Export" (generated 2026-06-25, 29 pages, full `assets/`).
  - **Action:** copied it into the project root → `design-export/` (40 MB, original in Downloads preserved).
- **No zip was found** anywhere (`*.zip` search = 0). Nothing to extract.
- **No nested/duplicate manifests** — only `design-export/manifest.json`.
- **Final root state:** `design-export/`, `design-refs/`, `legacy-reference/`, `look/` — no trailing-space folders remain.

## Part 2 — Reference inventory

### Authoritative (used)
- `design-export/assets/css/app.css` — **the design-system tokens** (colors, radii, shadows, type, fonts).
- `design-export/assets/css/components/product/product-card.css` — **the official product card** (`.dz-product-card`), 293 lines, full state machine.
- `design-export/pages/products.html` — shop grid (`ul.products`, 2→3→4 cols).
- `design-export/pages/single-product.html` — PDP (`dz-pdp-*`: gallery, head, badges, banners, features).
- `design-export/pages/category.html` — category archive listing.
- `design-export/manifest.json` — page index.
- `look/icons/toman.svg`, `look/logo/*` — project-owned assets (toman already in `public/icons/`).

### Key tokens extracted (design-export)
- **Primary = forest green `#15803d`** (hover `#166534`, soft `#dcfce7`).
- Warm-stone neutrals: bg `#fdfcf9`, surface `#fff`, surface-soft `#f5f5f4`, text `#292524`, text-muted `#57534e`, text-faint `#78716c`, border `#e7e5e4`.
- Warm accents: clay `#c2410c` (soft `#ffedd5`, deep `#9a3412`), gold `#f59e0b`/deep `#b45309`, honey `#fbbf24`, amber-soft `#fef3c7`, cream `#f5efe0`.
- Semantic badges: sale `#a64235`, bestseller `#b88a44`, new `#2f6b4f`, special `#7a5538`, gift `#8a5b86`.
- Radii: card `1.5rem`, md `.75rem`, sm `.5rem`, pill `999rem`. Shadows: warm low-opacity `rgba(47,38,31,…)`.
- Fonts: **Kalameh** (display) + Yekan Bakh (body) in the export. Per SKILL §C the app body stays **IRANYekanX**; **Kalameh heading is shared** → confirmed aligned.

### Official product card anatomy (`.dz-product-card`)
- Media **`object-fit: contain` on white** with padding (packaged-goods look, NOT cropped cover).
- Favorite heart (top inline-end), flag badge (top inline-start: bestseller/discount/special), category label on image bottom, optional flash timer, OOS overlay tag.
- Body: Kalameh title (line-clamp 2), meta row (rating + chip), weight chip + low-stock chip.
- Foot (border-top, row-reverse): price (was strikethrough clay / now bold + toman) ↔ action that varies by state: **+ add** / **افزودن** / outline **مشاهده** / **تماس بگیرید**.
- Toman rendered via CSS `mask` of `toman.svg` taking `currentColor`.
- Grid `ul.products`: 2 (mobile) → 3 (≥40rem) → 4 (≥64rem).

### Ignored (and why)
- `design-refs/tools.dashtzad.com/cc-*` (finance, team, sms, voip, calls, invoices, integrations, conversations, aicontent…) — **Command Center business modules**, explicitly barred. Used only to confirm idioms (pill radii, soft-tinted chips, warm surfaces), never imported.
- `design-export/pages/` admin/checkout/cart/chat/recipe/about/blog pages — out of scope (product system only). `cart-preview` viewed for visual reference only, no cart logic taken.
- Vazirmatn-based cart/checkout pages — different font track, not relevant to product system.

### Assets
- **Safe / project-owned:** `look/logo/*`, `look/icons/toman.svg` (already in `public/`), design-export product imagery is owner-supplied but **not copied into runtime** (we use real DB image URLs; export images are reference-only).
- **Unsafe / not used at runtime:** none copied; no external/proprietary assets pulled.

### Missing
- None blocking. Flash-sale countdown, nutrition facts, installment ("خرید قسطی"), and favorites have **no backing data/fields** in the current schema → intentionally **omitted** (no fabrication) rather than faked.

## Decisions (fixed)
- **Palette: scoped hybrid.** Design-export green/warm-stone/clay system applied **only** to product storefront via new **`store-*` tokens/classes**. Admin + shared foundation keep locked olive `dz-*`. No global dz token change.
- **Scope: product system only.** Card system, PLP, PDP, ProductVariantSelector, ProductPurchaseBox, gallery, trust cards, badges, empty states. Header/Footer/Homepage deferred to FRONT-CP2.

## Part 3 — Gap analysis (current FRONT-CP1 vs reference) + plan

| Area | Current (CP1) | Reference | Action |
|---|---|---|---|
| Palette | mono-olive | green + warm accents | add `store-*` tokens; restyle product UI |
| Card image | `object-cover` (cropped) | `contain` on white, padded | switch to contained packaged-goods look |
| Card structure | minimal foot | fav + flags + category-on-image + meta + foot states | port official anatomy |
| Toman | `<img>` | CSS mask (`currentColor`) | add `.store-toman` mask span |
| Badges | olive/gold pills | semantic (bestseller/discount/special/new/gift) | map to semantic tones |
| CTA states | view/add | +add / مشاهده / تماس بگیرید / OOS | map honestly to product state |
| PDP | olive sections | green warm hierarchy, refined gallery/badges | restyle visually, keep sections + SEO |
| PLP | olive grid | warm header/filters, 2→3→4 grid | restyle + grid rhythm |

**Honesty rules preserved:** simple in-stock → real add-to-cart; variant product → **مشاهده** (safe, no fake variant add); no fake price/discount/stock/rating/badge/timer/installment; ProductGroup/hasVariant + BreadcrumbList JSON-LD untouched; Latin slugs; ۱۳۱۳ heritage (never ۱۳۰۵).
