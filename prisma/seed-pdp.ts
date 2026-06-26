// Enrich all products with the data the design PDP shows: variants
// (weights × packaging), gallery images, reviews (+rating/histogram),
// answered questions, and rich pdpContent. Idempotent per product.
// Run: tsx prisma/seed-pdp.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const r = (n: number) => Math.round(n);
const ph = (p: string) => `/dz-design/products/${p}.jpeg`;
// Product-appropriate photos (identified from the dz-design photo set):
// p2=pistachio p3=almond p4=saffron-jar p5=gift-box p7=grains p8=dried-fruit p10=mixed-nuts
const IMAGES: Record<string, string[]> = {
  "pistachio-akbari-1kg": ["p2", "p10", "p7", "p5"].map(ph),
  "almond-raw-1kg": ["p3", "p2", "p10", "p7"].map(ph),
  "mixed-nuts-salted-1kg": ["p10", "p2", "p3", "p5"].map(ph),
  "saffron-negin-5g": ["p4", "p5", "p8"].map(ph),
  "saffron-sargol-1-mesghal": ["p4", "p8", "p5"].map(ph),
};

type Cfg = {
  latinTitle: string;
  baseGrams: number;
  kind: "nuts" | "saffron";
  weightTitles: string[]; // existing WeightPreset titles, small→large
  popularIdx: number; // which weight gets the پرفروش badge
  imageCount: number; // 0 = keep existing placeholder
  content: Record<string, unknown>;
};

const FEAT_NUTS = (origin: string) => [
  { label: "برند", value: "دشت‌زاد" },
  { label: "مبدأ", value: origin },
  { label: "ماندگاری", value: "۱۲ ماه" },
  { icon: "ri-leaf-line", label: "تازه" },
  { icon: "ri-medal-2-line", label: "درجه‌یک" },
  { icon: "ri-shield-check-line", label: "تضمین اصالت" },
];
const CARE_NUTS = [
  { icon: "ri-scissors-cut-line", title: "زمان برداشت", text: "اوایل پاییز، در اوج رسیدگی" },
  { icon: "ri-fire-line", title: "فرآوری", text: "تازه و با حرارت کنترل‌شده" },
  { icon: "ri-archive-line", title: "نگهداری", text: "ظرف دربسته، جای خشک و خنک، دور از نور" },
  { icon: "ri-shield-check-line", title: "ماندگاری", text: "۱۲ ماه از تاریخ بسته‌بندی" },
];

const CONFIGS: Record<string, Cfg> = {
  "pistachio-akbari-1kg": {
    latinTitle: "Premium Akbari Pistachios",
    baseGrams: 1000,
    kind: "nuts",
    weightTitles: ["۲۵۰ گرم", "۵۰۰ گرم", "۱ کیلوگرم"],
    popularIdx: 1,
    imageCount: 4,
    content: {
      freeShipThresholdToman: 378000,
      features: FEAT_NUTS("رفسنجان"),
      galleryBadges: [
        { label: "ممتاز", icon: "ri-medal-line", tone: "clay" },
        { label: "دانه‌درشت", icon: "ri-award-line", tone: "gold" },
      ],
      serving: [
        { icon: "ri-cup-line", label: "همراه چای" },
        { icon: "ri-cake-2-line", label: "میان‌وعده" },
        { icon: "ri-gift-line", label: "پذیرایی" },
      ],
      lead: "پستهٔ اکبریِ دانه‌درشتِ خندان، تازه‌بوداده با نمک دریایی — مغزی پر، تُرد و خوش‌عطر.",
      paragraphs: [
        "پستهٔ اکبری را از باغ‌های رفسنجان در اوج رسیدگی برمی‌چینیم، سورت و درجه‌بندی می‌کنیم و تازه، با حرارتِ کنترل‌شده و کمی نمک دریایی بو می‌دهیم تا عطر و تُردی‌اش دست‌نخورده بماند.",
        "نتیجه پسته‌ای است با مغزِ سبزِ پر، پوستِ خندان و طعمی متعادل — میان‌وعده‌ای اصیل برای پذیرایی و دورهمی.",
      ],
      bullets: [
        "<b>تازه‌بوداده</b> در کارگاه دشت‌زاد، نه انبارمانده",
        "دانهٔ <b>درشت و خندان</b>، سورت‌شده",
        "نمکِ <b>دریایی</b> به‌اندازه، بدون افزودنی",
        "منبعِ طبیعیِ <b>پروتئین و چربی سالم</b>",
      ],
      quote: { text: "پسته را باید تازه بو داد؛ عطرِ پستهٔ تازه‌بوداده با هیچ پستهٔ انبارمانده‌ای قابل‌مقایسه نیست.", by: "— کارگاهِ بوداده‌ی دشت‌زاد" },
      taste: [
        { label: "شوری", level: "متعادل", pct: 55 },
        { label: "تردی", level: "زیاد", pct: 88 },
        { label: "چربیِ طبیعی", level: "بالا", pct: 75 },
        { label: "عطر بوداده", level: "قوی", pct: 82 },
      ],
      highlights: [
        { icon: "ri-fire-line", title: "تازه‌بوداده", text: "بوداده در همان هفته، برای حفظ عطر و تردی." },
        { icon: "ri-seedling-line", title: "از باغ‌های رفسنجان", text: "برداشت مستقیم، بدون واسطه." },
        { icon: "ri-heart-3-line", title: "میان‌وعدهٔ سالم", text: "منبع پروتئین و چربی‌های مفید." },
        { icon: "ri-archive-line", title: "بسته‌بندی درب‌دار", text: "زیپ‌کیپ برای تازه‌ماندن." },
      ],
      specs: [
        { icon: "ri-leaf-line", key: "نوع محصول", value: "پستهٔ اکبری" },
        { icon: "ri-seedling-line", key: "مبدأ", value: "رفسنجان، ایران" },
        { icon: "ri-fire-line", key: "فرآوری", value: "تازه‌بوداده با نمک دریایی" },
        { icon: "ri-shield-check-line", key: "ماندگاری", value: "۱۲ ماه" },
        { icon: "ri-drop-line", key: "نمک", value: "دریایی، متعادل" },
        { icon: "ri-heart-3-line", key: "مناسب برای", value: "پذیرایی، میان‌وعده" },
      ],
      nutrition: {
        calories: 578,
        macros: [{ n: "۲۰", l: "پروتئین" }, { n: "۴۵", l: "چربی" }, { n: "۲۸", l: "کربوهیدرات" }],
        rows: [
          { label: "پروتئین", value: "۲۰ گرم", pct: 40 },
          { label: "چربی سالم", value: "۴۵ گرم", pct: 65 },
          { label: "کربوهیدرات", value: "۲۸ گرم", pct: 18 },
          { label: "فیبر غذایی", value: "۱۰٫۶ گرم", pct: 35 },
          { label: "پتاسیم", value: "۱۰۲۵ میلی‌گرم", pct: 30 },
        ],
        note: "منبعِ غنیِ پروتئین گیاهی و چربی‌های مفید.",
      },
      care: CARE_NUTS,
      faq: [
        { q: "این پسته تازه بو داده شده؟", a: "بله، به‌صورت دوره‌ای و در حجم کم بو می‌دهیم تا تردی و عطرش حفظ شود." },
        { q: "میزان نمک چقدر است؟", a: "نمکِ دریاییِ متعادل. برای نسخهٔ بدون‌نمک با پشتیبانی تماس بگیرید." },
        { q: "بهترین روش نگهداری؟", a: "ظرف دربسته، جای خشک و خنک، دور از نور مستقیم." },
        { q: "امکان مرجوع‌کردن هست؟", a: "بله، تا ۷ روز در صورت باز نشدن بسته." },
      ],
    },
  },
  "almond-raw-1kg": {
    latinTitle: "Raw Tree Almonds",
    baseGrams: 1000,
    kind: "nuts",
    weightTitles: ["۲۵۰ گرم", "۵۰۰ گرم", "۱ کیلوگرم"],
    popularIdx: 1,
    imageCount: 4,
    content: {
      freeShipThresholdToman: 400000,
      features: FEAT_NUTS("سامان، چهارمحال"),
      galleryBadges: [{ label: "خام و طبیعی", icon: "ri-leaf-line", tone: "green" }],
      serving: [
        { icon: "ri-cup-line", label: "همراه چای" },
        { icon: "ri-cake-2-line", label: "میان‌وعده" },
        { icon: "ri-bowl-line", label: "خیسانده" },
      ],
      lead: "بادام درختیِ خامِ مرغوب با مغزِ پر و طعمِ شیرینِ ملایم — بدون بو دادن، صددرصد طبیعی.",
      paragraphs: [
        "بادام درختی را از باغ‌های سامان برداشت می‌کنیم؛ خام و بدون فرآوری، تا تمام خواص و طعم طبیعی‌اش حفظ شود. مناسب برای خیساندن، میان‌وعده و آشپزی.",
      ],
      bullets: [
        "<b>خامِ طبیعی</b>، بدون بو دادن و نمک",
        "مغزِ <b>پر و یکدست</b>، سورت‌شده",
        "منبعِ <b>ویتامین E و منیزیم</b>",
        "مناسبِ <b>خیساندن و آشپزی</b>",
      ],
      quote: { text: "بادامِ خام را اگر شب بخیسانید، صبح مغزی لطیف‌تر و گوارش‌پذیرتر خواهید داشت.", by: "— آشپزخانهٔ دشت‌زاد" },
      taste: [
        { label: "شیرینیِ ملایم", level: "متوسط", pct: 50 },
        { label: "تردی", level: "زیاد", pct: 80 },
        { label: "چربیِ طبیعی", level: "بالا", pct: 78 },
        { label: "عطر", level: "ملایم", pct: 45 },
      ],
      highlights: [
        { icon: "ri-leaf-line", title: "خامِ طبیعی", text: "بدون بو دادن و افزودنی." },
        { icon: "ri-seedling-line", title: "از باغ‌های سامان", text: "برداشت مستقیم." },
        { icon: "ri-heart-3-line", title: "سرشار از خواص", text: "ویتامین E، منیزیم و فیبر." },
        { icon: "ri-archive-line", title: "بسته‌بندی درب‌دار", text: "برای تازه‌ماندن." },
      ],
      specs: [
        { icon: "ri-leaf-line", key: "نوع محصول", value: "بادام درختی خام" },
        { icon: "ri-seedling-line", key: "مبدأ", value: "سامان، چهارمحال" },
        { icon: "ri-check-line", key: "فرآوری", value: "خام، بدون افزودنی" },
        { icon: "ri-shield-check-line", key: "ماندگاری", value: "۱۲ ماه" },
        { icon: "ri-heart-3-line", key: "مناسب برای", value: "میان‌وعده، آشپزی" },
        { icon: "ri-leaf-line", key: "رژیم", value: "گیاه‌خواری، بدون گلوتن" },
      ],
      nutrition: {
        calories: 579,
        macros: [{ n: "۲۱", l: "پروتئین" }, { n: "۵۰", l: "چربی" }, { n: "۲۲", l: "کربوهیدرات" }],
        rows: [
          { label: "پروتئین", value: "۲۱ گرم", pct: 42 },
          { label: "چربی سالم", value: "۵۰ گرم", pct: 70 },
          { label: "فیبر غذایی", value: "۱۲٫۵ گرم", pct: 45 },
          { label: "منیزیم", value: "۲۷۰ میلی‌گرم", pct: 60 },
        ],
        note: "منبعِ عالیِ ویتامین E و چربی‌های مفید.",
      },
      care: CARE_NUTS,
      faq: [
        { q: "این بادام بو داده شده؟", a: "خیر، کاملاً خام است؛ می‌توانید خودتان بو بدهید یا بخیسانید." },
        { q: "برای خیساندن مناسب است؟", a: "بله، بسیار مناسب است؛ یک شب در آب بخیسانید و پوست بگیرید." },
        { q: "روش نگهداری؟", a: "ظرف دربسته، جای خشک و خنک." },
      ],
    },
  },
  "mixed-nuts-salted-1kg": {
    latinTitle: "Premium Salted Mixed Nuts",
    baseGrams: 1000,
    kind: "nuts",
    weightTitles: ["۲۵۰ گرم", "۵۰۰ گرم", "۱ کیلوگرم"],
    popularIdx: 1,
    imageCount: 4,
    content: {
      freeShipThresholdToman: 360000,
      features: [
        { label: "برند", value: "دشت‌زاد" },
        { label: "ترکیب", value: "۴ مغز" },
        { label: "ماندگاری", value: "۱۰ ماه" },
        { icon: "ri-fire-line", label: "تازه‌بوداده" },
        { icon: "ri-medal-2-line", label: "ممتاز" },
        { icon: "ri-shield-check-line", label: "تضمین اصالت" },
      ],
      galleryBadges: [
        { label: "پرفروش", icon: "ri-fire-line", tone: "clay" },
        { label: "۴ مغز", icon: "ri-award-line", tone: "gold" },
      ],
      serving: [
        { icon: "ri-cup-line", label: "همراه چای" },
        { icon: "ri-gift-line", label: "پذیرایی" },
        { icon: "ri-tv-line", label: "دورهمی" },
      ],
      lead: "آجیلِ مخلوطِ شورِ ممتاز — پسته، بادام، فندق و بادام‌هندی، تازه‌بوداده و متعادل.",
      paragraphs: [
        "ترکیبی متوازن از چهار مغزِ مرغوب که تازه بو داده و با نمک دریایی طعم‌دار شده‌اند؛ انتخابِ همیشگیِ پذیرایی و دورهمی‌های ایرانی.",
      ],
      bullets: [
        "ترکیبِ <b>پسته، بادام، فندق و بادام‌هندی</b>",
        "<b>تازه‌بوداده</b> با نمک دریایی",
        "نسبتِ <b>متوازن</b> از هر مغز",
        "بدونِ <b>افزودنی و روغن</b> اضافه",
      ],
      quote: { text: "رازِ یک آجیلِ خوب، تازگیِ مغزها و تعادلِ ترکیب است؛ نه فقط نمک.", by: "— کارگاهِ بوداده‌ی دشت‌زاد" },
      taste: [
        { label: "شوری", level: "متعادل", pct: 60 },
        { label: "تردی", level: "زیاد", pct: 85 },
        { label: "تنوع طعم", level: "بالا", pct: 90 },
        { label: "عطر بوداده", level: "قوی", pct: 80 },
      ],
      highlights: [
        { icon: "ri-award-line", title: "ترکیبِ چهارمغز", text: "پسته، بادام، فندق، بادام‌هندی." },
        { icon: "ri-fire-line", title: "تازه‌بوداده", text: "بوداده در همان هفته." },
        { icon: "ri-scales-3-line", title: "نسبتِ متوازن", text: "از هر مغز به‌اندازه." },
        { icon: "ri-gift-line", title: "مناسبِ پذیرایی", text: "انتخابِ محبوب مهمانی‌ها." },
      ],
      specs: [
        { icon: "ri-award-line", key: "ترکیب", value: "پسته، بادام، فندق، بادام‌هندی" },
        { icon: "ri-fire-line", key: "فرآوری", value: "تازه‌بوداده با نمک دریایی" },
        { icon: "ri-shield-check-line", key: "ماندگاری", value: "۱۰ ماه" },
        { icon: "ri-drop-line", key: "نمک", value: "دریایی، متعادل" },
        { icon: "ri-heart-3-line", key: "مناسب برای", value: "پذیرایی، دورهمی" },
        { icon: "ri-leaf-line", key: "افزودنی", value: "ندارد" },
      ],
      nutrition: {
        calories: 607,
        macros: [{ n: "۱۸", l: "پروتئین" }, { n: "۵۴", l: "چربی" }, { n: "۲۰", l: "کربوهیدرات" }],
        rows: [
          { label: "پروتئین", value: "۱۸ گرم", pct: 36 },
          { label: "چربی سالم", value: "۵۴ گرم", pct: 75 },
          { label: "فیبر غذایی", value: "۹ گرم", pct: 32 },
          { label: "سدیم", value: "۳۲۰ میلی‌گرم", pct: 14 },
        ],
        note: "انرژیِ بالا و ترکیبِ متنوعِ مغزها.",
      },
      care: CARE_NUTS,
      faq: [
        { q: "ترکیب دقیق چیست؟", a: "پسته، بادام درختی، فندق و بادام‌هندی، با نسبتِ متوازن." },
        { q: "شوری‌اش زیاد است؟", a: "خیر، نمکِ دریاییِ متعادل استفاده شده است." },
        { q: "نسخهٔ بدون‌نمک دارید؟", a: "بله، با پشتیبانی هماهنگ کنید." },
      ],
    },
  },
  "saffron-negin-5g": {
    latinTitle: "Negin Saffron",
    baseGrams: 5,
    kind: "saffron",
    weightTitles: ["۱ گرم", "۳ گرم", "۵ گرم"],
    popularIdx: 2,
    imageCount: 0,
    content: {
      freeShipThresholdToman: 200000,
      features: [
        { label: "برند", value: "دشت‌زاد" },
        { label: "مبدأ", value: "قائنات" },
        { label: "نوع", value: "نگین" },
        { icon: "ri-award-line", label: "رشتهٔ بلند" },
        { icon: "ri-medal-2-line", label: "درجه‌یک" },
        { icon: "ri-shield-check-line", label: "تضمین اصالت" },
      ],
      galleryBadges: [
        { label: "نگین ممتاز", icon: "ri-medal-line", tone: "clay" },
        { label: "قائنات", icon: "ri-award-line", tone: "gold" },
      ],
      serving: [
        { icon: "ri-cup-line", label: "دمنوش" },
        { icon: "ri-restaurant-line", label: "برنج و غذا" },
        { icon: "ri-cake-3-line", label: "شیرینی و دسر" },
      ],
      lead: "زعفرانِ نگینِ درجه‌یکِ قائنات با رشته‌های بلند و یکدست — رنگ، عطر و طعمِ بی‌نظیر.",
      paragraphs: [
        "نگین، مرغوب‌ترین گریدِ زعفران است؛ رشته‌های کلفت و بلند با کم‌ترین خامه. هر بسته از زعفرانِ تازهٔ قائنات تأمین و در بسته‌بندیِ مقاوم در برابر نور عرضه می‌شود.",
      ],
      bullets: [
        "گریدِ <b>نگین</b>، مرغوب‌ترین نوع",
        "رشتهٔ <b>بلند و یکدست</b>، کم‌خامه",
        "<b>رنگ و عطرِ قوی</b> با راندمان بالا",
        "بسته‌بندیِ <b>مقاوم در برابر نور</b>",
      ],
      quote: { text: "کیفیتِ زعفران را از رنگِ دمِ آن بشناسید؛ نگینِ اصیل، آبِ طلایی‌سرخِ پررنگ می‌دهد.", by: "— کارشناسِ زعفرانِ دشت‌زاد" },
      taste: [
        { label: "قدرتِ رنگ", level: "بسیار زیاد", pct: 92 },
        { label: "عطر", level: "قوی", pct: 88 },
        { label: "طعم", level: "غنی", pct: 80 },
        { label: "تلخیِ ملس", level: "کم", pct: 25 },
      ],
      highlights: [
        { icon: "ri-award-line", title: "گریدِ نگین", text: "مرغوب‌ترین گریدِ زعفران." },
        { icon: "ri-seedling-line", title: "از قائنات", text: "قطبِ زعفرانِ ایران." },
        { icon: "ri-sun-line", title: "رنگ‌دهیِ بالا", text: "راندمانِ بالا با مقدار کم." },
        { icon: "ri-shield-check-line", title: "تضمین اصالت", text: "آزمایش‌شده و خالص." },
      ],
      specs: [
        { icon: "ri-award-line", key: "گرید", value: "نگین درجه‌یک" },
        { icon: "ri-seedling-line", key: "مبدأ", value: "قائنات، خراسان جنوبی" },
        { icon: "ri-sun-line", key: "رنگ (کروسین)", value: "بالای ۲۵۰" },
        { icon: "ri-shield-check-line", key: "ماندگاری", value: "۲۴ ماه" },
        { icon: "ri-archive-line", key: "نگهداری", value: "دور از نور و رطوبت" },
        { icon: "ri-check-line", key: "افزودنی", value: "ندارد، خالص" },
      ],
      nutrition: null,
      care: [
        { icon: "ri-scissors-cut-line", title: "زمان برداشت", text: "اواخر پاییز، گل‌چینیِ دستی" },
        { icon: "ri-sun-line", title: "خشک‌کردن", text: "سنتی و کنترل‌شده برای حفظ رنگ" },
        { icon: "ri-archive-line", title: "نگهداری", text: "ظرفِ دربسته، دور از نور و رطوبت" },
        { icon: "ri-shield-check-line", title: "ماندگاری", text: "تا ۲۴ ماه با حفظ کیفیت" },
      ],
      faq: [
        { q: "تفاوت نگین با سرگل چیست؟", a: "نگین رشته‌های کلفت‌تر و بلندتر و کم‌خامه‌تری دارد و معمولاً مرغوب‌تر است." },
        { q: "برای دم‌کردن چقدر استفاده کنم؟", a: "برای هر ۴ نفر حدود ۱۵ تا ۲۰ رشته کافی است؛ ساییده و با آبِ ولرم دم کنید." },
        { q: "اصالت چطور تضمین می‌شود؟", a: "زعفران آزمایش‌شده و بدون افزودنی است و گواهی اصالت دارد." },
      ],
    },
  },
  "saffron-sargol-1-mesghal": {
    latinTitle: "Sargol Saffron — One Mesghal",
    baseGrams: 4.6,
    kind: "saffron",
    weightTitles: ["۱ گرم", "۳ گرم", "۵ گرم"],
    popularIdx: 2,
    imageCount: 0,
    content: {
      freeShipThresholdToman: 200000,
      features: [
        { label: "برند", value: "دشت‌زاد" },
        { label: "مبدأ", value: "قائنات" },
        { label: "نوع", value: "سرگل" },
        { icon: "ri-award-line", label: "تمام‌سرخ" },
        { icon: "ri-gift-line", label: "بسته‌بندی نفیس" },
        { icon: "ri-shield-check-line", label: "تضمین اصالت" },
      ],
      galleryBadges: [
        { label: "سرگل ممتاز", icon: "ri-medal-line", tone: "clay" },
        { label: "هدیه", icon: "ri-gift-line", tone: "gold" },
      ],
      serving: [
        { icon: "ri-cup-line", label: "دمنوش" },
        { icon: "ri-restaurant-line", label: "برنج و غذا" },
        { icon: "ri-gift-line", label: "هدیه" },
      ],
      lead: "زعفرانِ سرگلِ ممتازِ قائنات، یک مثقال در بسته‌بندیِ نفیس — تمام‌سرخ، خوش‌عطر و پررنگ.",
      paragraphs: [
        "سرگل، بخشِ تمام‌سرخِ کلالهٔ زعفران بدونِ خامه است؛ خوش‌عطر و پررنگ. بسته‌بندیِ نفیسِ یک‌مثقالی، انتخابی عالی برای هدیه و مصرفِ خانگی.",
      ],
      bullets: [
        "گریدِ <b>سرگل (تمام‌سرخ)</b>، بدونِ خامه",
        "<b>عطر و رنگِ قوی</b>",
        "بسته‌بندیِ <b>نفیسِ هدیه</b>",
        "یک مثقال = <b>۴٫۶ گرم</b>",
      ],
      quote: { text: "سرگل برای کسانی که عطرِ ناب و رنگِ یکدست می‌خواهند، انتخابی بی‌نقص است.", by: "— کارشناسِ زعفرانِ دشت‌زاد" },
      taste: [
        { label: "قدرتِ رنگ", level: "زیاد", pct: 85 },
        { label: "عطر", level: "بسیار قوی", pct: 90 },
        { label: "طعم", level: "غنی", pct: 82 },
        { label: "تلخیِ ملس", level: "کم", pct: 20 },
      ],
      highlights: [
        { icon: "ri-award-line", title: "گریدِ سرگل", text: "تمام‌سرخ، بدونِ خامه." },
        { icon: "ri-gift-line", title: "بسته‌بندیِ نفیس", text: "مناسبِ هدیه و مناسبت." },
        { icon: "ri-seedling-line", title: "از قائنات", text: "قطبِ زعفرانِ ایران." },
        { icon: "ri-shield-check-line", title: "تضمین اصالت", text: "آزمایش‌شده و خالص." },
      ],
      specs: [
        { icon: "ri-award-line", key: "گرید", value: "سرگل (تمام‌سرخ)" },
        { icon: "ri-seedling-line", key: "مبدأ", value: "قائنات، خراسان جنوبی" },
        { icon: "ri-scales-3-line", key: "وزن پایه", value: "یک مثقال (۴٫۶ گرم)" },
        { icon: "ri-shield-check-line", key: "ماندگاری", value: "۲۴ ماه" },
        { icon: "ri-gift-line", key: "بسته‌بندی", value: "نفیسِ هدیه" },
        { icon: "ri-check-line", key: "افزودنی", value: "ندارد، خالص" },
      ],
      nutrition: null,
      care: [
        { icon: "ri-scissors-cut-line", title: "زمان برداشت", text: "اواخر پاییز، گل‌چینیِ دستی" },
        { icon: "ri-sun-line", title: "خشک‌کردن", text: "سنتی و کنترل‌شده" },
        { icon: "ri-archive-line", title: "نگهداری", text: "دور از نور و رطوبت" },
        { icon: "ri-shield-check-line", title: "ماندگاری", text: "تا ۲۴ ماه" },
      ],
      faq: [
        { q: "یک مثقال چند گرم است؟", a: "یک مثقال برابر ۴٫۶ گرم است." },
        { q: "سرگل بهتر است یا نگین؟", a: "هر دو ممتازند؛ سرگل عطرِ بسیار قوی و نگین رشتهٔ بلندتر دارد." },
        { q: "برای هدیه مناسب است؟", a: "بله، بسته‌بندیِ نفیسِ یک‌مثقالی مخصوصِ هدیه است." },
      ],
    },
  },
};

const REVIEWERS = [
  { name: "مریم احمدی", phone: "09120000101" },
  { name: "حسین رضایی", phone: "09120000102" },
  { name: "سحر موسوی", phone: "09120000103" },
  { name: "علی کریمی", phone: "09120000104" },
  { name: "نگار محمدی", phone: "09120000105" },
  { name: "رضا قاسمی", phone: "09120000106" },
];

const REVIEW_TEXTS = [
  { rating: 5, text: "کیفیتش واقعاً عالی بود، تازه و خوش‌طعم. حتماً دوباره سفارش می‌دم.", rec: true },
  { rating: 5, text: "بسته‌بندی تمیز و مرتب، ارسال سریع. از خریدم کاملاً راضی‌ام.", rec: true },
  { rating: 4, text: "خیلی خوب بود، فقط کاش قیمتش کمی مناسب‌تر بود. در کل پیشنهاد می‌کنم.", rec: true },
  { rating: 5, text: "دقیقاً همون چیزی بود که انتظار داشتم. اصالتش معلومه.", rec: true },
  { rating: 5, text: "برای هدیه گرفتم، خیلی شیک و باکیفیت بود. ممنون از دشت‌زاد.", rec: true },
  { rating: 4, text: "طعمش طبیعی و تازه بود. بسته‌بندی هم درب‌دار و خوب.", rec: true },
  { rating: 3, text: "خوب بود ولی انتظار بیشتری داشتم. ارسالش کمی طول کشید.", rec: false },
  { rating: 5, text: "چند باره که از اینجا می‌خرم و هر بار کیفیت ثابت و عالی بوده.", rec: true },
];

const QUESTIONS = [
  { q: "ارسال به شهرستان چند روز طول می‌کشد؟", a: "سفارش‌ها معمولاً ۲ تا ۴ روز کاری به دستتان می‌رسد." },
  { q: "آیا امکان خرید عمده هست؟", a: "بله، برای خرید عمده با پشتیبانی تماس بگیرید تا قیمت ویژه اعمال شود." },
  { q: "بسته‌بندی هدیه دارید؟", a: "بله، گزینهٔ جعبه هدیه هنگام خرید قابل انتخاب است." },
];

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.FORCE_SEED !== "true") {
    throw new Error("Refusing to seed in production. Set FORCE_SEED=true to override.");
  }

  // reviewer users (idempotent by phone)
  const users = [];
  for (const ru of REVIEWERS) {
    const u = await prisma.user.upsert({
      where: { phoneNumber: ru.phone },
      update: { name: ru.name },
      create: { phoneNumber: ru.phone, name: ru.name, role: "USER" },
    });
    users.push(u);
  }
  const admin = (await prisma.user.findFirst({ where: { role: "ADMIN" } })) ?? users[0];

  const weightPresets = await prisma.weightPreset.findMany();
  const packagings = await prisma.packagingOption.findMany();
  const pouch = packagings.find((p) => p.title === "پاکت ۱ کیلوگرمی");
  const giftBox = packagings.find((p) => p.title === "جعبه هدیه");
  const tin5 = packagings.find((p) => p.title === "قوطی ۵ گرمی");

  let count = 0;
  for (const [slug, cfg] of Object.entries(CONFIGS)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.log("skip (not found):", slug);
      continue;
    }

    const perGram = product.price_rial / cfg.baseGrams;
    const offPerGram = product.offPrice_rial ? product.offPrice_rial / cfg.baseGrams : null;
    const basePack = cfg.kind === "saffron" ? tin5 : pouch;
    const extraPack = giftBox;

    // ---- variants: weights × {base packaging, gift box} ----
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    const variantData: any[] = [];
    cfg.weightTitles.forEach((wt, wi) => {
      const wp = weightPresets.find((w) => w.title === wt);
      if (!wp) return;
      const g = wp.gramValue;
      [basePack, extraPack].forEach((pack, pi) => {
        if (!pack) return;
        const reg = r(perGram * g) + pack.cost_rial;
        const off = offPerGram ? r(offPerGram * g) + pack.cost_rial : null;
        variantData.push({
          productId: product.id,
          weightPresetId: wp.id,
          packagingOptionId: pack.id,
          weightValue: g,
          weightUnit: "GRAM",
          gramValue: g,
          sku: `${slug}-${g}g-${pi === 0 ? "std" : "gift"}`.toUpperCase(),
          calculatedPrice_rial: reg,
          price_rial: reg,
          offPrice_rial: off,
          stock: 20 + wi * 10,
          isActive: true,
          marketingBadge: wi === cfg.popularIdx && pi === 0 ? "BESTSELLER" : null,
          sortOrder: wi * 2 + pi,
        });
      });
    });
    if (variantData.length) await prisma.productVariant.createMany({ data: variantData });

    // ---- images (product-appropriate) ----
    const imgList = IMAGES[slug] ?? [];
    if (imgList.length) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: imgList.map((url, i) => ({
          productId: product.id,
          url,
          alt: `${product.title} ${i + 1}`,
          sortOrder: i,
        })),
      });
    }

    // ---- reviews ----
    await prisma.productReview.deleteMany({ where: { productId: product.id } });
    const nRev = 5 + (count % 2); // 5..6 (one review per user; 6 users)
    const picked = REVIEW_TEXTS.slice(0, nRev);
    let sum = 0;
    for (let i = 0; i < picked.length; i++) {
      const rev = picked[i];
      sum += rev.rating;
      await prisma.productReview.create({
        data: {
          userId: users[i].id,
          productId: product.id,
          rating: rev.rating,
          text: rev.text,
          verifiedPurchase: true,
          status: "APPROVED",
          createdAt: new Date(Date.now() - (i + 1) * 3 * 86400000),
        },
      });
    }
    const avg = picked.length ? sum / picked.length : 0;

    // ---- questions ----
    await prisma.productQuestion.deleteMany({ where: { productId: product.id } });
    const nQ = 2 + (count % 2);
    for (let i = 0; i < nQ; i++) {
      const q = QUESTIONS[i % QUESTIONS.length];
      await prisma.productQuestion.create({
        data: {
          userId: users[(i + 2) % users.length].id,
          productId: product.id,
          question: q.q,
          answer: q.a,
          answeredById: admin.id,
          answeredAt: new Date(Date.now() - (i + 1) * 2 * 86400000),
          status: "ANSWERED",
          createdAt: new Date(Date.now() - (i + 1) * 4 * 86400000),
        },
      });
    }

    // ---- product: content + rating ----
    await prisma.product.update({
      where: { id: product.id },
      data: {
        latinTitle: cfg.latinTitle,
        pdpContent: cfg.content as any,
        rating: Math.round(avg * 10) / 10,
        numReviews: picked.length,
      },
    });

    count++;
    console.log(`✓ ${slug}: ${variantData.length} variants, ${picked.length} reviews, ${nQ} Q&A`);
  }

  console.log(`Done. Enriched ${count} products.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
