# FRONT-UIUX-SYSTEM-CP1 — UI/UX consistency audit

## Clean-state confirmation
- Schema **untouched** (no `ProductDetailBlock`); the PRODUCT-DETAIL-CP1 schema edit never applied. DB has **0 variants** (no demo data). `seed-demo-variants.sql` deleted (never run).

## Visual problems found (repeated / inconsistent patterns)
| Problem | Affected pages | Fix |
|---|---|---|
| Hero "warm band" markup copy-pasted | products, about, contact, faq, terms (5×) | extract **`StorePageHero`** |
| Primary green CTA markup copy-pasted | products, PDP, about, contact, faq, terms, cart, payment×2, ShareButton (10×) | **`.store-btn-primary/.store-btn-secondary`** utility classes |
| Centered status page (icon+title+actions) duplicated | not-found, payment/success, payment/failed (3×) | extract **`StoreStatusPage`** |
| Trust band / values grid duplicated | products (closing band), PDP (trust band), about (values) | extract **`StoreTrustBand`** |
| Inconsistent container max-width | about/terms/faq `max-w-3xl/4xl`, products `max-w-7xl`, PDP `max-w-6xl`, cart `max-w-5xl` | standardize via `StoreContainer` sizes |
| **Checkout still olive** (`dz-*`), looks disconnected | `views/checkout/CheckoutForm.tsx`, `checkout/page.tsx` | align to store palette |
| **Blog still olive** (`dz-*`) | `blog/page.tsx`, `blog/[slug]`, `PostCard.tsx` | align to store editorial palette |
| Section heading "olive bar + title" repeated inline | PDP, about, terms | already have `StoreSection`; reuse the bar consistently |

## Repeated patterns → shared components/utilities to create
- **`StorePageHero`** — eyebrow + Kalameh title + subtitle, warm-stone band (one source of truth).
- **`StoreStatusPage`** — icon + title + body + actions (success/failed/404 style).
- **`StoreTrustBand`** — the 4 brand-promise cards (reuses `StoreTrustCard`).
- **`.store-btn-primary` / `.store-btn-secondary` / `.store-btn-soft`** — button utilities in globals.css (store palette, consistent height/radius/focus).
- **`.store-eyebrow`**, **`.store-section-bar`** small utilities for the recurring eyebrow chip + section heading bar.
- Reuse existing: `StoreContainer`, `StoreSection`, `StoreBreadcrumbs`, `StoreAccordion`, `StoreTrustCard`, product-card system.

## Pages polished this checkpoint
home (verify only — no clash), products (PLP), products/[slug] (PDP), about, contact, terms, faq, cart, **checkout (palette align)**, **blog list + detail (palette align)**, payment success/failed, not-found.

## Responsive baseline
Mobile-first; QA at 360/390/768/1024/**1440 (baseline)**/1920. Containers cap readable width; product grid widens (`max-w-7xl`), editorial/brand pages narrower (`max-w-3xl/4xl`). No horizontal overflow; chips wrap; long SKUs/URLs wrap inside panels.

## Intentionally deferred (out of scope)
- Header/Footer/Homepage **identity reskin** → FRONT-CP2 (chrome stays olive; storefront body = store palette — known temporary mismatch).
- Admin palette/dark mode — untouched.
- Product detail blocks (PRODUCT-DETAIL-CP1), variant cart (CART-CP1), payment gateway — not in scope.

## Honesty / SEO
No fake ratings/reviews/discounts/stock/weight-chips/taste/transaction data. ProductGroup/hasVariant + BreadcrumbList + FAQPage(real) preserved; canonical Latin; no ۱۳۰۵ (heritage ۱۳۱۳).
