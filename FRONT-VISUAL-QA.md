# FRONT-VISUAL-CP1 — Visual Audit (product storefront)

Screenshots captured with local headless Chrome (no package installed):
`scratchpad/cur-plp.png`, `cur-pdp.png`, `cur-plp-mobile.png` (current) vs
`ref-products.png`, `ref-single.png`, `ref-category.png` (design-export).

## What looks wrong now
**PLP (`/products`)**
- Page reads **sparse / unfinished**: a thin 2-wide card grid sits top-left with a large empty white expanse below — no visual weight.
- **Plain text header** ("محصولات دشت‌زاد") on white — no hero, no warmth, no brand/heritage cue.
- Filter **sidebar looks like an admin card**, not a storefront panel; no horizontal category chips.
- No bottom content → page bottom is dead space before the footer.

**PDP (`/products/[slug]`)**
- **Purchase box reads like a plain form card**, not a premium buying surface; price not dominant enough.
- Hero hierarchy weak: title/category/SKU not clearly staged.
- Trust mini-cards are a small 2×2 grid that feels like generic icon boxes.
- Content sections (معرفی/نظرات) are thin text with lots of empty space; not editorial/calm.
- Gallery is fine (contained on white) but lacks a premium frame.

**Both:** quiet to the point of looking unstyled; not yet "designed".

## What the reference does better
- **Warm category/page hero** (icon/eyebrow + title + count + heritage), then horizontal **category chips**.
- **Dense, balanced grid** (3–4 columns) that fills the page width.
- **Designed filter panel** (clean sections) on the start side.
- PDP: a **distinct green-bordered purchase panel**, gallery with thumbs, a **warm full-width trust band**, **editorial content** with section headers, and a closing **brand/SEO text block**.
- Consistent warm-stone surfaces, forest-green actions, clay/gold accents, Kalameh headings.

## Exact visual fixes planned (in scope, honest)
**Card (faithful port already correct) → polish:** tighten vertical rhythm, stronger Kalameh title, calmer category/badge, designed price↔action footer, subtle premium hover. No fake rating/installment/discount/favorite.

**PLP:** premium warm **hero band** (eyebrow «از ۱۳۱۳» + Kalameh title + real count), horizontal **category chips**, restyled **filter panel**, **3-column** grid (wider container), branded **empty state**, and a closing **«چرا دشت‌زاد؟» trust band** to give the page real weight (reuses StoreTrustCard — real brand promises, not fake data).

**PDP:** distinct **green-bordered purchase panel** with dominant price, stronger **hero** (category + Kalameh title + subtle SKU + badge), **full-width warm trust band**, calmer **editorial sections** with section rules, sticky purchase on desktop, gallery frame polish.

**Palette/typography:** store-* forest-green/warm-stone/clay-gold only; Kalameh headings, IRANYekanX body, consistent radii (store radii), Persian numbers, toman icon. Admin/header/footer/homepage untouched.

## Out of scope (won't copy)
- Advanced facets from the reference (price slider, rating filter, نشان‌ها, منطقه کشت) — would need data/features not present.
- Taste-profile bars, spec tables, tabbed content, countdown timers, installment, ratings — **no backing data**; rendering them would be fabrication.
- Header/Footer/Homepage/admin/media — untouched.
