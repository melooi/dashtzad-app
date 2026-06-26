// Seed: 1 admin, 1 user, 3 categories, 5 products, 2 posts. 0 orders, 0 reviews.
// Prices are stored as integer Rial (display = Rial / 10 = Toman).
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  siteSettingsSchema,
  businessInfoSchema,
  contactInfoSchema,
  brandSettingsSchema,
  headerSchema,
  footerSchema,
  homepageSchema,
  socialLinksSchema,
  seoDefaultsSchema,
} from "../src/lib/admin/globals";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // DEV-ONLY: this seed DELETES all data then re-creates the dev dataset.
  // Guard against accidentally wiping a production/staging database.
  if (process.env.NODE_ENV === "production" && process.env.FORCE_SEED !== "true") {
    throw new Error(
      "Refusing to seed: NODE_ENV=production. This seed wipes all data. Set FORCE_SEED=true to override intentionally.",
    );
  }

  // ---- Clean (reverse FK order) ----
  // Site experience & globals (ADMIN-CP4) — no FK to legacy data.
  await prisma.globalSetting.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.fAQItem.deleteMany();
  await prisma.fAQGroup.deleteMany();
  await prisma.redirect.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.weightPreset.deleteMany();
  await prisma.packagingOption.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  // ---- Users ----
  const admin = await prisma.user.create({
    data: {
      phoneNumber: "09120000000",
      name: "ادمین دشت‌زاد",
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      phoneNumber: "09120000001",
      name: "کاربر تستی",
      role: "USER",
      isActive: true,
    },
  });

  // ---- Categories ----
  const ajeel = await prisma.category.create({
    data: { title: "آجیل و خشکبار", slug: "ajeel", englishTitle: "Nuts & Dried", type: "PRODUCT" },
  });
  const saffron = await prisma.category.create({
    data: { title: "زعفران و ادویه", slug: "saffron-spices", englishTitle: "Saffron & Spices", type: "PRODUCT" },
  });
  const cooking = await prisma.category.create({
    data: { title: "آشپزی", slug: "cooking", englishTitle: "Cooking", type: "POST" },
  });

  // ---- Products (price_rial = Toman * 10) ----
  const products = [
    {
      title: "زعفران سرگل ممتاز - یک مثقال",
      slug: "saffron-sargol-1-mesghal",
      description: "زعفران سرگل ممتاز قائنات، یک مثقال (۴.۶ گرم) در بسته‌بندی نفیس.",
      brand: "دشت‌زاد",
      price_rial: 28_000_000,
      offPrice_rial: 25_000_000,
      discountPercent: 10,
      countInStock: 40,
      tags: ["زعفران", "سرگل", "قائنات"],
      categoryId: saffron.id,
      img: "/placeholders/product-1.svg",
    },
    {
      title: "زعفران نگین - ۵ گرم",
      slug: "saffron-negin-5g",
      description: "زعفران نگین درجه یک با رشته‌های بلند، ۵ گرم.",
      brand: "دشت‌زاد",
      price_rial: 32_000_000,
      offPrice_rial: null,
      discountPercent: 0,
      countInStock: 25,
      tags: ["زعفران", "نگین"],
      categoryId: saffron.id,
      img: "/placeholders/product-2.svg",
    },
    {
      title: "پسته اکبری - یک کیلوگرم",
      slug: "pistachio-akbari-1kg",
      description: "پسته اکبری خندان و تازه، یک کیلوگرم.",
      brand: "دشت‌زاد",
      price_rial: 12_000_000,
      offPrice_rial: 10_500_000,
      discountPercent: 12,
      countInStock: 60,
      tags: ["پسته", "اکبری", "آجیل"],
      categoryId: ajeel.id,
      img: "/placeholders/product-3.svg",
    },
    {
      title: "بادام درختی خام - یک کیلوگرم",
      slug: "almond-raw-1kg",
      description: "بادام درختی خام و مرغوب، یک کیلوگرم.",
      brand: "دشت‌زاد",
      price_rial: 9_000_000,
      offPrice_rial: null,
      discountPercent: 0,
      countInStock: 80,
      tags: ["بادام", "خام", "آجیل"],
      categoryId: ajeel.id,
      img: "/placeholders/product-4.svg",
    },
    {
      title: "آجیل مخلوط شور - یک کیلوگرم",
      slug: "mixed-nuts-salted-1kg",
      description: "آجیل مخلوط شور ممتاز شامل پسته، بادام، فندق و بادام هندی.",
      brand: "دشت‌زاد",
      price_rial: 15_000_000,
      offPrice_rial: 13_800_000,
      discountPercent: 8,
      countInStock: 50,
      tags: ["آجیل", "مخلوط", "شور"],
      categoryId: ajeel.id,
      img: "/placeholders/product-5.svg",
    },
  ];

  for (const p of products) {
    const { img, ...data } = p;
    await prisma.product.create({
      data: {
        ...data,
        images: { create: [{ url: img, alt: p.title, sortOrder: 0 }] },
      },
    });
  }

  // ---- Weight presets (gramValue in grams; compatibility = PRODUCT category IDs) ----
  // Seed has two PRODUCT categories: saffron (زعفران و ادویه) and ajeel (آجیل و خشکبار).
  // rice has no dedicated category → left global ([]).
  await prisma.weightPreset.createMany({
    data: [
      // saffron
      { title: "نیم گرم", gramValue: 0.5, compatibility: [saffron.id], sortOrder: 1 },
      { title: "۱ گرم", gramValue: 1, compatibility: [saffron.id], sortOrder: 2 },
      { title: "۲ گرم", gramValue: 2, compatibility: [saffron.id], sortOrder: 3 },
      { title: "۳ گرم", gramValue: 3, compatibility: [saffron.id], sortOrder: 4 },
      { title: "۵ گرم", gramValue: 5, compatibility: [saffron.id], sortOrder: 5 },
      { title: "۱۰ گرم", gramValue: 10, compatibility: [saffron.id], sortOrder: 6 },
      // nuts / dried fruits
      { title: "۲۵۰ گرم", gramValue: 250, compatibility: [ajeel.id], sortOrder: 7 },
      { title: "۵۰۰ گرم", gramValue: 500, compatibility: [ajeel.id], sortOrder: 8 },
      { title: "۱ کیلوگرم", gramValue: 1000, compatibility: [ajeel.id], sortOrder: 9 },
      // rice (no category yet → global)
      { title: "۵ کیلوگرم", gramValue: 5000, compatibility: [], sortOrder: 11 },
      { title: "۱۰ کیلوگرم", gramValue: 10000, compatibility: [], sortOrder: 12 },
      // spices / tea (grouped under saffron category)
      { title: "۵۰ گرم", gramValue: 50, compatibility: [saffron.id], sortOrder: 13 },
      { title: "۱۰۰ گرم", gramValue: 100, compatibility: [saffron.id], sortOrder: 14 },
    ],
  });

  // ---- Packaging options (cost_rial = Toman × 10; compatibility = category IDs) ----
  await prisma.packagingOption.createMany({
    data: [
      { title: "پاکت ۲۵۰ گرمی", type: "POUCH", capacityGram: 250, cost_rial: 300_000, compatibility: [ajeel.id], sortOrder: 1 },
      { title: "پاکت ۵۰۰ گرمی", type: "POUCH", capacityGram: 500, cost_rial: 400_000, compatibility: [ajeel.id], sortOrder: 2 },
      { title: "پاکت ۱ کیلوگرمی", type: "POUCH", capacityGram: 1000, cost_rial: 500_000, compatibility: [ajeel.id], sortOrder: 3 },
      { title: "قوطی ۱ گرمی", type: "TIN", capacityGram: 1, cost_rial: 800_000, compatibility: [saffron.id], sortOrder: 4 },
      { title: "قوطی ۵ گرمی", type: "TIN", capacityGram: 5, cost_rial: 1_200_000, compatibility: [saffron.id], sortOrder: 5 },
      { title: "وکیوم ۵۰۰ گرمی", type: "VACUUM", capacityGram: 500, cost_rial: 600_000, compatibility: [ajeel.id], sortOrder: 6 },
      { title: "جعبه هدیه", type: "BOX", capacityGram: 1000, cost_rial: 1_500_000, compatibility: [saffron.id, ajeel.id], sortOrder: 7 },
      { title: "گونی بزرگ", type: "SACK", capacityGram: 10000, cost_rial: 900_000, compatibility: [], sortOrder: 8 },
    ],
  });

  // ---- Posts ----
  await prisma.post.create({
    data: {
      title: "راهنمای کامل دم‌کردن زعفران",
      slug: "how-to-brew-saffron",
      type: "FREE",
      status: "PUBLISHED",
      briefText: "چطور از زعفران بیشترین رنگ و عطر را بگیریم؟",
      text: "برای دم‌کردن زعفران، ابتدا آن را در هاون بسابید تا پودر شود، سپس با کمی آب جوش یا یخ دم کنید و چند دقیقه صبر کنید.",
      coverImage: "/placeholders/post-1.svg",
      readingTime: 4,
      tags: ["زعفران", "آشپزی", "ترفند"],
      authorId: admin.id,
      categoryId: cooking.id,
    },
  });

  // ============================================================
  // Site Experience & Globals (ADMIN-CP4)
  // ============================================================

  // ---- Menus ----
  const headerMain = await prisma.menu.create({
    data: { title: "منوی اصلی هدر", slug: "header-main", location: "HEADER_MAIN", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      { menuId: headerMain.id, label: "خانه", href: "/", linkType: "INTERNAL", sortOrder: 0 },
      { menuId: headerMain.id, label: "محصولات", href: "/products", linkType: "INTERNAL", sortOrder: 1 },
      { menuId: headerMain.id, label: "بلاگ", href: "/blog", linkType: "INTERNAL", sortOrder: 2 },
      { menuId: headerMain.id, label: "درباره ما", href: "/about", linkType: "PAGE", sortOrder: 3 },
      { menuId: headerMain.id, label: "تماس", href: "/contact", linkType: "PAGE", sortOrder: 4 },
    ],
  });

  const footerPrimary = await prisma.menu.create({
    data: { title: "راهنما و پشتیبانی", slug: "footer-primary", location: "FOOTER_PRIMARY", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      { menuId: footerPrimary.id, label: "پرسش‌های متداول", href: "/faq", linkType: "PAGE", sortOrder: 0 },
      { menuId: footerPrimary.id, label: "قوانین و مقررات", href: "/terms", linkType: "PAGE", sortOrder: 1 },
      { menuId: footerPrimary.id, label: "تماس با ما", href: "/contact", linkType: "PAGE", sortOrder: 2 },
      { menuId: footerPrimary.id, label: "پیگیری سفارش", href: "/orders/track", linkType: "PAGE", sortOrder: 3 },
      { menuId: footerPrimary.id, label: "درباره‌ی ما", href: "/about", linkType: "PAGE", sortOrder: 4 },
    ],
  });

  const footerSecondary = await prisma.menu.create({
    data: { title: "فوتر — فروشگاه", slug: "footer-secondary", location: "FOOTER_SECONDARY", sortOrder: 2 },
  });
  await prisma.menuItem.createMany({
    data: [
      { menuId: footerSecondary.id, label: "زعفران و ادویه", href: "/products?category=saffron-spices", linkType: "CATEGORY", sortOrder: 0 },
      { menuId: footerSecondary.id, label: "آجیل و خشکبار", href: "/products?category=ajeel", linkType: "CATEGORY", sortOrder: 1 },
    ],
  });

  // ---- FAQ groups + items (matching design-export/pages/faq.html) ----
  const faqGeneral = await prisma.fAQGroup.create({
    data: {
      title: "محصولات، اصالت و نگهداری",
      slug: "g-product",
      description: "تاریخ مصرف، نگهداری، اصالت زعفران، وزن و استانداردها",
      placement: "GENERAL",
      sortOrder: 1,
      items: {
        create: [
          {
            question: "محصولات تاریخ تولید و مصرف دارند؟ ماندگاری‌شان چقدر است؟",
            answer: `<p>بله. روی هر بسته <strong>تاریخ تولید/بسته‌بندی</strong> و <strong>تاریخ انقضا (یا بهترین زمان مصرف)</strong> درج شده است. ماندگاری تقریبی محصولات در شرایط نگهداری درست به این صورت است:</p><div class="dz-faq-facts"><span class="dz-faq-fact"><i class="dz-icon ri-bowl-line" aria-hidden="true"></i> برنج: تا ۱۸ ماه</span><span class="dz-faq-fact"><i class="dz-icon ri-seedling-line" aria-hidden="true"></i> حبوبات: تا ۱۲ ماه</span><span class="dz-faq-fact"><i class="dz-icon ri-medicine-bottle-line" aria-hidden="true"></i> زعفران: تا ۲۴ ماه</span><span class="dz-faq-fact"><i class="dz-icon ri-bowl-line" aria-hidden="true"></i> خشکبار و آجیل: ۶ تا ۹ ماه</span></div><div class="dz-faq-note"><i class="dz-icon ri-information-line" aria-hidden="true"></i><span>این بازه‌ها برای بسته‌بندیِ پلمب‌شده و نگهداری در جای خشک و خنک است. برنج کهنه با گذر زمان عطر و خاصیت دانه‌دانه‌شدنش بهتر هم می‌شود.</span></div>`,
            sortOrder: 0,
          },
          {
            question: "محصولات را چطور نگهداری کنم که تازه بمانند و آفت نزنند؟",
            answer: `<p>کلید ماندگاری، نگهداری در جای <strong>خشک، خنک و دور از نور و رطوبت</strong> است. پس از باز کردن بسته، محتویات را در ظرف دربسته بریزید:</p><div class="dz-faq-facts"><span class="dz-faq-fact"><i class="dz-icon ri-box-3-line" aria-hidden="true"></i> برنج و حبوبات: ظرف دربسته، دور از رطوبت</span><span class="dz-faq-fact"><i class="dz-icon ri-snowy-line" aria-hidden="true"></i> برای جلوگیری از شپشه: نگهداری در فریزر</span><span class="dz-faq-fact"><i class="dz-icon ri-flask-line" aria-hidden="true"></i> زعفران: شیشه دربسته، دور از نور</span></div><div class="dz-faq-note"><i class="dz-icon ri-lightbulb-line" aria-hidden="true"></i><span>گذاشتن چند حبه نمک خشک یا چند برگ بو لای برنج، یک ترفند خانگیِ قدیمی برای دور نگه‌داشتن آفت است. خشکبار و آجیل را برای ماندگاری بیشتر در یخچال نگه دارید.</span></div>`,
            sortOrder: 1,
          },
          {
            question: "اصالت و خلوص زعفران چطور تضمین می‌شود؟",
            answer: `<p>زعفران دشت‌زاد از نوع <strong>سرگلِ خالص</strong> است؛ بدون رنگ مصنوعی، پُرکُن یا اجزای افزوده. کیفیت آن بر پایه استاندارد بین‌المللی زعفران یعنی <strong>ISO 3632</strong> سنجیده می‌شود — استانداردی که میزان رنگ‌دهی (کروسین)، تلخی (پیکروکروسین) و عطر (سافرانال) را اندازه می‌گیرد.</p><div class="dz-faq-facts"><span class="dz-faq-fact"><i class="dz-icon ri-flask-line" aria-hidden="true"></i> آزمون آزمایشگاهی طبق ISO 3632</span><span class="dz-faq-fact"><i class="dz-icon ri-forbid-2-line" aria-hidden="true"></i> بدون رنگ و افزودنی</span><span class="dz-faq-fact"><i class="dz-icon ri-verified-badge-line" aria-hidden="true"></i> دارای استاندارد ملی</span></div><div class="dz-faq-note"><i class="dz-icon ri-checkbox-circle-line" aria-hidden="true"></i><span>یک آزمایش ساده خانگی: زعفران اصل در آب سرد به‌آرامی و یکدست رنگ می‌دهد، نه فوری و پررنگ؛ و رشته‌ها رنگ خود را پس از خیساندن از دست نمی‌دهند.</span></div>`,
            sortOrder: 2,
          },
          {
            question: "وزن درج‌شده روی بسته دقیق است؟",
            answer: `<p>بله. وزن نوشته‌شده روی بسته، <strong>وزن خالصِ محصول</strong> (بدون بسته‌بندی) است و با ترازوهای کالیبره‌شده و مطابق الزامات <strong>سازمان ملی استاندارد ایران</strong> توزین می‌شود.</p><div class="dz-faq-note"><i class="dz-icon ri-scales-3-line" aria-hidden="true"></i><span>برای محصولات طبیعی و فله ممکن است اختلاف بسیار ناچیز و مجاز وجود داشته باشد؛ اگر وزن دریافتی به‌طور محسوس کمتر بود، طبق ضمانت بازگشت کالا رسیدگی می‌شود.</span></div>`,
            sortOrder: 3,
          },
          {
            question: "محصولات چه مجوزها و استانداردهایی دارند؟",
            answer: `<p>همه محصولات خوراکی دشت‌زاد دارای مجوزهای بهداشتی لازم برای عرضه و فروش هستند:</p><div class="dz-faq-facts"><span class="dz-faq-fact"><i class="dz-icon ri-shield-line" aria-hidden="true"></i> پروانه بهداشت از سازمان غذا و دارو</span><span class="dz-faq-fact"><i class="dz-icon ri-verified-badge-line" aria-hidden="true"></i> نشان استاندارد ملی برای اقلام مشمول</span><span class="dz-faq-fact"><i class="dz-icon ri-box-3-line" aria-hidden="true"></i> بسته‌بندی بهداشتی و پلمب‌دار</span></div><div class="dz-faq-note"><i class="dz-icon ri-information-line" aria-hidden="true"></i><span>مشخصات و مجوز هر محصول در صفحه همان کالا در فروشگاه قابل مشاهده است.</span></div>`,
            sortOrder: 4,
          },
        ],
      },
    },
  });

  await prisma.fAQGroup.create({
    data: {
      title: "ارسال و تحویل",
      slug: "g-ship",
      description: "زمان رسیدن، هزینه ارسال و پیگیری سفارش",
      placement: "GENERAL",
      sortOrder: 2,
      items: {
        create: [
          {
            question: "ارسال چقدر طول می‌کشد؟",
            answer: `<p>سفارش‌هایی که تا <strong>ساعت ۱۲ ظهر</strong> ثبت شوند، همان روز کاری بسته‌بندی و تحویل پست/پیک می‌شوند. زمان رسیدن به دست شما بسته به مقصد است:</p><div class="dz-faq-facts"><span class="dz-faq-fact"><i class="dz-icon ri-map-pin-line" aria-hidden="true"></i> تهران: ۱ تا ۲ روز کاری</span><span class="dz-faq-fact"><i class="dz-icon ri-map-2-line" aria-hidden="true"></i> مراکز استان‌ها: ۲ تا ۳ روز کاری</span><span class="dz-faq-fact"><i class="dz-icon ri-landscape-line" aria-hidden="true"></i> سایر شهرها: ۳ تا ۴ روز کاری</span></div><div class="dz-faq-note"><i class="dz-icon ri-information-line" aria-hidden="true"></i><span>روزهای تعطیل رسمی جزو روزهای کاری حساب نمی‌شوند. در ایام پرسفارش (مثل شب عید) ممکن است یک روز به این بازه اضافه شود؛ در آن صورت پیش از خرید اطلاع‌رسانی می‌کنیم.</span></div>`,
            sortOrder: 0,
          },
          {
            question: "هزینه ارسال چطور حساب می‌شود؟",
            answer: `<p>هزینه ارسال بر اساس <strong>وزن سفارش</strong> و <strong>مقصد</strong> محاسبه و پیش از نهایی‌شدن خرید، در صفحه پرداخت به‌صورت دقیق به شما نمایش داده می‌شود؛ هیچ هزینه پنهانی وجود ندارد.</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-gift-line" aria-hidden="true"></i> خرید بالای ۷۰۰٬۰۰۰ تومان: ارسال رایگان</span><span class="dz-faq-fact"><i class="dz-icon ri-box-3-line" aria-hidden="true"></i> سفارش‌های سنگین: بر اساس تعرفه باربری</span></div><p>برای شهرهای دارای پیک، امکان <strong>ارسال سریع همان‌روز</strong> هم با هزینه جداگانه در دسترس است.</p>`,
            sortOrder: 1,
          },
          {
            question: "سفارشم را چطور پیگیری کنم؟",
            answer: `<p>به‌محض ارسال سفارش، یک <strong>کد رهگیری</strong> از طریق پیامک برایتان فرستاده می‌شود. وضعیت سفارش را به دو روش می‌توانید ببینید:</p><ul class="dz-faq-steps"><li><b>۱</b><span>از صفحه پیگیری سفارش با کد رهگیری و شماره موبایل، مرحله‌به‌مرحله وضعیت را ببینید.</span></li><li><b>۲</b><span>کد رهگیری را در سامانه شرکت پست/پیک وارد کنید تا موقعیت دقیق مرسوله را دنبال کنید.</span></li></ul><div class="dz-faq-note"><i class="dz-icon ri-notification-3-line" aria-hidden="true"></i><span>در هر مرحله (تایید، بسته‌بندی، ارسال و تحویل) یک پیامک به‌روزرسانی دریافت می‌کنید.</span></div>`,
            sortOrder: 2,
          },
          {
            question: "به سراسر کشور ارسال دارید؟ بسته‌بندی مواد غذایی چطور است؟",
            answer: `<p>بله، به <strong>سراسر ایران</strong> از طریق پست و باربری ارسال می‌کنیم. محصولات خوراکی با <strong>بسته‌بندی بهداشتی، پلمب‌شده و مقاوم</strong> ارسال می‌شوند تا سالم و تازه به دستتان برسند.</p><div class="dz-faq-facts"><span class="dz-faq-fact"><i class="dz-icon ri-truck-line" aria-hidden="true"></i> ارسال به همه شهرها و روستاها</span><span class="dz-faq-fact"><i class="dz-icon ri-box-3-line" aria-hidden="true"></i> لفاف محافظ برای اقلام شکننده</span></div><div class="dz-faq-note"><i class="dz-icon ri-information-line" aria-hidden="true"></i><span>برای مناطق دورافتاده ممکن است یک تا دو روز به زمان ارسال اضافه شود. ارسال به خارج از کشور فعلاً تنها برای سفارش‌های خاص و با هماهنگی پشتیبانی انجام می‌شود.</span></div>`,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  await prisma.fAQGroup.create({
    data: {
      title: "ضمانت کیفیت و بازگشت کالا",
      slug: "g-return",
      description: "کالای معیوب، مهلت پیگیری، مدارک لازم و نحوه جبران",
      placement: "GENERAL",
      sortOrder: 3,
      items: {
        create: [
          {
            question: "امکان مرجوع‌کردن کالا هست؟",
            answer: `<p>بله. کالای سالم را تا <strong>۷ روز</strong> پس از دریافت می‌توانید مرجوع کنید، به شرط آن‌که <strong>بسته‌بندی باز نشده</strong> و کالا دست‌نخورده باشد. کافی است از بخش پیگیری سفارش درخواست مرجوعی را ثبت کنید.</p><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-error-warning-line" aria-hidden="true"></i><span>اقلام خوراکیِ <strong>باز یا مصرف‌شده</strong> به دلیل بهداشتی قابل مرجوع نیستند، مگر ایراد کیفی داشته باشند.</span></div>`,
            sortOrder: 0,
          },
          {
            question: "با محصول مشکل‌دار یا خراب چطور برخورد می‌شود؟",
            answer: `<p>پیش از هر چیز عذرخواهی می‌کنیم و خیالتان راحت باشد که <strong>هزینه‌ای بابت آن نمی‌پردازید</strong>. روند رسیدگی ساده است:</p><ul class="dz-faq-steps"><li><b>۱</b><span>مشکل را از بخش پیگیری سفارش یا از طریق پشتیبانی ثبت کنید.</span></li><li><b>۲</b><span>کارشناسان ما طی <strong>۲۴ ساعت</strong> بررسی و با شما تماس می‌گیرند.</span></li><li><b>۳</b><span>به‌انتخاب شما، جبران انجام می‌شود (جزئیات در پرسش‌های پایین‌تر).</span></li></ul>`,
            sortOrder: 1,
          },
          {
            question: "مهلت پیگیری کالای معیوب چند روز است؟",
            answer: `<p>هرچه زودتر اطلاع دهید، رسیدگی سریع‌تر است. بازه زمانی ثبت مشکل به این صورت است:</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-inbox-unarchive-line" aria-hidden="true"></i> کالای معیوب یا مغایر: تا ۴۸ ساعت پس از تحویل</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-search-line" aria-hidden="true"></i> ایراد کیفیِ پنهان: تا ۷ روز پس از تحویل</span></div><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-time-line" aria-hidden="true"></i><span>برای ثبت سریع‌تر، بهتر است بسته آسیب‌دیده را پیش از باز کردنِ کامل، همان لحظه تحویل بررسی کنید.</span></div>`,
            sortOrder: 2,
          },
          {
            question: "برای ثبت مشکل حتماً باید عکس یا ویدیو بفرستم؟",
            answer: `<p>بله، ثبت <strong>عکس یا ویدیو</strong> کمک می‌کند مشکل سریع‌تر و دقیق‌تر بررسی شود و معمولاً نیاز به ارسال کالا برای کارشناسی را حذف می‌کند.</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-camera-line" aria-hidden="true"></i> یک عکس واضح از کالا</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-box-3-line" aria-hidden="true"></i> عکس بسته‌بندی و برچسب</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-video-line" aria-hidden="true"></i> ویدیوی باز کردن بسته (در صورت امکان)</span></div><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-information-line" aria-hidden="true"></i><span>اگر امکان تهیه عکس نبود، باز هم می‌توانید درخواست را ثبت کنید؛ تنها ممکن است بررسی کمی بیشتر طول بکشد.</span></div>`,
            sortOrder: 3,
          },
          {
            question: "پول من برمی‌گردد یا کالای جایگزین می‌فرستید؟",
            answer: `<p>پس از تایید مشکل، <strong>انتخاب با شماست</strong>:</p><ul class="dz-faq-steps"><li><b>۱</b><span><strong>ارسال جایگزین رایگان:</strong> کالای سالم در اولین فرصت و بدون هزینه ارسال برای شما فرستاده می‌شود.</span></li><li><b>۲</b><span><strong>بازگشت کامل وجه:</strong> مبلغ طی <strong>۳ تا ۵ روز کاری</strong> به حساب یا کیف پول شما در سایت بازمی‌گردد.</span></li></ul><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-hand-heart-line" aria-hidden="true"></i><span>اگر فقط بخشی از سفارش مشکل داشته باشد، جبران تنها برای همان قلم انجام می‌شود و بقیه سفارش دست‌نخورده می‌ماند.</span></div>`,
            sortOrder: 4,
          },
          {
            question: "کیفیت برنج‌ها چطور تضمین می‌شود؟",
            answer: `<p>برنج‌های دشت‌زاد مستقیم از <strong>شالیزارهای شمال و باغ‌های خانوادگی</strong> تامین می‌شوند؛ بدون واسطه، بدون اسانس و رنگ افزودنی. هر بسته با همین وسواس کنترل می‌شود:</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-seedling-line" aria-hidden="true"></i> صددرصد طبیعی، بدون افزودنی</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-calendar-check-line" aria-hidden="true"></i> درج سال برداشت روی بسته</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-windy-line" aria-hidden="true"></i> بوجاری و سورت دانه‌به‌دانه</span></div><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-award-line" aria-hidden="true"></i><span><strong>ضمانت عطر و دانه‌دانه‌شدن:</strong> اگر برنج دریافتی مطابق توضیحات نبود، بدون چون‌وچرا تعویض می‌شود یا وجهش بازمی‌گردد.</span></div>`,
            sortOrder: 5,
          },
        ],
      },
    },
  });

  await prisma.fAQGroup.create({
    data: {
      title: "پرداخت و روش‌های خرید",
      slug: "g-pay",
      description: "امنیت تراکنش، روش‌های پرداخت و خرید عمده",
      placement: "GENERAL",
      sortOrder: 4,
      items: {
        create: [
          {
            question: "پرداخت در دشت‌زاد چقدر امن است؟",
            answer: `<p>پرداخت‌ها از طریق <strong>درگاه بانکی معتبر و مورد تایید شاپرک</strong> انجام می‌شود و تمام ارتباط شما با سایت با پروتکل امن <strong>SSL</strong> رمزنگاری شده است.</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-lock-line" aria-hidden="true"></i> رمزنگاری SSL سرتاسری</span><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-bank-card-line" aria-hidden="true"></i> اطلاعات کارت نزد ما ذخیره نمی‌شود</span><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-bank-line" aria-hidden="true"></i> درگاه رسمی بانکی</span></div><p>اطلاعات کارت شما فقط در صفحه بانک وارد می‌شود و دشت‌زاد به آن دسترسی ندارد.</p><div class="dz-faq-note dz-faq-note--gold"><i class="dz-icon ri-shield-check-line" aria-hidden="true"></i><span>اگر مبلغی از حساب شما کسر شد اما سفارش ثبت نشد، طبق قوانین بانکی حداکثر تا <strong>۷۲ ساعت</strong> به‌صورت خودکار بازمی‌گردد.</span></div>`,
            sortOrder: 0,
          },
          {
            question: "چه روش‌های پرداختی دارید؟",
            answer: `<p>برای راحتی شما چند روش پرداخت در دسترس است:</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-bank-card-line" aria-hidden="true"></i> پرداخت آنلاین با همه کارت‌های شتاب</span><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-wallet-3-line" aria-hidden="true"></i> کیف پول دشت‌زاد</span><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-cash-line" aria-hidden="true"></i> پرداخت در محل (شهرهای منتخب)</span></div><div class="dz-faq-note dz-faq-note--gold"><i class="dz-icon ri-information-line" aria-hidden="true"></i><span>پرداخت در محل برای همه مناطق فعال نیست؛ در صورت پشتیبانی، این گزینه هنگام نهایی‌کردن سفارش نمایش داده می‌شود.</span></div>`,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await prisma.fAQGroup.create({
    data: {
      title: "حساب کاربری و پروفایل",
      slug: "g-account",
      description: "ساخت حساب، ثبت آدرس، رمز عبور، اطلاعات حقوقی و باشگاه مشتریان",
      placement: "GENERAL",
      sortOrder: 5,
      items: {
        create: [
          {
            question: "چگونه حساب کاربری بسازم؟",
            answer: `<p>ساخت حساب در چند ثانیه انجام می‌شود:</p><ul class="dz-faq-steps"><li><b>۱</b><span>روی گزینه «ورود / ثبت‌نام» کلیک کنید و شماره موبایل خود را وارد کنید.</span></li><li><b>۲</b><span>کد فعال‌سازی پیامک‌شده را وارد کنید تا حساب ساخته شود.</span></li><li><b>۳</b><span>از بخش «تکمیل اطلاعات»، نام و مشخصات خود را کامل کنید.</span></li></ul>`,
            sortOrder: 0,
          },
          {
            question: "چطور آدرس خود را در حساب کاربری ثبت کنم؟",
            answer: `<p>پس از تکمیل اطلاعات کاربری، به بخش <strong>«نشانی‌ها»</strong> در حساب کاربری خود بروید و آدرس جدید را با <strong>کد پستی و جزئیات دقیق</strong> ثبت کنید. می‌توانید چند آدرس ذخیره کنید و هنگام خرید یکی را انتخاب کنید.</p>`,
            sortOrder: 1,
          },
          {
            question: "چگونه یک رمز عبور امن بسازم؟",
            answer: `<p>رمز قوی و غیرقابل‌حدس، بهترین سپر در برابر نفوذ به حساب شماست:</p><div class="dz-faq-facts"><span class="dz-faq-fact"><i class="dz-icon ri-key-2-line" aria-hidden="true"></i> دست‌کم ۸ کاراکتر</span><span class="dz-faq-fact"><i class="dz-icon ri-font-size" aria-hidden="true"></i> ترکیب حروف بزرگ، کوچک، عدد و نماد</span><span class="dz-faq-fact"><i class="dz-icon ri-spy-line" aria-hidden="true"></i> پرهیز از اطلاعات قابل‌حدس (تاریخ تولد، شماره موبایل)</span></div><div class="dz-faq-note"><i class="dz-icon ri-shield-line" aria-hidden="true"></i><span>از یک رمز تکراری در چند سایت استفاده نکنید؛ برای هر حساب یک رمز یکتا بسازید.</span></div>`,
            sortOrder: 2,
          },
          {
            question: "رمز عبورم را فراموش کرده‌ام؛ چطور بازیابی کنم؟",
            answer: `<p>جای نگرانی نیست. در صفحه ورود، گزینه <strong>«فراموشی رمز عبور»</strong> را بزنید؛ کد تایید به موبایل شما پیامک می‌شود و پس از تایید، می‌توانید رمز تازه‌ای تعریف کنید.</p>`,
            sortOrder: 3,
          },
          {
            question: "چطور مشخصات و ایمیل خود را ویرایش کنم؟",
            answer: `<p>پس از ورود به حساب کاربری، به بخش <strong>«پروفایل / اطلاعات شخصی»</strong> بروید و گزینه <strong>«ویرایش اطلاعات شخصی»</strong> را بزنید تا نام، ایمیل و سایر مشخصات را به‌روز کنید.</p>`,
            sortOrder: 4,
          },
          {
            question: "چطور شماره کارت خود را ثبت کنم؟",
            answer: `<p>در حساب کاربری، بخش <strong>اطلاعات بانکی / کارت‌ها</strong>، شماره کارت خود را وارد کنید. این شماره برای <strong>بازگشت وجه</strong> سفارش‌های مرجوعی یا لغو‌شده استفاده می‌شود.</p><div class="dz-faq-note"><i class="dz-icon ri-information-line" aria-hidden="true"></i><span>شماره کارت باید به نام صاحب حساب کاربری باشد.</span></div>`,
            sortOrder: 5,
          },
          {
            question: "چطور برای شرکت یا شخص حقوقی خرید کنم؟",
            answer: `<p>وارد پروفایل شوید، گزینه <strong>«ویرایش اطلاعات شخصی»</strong> و سپس <strong>«ایجاد اطلاعات حقوقی»</strong> را انتخاب و اطلاعات شرکت (نام، شناسه ملی و کد اقتصادی) را ثبت کنید تا فاکتور رسمی صادر شود.</p><a class="dz-faq-link" href="/faq#g-corporate"><i class="dz-icon ri-gift-line" aria-hidden="true"></i> بیشتر درباره خرید سازمانی</a>`,
            sortOrder: 6,
          },
        ],
      },
    },
  });

  await prisma.fAQGroup.create({
    data: {
      title: "باشگاه مشتریان و امتیازها",
      slug: "g-club",
      description: "عضویت، کسب و خرج امتیاز، ثبت دیدگاه و کدهای تخفیف",
      placement: "GENERAL",
      sortOrder: 6,
      items: {
        create: [
          {
            question: "برای عضویت در باشگاه مشتریان چه کاری باید بکنم؟",
            answer: `<p>هیچ اقدام جداگانه‌ای لازم نیست. <strong>به‌محض ساخت حساب کاربری</strong> در دشت‌زاد، به‌صورت خودکار عضو باشگاه مشتریان می‌شوید و می‌توانید امتیاز جمع کنید.</p>`,
            sortOrder: 0,
          },
          {
            question: "چطور امتیاز جمع کنم؟",
            answer: `<p>دو راه ساده برای جمع‌کردن امتیاز دارید:</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-shopping-cart-2-line" aria-hidden="true"></i> خرید کالا</span><span class="dz-faq-fact dz-faq-fact--gold"><i class="dz-icon ri-star-line" aria-hidden="true"></i> ثبت دیدگاه تایید‌شده</span></div><div class="dz-faq-note dz-faq-note--gold"><i class="dz-icon ri-calculator-line" aria-hidden="true"></i><span>امتیاز خرید بر اساس مبلغ سفارش محاسبه می‌شود (به ازای هر <strong>۱۰٬۰۰۰ تومان</strong> خرید، ۱ امتیاز) و به نوع کالا بستگی ندارد.</span></div>`,
            sortOrder: 1,
          },
          {
            question: "چطور برای کالای خریداری‌شده دیدگاه، عکس یا فیلم ثبت کنم؟",
            answer: `<p>به بخش پیگیری سفارش بروید، روی <strong>«جزئیات»</strong> سفارش و سپس <strong>«ثبت نظر»</strong> بزنید تا دیدگاه، عکس و فیلم خود را از کالا ثبت کنید.</p><div class="dz-faq-note dz-faq-note--gold"><i class="dz-icon ri-checkbox-circle-line" aria-hidden="true"></i><span>پس از تایید دیدگاه توسط کارشناسان، امتیاز آن برای شما ثبت می‌شود؛ تا پیش از تایید، در بخش تاریخچه با وضعیت «در صف بررسی» دیده می‌شود.</span></div>`,
            sortOrder: 2,
          },
          {
            question: "امتیاز خرید چه زمانی به حسابم می‌نشیند؟",
            answer: `<p>امتیاز خرید، <strong>پس از تحویل سفارش</strong> و گذشت مهلت بازگشت کالا (تا ۷ روز) و به‌شرط عدم مرجوعی، به حساب شما افزوده می‌شود. تا آن زمان، امتیاز در بخش تاریخچه با وضعیت «در صف بررسی» قابل مشاهده است.</p>`,
            sortOrder: 3,
          },
          {
            question: "چطور امتیازم را خرج کنم؟",
            answer: `<p>در صفحه باشگاه مشتریان، به بخش <strong>«جوایز»</strong> بروید تا پیشنهادهای متنوع را ببینید. امتیازها را می‌توانید صرف دریافت <strong>کد تخفیف</strong> و پیشنهادهای ویژه کنید.</p>`,
            sortOrder: 4,
          },
          {
            question: "کدهای تخفیفِ دریافتی‌ام را کجا ببینم و تا کی اعتبار دارند؟",
            answer: `<p>همه کدهای تخفیفی که با خرج‌کردن امتیاز دریافت کرده‌اید، در صفحه <strong>«تاریخچه»</strong> باشگاه با جزئیات و <strong>تاریخ انقضا</strong> قابل مشاهده‌اند.</p><div class="dz-faq-note dz-faq-note--gold"><i class="dz-icon ri-error-warning-line" aria-hidden="true"></i><span>پس از پایان اعتبار، کدهای تخفیف قابل تمدید یا تعویض نیستند. کد دریافتی به جهت امنیت، تنها در حساب کاربری خودتان قابل استفاده است.</span></div>`,
            sortOrder: 5,
          },
          {
            question: "اعتبار امتیازها تا چه زمانی است؟ آیا به پول تبدیل می‌شوند؟",
            answer: `<p>امتیازهای کسب‌شده در هر سال، <strong>تا پایان سال بعد</strong> معتبرند و پس از آن منقضی می‌شوند. امتیازها <strong>صرفاً</strong> برای استفاده از پیشنهادهای باشگاه هستند و <strong>قابل نقد شدن نیستند</strong>.</p>`,
            sortOrder: 6,
          },
          {
            question: "حساب کاربری سازمانی (حقوقی) هم امتیاز می‌گیرد؟",
            answer: `<p>باشگاه مشتریان دشت‌زاد در حال حاضر تنها برای <strong>اشخاص حقیقی</strong> فعال است و حساب‌های کاربری حقوقی امکان جمع‌کردن امتیاز ندارند.</p>`,
            sortOrder: 7,
          },
        ],
      },
    },
  });

  await prisma.fAQGroup.create({
    data: {
      title: "هدایای سازمانی و خرید سازمانی",
      slug: "g-corporate",
      description: "فاکتور رسمی، بسته‌بندی اختصاصی، توزیع چندمقصده و تسویه",
      placement: "GENERAL",
      sortOrder: 7,
      items: {
        create: [
          {
            question: "شرایط صدور فاکتور رسمی چگونه است؟",
            answer: `<p>برای خریدهای سازمانی و عمده، <strong>فاکتور رسمی</strong> همراه با اطلاعات حقوقی و مالیات بر ارزش افزوده صادر می‌شود. کافی است پیش از ثبت سفارش، اطلاعات زیر را به کارشناس فروش سازمانی بدهید:</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-building-line" aria-hidden="true"></i> نام شرکت و شناسه ملی</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-hashtag" aria-hidden="true"></i> کد اقتصادی و نشانی</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-percent-line" aria-hidden="true"></i> شامل ارزش افزوده</span></div><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-file-text-line" aria-hidden="true"></i><span>نسخه رسمی فاکتور پس از تایید سفارش برای شما ارسال می‌شود.</span></div>`,
            sortOrder: 0,
          },
          {
            question: "تحویل سفارش هدایای سازمانی چگونه است؟",
            answer: `<p>بسته به حجم سفارش، تحویل به دو صورت انجام می‌شود: <strong>تحویل یک‌جا</strong> به آدرس سازمان، یا <strong>توزیع جداگانه</strong> به گیرندگان. زمان‌بندی تحویل با هماهنگی قبلی و توسط کارشناس اختصاصی تنظیم می‌شود.</p><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-calendar-check-line" aria-hidden="true"></i><span>برای مناسبت‌های خاص (مانند عید یا روزهای سازمانی) بهتر است سفارش را چند روز زودتر ثبت کنید.</span></div>`,
            sortOrder: 1,
          },
          {
            question: "امکان بسته‌بندی محصول دیگری کنار محصولات دشت‌زاد وجود دارد؟",
            answer: `<p>بله؛ امکان بسته‌بندی اقلام دیگر در کنار محصولات دشت‌زاد وجود دارد. جهت هماهنگی تماس بگیرید.</p>`,
            sortOrder: 2,
          },
          {
            question: "امکان توزیع هدایای سازمانی به آدرس‌های مختلف وجود دارد؟",
            answer: `<p>بله. کافی است فهرست <strong>گیرندگان و آدرس‌ها</strong> را در قالب یک فایل در اختیار ما بگذارید تا هر هدیه به‌صورت جداگانه به مقصد خودش ارسال شود.</p><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-map-pin-line" aria-hidden="true"></i><span>هزینه توزیع چندمقصده بر اساس تعداد و پراکندگی آدرس‌ها محاسبه و پیش از تایید به شما اعلام می‌شود.</span></div>`,
            sortOrder: 3,
          },
          {
            question: "می‌توانیم کارت‌های هدیه را شخصی‌سازی کنیم؟",
            answer: `<p>بله. امکان درج <strong>لوگوی سازمان، پیام اختصاصی</strong> و طراحی کارت متناسب با هویت بصری شما وجود دارد تا هدیه حسّ و حال برند شما را داشته باشد.</p>`,
            sortOrder: 4,
          },
          {
            question: "می‌توانیم ترکیب محصولی خودمان را انتخاب کنیم؟",
            answer: `<p>بله. سبد هدیه را می‌توانید از میان محصولات دشت‌زاد به‌دلخواه و متناسب با <strong>بودجه موردنظر</strong> بچینید؛ کارشناس ما هم برای چیدمان بهتر پیشنهاد می‌دهد.</p>`,
            sortOrder: 5,
          },
          {
            question: "برای پیگیری سفارش چه کاری باید بکنم؟",
            answer: `<p>برای سفارش‌های سازمانی، یک <strong>کارشناس اختصاصی</strong> پیگیری را برعهده دارد و در هر مرحله شما را در جریان می‌گذارد. همچنین وضعیت سفارش از صفحه پیگیری سفارش و از طریق پیامک قابل پیگیری است.</p>`,
            sortOrder: 6,
          },
          {
            question: "نحوه تسویه‌حساب چگونه است؟",
            answer: `<p>تسویه‌حساب به چند روش امکان‌پذیر است:</p><div class="dz-faq-facts"><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-bank-card-line" aria-hidden="true"></i> پرداخت آنلاین</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-bank-line" aria-hidden="true"></i> واریز به حساب شرکتی</span><span class="dz-faq-fact dz-faq-fact--clay"><i class="dz-icon ri-bill-line" aria-hidden="true"></i> تسویه مرحله‌ای (سازمانی)</span></div><div class="dz-faq-note dz-faq-note--clay"><i class="dz-icon ri-shake-hands-line" aria-hidden="true"></i><span>برای سازمان‌ها، امکان تسویه مرحله‌ای (پیش‌پرداخت و تسویه مابقی پس از تایید) با توافق وجود دارد. حساب به نام «دشت‌زاد کشت و تجارت ایرانیان» است.</span></div><a class="dz-faq-link" href="#contact"><i class="dz-icon ri-customer-service-2-line" aria-hidden="true"></i> تماس با کارشناس فروش سازمانی</a>`,
            sortOrder: 7,
          },
        ],
      },
    },
  });

  // ---- Banner (homepage hero/top) ----
  await prisma.banner.create({
    data: {
      title: "ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان",
      slug: "free-shipping",
      subtitle: "تا پایان ماه",
      placement: "HOME_TOP",
      linkLabel: "مشاهده محصولات",
      linkHref: "/products",
      isActive: true,
      sortOrder: 0,
    },
  });

  // ---- Redirects (dev sample) ----
  await prisma.redirect.create({
    data: { source: "/shop", destination: "/products", statusCode: 301, isActive: true },
  });

  // ---- Globals ----
  const G = async (key: string, data: unknown) =>
    prisma.globalSetting.create({ data: { key, data: data as object } });

  await G("siteSettings", siteSettingsSchema.parse({
    siteName: "دشت‌زاد",
    siteShortName: "دشت‌زاد",
    tagline: "مواد غذایی پرمیوم ایرانی",
    siteUrl: "https://dashtzad.com",
    announcementText: "ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان",
    announcementActive: true,
    supportHoursShortText: "شنبه تا پنجشنبه، ۹ تا ۱۷",
  }));

  await G("businessInfo", businessInfoSchema.parse({
    brandName: "دشت‌زاد",
    legalName: "دشت‌زاد",
    address: "تهران، پیروزی، نبرد شمالی، کوچه خزایی، پلاک ۱، واحد ۶",
    province: "تهران",
    city: "تهران",
    foundedYear: "۱۳۱۳",
    businessDescription: "تولید و عرضه‌ی زعفران، آجیل، حبوبات و ادویه‌ی پرمیوم ایرانی از سال ۱۳۱۳.",
    aboutShortText: "دشت‌زاد، اصالت طعم ایرانی از سال ۱۳۱۳.",
  }));

  await G("contactInfo", contactInfoSchema.parse({
    primaryPhone: "۰۲۱-۹۲۰۰۲۶۶۱",
    supportPhone: "۰۲۱-۹۲۰۰۲۶۶۱",
    email: "info@dashtzad.com",
    supportEmail: "info@dashtzad.com",
    addressText: "تهران، پیروزی، نبرد شمالی، کوچه خزایی، پلاک ۱، واحد ۶",
    workingHours: "شنبه تا پنجشنبه، ۹ تا ۱۷",
    responseTimeText: "پاسخ‌گویی در کمتر از ۲۴ ساعت",
    showContactInFooter: true,
  }));

  await G("brandSettings", brandSettingsSchema.parse({
    primaryColor: "#4a6340",
    brandSlogan: "اصالت طعم ایرانی",
    brandStampText: "۱۳۱۳",
    footerBrandText: "مواد غذایی پرمیومِ ایرانی — زعفران، آجیل، حبوبات و ادویه. از سال ۱۳۱۳.",
    trustStatement: "کیفیت تضمین‌شده، اصالت از مزرعه تا سفره.",
  }));

  await G("header", headerSchema.parse({
    logoVariant: "full",
    mainMenuId: headerMain.id,
    showSearch: true,
    showCart: true,
    showAccount: true,
    showAnnouncement: true,
    stickyHeader: true,
  }));

  await G("footer", footerSchema.parse({
    footerMenuPrimaryId: footerPrimary.id,
    footerMenuSecondaryId: footerSecondary.id,
    showBusinessInfo: true,
    showContactInfo: true,
    showSocialLinks: true,
    newsletterTitle: "از تازه‌ها باخبر شوید",
    newsletterDescription: "با عضویت در خبرنامه از تخفیف‌ها و محصولات جدید مطلع شوید.",
    trustBadges: [
      { title: "ضمانت اصالت", description: "کیفیت تضمین‌شده", icon: "" },
      { title: "ارسال سریع", description: "بسته‌بندی ایمن", icon: "" },
    ],
    copyrightText: "© دشت‌زاد — تمام حقوق محفوظ است.",
  }));

  await G("homepage", homepageSchema.parse({
    blocks: [
      { id: "seed-hero", type: "Hero", isActive: true, eyebrow: "از سال ۱۳۱۳", title: "اصالت طعم ایرانی", subtitle: "زعفران، آجیل، حبوبات و ادویه‌ی پرمیوم — مستقیم از دشت تا سفره‌ی شما.", primaryCtaLabel: "مشاهده‌ی محصولات", primaryCtaHref: "/products" },
      { id: "seed-featured", type: "FeaturedProducts", isActive: true, title: "محصولات منتخب", mode: "LATEST", limit: 4 },
      { id: "seed-blog", type: "BlogPreview", isActive: true, title: "از بلاگ", mode: "LATEST", limit: 2 },
      { id: "seed-faq", type: "FAQGroup", isActive: true, title: "سوالات متداول", faqGroupId: faqGeneral.id },
    ],
  }));

  await G("socialLinks", socialLinksSchema.parse({
    links: [
      { platform: "instagram", label: "اینستاگرام", url: "https://instagram.com/dashtzad", icon: "", isActive: true, sortOrder: 0 },
      { platform: "telegram", label: "تلگرام", url: "https://t.me/dashtzad", icon: "", isActive: true, sortOrder: 1 },
    ],
  }));

  await G("seoDefaults", seoDefaultsSchema.parse({
    defaultTitle: "دشت‌زاد — مواد غذایی پرمیوم ایرانی",
    titleTemplate: "%s | دشت‌زاد",
    defaultDescription: "زعفران، آجیل، حبوبات و ادویه‌ی پرمیوم ایرانی — مستقیم از دشت تا سفره‌ی شما. از سال ۱۳۱۳.",
    canonicalBase: "https://dashtzad.com",
    organizationName: "دشت‌زاد",
    organizationSameAs: ["https://instagram.com/dashtzad"],
  }));

  await prisma.post.create({
    data: {
      title: "خواص آجیل و میزان مصرف روزانه",
      slug: "benefits-of-nuts",
      type: "FREE",
      status: "PUBLISHED",
      briefText: "آجیل‌ها منبع غنی پروتئین و چربی‌های سالم‌اند.",
      text: "مصرف روزانه یک مشت آجیل خام برای سلامت قلب و مغز مفید است؛ اما به دلیل کالری بالا در مصرف آن زیاده‌روی نکنید.",
      coverImage: "/placeholders/post-2.svg",
      readingTime: 3,
      tags: ["آجیل", "سلامت", "تغذیه"],
      authorId: admin.id,
      categoryId: cooking.id,
    },
  });
}

main()
  .then(async () => {
    const counts = {
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      productImages: await prisma.productImage.count(),
      weightPresets: await prisma.weightPreset.count(),
      packagingOptions: await prisma.packagingOption.count(),
      posts: await prisma.post.count(),
      orders: await prisma.order.count(),
      reviews: await prisma.productReview.count(),
      globals: await prisma.globalSetting.count(),
      menus: await prisma.menu.count(),
      menuItems: await prisma.menuItem.count(),
      banners: await prisma.banner.count(),
      faqGroups: await prisma.fAQGroup.count(),
      faqItems: await prisma.fAQItem.count(),
      redirects: await prisma.redirect.count(),
    };
    console.log("SEED_COUNTS " + JSON.stringify(counts));
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
