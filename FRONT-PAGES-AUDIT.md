# FRONT-PAGES-CP1 — Reference verification & route map

## Part 1 — Reference verification
- Archive present in project: `design-export/` with `index.html` ✓, `pages/` (29 HTML) ✓, `assets/` ✓ (copied in CP1.2).
- `index.html` is the gallery navigator only; the real pages live under `design-export/pages/*.html` and were inspected per route below.
- No missing references; no zip.

## Part 2 — Route map

| Archive page | Purpose | Next route | Exists? | Status this CP | Data source | Notes / deferral |
|---|---|---|---|---|---|---|
| home-preview.html | Home | `/` | ✓ | unchanged (globals/HomepageBlocks) | GlobalSetting | Verify only; FRONT-CP2 for identity |
| products.html | Shop/PLP | `/products` | ✓ | **visually rescued** | Prisma | hero+chips+grid+trust band |
| category.html | Category archive | `/products?cat=` | ✓ (param) | category-state polished | Prisma | No `/category/[slug]` route built (param-based, documented) |
| single-product.html | PDP | `/products/[slug]` | ✓ | **visually rescued** | Prisma | ProductGroup/hasVariant preserved; safe variant CTA |
| about.html / about-concepts.html | About | `/about` | ✓ (stub) | **rebuilt** (real story, ۱۳۱۳) | getBusinessInfo | no fake claims |
| faq.html | FAQ | `/faq` | ✗ | **new** | FAQGroup (GENERAL) | FAQPage JSON-LD only from real items |
| terms.html | Terms | `/terms` | ✓ (stub) | **polished** | static sections | marked admin-editable; no fake legal promises |
| page-contact.html | Contact | `/contact` | ✓ (stub) | **rebuilt** | getContactInfo + given data | form honest (no backend → disabled + direct channels) |
| login.html | Auth | `/auth` | ✓ | unchanged | OTP/session | polish only if needed; logic preserved |
| 404.html | Not found | `not-found.tsx` | ✓ (stub) | **polished** branded | — | store palette |
| cart-preview.html | Cart | `/cart` | ✓ | visual polish (light) | localStorage cart | no data-model change |
| checkout-preview.html | Checkout | `/checkout` | ✓ | visual polish (light) | existing | no payment/order change |
| page-payment-success.html | Payment success | `/payment/success` | ✗ | **new** safe display | — | no fake transaction data |
| page-payment-failed.html | Payment failed | `/payment/failed` | ✗ | **new** safe display | — | no fake transaction data |
| content-preview.html | Blog article | `/blog/[slug]` | ✓ | light polish | Post | Article JSON-LD preserved |
| recipe-preview.html | Recipe | `/recipes/[slug]` | ✗ | **deferred** | — | CONTENT-CP1 (no recipe system) |
| what-to-cook(-results) | Assistant | `/what-to-cook` | ✗ | **deferred** | — | ASSISTANT-CP1 (no backend) |
| _hf.html / header-footer.html | Header/Footer | layout | ✓ | unchanged | globals | FRONT-CP2 |
| bottom-bar-mobile.html | Mobile bottom bar | — | ✗ | **deferred** | — | FRONT-CP2 / MOBILE-UX |
| chat-compare / chat-standalone | Chat | — | ✗ | **deferred** | — | CHAT-CP1 |
| admin-settings / product-admin-* / recipe-editor | Admin | `/admin/*` | ✓ (custom) | **untouched** | — | current admin already advanced; archive = visual memory only |

## Decisions
- **Category route:** stays parameter-based `/products?cat=` (both `cat` & `category` accepted); no new `/category/[slug]` route (avoids overbuild; documented).
- **Palette:** reuse the FRONT-VISUAL `store-*` storefront tokens (forest-green/warm-stone/clay-gold) for public pages. **No global dz token change; admin/header/footer/homepage untouched** (header/footer identity = FRONT-CP2).
- **Data honesty:** real data only (globals, FAQ, posts, products). Missing data → safe empty/managed states or deferral. No fake ratings/reviews/discounts/stock/transactions/recipes.
