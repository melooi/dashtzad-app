# FRONT-HF-LOCK-CP1 — Audit (FRONT-HF-LOCK-QA.md)

> Part-1 AUDIT for checkpoint **FRONT-HF-LOCK-CP1**. Scope: build & visually lock ONLY the public **Header + Footer + mobile navigation + mega menu**, admin-driven. **No code is written in Part 1.** This document must be accurate enough to drive implementation in Part 2.
>
> Hard project rules carried into this audit:
> - Brand name always with ZWNJ: «دشت‌زاد». Heritage year is **۱۳۱۳** — NEVER ۱۳۰۵.
> - Header / Footer / Nav are **STOREFRONT** → must use **store-\*** tokens (forest green `#15803d` + warm stone + clay/gold), NOT admin **dz-\*** (olive `#4a6340`).
> - Honest data only: no fake counts/badges/socials/menus. Empty social → hide. Missing icon → meaningful fallback.
> - Pricing stored as rial integer, displayed toman (÷10) — not directly relevant to chrome except cart badge count.
> - RTL Persian UI; code/files/vars in English. Tailwind CSS 4 `@theme`, Next.js 16 App Router, React 19, TS strict, Prisma + Postgres (client at `src/generated/prisma`).

---

## 1. Reference Audit

### 1.1 Design-export files found & inspected

| File | What it covers | Inspected |
|---|---|---|
| `design-export/pages/_hf.html` | The ONLY source of real chrome: builds header/footer/mobile/drawer/bottom-nav/mega via JS into `#hf-header` / `#hf-botnav`. Context switch `?ctx=main\|blog`. | ✅ Yes |
| `design-export/pages/header-footer.html` | HF preview host page. | ✅ Yes |
| `design-export/pages/bottom-bar-mobile.html` | Mobile bottom-nav preview. | ✅ Yes |
| `design-export/pages/dashtzad-chat-standalone.html` | Chat widget standalone (DEFERRED — not this checkpoint). | ✅ Yes |
| `design-export/pages/home-preview.html` | Home body only — **NO chrome** (starts at `<main class="dz-home">`). Correctly uses ۱۳۱۳. | ✅ Yes |
| `design-export/pages/products.html` | PLP card-style demo — **NO chrome**. | ✅ Yes |
| `design-export/pages/category.html` | Category body — **NO chrome** (page-level `dz-cat-hero` is a banner, not site header). Uses ۱۳۰۵ (wrong). | ✅ Yes |
| `design-export/pages/single-product.html` | PDP body + preview toolbar — **NO chrome**. Uses ۱۳۰۵ (wrong). | ✅ Yes |
| `design-export/assets/css/app.css` | Token bundle (palette, type, spacing, radius, shadow, z-scale). | ✅ Yes |
| `design-export/assets/css/input.css` | Tailwind source / `@theme`. | ✅ Yes |
| `design-export/assets/css/components/layout/header.css` | Header + promo + mobile-head + drawer + mega styles. | ✅ Yes |
| `design-export/assets/css/components/layout/footer.css` | Footer styles. | ✅ Yes |
| `design-export/assets/css/components/layout/bottom-bar.css` | Liquid-glass bottom nav + chat sheet. | ✅ Yes |
| `design-export/assets/js/app.js` | 7-line empty IIFE stub — **no header logic to port**. | ✅ Yes |
| `design-export/assets/js/chat.js` | Chat widget logic only (drawer/popover/matchMedia patterns worth porting). | ✅ Yes |
| `design-export/assets/icons/icon-map.json` | Role→RemixIcon map; fallback `ri-circle-line`. | ✅ Yes (referenced) |

**Critical finding:** the four page mockups carry **NO chrome at all**. Header/footer/nav/mega exist ONLY in `_hf.html`. Cross-checking the mega menu "in context" on those pages is impossible — verify only against `_hf.html` (`?ctx=main`).

### 1.2 What the reference HEADER contains (desktop)

`<header class="dz-header" data-context="main|blog">` — `position:sticky; top:0; z-index:40`, white surface, hairline bottom border. Built in 3 stacked layers by `headerHTML()`:

**LAYER 1 — Announcement / promo bar** (`.dz-promo > .dz-promo__inner`), dark-ink background `#292524`, two items, RTL:
- Right (`--right`, honey `#fbbf24`, weight 600): desktop «ارسال رایگان برای سفارش‌های بالای ۷۰۰٬۰۰۰ تومان» / mobile «ارسال رایگان بالای ۷۰۰٬۰۰۰ تومان» (swapped via `--desktop`/`--mobile` spans).
- Left (`--left`, hidden on mobile): «مستقیم از باغ‌های دماوند — بدون واسطه».

**LAYER 2 — Main bar** (`.dz-header__bar > .dz-header__inner`), 3 RTL zones, `max-width 84rem`:
- **Brand** (`.dz-brand`): seal chip (`.dz-brand__seal`, icon role `nav.about`, 2.9rem, primary bg, inverse text) + name «دشت‌زاد» (`.dz-brand__name`, display font, weight 800) + tagline «از باغ خانوادگی تا سفره شما — ۱۳۰۵». ⚠️ Tagline year ۱۳۰۵ is WRONG → must become **۱۳۱۳**.
- **Search** (`form.dz-search` role=`search`): leading icon (role `action.search`) + input (`type=search`) placeholder «جستجو در فروشگاه دشت‌زاد…». `flex:1`, focus-within border → primary.
- **Actions** (`.dz-header__actions`): (1) commerce button `.dz-action--commerce` — MAIN = cart (icon `action.cart` + «سبد خرید» + count pill); BLOG = shop (icon `nav.shop` + «فروشگاه دشت‌زاد»). (2) account ghost `.dz-action--ghost` (icon `action.account` + «ورود»). No phone element in this row.

**LAYER 3 — Nav row** (`nav.dz-nav--desktop > .dz-nav__inner`), hairline top divider, gap 1.6rem, wraps. Each `.dz-nav__link` = leading role icon + label; modifiers `--bold`, `is-current`, `--ai`.

MAIN context nav items (in order) with icon roles:

| # | Label | Icon role | Notes |
|---|---|---|---|
| 1 | خانه | `nav.home` | `--bold` + `is-current` |
| 2 | فروشگاه | `nav.shop` | **mega trigger** (caret `ui.caret`) |
| 3 | فروش ویژه | `nav.special-sale` | |
| 4 | مجله | `nav.magazine` | cross-links to blog ctx |
| 5 | خرید عمده | `nav.bulk-order` | |
| 6 | هدایای سازمانی | `nav.corporate-gifts` | |
| 7 | درباره ما | `nav.about` | |
| 8 | تماس با ما | `nav.contact` | |

BLOG context nav (separate array): خانه مجله (`nav.magazine`, bold/current) · دسته‌ها (`blog.categories`) · امروز چی بپزم؟ (`blog.what-to-cook`) · پرونده‌ها (`blog.dossiers`) · آموزش تصویری (`blog.video`) · ترفندها (`blog.tips`) · دستیار آشپزی هوشمند (`blog.ai-assistant`, `--ai`).

> ⚠️ Mega trigger label in the export is **«فروشگاه»**, not «دسته‌بندی محصولات». Confirm the desired label before coding (recommend keeping «فروشگاه» to match export, OR a dedicated «دسته‌بندی محصولات» trigger — open question 7.x).

### 1.3 What the reference FOOTER contains

`<footer class="dz-footer" data-context="main|blog">`, warm surface `#fafaf9`, hairline top border, two regions:

**A) `.dz-footer__main > .dz-footer__cols`** (grid: 1col → 2col @40rem → `1.4fr 1fr 1fr 1fr` @64rem):
- **Brand column** (`.dz-footer__brandcol`, spans full until 64rem): seal (role `nav.about`) + name «دشت‌زاد»; intro paragraph.
  - MAIN intro: «دشت‌زاد؛ روایت چهار نسل از ۱۳۰۵. برنج، حبوبات، خشکبار، چای، ادویه و آجیل مرغوب — از باغ خانوادگی تا سفره شما، بدون واسطه.»
  - BLOG intro: «مجله دشت‌زاد؛ روایت یک نسل از ۱۳۰۵. …»
  - ⚠️ Both intros say ۱۳۰۵ → must become **۱۳۱۳**.
  - **Social block** (`.dz-social`): label «دشت‌زاد در شبکه‌های اجتماعی:» + row of 4 icon-only links: اینستاگرام (`social.instagram`), تلگرام (`social.telegram`), واتساپ (`social.whatsapp`), لینکدین (`social.linkedin`), each with `aria-label`. **Honest-data: hide any social with no admin URL.**
- **Link columns** (`.dz-fcol`, mobile accordion via hidden checkbox `.dz-fcol__toggle`; opens flat @40rem):
  - MAIN col 1 «دسته‌بندی‌ها»: برنج، حبوبات، خشکبار، چای و دمنوش، ادویه و زعفران، آجیل.
  - MAIN col 2 «راهنما و پشتیبانی»: پرسش‌های متداول، قوانین و مقررات، تماس با ما، پیگیری سفارش، سبد خرید.
  - MAIN col 3 «درباره دشت‌زاد»: داستان ما، فروشگاه دشت‌زاد، مجله دشت‌زاد.
  - BLOG cols differ (دسته‌بندی‌ها / بخش‌های مجله / درباره دشت‌زاد).

**Trust badge** (`.dz-trust`, MAIN only, hidden in blog): icon role `footer.trust` + title «نماد اعتماد الکترونیکی» + sub «فروشگاه دارای مجوز رسمی».

**B) `.dz-footer__bottom`** (dark-ink bg, centered): «© تمامی حقوق برای این فروشگاه محفوظ است · ۱۳۹۷–۱۴۰۵» + sub «دشت‌زاد کشت و تجارت ایرانیان».

> ⚠️ There is **no «از ۱۳۱۳» heritage line** anywhere in the export footer — heritage appears only as the (wrong) ۱۳۰۵ tagline/intro. The CURRENT `Footer.tsx` fallback already uses the correct «از سال ۱۳۱۳». In the rebuild, the heritage year MUST be ۱۳۱۳ wherever it appears (tagline, footer intro, brand stamp).

### 1.4 Reference mobile header + drawer + bottom nav

Breakpoint = **64rem**. Below it: mobile header + drawer + bottom nav. Above it: desktop bar + nav + mega. Whole mobile system is **no-JS / checkbox-driven** (`#dz-mnav`, nested `#dz-shop-acc`, `#dz-chat`, `#fcol{n}`).

**Mobile header** (`.dz-mhead`):
- `.dz-mhead__row`: hamburger (`label.dz-mhead__menu for="dz-mnav"`, icon `mobile.menu`, aria «منو») · center brand (name «دشت‌زاد» + small seal `nav.about`) · actions (commerce icon-button — MAIN cart `action.cart` aria «سبد خرید» / BLOG shop `nav.shop` aria «فروشگاه»; then account `action.account` aria «حساب»).
- `.dz-mhead__search`: second row, `form.dz-search--mobile`, placeholder «جستجو در فروشگاه دشت‌زاد…».

**Right-side drawer** (`aside.dz-drawer`, toggled `#dz-mnav`, backdrop `.dz-drawer-backdrop`, `width min(86vw,22rem)`, slides `translateX(100%)→0`):
- **Head**: brand (small seal + «دشت‌زاد») + close label (`for=dz-mnav`, icon `mobile.close`, aria «بستن»).
- **Body**:
  1. Account row `a.dz-drawer__account`: icon `action.account` + «ورود / ثبت‌نام» + arrow `ui.arrow-go`.
  2. Section label «دسترسی سریع».
  3. Links from same NAV array (in MAIN the bold/home «خانه» is skipped). Plain items = `a.dz-drawer__link`. The «فروشگاه» mega item becomes an **accordion** (`.dz-dacc`, nested checkbox `#dz-shop-acc`): head «فروشگاه» + caret; panel = «همه محصولات فروشگاه» link (+arrow) + `.dz-dacc__cats` grid of 6 category links (toned icon chip + label).
  4. Utility group `.dz-drawer__util`: «پیگیری سفارش» (`drawer.track-order`) + «پشتیبانی و تماس با ما» (`nav.contact`). **Contact/support lives here on mobile.**
- No in-drawer chat; no in-drawer search (search is in `.dz-mhead__search`).

**Bottom nav** (`nav.dz-bottomnav`, aria «ناوبری پایین»): floating two-layer **Liquid-Glass capsule**, fixed, `inset-inline 1rem`, `max 34rem` centered, height `3.7rem`, visible ONLY <64rem; body gets `padding-block-end ~5.4rem` to clear it. Exactly **5 tabs**:

| # | Label | Icon role | Type |
|---|---|---|---|
| 1 | خانه | `botnav.home` | link, `is-active` |
| 2 | دسته‌بندی | `botnav.categories` | link |
| 3 | گفت‌وگو | `botnav.chat` | **label** `for="dz-chat"` (center, opens chat sheet) — DEFERRED |
| 4 | سبد خرید | `botnav.cart` | link + badge (clay) «۲» ← placeholder, must be real cart count |
| 5 | حساب | `botnav.account` | link |

### 1.5 Reference mega menu structure

Attached to the «فروشگاه» desktop nav item only (`.dz-mega` wrapper). **Pure CSS, hover/focus-within open** — no JS in export.

- **Trigger**: `button.dz-nav__link.dz-mega__trigger`, `aria-haspopup=true` = icon `nav.shop` + «فروشگاه» + caret `ui.caret`.
- **Panel** (`.dz-mega__panel`): absolute, drops below link, `z-index 50`, `inline-size min(58rem,92vw)`, paper bg, hairline border, radius-lg, popover shadow, padding 1rem; reveal via opacity/translateY transition.
  - Top CTA `.dz-mega__all`: «همه محصولات فروشگاه» + arrow `ui.arrow-go` (primary-soft pill → primary on hover).
  - Grid `.dz-mega__grid` (2 columns): 6 toned category cards `a.dz-megacat` = `.dz-megacat__ic--{tone}` chip + label:

| Category | tone class | chip bg → text |
|---|---|---|
| برنج | `--rice` | amber-soft `#fef3c7` → gold-deep `#b45309` |
| حبوبات | `--legume` | primary-soft `#dcfce7` → primary-hover |
| خشکبار | `--nuts` | clay-soft `#ffedd5` → clay-deep `#9a3412` |
| چای و دمنوش | `--tea` | mix(success 16%, white) → success |
| ادویه و زعفران | `--spice` | amber-soft → warning |
| آجیل | `--ajil` | mix(secondary 16%, white) → secondary `#7a5538` |

No featured cards, no multi-level columns — single "all" parent + flat 6-up toned grid. **The same CATS set is reused in the mobile drawer shop accordion.** Blog nav has NO mega.

### 1.6 Reference palette / typography / spacing (port to `store-*`)

> The export names tokens **`dz-*`** but the VALUES are the storefront forest-green palette. Remap every value to a **`store-*`** Tailwind 4 `@theme` token. `store-primary #15803d`, `-hover`, `-soft`, `-deep`, `-tint` already exist in `globals.css:140-144`; the rest below must be added/confirmed.

**Palette values to map → `store-*`:**

| Export token (value) | Suggested `store-*` |
|---|---|
| `#15803d` primary | `store-primary` ✅ exists |
| `#166534` primary-hover | `store-primary-hover` ✅ |
| `#dcfce7` primary-soft | `store-primary-soft` ✅ |
| `#14532d` primary-deep / `#0c3a1f` deepest / `#f0fdf4` tint | `store-primary-deep` / `-deepest` / `-tint` |
| `#7a5538` secondary (clay-brown) | `store-secondary` |
| `#b45309` accent / gold-deep | `store-accent` |
| `#fdfcf9` bg / `#ffffff` surface/paper / `#f5f5f4` surface-soft / `#fafaf9` surface-warm | `store-bg` / `store-surface` / `store-surface-soft` / `store-surface-warm` |
| `#292524` text / `#57534e` muted / `#78716c` faint / `#ffffff` inverse | `store-text` / `-muted` / `-faint` / `-inverse` |
| `#e7e5e4` border / `#d6d3d1` border-strong / `#ece3d4` border-soft | `store-border` / `-strong` / `-soft` |
| `#c2410c` clay (cart/count badges) / `#ffedd5` clay-soft / `#9a3412` clay-deep | `store-clay` / `-soft` / `-deep` |
| `#f59e0b` gold / `#fbbf24` honey (promo right text) / `#fef3c7` amber-soft | `store-gold` / `store-honey` / `store-amber-soft` |
| `#166534` success / `#b45309` warning | `store-success` / `store-warning` |
| `rgba(47,38,31,0.58)` overlay (drawer/chat backdrop) | `store-overlay` |
| Glass set (bottom-nav): bar `rgba(255,255,255,.5)`, edge `.7`, highlight `.45`/`1`, inner `.25`, clear `0` | `store-glass-*` |
| Shadow ink faint/soft/strong `rgba(28,25,23,.05/.16/.24)` | `store-shadow-ink-*` |
| Channels: whatsapp `#25d366`, telegram `#229ed9` | brand-channel constants |

**Typography:** body = `"Yekan Bakh"` (`--font-store-primary`); display/headings/brand/prices = `"Kalameh","Yekan Bakh"` (`--font-store-display`); both owner woff2, `font-display:swap`. Type scale tokens: display 3rem, h1 2.25, h2 1.75, h3 1.375, body 1, body-sm .875, caption .75, price 1.125, button .9375. Line-heights: tight 1.35, normal 1.8, relaxed 2. Chrome uses many literal rem sizes (.72–1.6rem).

**Spacing/radius/shadow:** spacing scale 1→20 in .25rem steps; standard page inline gutter `clamp(1rem,4vw,2.5rem)`; container inner `84rem` (`--container-store-xl`). Radius: xs .375 / sm .5 / md .75 / lg 1 / xl 1.5 / card 1.5 / modal 1.75 / pill 999rem. Borders: hairline `.0625rem`, medium `.125rem`. Shadow `popover = 0 1rem 3rem rgba(47,38,31,.14)` (mega + drawer). Motion: fast 120 / normal 200 / slow 320ms; drawer slide `cubic-bezier(.32,.72,0,1)`. **z-index scale: header 40, dropdown 50, sticky-cta 60, drawer 70, modal 80, toast 90** (bottom-nav uses toast 90). All RTL, logical properties, no px.

### 1.7 What the CURRENT Header/Footer/mobile GET WRONG

**Header (`src/components/Header.tsx`, `"use client"`; imported by `src/app/(public)/layout.tsx` as `@/components/Header`):**
- ❌ Uses **dz-\*** (admin olive) tokens everywhere — must be **store-\***.
- ❌ No shop-vs-blog split: single flat `mainNav`. `secondaryNav` is fetched but never passed/used.
- ❌ No mega menu / dropdowns: `n.children` is never rendered though the tree + child data exist.
- ❌ Mobile is a weak inline non-collapsing text row (`md:hidden`), not a real drawer/hamburger or bottom nav; overflows; no mobile cart/account/search structure.
- ❌ No search affordance anywhere.
- ❌ Icons generic only (ShoppingCart + User); ignores `n.icon` entirely.
- ❌ Logo-only branding, no wordmark/tagline/seal.
- ❌ Cart count + user fetched client-side after mount (hydration flash); cart/account hrefs hardcoded.
- ❌ Not visually premium (flat white/85 backdrop, no clay/gold depth).

**Footer (`src/components/Footer.tsx`, server component; imported by `src/app/(public)/layout.tsx` as `@/components/Footer`):**
- ❌ Uses **dz-\*** tokens.
- ❌ Social icons are GENERIC lucide stand-ins (instagram→Camera, telegram→Send…), not brand glyphs.
- ❌ Newsletter is display-only, no working form.
- ❌ `secondaryNav` (footerMenuSecondaryId) fetched but never rendered — second column dropped.
- ❌ Trust seals enamad/anjoman hardcoded static images, not admin-conditional.
- ❌ Plain flat 4-col grid, no warmth/depth; mixes hardcoded marketing copy via fallback.

**Mobile:**
- ❌ No hamburger/off-canvas drawer and no bottom nav at all.
- ❌ Only an inline text row duplicating links; no icons/nesting/overflow handling.
- ❌ No mobile search / categories / structured menu.
- ❌ Wrong dz-\* palette; footer just stacks to 1 column, no accordions.

---

## 2. Barjil-Inspired Mega Menu Analysis

> Conceptual UX analysis of the well-known **Barjil** large-grocery mega-menu pattern. Derived from the known pattern only — **no Barjil files were read**, and nothing from Barjil is copied.

### 2.1 Which UX-pattern parts are useful

- **Persistent category trigger** in the primary nav that opens a wide panel (matches our «فروشگاه» trigger).
- **Parent column + subcategory panel** model: a left/lead column of top-level categories whose hover/focus swaps the adjacent panel to that category's children — scales far better than a flat list for a large food catalog.
- **Multi-column subcategory layout** inside the panel (grouped headings + links), useful if Dashtzad grows beyond the current 6 categories (برنج/حبوبات/خشکبار/چای/ادویه/آجیل) into sub-levels (e.g. آجیل → پسته/بادام/فندق…).
- **"View all" affordance** per category and an overall «همه محصولات فروشگاه» — matches our `.dz-mega__all`.
- **Clear active/hover states** on the parent column so the user always knows which group is shown.
- **Large food-commerce scale handling**: panel sized to content, hover-open with small intent delay, keyboard + focus-within fallback.

### 2.2 What MUST NOT be copied

- ❌ No Barjil HTML/CSS/JS, class names, DOM structure, or component code.
- ❌ No Barjil exact visual design, spacing system, colors, imagery, or iconography.
- ❌ No Barjil brand assets, copy, or category taxonomy.
- ❌ No screenshot-tracing into pixel-identical layout. Only the abstract interaction pattern (trigger → parent column → subcategory panel → view-all) is reused.

### 2.3 How Dashtzad's version must differ

- **Palette**: store-\* forest-green + warm stone + clay/gold tones; per-category toned chips already defined in §1.5 (rice/legume/nuts/tea/spice/ajil).
- **RTL-first**: parent column on the right, panel opens to the inline-start; all logical properties; caret/arrow mirrored.
- **Admin-driven**: categories, labels, hrefs, icons, and order come from a `MenuItem` tree (parent = category, children = sub-links), NOT hardcoded. The export's flat 6-up grid is the minimum; the parent→children tree enables Barjil-style sub-panels when admin adds children.
- **Honest data**: render only real categories the admin configured; no fake "featured" cards, no fake counts/badges unless admin supplies a real `badge`.
- **Meaningful icons**: per-category icon resolved from a curated allow-list (§4.6), with category-type fallback — never a broken/blank icon.
- **Our taxonomy**: Dashtzad food categories (saffron, nuts, legumes, spices, rice, tea, dried fruit, coffee, gifts, ready packs), not a generic grocery taxonomy.
- **Pure-CSS or minimal-JS**: prefer CSS hover/focus-within parity with the export; add JS only for accessibility (Escape-to-close, focus management) that the export lacks.

---

## 3. Admin Data Audit

### 3.1 Menu model capabilities (verbatim)

```
Menu {
  id        String @id @default(uuid())
  title     String
  slug      String @unique            // Latin-only (slug policy)
  location  MenuLocation @default(CUSTOM)
  isActive  Boolean @default(true)
  sortOrder Int @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  items     MenuItem[]
  @@index([slug]); @@index([location])
}
```

Admin Menu Manager (`/admin/collections/menus`): list/create/edit/delete; MenuForm fields = title, slug (auto), location, sortOrder, isActive. Delete blocked if referenced by header/footer menu IDs (`menuUsage` guard). Per-menu `MenuItemsManager`: add/edit/delete items, **two-level** parent/child tree, reorder siblings via up/down (`moveMenuItem`). Server actions enforce same-menu parent + no self-parent + child cascade; revalidate `/`.

### 3.2 MenuItem fields (verbatim + presence audit)

```
MenuItem {
  id        String @id @default(uuid())
  menuId    String
  parentId  String?                   // self-FK for nested items
  label     String
  href      String
  linkType  MenuLinkType @default(CUSTOM)
  target    LinkTarget @default(SELF)
  icon      String?
  isActive  Boolean @default(true)
  sortOrder Int @default(0)
  createdAt DateTime; updatedAt DateTime
  menu      Menu  @relation(... onDelete: Cascade)
  parent    MenuItem? @relation("MenuItemTree", ... onDelete: Cascade)
  children  MenuItem[] @relation("MenuItemTree")
  @@index([menuId]); @@index([parentId])
}
```

| Field | Present? | Notes |
|---|---|---|
| `icon` | ✅ Present (`String?`) | Free-text lucide name via AutoIconField; **not rendered by Header today**. |
| `parentId` / parent self-relation | ✅ Present (`@relation("MenuItemTree")`) | Backbone for mega-menu groups; manager caps at 2 levels. |
| `isActive` | ✅ Present | Global on/off only. |
| desktop visibility | ❌ Absent | No `desktopVisible`. |
| mobile visibility | ❌ Absent | No `mobileVisible`. |
| `badge` | ❌ Absent | No badge/label field. |
| `description` | ❌ Absent | No sub-line field. |
| `sortOrder` | ✅ Present (schema) | NOT exposed in item editor; ordering only via up/down buttons. |
| `target` | ✅ Present (`LinkTarget` SELF/BLANK) | Editable. |
| `href` (url) | ✅ Present (required) | Validated internal path / absolute / tel: / mailto: / #anchor. |
| `linkType` | ✅ Present | INTERNAL/EXTERNAL/CATEGORY/PRODUCT/POST/RECIPE/PAGE/CUSTOM. |

### 3.3 MenuLocation enum — current + checkpoint needs

**Current values (verbatim):** `HEADER_MAIN`, `HEADER_SECONDARY`, `FOOTER_PRIMARY`, `FOOTER_SECONDARY`, `MOBILE`, `CUSTOM`.

> ⚠️ The enum is **classification metadata only** — no resolver queries menus by location; Header/Footer bind menus by **explicit ID** (`mainMenuId`, etc.). There is **no `getMenuByLocation` helper**.

| Proposed value | Verdict |
|---|---|
| `MEGA_MENU` | **Do NOT add** — mega content is modeled as `MenuItem.parent/children` under a `HEADER_MAIN` menu. Unnecessary. |
| `MOBILE_BOTTOM` | **Optional** — add ONLY if the bottom tab bar needs its own classifiable Menu distinct from `MOBILE` (which serves the drawer). If `MOBILE` is reused for both, do NOT add. **Recommendation: reuse `MOBILE` or wire a `bottomNavMenuId` global; default = no enum change.** |

### 3.4 Header global fields (current)

`GlobalSetting key="header"` (Zod `headerSchema`): `logoVariant` (full|mark|1313), `mainMenuId`, `secondaryMenuId`, `showSearch` (default true), `showCart` (true), `showAccount` (true), `showAnnouncement` (false), `stickyHeader` (true), `mobileMenuStyle` (drawer|accordion), `ctaLabel`, `ctaHref`, `phoneLabel`, `phoneHref`. Admin page `/admin/globals/header` (generic GlobalSettingPage).

### 3.5 Footer global fields (current)

`GlobalSetting key="footer"` (Zod `footerSchema`): `footerMenuPrimaryId`, `footerMenuSecondaryId`, `showBusinessInfo` (true), `showContactInfo` (true), `showSocialLinks` (true), `newsletterTitle`, `newsletterDescription`, `trustBadges` ({title,description,icon}[]), `copyrightText` (default «© دشت‌زاد — تمام حقوق محفوظ است.»), `bottomNote`, `enamadHtml`, `samandehiHtml`. Admin page `/admin/globals/footer`.

### 3.6 Brand / Site / Contact / Business / Social globals (current)

- **brandSettings**: logoUrl, logoDarkUrl, logoLightUrl, iconUrl, faviconUrl, ogImageUrl, primaryColor (`#4a6340` admin default), secondaryColor, brandSlogan, **brandStampText (default ۱۳۱۳)**, footerBrandText, packageTagline, trustStatement.
- **siteSettings**: siteName/siteShortName (دشت‌زاد), tagline, defaultLanguage (locked fa), currency (locked toman), siteUrl, maintenanceMode/Message, **announcementText / announcementHref / announcementActive**, defaultProductSort, productsPerPage, supportHoursShortText.
- **contactInfo**: primaryPhone, supportPhone, salesPhone, whatsapp, email, supportEmail, salesEmail, addressText, workingHours, responseTimeText, contactPageIntro, showContactInHeader (false), showContactInFooter (true).
- **businessInfo**: brandName (دشت‌زاد), legalName, registrationNumber, nationalId, economicCode, address, province/city (تهران), postalCode, mapUrl, **foundedYear (default ۱۳۱۳)**, businessDescription, aboutShortText.
- **socialLinks**: `{ links: SocialLink[] }`; `SocialLink` = platform (instagram|telegram|whatsapp|linkedin|aparat|x|youtube|custom), label, url, icon, isActive (true), sortOrder.

### 3.7 Media / logo storage

Dedicated `MediaAsset` model (MEDIA-CP1): filename (latin), originalName, mimeType, sizeBytes, width?, height?, alt?, title?, caption?, storage (LOCAL|VERCEL_BLOB|S3), path, url (public relative), publicId?, folder?, tags[], usage (PRODUCT|BANNER|HOMEPAGE|**BRAND**|SEO|BLOG|RECIPE|GENERAL), uploadedById?. **Logo URLs are plain strings in brandSettings/header JSON** (logoUrl, logoDarkUrl…), typically pointing at a `MediaAsset.url`. BRAND usage covers logos. **Out of scope to modify media internals** this checkpoint.

### 3.8 MISSING fields needed for final Header/Footer

| Need | Where | Type of change |
|---|---|---|
| Wire announcement `showAnnouncement` (header flag) to `announcementText/Href/Active` (siteSettings) — currently NOT connected | header + siteSettings | **Render-side logic** (no new field; combine existing). Optionally add announcement variant/icon/dismissible → global JSON fields. |
| `showBottomNav` toggle (mobile bottom tab bar) | header | **Global JSON field** (`headerSchema` boolean) |
| `bottomNavMenuId` (attach a MOBILE menu to bottom nav) | header | **Global JSON field** (`menu` picker) |
| Mega-menu enable / per-item layout (featured/columns/image) | menuItem / header | **Schema (additive) + UI**, or model via existing parent/children (preferred minimal: no new model) |
| `badge` on nav items («جدید»/«تخفیف») | MenuItem | **Schema change** (additive nullable `String?`) — render only if real value |
| `description` (mega/footer sub-line per link) | MenuItem | **Schema change** (additive nullable `String?`) |
| `desktopVisible` / `mobileVisible` (per-item responsive) | MenuItem | **Schema change** (additive `Boolean @default(true)`) — only if responsive per-item visibility is in scope |
| Pull header phone automatically from `contactInfo.primaryPhone` | header logic | **Render-side** (avoid re-entering); current `phoneHref/phoneLabel` stay as override |
| Named footer columns beyond 2 menus + column headings | footer | **Global JSON fields** (column titles) — only if 3+ named columns required; export uses 3 columns so likely needed |
| Per-trust-badge link + structured payment/cert logos | footer | **Global JSON fields** — optional, lower priority |
| Newsletter enable toggle + working submit endpoint + subscriber model | footer | **DEFERRED** (display-only this checkpoint; needs backend model — out of scope) |
| Curated icon allow-list for honest icons | AutoIconField | **Admin UI upgrade** (shared lucide allow-list constant) — improves mega/bottom-nav/social honesty |

---

## 4. Implementation Plan

### 4.1 Exact files to change/create

**Storefront components (store-\* palette):**

| Path | Action |
|---|---|
| `src/components/Header.tsx` | Rewrite (existing file): store-\* tokens, 3-layer desktop header, search, brand seal+wordmark+tagline (۱۳۱۳), shop/blog context, mega trigger, server-resolved data. |
| `src/components/Footer.tsx` | Rewrite (existing file): store-\*, brand column + intro (۱۳۱۳) + social (honest hide), 3 link columns (mobile accordion), trust badge (main only), dark-ink copyright. |
| `src/components/storefront/chrome/MegaMenu.tsx` | **Create** (new `storefront/chrome/` subfolder, next to existing `src/components/storefront/*`): hover/focus-within panel, «همه محصولات فروشگاه» + toned category grid from MenuItem tree; Escape/focus a11y. |
| `src/components/storefront/chrome/MobileHeader.tsx` | **Create**: hamburger + center brand + cart/account + search row. |
| `src/components/storefront/chrome/MobileDrawer.tsx` | **Create**: account row, quick-access links, shop accordion, utility (track order + support/contact). Toggle pattern (checkbox or React state). |
| `src/components/storefront/chrome/BottomNav.tsx` | **Create**: liquid-glass 5-tab capsule (home/categories/chat-placeholder/cart+real count/account). |
| `src/components/storefront/chrome/NavIcon.tsx` (or `src/lib/storefront/nav-icons.ts`) | **Create**: resolve curated icon by name/category with meaningful fallback. |

> **Path correction (verified):** the live chrome is `src/components/Header.tsx` + `src/components/Footer.tsx` (imported by `src/app/(public)/layout.tsx`). There is **no** `src/app/(public)/_components/` directory. New chrome subcomponents go under `src/components/storefront/chrome/` to sit beside the existing `src/components/storefront/` shared components.

**Admin UI:**

| Path | Action |
|---|---|
| `src/lib/admin/globals.ts` | Add `headerSchema` fields (`showBottomNav`, `bottomNavMenuId`, optional announcement variant); confirm footer column-title fields if needed. |
| GLOBAL_CONFIGS header/footer field defs | Add new field configs (data-driven, reuse menu picker / checkbox). |
| `AutoIconField` component | Upgrade to curated allow-list picker + preview (optional but recommended). |
| `MenuItemsManager` + `menuItemSchema` | Add optional `badge`, `description` inputs (if schema fields added); optionally relax 2-level cap. |

**Data / lib:**

| Path | Action |
|---|---|
| `src/lib/site-data.ts` | `getHeaderData` must also pass `secondaryNav`; resolve mega tree (children) for the shop menu; optionally add `getMenuByLocation` helper; resolve announcement from siteSettings; resolve `bottomNavMenuId`. |
| `src/app/(public)/layout.tsx` | Pass `secondaryNav`, announcement (wired), bottom-nav data, contact phone to Header. |
| `src/lib/cart` | Cart count for header + bottom-nav badge (already `getCount` + `CART_EVENT`). |

**Schema:**

| Path | Action |
|---|---|
| `prisma/schema.prisma` | Additive MenuItem fields (`badge?`, `description?`, optional `desktopVisible`/`mobileVisible`). No enum add recommended. |

### 4.2 Schema changes

**Additive only — nothing removed.** Suggested single migration name: **`add_menuitem_badge_description_device_visibility`**.

| Change | Detail | Safety |
|---|---|---|
| `MenuItem.badge String?` | Optional nav badge («جدید»/«تخفیف»), render only if real value | New nullable column — fully safe |
| `MenuItem.description String?` | Mega/footer sub-line | New nullable column — fully safe |
| `MenuItem.desktopVisible Boolean @default(true)` | Per-item desktop visibility (only if in scope) | Must include `@default(true)` to backfill existing rows |
| `MenuItem.mobileVisible Boolean @default(true)` | Companion (only if in scope) | `@default(true)` backfills safely |
| MenuLocation enum | **No add recommended** (`MEGA_MENU`/`MOBILE_BOTTOM` unnecessary) | — |

**Postgres enum-add safety statement:** Adding values to an enum is additive and safe (`ALTER TYPE … ADD VALUE`), but in older Postgres a newly added enum value **cannot be used in the same transaction** as its creation; Prisma handles this — just **do not seed the new value in the same migration**. (Moot here since no enum change is recommended.)

**ALREADY PRESENT — do NOT re-add:** `MenuItem.icon`, `parentId` self-relation (`MenuItemTree`), `isActive`, `sortOrder`, `target`, `linkType`; `Menu.location/isActive/sortOrder`. No data migration or destructive change required.

> **Per-piece verdict:** Mega menu, mobile drawer, bottom nav, and shop/blog split need **NO schema change** if modeled via existing `parent/children` + new global JSON fields. Only `badge`/`description` (and optionally device-visibility) justify a schema migration, and only if those features are in scope this checkpoint.

### 4.3 Which data comes from admin

| Chrome element | Admin source |
|---|---|
| Logo | `brandSettings.logoUrl/logoLightUrl` + `header.logoVariant` (full/mark/1313) → `MediaAsset.url` |
| Brand name / stamp / tagline year | `businessInfo.brandName`, `brandSettings.brandStampText` (۱۳۱۳), `businessInfo.foundedYear` (۱۳۱۳) |
| Announcement bar | `siteSettings.announcementText/announcementHref/announcementActive` gated by `header.showAnnouncement` (**wire both**) |
| Main nav (shop) | `header.mainMenuId` → `MenuItem` tree (mega children under «فروشگاه») |
| Secondary / blog nav | `header.secondaryMenuId` → must be passed (currently dropped) |
| Mega categories | Children of the shop MenuItem (parent/children tree); icon per item |
| Search toggle / cart / account | `header.showSearch` / `showCart` / `showAccount` |
| Sticky | `header.stickyHeader` |
| Mobile menu style | `header.mobileMenuStyle` (drawer/accordion) |
| Bottom nav | NEW `header.showBottomNav` + `header.bottomNavMenuId` (MOBILE menu) |
| Header CTA / phone | `header.ctaLabel/ctaHref/phoneLabel/phoneHref` (phone may auto-fill from `contactInfo.primaryPhone`) |
| Footer columns | `footer.footerMenuPrimaryId` + `footerMenuSecondaryId` (+ third column needs new field or third menu slot) |
| Footer brand intro | `brandSettings.footerBrandText` → `businessInfo.businessDescription` → fallback (۱۳۱۳) |
| Footer contact | `contactInfo.*` gated by `footer.showContactInfo` / `contactInfo.showContactInFooter` |
| Footer social | `socialLinks.links` filtered `isActive && url`, sorted; gated by `footer.showSocialLinks` (**hide if empty**) |
| Trust badge / seals | `footer.trustBadges`, `enamadHtml`, `samandehiHtml` (render structurally; enamad/anjoman currently hardcoded — make admin-conditional) |
| Copyright / bottom note | `footer.copyrightText`, `footer.bottomNote` |
| Cart count (header + bottom-nav badge) | Real cart state via `@/lib/cart` `getCount()` + `CART_EVENT` (replace placeholder «۲») |

### 4.4 Which parts are visual-only (no data)

- Liquid-glass capsule styling, sheen pseudo-element, shadows, blur of the bottom nav.
- Promo/announcement bar **layout & styling** (text is admin; the chrome is visual).
- Toned category chip colors in mega + drawer (`--rice/--legume/...` mappings).
- Brand seal chip shape, search-field framing, focus rings, hover transitions, caret rotations, drawer slide/backdrop animation.
- Section dividers, container widths, RTL logical-property layout, breakpoint behavior (64rem, footer 40rem).
- Copyright dark-ink bottom band style (text is admin).

### 4.5 Which parts are DEFERRED

- **Chat** = placeholder only this checkpoint. The bottom-nav «گفت‌وگو» center tab renders as a **visual placeholder / inert affordance** (or hidden behind a flag); full chat widget (panel, composer, attention/teaser, proactive messages, settings drawer) → **CHAT-CP1**.
- **Newsletter submission** (endpoint + subscriber model) — display-only text remains; no working form this checkpoint.
- **Desktop floating chat FAB / WhatsApp widget** — DEFERRED (CHAT-CP1).
- **Anything beyond header / footer / mobile-nav / mega menu** (see §5).
- Curated-icon admin picker upgrade is **optional**; if not done this checkpoint, the render-side icon resolver still supplies the meaningful fallback (§4.6).

### 4.6 Icon mapping plan

Render-side curated allow-list (lucide), resolved by configured `icon` name first, then by **category-type fallback**, then a final generic fallback — never blank/broken (honest-data «meaningful fallback» rule).

| Category / element | Primary lucide | Fallback chain |
|---|---|---|
| آجیل | `Nut` | → `Package` |
| خشکبار | `Grape` | → `Leaf` |
| میوه خشک | `Apple` | → `Citrus` |
| قهوه | `Coffee` | → `CupSoda` |
| چای و دمنوش | `CupSoda` | → `Leaf` |
| برنج | `Wheat` | → `Package` |
| ادویه و زعفران | `Sparkles` | → `Flame` |
| هدایا / هدایای سازمانی | `Gift` | → `Package` |
| بسته آماده | `PackageCheck` | → `Package` |
| فروش ویژه | `BadgePercent` | → `Tag` |
| مجله / بلاگ | `Newspaper` | → `BookOpen` |
| تماس / پشتیبانی | `Headset` | → `Phone` |
| حساب / ورود | `User` | → `CircleUser` |
| سبد خرید | `ShoppingCart` | → `ShoppingBag` |
| جستجو | `Search` | → `Search` |
| گفت‌وگو / چت | `MessageCircle` | → `MessageSquare` |
| خانه | `Home` | → `House` |
| دسته‌بندی | `LayoutGrid` | → `Grid3x3` |
| درباره ما | `Info` | → `BadgeInfo` |
| خرید عمده | `Boxes` | → `Package` |
| پیگیری سفارش | `Truck` | → `PackageSearch` |
| generic unknown | — | → `Circle` (final meaningful fallback) |

**Fallback rule:** (1) if admin set a valid `icon` name, use it; (2) else map by detected category/link type (keyword match on label/href/linkType); (3) else a sensible group icon; (4) else `Circle`. Social-platform icons resolve by `SocialLink.platform` (instagram/telegram/whatsapp/linkedin/aparat/x/youtube), with brand-channel colors for WhatsApp `#25d366` / Telegram `#229ed9`; replace today's generic lucide stand-ins (Camera/Send) with proper brand glyphs or curated mapped icons.

### 4.7 Risk / open questions to confirm before coding

1. **Mega trigger label**: export uses «فروشگاه»; task assumed «دسته‌بندی محصولات». Confirm which (recommend «فروشگاه» to match export). — *verify before coding.*
2. **Heritage year**: export tagline/intros use ۱۳۰۵ (wrong). Rebuild MUST use **۱۳۱۳** everywhere. Confirm exact tagline string (e.g. «از باغ خانوادگی تا سفره شما — ۱۳۱۳»). — *verify before coding.*
3. **Third footer column**: export shows 3 MAIN columns; admin footer wires only 2 menus. Need a 3rd menu slot or named-column fields. Confirm desired column count/titles. — *unknown — verify before coding.*
4. **Bottom nav menu source**: reuse `MOBILE` location vs new `bottomNavMenuId` global vs hardcoded 5 tabs. Recommend `header.bottomNavMenuId` + `showBottomNav`. — *confirm.*
5. **Shop vs blog context**: export uses `?ctx=blog`. How does the real app decide context (route prefix `/blog`, or query)? Header must read context from route, not query. — *verify routing.*
6. **Mobile menu style**: `mobileMenuStyle` enum (drawer|accordion) — both supported, or drawer only this checkpoint? — *confirm.*
7. **Pure-CSS vs React state** for drawer/mega/accordions: export is no-JS checkbox-driven; React port may use state + a11y (Escape, focus trap — both ABSENT in export and must be ADDED). Confirm preferred approach. — *decide.*
8. **store-\* token completeness**: only primary/-hover/-soft/-deep/-tint exist; secondary, clay, gold, honey, surfaces, borders, glass, shadow-ink tokens must be added to `@theme`. Confirm token names. — *define before coding.*
9. **Badge/description/device-visibility schema fields**: add now or defer? Drives whether a migration ships this checkpoint. — *decide scope.*
10. **enamad/samandehi/anjoman seals**: currently hardcoded; should they become admin-conditional (`enamadHtml`/`samandehiHtml` + `trustBadges`) this checkpoint? — *confirm.*

---

## 5. Scope Guard

**This checkpoint (FRONT-HF-LOCK-CP1) builds & visually locks ONLY:** the public **Header**, **Footer**, **mobile header + drawer**, **mobile bottom nav**, and the **desktop mega menu** — all admin-driven, store-\* palette, RTL, honest data.

**This checkpoint will NOT touch:**
- Homepage body / `HomepageBlocks` content.
- Product cards, **PLP** (products listing), category pages, **PDP** (single product) bodies.
- Cart / checkout / payment / coupons / **pricing logic** (cart count badge consumes existing cart state only).
- Rich text editor.
- **SEO architecture** (closed module — do not reopen).
- Media storage internals / `MediaAsset` model (consumes logo URLs only).
- Blog body / magazine article rendering (only the blog-context nav switch in chrome).
- **Admin dark-mode** & admin responsive architecture (admin-scoped; storefront stays light).
- Full chat widget (placeholder only → CHAT-CP1) and newsletter submission backend.

**Palette confirmation:** Header, Footer, mobile nav, and mega menu MUST use the **store-\*** storefront palette (forest green `#15803d` + warm stone + clay/gold), **NOT** the **dz-\*** admin olive palette (`#4a6340`). The design-export's `dz-*` token NAMES are a value reference only and must be remapped to `store-*` Tailwind 4 `@theme` tokens. **Heritage year is ۱۳۱۳, never ۱۳۰۵.**
