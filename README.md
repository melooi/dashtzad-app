# دشت‌زاد — فروشگاه و بلاگ

فروشگاه اینترنتی و بلاگِ **دشت‌زاد** — عرضه‌ی مواد غذایی پرمیومِ ایرانی (زعفران، آجیل، حبوبات و ادویه) از سال ۱۳۱۳.

این پروژه یک بازسازی کامل (rebuild) روی استک مدرن است و به‌عنوان پایه‌ای قابل‌استفاده برای پروژه‌های آینده طراحی شده.

---

## استک

| لایه | فناوری |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 · TypeScript (strict) |
| Styling | Tailwind CSS 4 (`@theme`) + توکن‌های `dz-` |
| Database | PostgreSQL 18 |
| ORM | Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Auth | OTP سفارشی (Kavenegar) + سشن دیتابیسی (توکن opaque) |
| Validation | Zod |
| Data fetching | TanStack Query v5 · react-hook-form + zod |
| Icons | lucide-react |
| Dates | dayjs + jalaliday (تقویم جلالی) |
| Runtime | Node 24 LTS |

فونت‌ها: **IRANYekanX** (متن) · **Kalameh** (تیتر). رنگ پایه: سبز زیتونی `#4a6340`.

---

## پیش‌نیازها

- **Node 24 LTS** (با `nvm install 24 && nvm use 24` — فایل `.nvmrc` موجود است)
- **PostgreSQL 18** (محلی یا ریموت)
- npm

---

## نصب

```bash
# ۱) کلون و نصب وابستگی‌ها
cd dashtzad-app
nvm use            # Node 24 از .nvmrc
npm install

# ۲) راه‌اندازی دیتابیس (نمونه با Homebrew)
brew install postgresql@18
brew services start postgresql@18
createdb dashtzad

# ۳) متغیرهای محیطی
cp .env.example .env
# .env را ویرایش کنید (حداقل DATABASE_URL و OTP_SECRET)
#   OTP_SECRET با: openssl rand -hex 32

# ۴) اعمال schema + داده‌ی نمونه
npx prisma migrate dev      # ساخت جداول
npx prisma db seed          # داده‌ی نمونه (یا: npx tsx prisma/seed.ts)

# ۵) اجرا
npm run dev                 # http://localhost:3000
```

> اگر پورت ۳۰۰۰ اشغال بود: `npm run dev -- -p 3001`.

### اسکریپت‌ها

| دستور | کار |
|---|---|
| `npm run dev` | حالت توسعه |
| `npm run build` | بیلد پروداکشن |
| `npm start` | اجرای بیلد |
| `npm run lint` | اجرای ESLint |
| `npx prisma studio` | مرور دیتابیس |
| `npx prisma migrate dev` | ساخت/اعمال migration |

---

## متغیرهای `.env`

| متغیر | توضیح |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `NEXT_PUBLIC_BASE_URL` | آدرس پایه‌ی سایت (برای canonical/OG/sitemap) |
| `DATABASE_URL` | رشته‌ی اتصال PostgreSQL |
| `SESSION_COOKIE_NAME` | نام کوکی سشن (پیش‌فرض `dz_session`) |
| `SESSION_TTL_DAYS` | عمر سشن به روز |
| `OTP_TESTING_MODE` | `true` → کد OTP در پاسخ API برمی‌گردد (بدون پیامک) |
| `OTP_TTL_SECONDS` | عمر کد OTP |
| `OTP_MAX_ATTEMPTS` | سقف تلاش نادرست |
| `OTP_SECRET` | کلید HMAC برای هش OTP (الزامی) |
| `KAVENEGAR_API_KEY` | کلید کاوه‌نگار (برای پیامک واقعی در production) |
| `KAVENEGAR_OTP_TEMPLATE` | نام تمپلیت OTP کاوه‌نگار |
| `ZARINPAL_MERCHANT_ID` | شناسه‌ی پذیرنده‌ی زرین‌پال (فاز بعد) |
| `ZARINPAL_SANDBOX` | `true` برای تست |
| `ZARINPAL_CALLBACK_URL` | آدرس بازگشت پرداخت |
| `GOOGLE_SITE_VERIFICATION` | توکن Search Console (اختیاری) |

---

## حساب‌های تستی (seed)

| نقش | شماره | توضیح |
|---|---|---|
| ادمین | `09120000000` | دسترسی به `/admin` |
| کاربر | `09120000001` | کاربر عادی |

در حالت `OTP_TESTING_MODE=true`، کد تأیید در صفحه‌ی `/auth` به‌صورت یک badge نمایش داده می‌شود (نیازی به پیامک نیست).

---

## ساختار پوشه

```
dashtzad-app/
├─ prisma/
│  ├─ schema.prisma          # ۱۸ مدل
│  ├─ migrations/
│  └─ seed.ts                # داده‌ی نمونه
├─ public/
│  ├─ fonts/                 # IRANYekanX + Kalameh
│  ├─ icons/toman.svg        # آیکن واحد پول
│  ├─ logo/                  # لوگوها + نمادها
│  └─ placeholders/          # تصاویر نمونه‌ی محلی
├─ src/
│  ├─ app/
│  │  ├─ (public)/           # صفحات عمومی + layout با Header/Footer
│  │  │   ├─ page.tsx        # خانه
│  │  │   ├─ products/ blog/ cart/ checkout/ orders/[id]/
│  │  │   ├─ about/ contact/ terms/ account/
│  │  ├─ auth/               # ورود OTP
│  │  ├─ admin/              # پنل (placeholder، محافظت‌شده)
│  │  ├─ api/
│  │  │   ├─ auth/{get-otp,verify-otp,logout,me}/
│  │  │   ├─ orders/  comments/
│  │  ├─ layout.tsx globals.css
│  │  ├─ sitemap.ts robots.ts opengraph-image.tsx
│  │  ├─ error.tsx not-found.tsx loading.tsx
│  ├─ components/            # reusable (Header, Footer, Logo, Price, …)
│  ├─ common/                # primitives (Button, TextField, Loading, EmptyState)
│  ├─ views/                 # partialهای صفحه‌محور (auth, checkout, product, …)
│  ├─ lib/
│  │   ├─ prisma.ts          # کلاینت Prisma (singleton + adapter-pg)
│  │   ├─ auth/{session,otp,guards,phone}.ts
│  │   ├─ price.ts date.ts cart.ts order.ts
│  │   ├─ seo.ts jsonld.ts kavenegar.ts
│  ├─ generated/prisma/      # کلاینت تولیدشده (gitignore)
│  └─ proxy.ts               # محافظت route (جایگزین middleware در Next 16)
├─ .nvmrc  .env.example  next.config.ts  prisma.config.ts
```

---

## قواعد مهم پروژه

- **قیمت:** در دیتابیس **ریال** (integer، با suffix `_rial`). نمایش به کاربر **تومان** = ریال ÷ ۱۰. همیشه با کامپوننت `<Price>` و آیکن `toman.svg`.
- **اعداد UI:** همیشه با `toPersianNumbers` فارسی.
- **برند:** «دشت‌زاد» با نیم‌فاصله. سال تأسیس: **۱۳۱۳**.
- **سشن:** توکن opaque (`crypto.randomBytes(32)`); در دیتابیس فقط `sha256(token)` ذخیره می‌شود.
- **OTP:** هرگز plaintext؛ فقط `HMAC-SHA256(code)` با `OTP_SECRET`.

---

## افزودن یک صفحه‌ی جدید

1. یک پوشه در `src/app/(public)/<route>/` بساز و `page.tsx` در آن.
2. برای متادیتا: `export const metadata = buildMetadata({ title, description, url })` (از `@/lib/seo`).
3. اگر داده‌ی پویا دارد، یک `loading.tsx` کنارش بگذار.
4. اگر نیاز به auth دارد: مسیر را در `src/proxy.ts` (`matcher`) اضافه کن و در صفحه `await requireAuth()` بزن.

## افزودن یک مدل جدید

1. مدل را در `prisma/schema.prisma` تعریف کن (id با `uuid`، قیمت‌ها `_rial`، index روی FK/searchها).
2. `npx prisma migrate dev --name <name>` → جدول ساخته و کلاینت دوباره تولید می‌شود.
3. در صورت تغییر، کلاینت را با `npx prisma generate` به‌روز کن.
4. import از `@/generated/prisma/client` و استفاده از `prisma` در `@/lib/prisma`.

---

## استقرار (Deployment)

- **Vercel:** متغیرهای `.env` را در داشبورد ست کن. `DATABASE_URL` به یک PostgreSQL مدیریت‌شده (Neon/Supabase/…) وصل شود. `prisma migrate deploy` در مرحله‌ی build.
- **سرور اختصاصی:** `npm run build && npm start` پشت Nginx (reverse proxy). PostgreSQL 18 محلی یا ریموت. `NEXT_PUBLIC_BASE_URL` را روی دامنه‌ی واقعی ست کن.
- قبل از استقرار: `npm run build` باید بدون خطا pass شود.

---

## TODO (فازهای بعدی)

- [ ] **زرین‌پال:** پس از دریافت `ZARINPAL_MERCHANT_ID`، مسیرهای `/api/payment/*`، صفحات `/payment/success` و `/payment/failed`، و اتصال درگاه از صفحه‌ی سفارش.
- [ ] پنل مدیریت کامل (محصولات، سفارش‌ها، کاربران، کوپن، کامنت‌ها).
- [ ] فرم تماس واقعی (`/contact`) و صفحات حساب کاربری (سفارش‌های من، آدرس‌ها).
- [ ] سبد خرید دیتابیسی (الان localStorage است).
- [ ] محتوای نهایی صفحات about/terms.
