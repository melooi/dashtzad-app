# ADMIN-RESP-CP1 — Responsive Admin QA

Checkpoint: make the custom admin panel fully responsive (mobile → tablet → laptop →
1440px desktop baseline → 1920px sanity), using Tailwind CSS 4 responsive best practices.
UI/responsiveness only — no business logic, schema, pricing, cart/checkout, SEO
architecture, or media-storage changes.

---

## 1. Tailwind responsive principles used

- **Mobile-first.** Unprefixed utilities are the mobile/base style; `md:`/`lg:`/`xl:`
  layer larger layouts on top. `sm:` is never used as "mobile".
- **Default breakpoints.** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. The admin
  shell switches from drawer to static sidebar at **`lg` (1024px)**.
- **Desktop baseline = 1440px.** Content column is capped at `max-w-7xl` (1280px) and
  centered, so 1440px uses space well and 1920px stays controlled (no endless stretch).
  Forms self-cap narrower (`max-w-4xl` / `max-w-3xl`) for readability; dense tools
  (QuickSheet, VariantMatrix, data tables) scroll inside their own panels.
- **`max-*` ranges / arbitrary variants** only where genuinely needed
  (`max-w-[85vw]` drawer cap, `max-w-[calc(100vw-2rem)]` floating bar). No arbitrary
  breakpoint proliferation.
- **Container queries (`@container` + `@md:`)** on reusable panels whose layout should
  react to their own width rather than the viewport (see §6).
- **Layout-bug guards.** `min-w-0` on flex content regions; `overflow-x-auto` only
  around dense tables/grids, never the whole page; long slugs/URLs use
  `font-mono` + `dir="ltr"` + `truncate`/`break`.
- **State variants.** `focus-ring` (focus-visible halo, dark-aware), `hover:`,
  `disabled:`, `aria-*` styling preserved throughout. Touch targets ≥ ~36px.

---

## 2. Audited surfaces

Shell: `AdminShell`, `AdminSidebar`, `AdminHeader`, `AdminThemeToggle`.
Page system: `AdminPageHeader`, `AdminBreadcrumbs`, `AdminToolbar`, `AdminFilterBar`,
`AdminSearchInput`, `AdminTablePagination`, `AdminBulkActionBar`.
Forms: `AdminFormShell`, `AdminFormSection`, `AdminField`, text/select/textarea/
checkbox/relation/slug fields, `AdminSubmitBar`, `AdminDangerZone`, `AdminConfirmDialog`.
Dashboards/cards: `DashboardCard`, `SeoStatCard`, `SeoPreview`.
Tables/data: `AdminDataTable`, `ProductsTable`, `pricing` table, `structured-data` table.
Product admin: `ProductForm`, `VariantMatrix`, `QuickAddSheet`.
Globals / SEO / site: `HomepageBuilder`, `GlobalForm`, `SeoPanel`, `SeoUi`, menus/
banners/FAQs/redirects/categories forms.
Pages: dashboard, products list + quick-add, categories, weights-packaging, globals
(homepage/header/footer), SEO (overview/merchant/structured-data), pricing.

---

## 3. Main problems found

| # | Surface | Problem | Viewport |
|---|---------|---------|----------|
| 1 | `AdminSidebar` / shell | Fixed `w-64` sidebar always visible; no mobile drawer → no usable nav, sidebar ate ~70% of a phone screen. | ≤ 1023px |
| 2 | `AdminHeader` | No menu trigger; view-site / name / logout labels crowded the bar at 360–390px. | mobile |
| 3 | Content container | `px-6 py-7` fixed padding (too tight at 360); `max-w-6xl` left desktop slightly under-using 1440 and uncontrolled per-page width intent. | mobile + desktop |
| 4 | `QuickAddSheet` | `min-w-[1040px]` grid had **no** overflow wrapper → page-level horizontal scroll on every viewport < 1040px. | all small |
| 5 | `AdminPageHeader` / breadcrumbs | Action cluster + breadcrumb trail didn't wrap → overflow with 2+ actions or long trails. | mobile |
| 6 | `AdminSubmitBar` | `justify-between` with status text + 2 buttons cramped/overflowed. | 360px |
| 7 | `VariantMatrix` footer | Note + save button on one row cramped. | mobile |
| 8 | `AdminBulkActionBar` | `w-fit` floating bar could exceed viewport width with wide actions. | mobile |
| 9 | `HomepageBuilder` block row | 7 icon controls + label on one non-wrapping row could overflow the card. | 360px |
| 10 | Min-width content regions | Flex content column lacked `min-w-0`, risking flex blow-out from wide tables. | all |

---

## 4. Fixes applied

**Shell — mobile drawer (Part 2).**
- `AdminShell` is now a client component owning `drawerOpen` state. Renders a
  backdrop (`z-40`, `lg:hidden`) and passes `open`/`onNavigate`/`onClose` to the
  sidebar and `onOpenMenu` to the header. **Esc** closes the drawer.
- `AdminSidebar`: base = off-canvas drawer pinned to the **right** edge (RTL side):
  `fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] translate-x-full` → `translate-x-0`
  when open, with `transition-transform` + `shadow-2xl`. At `lg:` it reverts to the
  in-flow static column (`lg:static lg:w-64 lg:translate-x-0 lg:transition-none`).
  Added an in-drawer **close button** (`lg:hidden`, `aria-label="بستن منو"`) and
  `aria-label="ناوبری مدیریت"` on the `<aside>`. Nav links + brand link call
  `onNavigate` → drawer closes on navigation.
- `AdminHeader`: added a **menu button** (`lg:hidden`, `aria-label="باز کردن منو"`).
  View-site / logout collapse to icon-only below `sm` (`hidden sm:inline` labels);
  the name chip is `hidden sm:flex`. Padding/gap tighten on mobile
  (`px-4 gap-2` → `sm:px-6 sm:gap-4`).

**Page container system (Part 3).**
- Content wrapper: `px-4 py-5 sm:px-6 sm:py-7`, `max-w-7xl` (1280) centered. Content
  column got `min-w-0` to prevent flex blow-out.
- `AdminPageHeader` actions wrap (`flex flex-wrap … sm:shrink-0`); breadcrumbs wrap
  (`flex-wrap`). Title/description already stacked on mobile (`sm:flex-row`).

**Tables / dense data (Part 4).** `AdminDataTable`, pricing, and structured-data
tables already wrap in `overflow-x-auto` with sensible `min-w`. Verified every dense
admin table scrolls inside its panel — **no page-level horizontal scroll** anywhere.
`AdminBulkActionBar` capped at `max-w-[calc(100vw-2rem)]` and allowed to wrap.

**Forms (Part 5).** `AdminSubmitBar` now wraps (`flex-wrap`, `gap-x/gap-y`). Field
components, `AdminFormSection`, `AdminConfirmDialog` (`max-w-sm` + `p-4` backdrop) and
`AdminDangerZone` already single-column / mobile-fit; left intact.

**Product admin (Part 6).** `QuickAddSheet` grid panel gained `overflow-x-auto` (the
`gridRef` element) so the 1040px sheet scrolls inside its own panel — **all keyboard
behavior preserved** (handler unchanged; focused cell auto-scrolls into view).
`VariantMatrix` footer stacks on mobile and its matrix already scrolls in-panel.

**Globals / SEO (Part 7).** `HomepageBuilder` block header row wraps; block content +
SEO preview adopt container queries (§6).

---

## 5. Desktop / large-screen result

- **1440px:** sidebar `w-64` + content column filling up to `max-w-7xl` (1280) — full,
  balanced use of space, not a blown-up mobile layout. Dashboard cards = 3 columns.
- **1920px:** content stays capped at 1280 and centered — polished, no stretch.
- Forms remain readable (self-capped at 4xl/3xl); data tools use the wider column.

---

## 6. Container query usage (Part 8)

Container queries (`@container` parent + `@md:` children, native in Tailwind v4) were
added where a panel's internal layout should follow its **own** width, not the viewport:

- **`AdminFormSection`** — inner sections marked `@container` so titled form sections
  can opt into `@`-based internal column layouts regardless of where they're embedded.
- **`HomepageBuilder` block editor** — open block's field grid is
  `@container … grid @md:grid-cols-2` (wide-field types span `@md:col-span-2`), so
  fields go 2-up only when the block card itself is wide.
- **`SeoPreview`** — panel is `@container`; the two SEO counters become
  `@md:grid-cols-2` based on the preview panel width.

The full page shell intentionally still uses viewport breakpoints (not container
queries), per the checkpoint rules.

---

## 7. Dark mode (Part 9)

`.dark` remains admin-scoped (toggled on `<html>` only inside `/admin` via
`AdminThemeScript`/`AdminThemeToggle`); public storefront unaffected. Every responsive
change kept its paired `dark:` classes (drawer, backdrop `dark:bg-black/60`, menu/close
buttons, header chips). No dark-mode architecture touched, no flicker/hydration change
(theme script untouched).

---

## 8. Accessibility (Part 10)

- Menu button `aria-label="باز کردن منو"`; drawer close `aria-label="بستن منو"`;
  `<aside aria-label="ناوبری مدیریت">`; logout `aria-label`.
- Backdrop `aria-hidden`; Esc closes the drawer; nav click closes the drawer.
- Visible `focus-ring` (focus-visible, dark-aware) retained on all interactive items;
  disabled states keep reduced opacity; icon-only buttons all labelled.
- RTL: drawer slides from the **right** (the RTL sidebar side); `translate-x-full`
  hides it off the right edge. Simple drawer (no focus trap) — accepted by spec.

---

## 9. Verification (Part 11)

- `npx tsc --noEmit` → **clean** (no errors).
- `npm run build` → **✓ Compiled successfully**; all `/admin/*` routes built as dynamic
  server-rendered (`ƒ`), public routes unchanged. Admin routes are guarded by
  `requireAdmin()` (redirects unauthenticated → `/auth`), so 200-with-session smoke
  testing requires a live ADMIN session; the build proves they compile and render.

---

## 10. Viewport QA checklist (manual)

Run each with the device toolbar; expected results noted.

| Viewport | Expect |
|---|---|
| **360 / 390 mobile** | Sidebar hidden; menu button opens right drawer over backdrop; Esc/backdrop/nav-link close it. Header = menu + view-site icon + theme + logout icon (no overflow). Dashboard cards 1-col. Tables/QuickSheet/VariantMatrix scroll inside their panels; **no page-level horizontal scroll**. Submit bar wraps. |
| **768 tablet** | Still drawer mode (< lg). Dashboard cards 2-col. Forms single-column. Toolbars wrap. |
| **1024 small laptop** | Sidebar becomes static `w-64`; menu button gone. Dashboard cards 3-col. |
| **1440 desktop** | Balanced sidebar + `max-w-7xl` content; forms readable (self-capped); data tools use width. |
| **1920 sanity** | Content capped 1280, centered; polished, no stretch. |
| **All** | Toggle dark mode at each width — surfaces readable; storefront `/` stays light. |

---

## 11. Container/MEDIA-CP1 conflict note

No media files were edited. Per the parallel-safety rule, `src/components/admin/media/*`,
`src/app/admin/media/*`, `src/lib/media/*`, and MediaPicker components were left
untouched (their tables/toolbars already use `overflow-x-auto` + `min-w` and were only
verified, not modified). If MEDIA-CP1 later restyles those, no merge conflict exists in
the files this checkpoint changed.

---

## 12. Known limitations

- Admin **tables stay row-based** (horizontal scroll inside the panel) on mobile rather
  than converting to card lists — intentional, per "do not overbuild card-mode tables".
- Drawer is a simple slide-over (no focus trap / inert background) — accepted by spec;
  Esc + backdrop + nav-close cover the practical cases.
- No live browser screenshots captured in this environment; §10 is the manual QA script.
- Authenticated 200 smoke tests need a running DB + ADMIN session; build + tsc confirm
  compile/render integrity.

---

## 13. Files changed

- `src/components/admin/AdminShell.tsx` (client; drawer state, backdrop, Esc, container width/padding)
- `src/components/admin/AdminSidebar.tsx` (off-canvas drawer + close button + nav-close)
- `src/components/admin/AdminHeader.tsx` (menu button + mobile-compact controls)
- `src/components/admin/ui/AdminPageHeader.tsx` (wrapping actions)
- `src/components/admin/ui/AdminBreadcrumbs.tsx` (wrapping trail)
- `src/components/admin/ui/AdminSubmitBar.tsx` (wrapping bar)
- `src/components/admin/ui/AdminBulkActionBar.tsx` (viewport-capped, wrapping)
- `src/components/admin/ui/AdminFormSection.tsx` (`@container`)
- `src/components/admin/products/QuickAddSheet.tsx` (grid `overflow-x-auto`)
- `src/components/admin/products/VariantMatrix.tsx` (footer stacks on mobile)
- `src/components/admin/globals/HomepageBuilder.tsx` (header wrap + block-field `@container`)
- `src/components/admin/globals/SeoPreview.tsx` (`@container` counters)
