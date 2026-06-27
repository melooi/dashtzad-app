<div align="center">

<br />

<picture>
  <img alt="Dashtzad" src="dashtzad-app/public/og-image.png" width="120" height="120" />
</picture>

<h1>دشت‌زاد &nbsp;·&nbsp; Dashtzad</h1>

<p>
  <strong>Full-stack e-commerce &amp; content platform for a premium Iranian food brand.</strong><br />
  <sub>زعفران &nbsp;·&nbsp; آجیل &nbsp;·&nbsp; حبوبات &nbsp;·&nbsp; ادویه &nbsp;—&nbsp; از سال ۱۳۱۳</sub>
</p>

<br />

<p>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.2.9-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" /></a>
  &nbsp;
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  &nbsp;
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  &nbsp;
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  &nbsp;
  <a href="https://postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  &nbsp;
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" /></a>
</p>

<p>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-24_LTS-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" /></a>
  &nbsp;
  <a href="https://openai.com"><img src="https://img.shields.io/badge/OpenAI-Responses_API-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI" /></a>
  &nbsp;
  <img src="https://img.shields.io/badge/RTL-Persian_%2F_Jalali-4A6340?style=flat-square" alt="RTL Persian" />
  &nbsp;
  <img src="https://img.shields.io/badge/License-Private-red?style=flat-square" alt="Private" />
</p>

<br />

</div>

---

## What is this?

Dashtzad (دشت‌زاد) is the complete digital commerce and content platform for an Iranian premium food brand established in 1313 (1934). It is a production-grade monorepo that ships five interconnected systems under a single Next.js App Router application:

| System | What it does |
|---|---|
| **Storefront** | Public-facing shop — product catalog, PDP, cart, checkout, customer accounts |
| **Admin Panel** | Full back-office — products, orders, pricing, media, CMS, integrations |
| **AI Chat** | Live customer support with OpenAI memory layer and admin analyst UI |
| **Content / CMS** | Rich-text articles, recipes, media library, SEO metadata |
| **Commerce Engine** | Order lifecycle, Zarinpal/IDPay payments, IRR/toman conversion |

The entire UI is **RTL**, renders **Jalali (Persian) dates**, converts all numbers to **Persian numerals**, and is built around a bespoke `dz-` design-token system with separate light (storefront) and dark (`dz-night`) admin themes.

---

## Platform Map

### Storefront — `app/(public)/`

| Route | Page |
|---|---|
| `/` | Homepage — hero, featured collections, blog highlights |
| `/products` | Catalog with filtering, sorting, search |
| `/products/[slug]` | Product Detail Page — gallery, specs, rich content, related |
| `/cart` | Cart with real-time quantity management |
| `/checkout` | Multi-step checkout — address, shipping, payment |
| `/account` | Customer dashboard — orders, wishlist, profile |
| `/blog` | Article index |
| `/blog/[slug]` | Article / recipe detail |
| `/about`, `/contact`, `/faq` | Static brand pages |

### Admin Panel — `app/admin/`

| Section | Capabilities |
|---|---|
| **Dashboard** | Live KPIs — revenue, orders, sessions |
| **Products** | CRUD, image manager, variant pricing (inline-editable), pagination |
| **Orders** | Full lifecycle — pending → processing → shipped → delivered |
| **Customers** | Account management, order history, flags |
| **Content** | Articles, recipes, Tiptap rich editor, media library |
| **Chat** | Agent inbox, workspace, canned replies, department routing |
| **AI Settings** | Model selection, memory configuration, behavior tuning |
| **SEO** | Per-page meta, Open Graph, structured data |
| **Integrations** | Live status of all external services (no keys exposed in UI) |
| **Settings** | Store config, SMS templates, global variables |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                         │
│   React 19 · TanStack Query v5 · react-hook-form · Tailwind 4  │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTP / RSC streaming
┌────────────────────────▼────────────────────────────────────────┐
│                    Next.js 16 App Router                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ (public)/   │  │   admin/     │  │   api/ route handlers  │ │
│  │ Storefront  │  │ Admin Panel  │  │   (REST + Server Fn.)  │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      lib/                                 │   │
│  │  auth (OTP + sessions) · ai/openai-client · validation   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼──────────────────┐
         ▼               ▼                  ▼
   ┌──────────┐   ┌────────────┐   ┌──────────────────┐
   │PostgreSQL│   │ Kavenegar  │   │ Zarinpal / IDPay │
   │  + Prisma│   │  SMS OTP   │   │  Payment Gateway │
   └──────────┘   └────────────┘   └──────────────────┘
                                          ▲
                                   ┌──────┴───────┐
                                   │  OpenAI API  │
                                   │ (Chat + AI)  │
                                   └──────────────┘
```

---

## Tech Stack

<table>
<tr><th>Layer</th><th>Technology</th><th>Notes</th></tr>
<tr><td><b>Framework</b></td><td>Next.js 16.2.9</td><td>App Router, Server Components, Server Functions</td></tr>
<tr><td><b>UI runtime</b></td><td>React 19</td><td>Concurrent features, use() hook</td></tr>
<tr><td><b>Language</b></td><td>TypeScript 5 (strict)</td><td>Zero <code>any</code> policy; <code>noEmit</code> must always pass</td></tr>
<tr><td><b>Styling</b></td><td>Tailwind CSS 4</td><td><code>@theme</code> directive, <code>dz-</code> token system</td></tr>
<tr><td><b>Database</b></td><td>PostgreSQL 18</td><td>Single DB, connection via <code>@prisma/adapter-pg</code></td></tr>
<tr><td><b>ORM</b></td><td>Prisma 7</td><td>Migrations, typed client, seed scripts</td></tr>
<tr><td><b>Auth</b></td><td>Custom OTP + DB sessions</td><td>Kavenegar SMS · no Auth.js dependency</td></tr>
<tr><td><b>Validation</b></td><td>Zod 4</td><td>Shared schemas client ↔ server</td></tr>
<tr><td><b>Forms</b></td><td>react-hook-form + zod resolver</td><td>Zero uncontrolled-component hacks</td></tr>
<tr><td><b>Data fetching</b></td><td>TanStack Query v5</td><td>Optimistic updates, invalidation patterns</td></tr>
<tr><td><b>Rich text</b></td><td>Tiptap 3</td><td>Extensions: table, placeholder, code, image gallery</td></tr>
<tr><td><b>Dates</b></td><td>dayjs + jalaliday</td><td>Full Jalali calendar support throughout</td></tr>
<tr><td><b>AI</b></td><td>OpenAI Responses API</td><td>Unified client at <code>lib/ai/openai-client</code>; separate <code>ai_*</code> tables</td></tr>
<tr><td><b>Payments</b></td><td>Zarinpal · IDPay</td><td>IRR integers sent directly — no conversion at gateway</td></tr>
<tr><td><b>SMS</b></td><td>Kavenegar</td><td>OTP delivery, order notifications</td></tr>
<tr><td><b>Images</b></td><td>sharp + Next/Image</td><td>WebP optimization, responsive sizes</td></tr>
<tr><td><b>Runtime</b></td><td>Node.js 24 LTS</td><td>Port 3000 (dev) / 3001 (alt)</td></tr>
</table>

---

## Design System

The `dz-` token system is defined in `src/styles/` using Tailwind 4's `@theme` directive and shared across both the storefront and admin panel.

```
Brand primary  →  #4A6340  (olive green, dz-primary-600)
Storefront     →  light theme  (dz-primary-* scale, warm neutrals)
Admin panel    →  dz-night dark theme  (.dark scope, separate token set)
```

**Typography**

| Role | Font | Weights used |
|---|---|---|
| Headings, brand name, key numbers | **Kalameh** | 700, 800 |
| Body, UI labels, inputs, tables | **IRANYekanX** | 400, 500, 600, 700 |

All text is **RTL**. All numbers pass through `toPersianNumbers()` before display. Currency always renders with `toman.svg` — never the letter «ت».

---

## Currency Convention

Prices live in the database as **IRR (rial) integers** to avoid floating-point errors.

```
Admin inputs  →  250,000       (toman)
Stored        →  2,500,000     (rial, ×10 on write)
Displayed     →  ۲۵۰٬۰۰۰ ﷼    (÷10, Persian numerals, toman icon)
Gateway       →  2,500,000     (rial, sent as-is to Zarinpal)
```

> The ×10 / ÷10 conversion happens **only at the application boundary**, never inside the payment flow.

---

## Repository Structure

```
dashtzadpro/
│
├── dashtzad-app/                  # Next.js 16 application (primary)
│   │
│   ├── prisma/
│   │   ├── schema.prisma          # Canonical data model (1,675 lines)
│   │   ├── migrations/            # Applied PostgreSQL migrations
│   │   ├── seed.ts                # Base data seed
│   │   └── seed-pdp.ts            # PDP content seed
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/          # Storefront — home, products, blog, account…
│   │   │   ├── admin/             # Admin panel — all back-office sections
│   │   │   ├── auth/              # OTP login / logout flow
│   │   │   ├── merchant/          # Merchant-facing portal
│   │   │   └── api/               # REST route handlers & server functions
│   │   │
│   │   ├── components/            # Shared, reusable across pages
│   │   ├── views/                 # Page-scoped partials (one folder per route)
│   │   ├── common/                # Design primitives — Button, TextField, Modal…
│   │   ├── lib/                   # Server utilities, auth session, AI client
│   │   └── styles/                # globals.css, dz- token declarations
│   │
│   └── public/
│       ├── fonts/                 # IRANYekanX + Kalameh (woff2)
│       ├── icons/                 # toman.svg and brand icons
│       └── dz-design/             # PDP cinema-style layout assets
│
└── look/                          # Brand source files (outside Next.js)
    ├── fonts/                     # Font source files (woff / woff2)
    ├── logo/                      # Logo variants (mark, full, 1313)
    └── icons/                     # Source SVGs
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 24 LTS |
| PostgreSQL | 18 (17 or 16 also work) |
| npm | 10+ |

### 1. Clone & install

```bash
git clone <repo-url>
cd dashtzadpro/dashtzad-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in the values below
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/dashtzad` |
| `SESSION_SECRET` | Random 32-byte hex string |
| `KAVENEGAR_API_KEY` | OTP SMS provider (kavenegar.com) |
| `ZARINPAL_MERCHANT_ID` | Payment gateway merchant ID |
| `IDPAY_API_KEY` | Alternative payment gateway |
| `OPENAI_API_KEY` | AI chat & admin analyst |
| `NEXT_PUBLIC_SITE_URL` | Public base URL (e.g. `https://dashtzad.ir`) |

### 3. Set up the database

```bash
npx prisma migrate dev     # Apply all migrations
npx prisma db seed         # Seed base data
```

### 4. Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

### 5. Verify type safety

```bash
npx tsc --noEmit           # Must exit 0 before any commit
```

> **Important:** After running `prisma generate` or creating new models, you **must restart `next dev`**. The Prisma client is cached on `globalThis` at startup — a stale instance will return 500 errors for new model APIs until the process restarts.

---

## Scripts

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (Next.js config)
npx tsc --noEmit    # Type check (zero errors required)
npx prisma studio   # Visual database browser
npx prisma migrate dev --name <name>   # Create + apply a new migration
```

---

## Data Model Highlights

The Prisma schema (`prisma/schema.prisma`, ~1,675 lines) covers:

- **Products** — variants, images, pricing history, PDP content, Latin slugs
- **Orders** — line items, status lifecycle, shipping address, payment records
- **Users / Sessions** — OTP tokens, database sessions, roles
- **Chat** — threads, messages, departments, canned replies, AI memory (`ai_*` tables)
- **Content** — articles, recipes, media assets, SEO metadata
- **Commerce** — cart, wishlist, promotions, payment gateway records

All monetary values are stored as `Int` (rial). All timestamps use `DateTime` with UTC storage and Jalali conversion at the presentation layer.

---

## Key Conventions

| Convention | Rule |
|---|---|
| Price storage | IRR rial as `Int` — multiply by 10 on write, divide on read |
| Currency display | `toman.svg` icon — never the letter «ت» or word «تومان» |
| Numbers in UI | Always `toPersianNumbers()` |
| Brand name | `دشت‌زاد` — always with ZWNJ (U+200C) |
| Admin theme | `.dark` scope with `dz-night` tokens — never bleeds to storefront |
| AI client | All OpenAI calls go through `lib/ai/openai-client` — no direct SDK usage elsewhere |
| Logo | Always via `<Logo variant="..." />` — never hardcoded file paths |
| "Done" | A task is done only when `tsc --noEmit` and `build` both pass |

---

## Brand

**دشت‌زاد کشت و تجارت ایرانیان** (registered as joint-stock company)

Founded in 1313 (1934), Dashtzad is one of Iran's heritage food brands, specialising in premium-grade **saffron**, **nuts**, **legumes**, and **spices**. The visual language is cinematic and Apple-adjacent — high contrast, generous whitespace, zero decorative noise.

---

<div align="center">

<br />

**دشت‌زاد کشت و تجارت ایرانیان**

*بنیان‌گذاری ۱۳۱۳ — ساخته‌شده با Next.js ۱۶ و React ۱۹*

<br />

</div>
