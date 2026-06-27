// seed-catalog.ts — دسته‌بندی و محصولات کامل دشت‌زاد
// Auto-generated — idempotent (safe to run multiple times)
// Run: npx tsx prisma/seed-catalog.ts

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Dashtzad catalog seed starting...");

  // ── 1. Root categories ──────────────────────────────────────
  const catMap: Record<string, string> = {};

  {
    const c = await prisma.category.upsert({
      where: { slug: "ajil-va-maghzha" },
      create: { title: "آجیل و مغزها", slug: "ajil-va-maghzha", englishTitle: "nuts-and-kernels", description: "دشت‌زاد بهترین آجیل و مغزهای ایرانی و وارداتی را با کیفیتی بی‌نظیر و طعمی اصیل عرضه می‌کند. هر محصول با دقت انتخاب و بسته‌بندی شده تا تازگی و ارزش غذایی آن حفظ شود. از پسته کرمان تا بادام‌های ممتاز، دشت‌زاد همراه لحظه‌های شما است.", type: "PRODUCT", parentId: null },
      update: { title: "آجیل و مغزها", englishTitle: "nuts-and-kernels", description: "دشت‌زاد بهترین آجیل و مغزهای ایرانی و وارداتی را با کیفیتی بی‌نظیر و طعمی اصیل عرضه می‌کند. هر محصول با دقت انتخاب و بسته‌بندی شده تا تازگی و ارزش غذایی آن حفظ شود. از پسته کرمان تا بادام‌های ممتاز، دشت‌زاد همراه لحظه‌های شما است." },
    });
    catMap["ajil-va-maghzha"] = c.id;
  }

  {
    const c = await prisma.category.upsert({
      where: { slug: "khoshkbar" },
      create: { title: "خشکبار", slug: "khoshkbar", englishTitle: "dried-goods", description: "خشکبار دشت‌زاد از باغ‌های سرسبز ایران به دست شما می‌رسد؛ محصولاتی طبیعی، بدون افزودنی مصنوعی و سرشار از طعم اصیل. از آلوی خشک شیراز تا خرمای جنوب، هر قلم با استانداردهای کیفی دشت‌زاد گزینش می‌شود. سلامت و لذت را با هم تجربه کنید.", type: "PRODUCT", parentId: null },
      update: { title: "خشکبار", englishTitle: "dried-goods", description: "خشکبار دشت‌زاد از باغ‌های سرسبز ایران به دست شما می‌رسد؛ محصولاتی طبیعی، بدون افزودنی مصنوعی و سرشار از طعم اصیل. از آلوی خشک شیراز تا خرمای جنوب، هر قلم با استانداردهای کیفی دشت‌زاد گزینش می‌شود. سلامت و لذت را با هم تجربه کنید." },
    });
    catMap["khoshkbar"] = c.id;
  }

  {
    const c = await prisma.category.upsert({
      where: { slug: "miveh-khoshk" },
      create: { title: "میوه خشک", slug: "miveh-khoshk", englishTitle: "dried-fruit", description: "میوه‌های خشک دشت‌زاد با فرآیند خشک‌کردن بهینه، رنگ، عطر و طعم میوه تازه را در خود نگه می‌دارند. این محصولات میان‌وعده‌ای سالم و خوشمزه برای همه سنین هستند. دشت‌زاد تنوع کاملی از میوه خشک را در قالب‌های مختلف ارائه می‌دهد.", type: "PRODUCT", parentId: null },
      update: { title: "میوه خشک", englishTitle: "dried-fruit", description: "میوه‌های خشک دشت‌زاد با فرآیند خشک‌کردن بهینه، رنگ، عطر و طعم میوه تازه را در خود نگه می‌دارند. این محصولات میان‌وعده‌ای سالم و خوشمزه برای همه سنین هستند. دشت‌زاد تنوع کاملی از میوه خشک را در قالب‌های مختلف ارائه می‌دهد." },
    });
    catMap["miveh-khoshk"] = c.id;
  }

  {
    const c = await prisma.category.upsert({
      where: { slug: "chai" },
      create: { title: "چای", slug: "chai", englishTitle: "tea", description: "چای‌های دشت‌زاد از بهترین باغ‌های چای ایران و جهان تأمین می‌شوند تا هر فنجان تجربه‌ای ماندگار باشد. با طیف متنوعی از چای سیاه اصیل تا چای‌های معطر بین‌المللی، هر ذائقه‌ای را پوشش می‌دهیم. لحظات آرامش خود را با چای دشت‌زاد کامل کنید.", type: "PRODUCT", parentId: null },
      update: { title: "چای", englishTitle: "tea", description: "چای‌های دشت‌زاد از بهترین باغ‌های چای ایران و جهان تأمین می‌شوند تا هر فنجان تجربه‌ای ماندگار باشد. با طیف متنوعی از چای سیاه اصیل تا چای‌های معطر بین‌المللی، هر ذائقه‌ای را پوشش می‌دهیم. لحظات آرامش خود را با چای دشت‌زاد کامل کنید." },
    });
    catMap["chai"] = c.id;
  }

  {
    const c = await prisma.category.upsert({
      where: { slug: "damnoosh-paye" },
      create: { title: "دمنوش و گیاهان دارویی پایه", slug: "damnoosh-paye", englishTitle: "herbal-tea-base", description: "گیاهان دارویی دشت‌زاد مستقیماً از دامنه‌های کوهستانی و مزارع طبیعی ایران تهیه می‌شوند تا خواص درمانی آن‌ها حفظ شود. هر دمنوش پایه با دقت خشک و بسته‌بندی شده تا عطر و اثر آن به دست شما برسد. سلامتی را با طبیعت بنوشید.", type: "PRODUCT", parentId: null },
      update: { title: "دمنوش و گیاهان دارویی پایه", englishTitle: "herbal-tea-base", description: "گیاهان دارویی دشت‌زاد مستقیماً از دامنه‌های کوهستانی و مزارع طبیعی ایران تهیه می‌شوند تا خواص درمانی آن‌ها حفظ شود. هر دمنوش پایه با دقت خشک و بسته‌بندی شده تا عطر و اثر آن به دست شما برسد. سلامتی را با طبیعت بنوشید." },
    });
    catMap["damnoosh-paye"] = c.id;
  }

  {
    const c = await prisma.category.upsert({
      where: { slug: "damnoosh-tarkibi" },
      create: { title: "دمنوش‌های ترکیبی", slug: "damnoosh-tarkibi", englishTitle: "blended-herbal-tea", description: "دمنوش‌های ترکیبی دشت‌زاد با الهام از طب سنتی ایران و دانش مدرن گیاه‌شناسی فرموله شده‌اند تا هم لذت‌بخش باشند و هم مفید. هر ترکیب داستانی دارد و احساسی را بیدار می‌کند، از آرامش شبانه تا شادابی روزانه. دشت‌زاد دمنوشی برای هر خُلق و هر لحظه دارد.", type: "PRODUCT", parentId: null },
      update: { title: "دمنوش‌های ترکیبی", englishTitle: "blended-herbal-tea", description: "دمنوش‌های ترکیبی دشت‌زاد با الهام از طب سنتی ایران و دانش مدرن گیاه‌شناسی فرموله شده‌اند تا هم لذت‌بخش باشند و هم مفید. هر ترکیب داستانی دارد و احساسی را بیدار می‌کند، از آرامش شبانه تا شادابی روزانه. دشت‌زاد دمنوشی برای هر خُلق و هر لحظه دارد." },
    });
    catMap["damnoosh-tarkibi"] = c.id;
  }

  // ── 2. Subcategories ─────────────────────────────────────────
  {
    const c = await prisma.category.upsert({
      where: { slug: "piste" },
      create: { title: "پسته", slug: "piste", englishTitle: "pistachios", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "پسته", englishTitle: "pistachios", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["piste"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "fandoq" },
      create: { title: "فندق", slug: "fandoq", englishTitle: "hazelnuts", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "فندق", englishTitle: "hazelnuts", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["fandoq"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "gerdo" },
      create: { title: "گردو", slug: "gerdo", englishTitle: "walnuts", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "گردو", englishTitle: "walnuts", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["gerdo"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "badam-derakht" },
      create: { title: "بادام درختی", slug: "badam-derakht", englishTitle: "almonds", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "بادام درختی", englishTitle: "almonds", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["badam-derakht"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "badam-hendi" },
      create: { title: "بادام هندی", slug: "badam-hendi", englishTitle: "cashews", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "بادام هندی", englishTitle: "cashews", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["badam-hendi"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "badam-zamini" },
      create: { title: "بادام زمینی", slug: "badam-zamini", englishTitle: "peanuts", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "بادام زمینی", englishTitle: "peanuts", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["badam-zamini"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "danehaye-khorakhi" },
      create: { title: "دانه‌های خوراکی", slug: "danehaye-khorakhi", englishTitle: "edible-seeds", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "دانه‌های خوراکی", englishTitle: "edible-seeds", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["danehaye-khorakhi"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "tokhme" },
      create: { title: "تخمه", slug: "tokhme", englishTitle: "roasted-seeds", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "تخمه", englishTitle: "roasted-seeds", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["tokhme"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "ajil-mokhallat" },
      create: { title: "آجیل مخلوط", slug: "ajil-mokhallat", englishTitle: "mixed-nuts", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "آجیل مخلوط", englishTitle: "mixed-nuts", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["ajil-mokhallat"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "ajil-rokooshdhar" },
      create: { title: "آجیل روکش‌دار", slug: "ajil-rokooshdhar", englishTitle: "coated-nuts", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "آجیل روکش‌دار", englishTitle: "coated-nuts", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["ajil-rokooshdhar"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "ajil-eqtesadi" },
      create: { title: "آجیل اقتصادی", slug: "ajil-eqtesadi", englishTitle: "economy-nuts", type: "PRODUCT", parentId: catMap["ajil-va-maghzha"] },
      update: { title: "آجیل اقتصادی", englishTitle: "economy-nuts", parentId: catMap["ajil-va-maghzha"] },
    });
    catMap["ajil-eqtesadi"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "bargeh-miveh" },
      create: { title: "برگه میوه", slug: "bargeh-miveh", englishTitle: "fruit-leather", type: "PRODUCT", parentId: catMap["khoshkbar"] },
      update: { title: "برگه میوه", englishTitle: "fruit-leather", parentId: catMap["khoshkbar"] },
    });
    catMap["bargeh-miveh"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "alu-khoshk" },
      create: { title: "آلو خشک", slug: "alu-khoshk", englishTitle: "dried-plum", type: "PRODUCT", parentId: catMap["khoshkbar"] },
      update: { title: "آلو خشک", englishTitle: "dried-plum", parentId: catMap["khoshkbar"] },
    });
    catMap["alu-khoshk"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "tut-khoshk" },
      create: { title: "توت خشک", slug: "tut-khoshk", englishTitle: "dried-mulberry", type: "PRODUCT", parentId: catMap["khoshkbar"] },
      update: { title: "توت خشک", englishTitle: "dried-mulberry", parentId: catMap["khoshkbar"] },
    });
    catMap["tut-khoshk"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "anjir-khoshk" },
      create: { title: "انجیر خشک", slug: "anjir-khoshk", englishTitle: "dried-fig", type: "PRODUCT", parentId: catMap["khoshkbar"] },
      update: { title: "انجیر خشک", englishTitle: "dried-fig", parentId: catMap["khoshkbar"] },
    });
    catMap["anjir-khoshk"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "keshmesh" },
      create: { title: "کشمش", slug: "keshmesh", englishTitle: "raisins", type: "PRODUCT", parentId: catMap["khoshkbar"] },
      update: { title: "کشمش", englishTitle: "raisins", parentId: catMap["khoshkbar"] },
    });
    catMap["keshmesh"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "khorma" },
      create: { title: "خرما", slug: "khorma", englishTitle: "dates", type: "PRODUCT", parentId: catMap["khoshkbar"] },
      update: { title: "خرما", englishTitle: "dates", parentId: catMap["khoshkbar"] },
    });
    catMap["khorma"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "miveh-khoshk-varaqei" },
      create: { title: "میوه خشک ورقه‌ای", slug: "miveh-khoshk-varaqei", englishTitle: "sliced-dried-fruit", type: "PRODUCT", parentId: catMap["miveh-khoshk"] },
      update: { title: "میوه خشک ورقه‌ای", englishTitle: "sliced-dried-fruit", parentId: catMap["miveh-khoshk"] },
    });
    catMap["miveh-khoshk-varaqei"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "miveh-khoshk-habbei" },
      create: { title: "میوه خشک حبه‌ای", slug: "miveh-khoshk-habbei", englishTitle: "whole-dried-fruit", type: "PRODUCT", parentId: catMap["miveh-khoshk"] },
      update: { title: "میوه خشک حبه‌ای", englishTitle: "whole-dried-fruit", parentId: catMap["miveh-khoshk"] },
    });
    catMap["miveh-khoshk-habbei"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "miveh-khoshk-dareste" },
      create: { title: "میوه خشک درسته", slug: "miveh-khoshk-dareste", englishTitle: "whole-piece-dried-fruit", type: "PRODUCT", parentId: catMap["miveh-khoshk"] },
      update: { title: "میوه خشک درسته", englishTitle: "whole-piece-dried-fruit", parentId: catMap["miveh-khoshk"] },
    });
    catMap["miveh-khoshk-dareste"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "miveh-khoshk-mokhallat" },
      create: { title: "میوه خشک مخلوط", slug: "miveh-khoshk-mokhallat", englishTitle: "mixed-dried-fruit", type: "PRODUCT", parentId: catMap["miveh-khoshk"] },
      update: { title: "میوه خشک مخلوط", englishTitle: "mixed-dried-fruit", parentId: catMap["miveh-khoshk"] },
    });
    catMap["miveh-khoshk-mokhallat"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "chai-siyah" },
      create: { title: "چای سیاه", slug: "chai-siyah", englishTitle: "black-tea", type: "PRODUCT", parentId: catMap["chai"] },
      update: { title: "چای سیاه", englishTitle: "black-tea", parentId: catMap["chai"] },
    });
    catMap["chai-siyah"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "chai-sabz" },
      create: { title: "چای سبز", slug: "chai-sabz", englishTitle: "green-tea", type: "PRODUCT", parentId: catMap["chai"] },
      update: { title: "چای سبز", englishTitle: "green-tea", parentId: catMap["chai"] },
    });
    catMap["chai-sabz"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "chai-earl-grey" },
      create: { title: "چای ارل گری", slug: "chai-earl-grey", englishTitle: "earl-grey-tea", type: "PRODUCT", parentId: catMap["chai"] },
      update: { title: "چای ارل گری", englishTitle: "earl-grey-tea", parentId: catMap["chai"] },
    });
    catMap["chai-earl-grey"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "chai-irani" },
      create: { title: "چای ایرانی", slug: "chai-irani", englishTitle: "iranian-tea", type: "PRODUCT", parentId: catMap["chai"] },
      update: { title: "چای ایرانی", englishTitle: "iranian-tea", parentId: catMap["chai"] },
    });
    catMap["chai-irani"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "chai-torsh" },
      create: { title: "چای ترش", slug: "chai-torsh", englishTitle: "hibiscus-tea", type: "PRODUCT", parentId: catMap["damnoosh-paye"] },
      update: { title: "چای ترش", englishTitle: "hibiscus-tea", parentId: catMap["damnoosh-paye"] },
    });
    catMap["chai-torsh"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "babooneh" },
      create: { title: "بابونه", slug: "babooneh", englishTitle: "chamomile", type: "PRODUCT", parentId: catMap["damnoosh-paye"] },
      update: { title: "بابونه", englishTitle: "chamomile", parentId: catMap["damnoosh-paye"] },
    });
    catMap["babooneh"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "naana-khoshk" },
      create: { title: "نعنا خشک", slug: "naana-khoshk", englishTitle: "dried-mint", type: "PRODUCT", parentId: catMap["damnoosh-paye"] },
      update: { title: "نعنا خشک", englishTitle: "dried-mint", parentId: catMap["damnoosh-paye"] },
    });
    catMap["naana-khoshk"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "avishan" },
      create: { title: "آویشن", slug: "avishan", englishTitle: "thyme", type: "PRODUCT", parentId: catMap["damnoosh-paye"] },
      update: { title: "آویشن", englishTitle: "thyme", parentId: catMap["damnoosh-paye"] },
    });
    catMap["avishan"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "gol-gavazaban" },
      create: { title: "گل گاوزبان", slug: "gol-gavazaban", englishTitle: "borage-flower", type: "PRODUCT", parentId: catMap["damnoosh-paye"] },
      update: { title: "گل گاوزبان", englishTitle: "borage-flower", parentId: catMap["damnoosh-paye"] },
    });
    catMap["gol-gavazaban"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "beh-limu" },
      create: { title: "به‌لیمو", slug: "beh-limu", englishTitle: "lemon-verbena", type: "PRODUCT", parentId: catMap["damnoosh-paye"] },
      update: { title: "به‌لیمو", englishTitle: "lemon-verbena", parentId: catMap["damnoosh-paye"] },
    });
    catMap["beh-limu"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "damnoosh-eshq" },
      create: { title: "دمنوش عشق", slug: "damnoosh-eshq", englishTitle: "love-herbal-blend", type: "PRODUCT", parentId: catMap["damnoosh-tarkibi"] },
      update: { title: "دمنوش عشق", englishTitle: "love-herbal-blend", parentId: catMap["damnoosh-tarkibi"] },
    });
    catMap["damnoosh-eshq"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "damnoosh-aramesh" },
      create: { title: "دمنوش آرامش", slug: "damnoosh-aramesh", englishTitle: "calm-herbal-blend", type: "PRODUCT", parentId: catMap["damnoosh-tarkibi"] },
      update: { title: "دمنوش آرامش", englishTitle: "calm-herbal-blend", parentId: catMap["damnoosh-tarkibi"] },
    });
    catMap["damnoosh-aramesh"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "damnoosh-zibai" },
      create: { title: "دمنوش زیبایی", slug: "damnoosh-zibai", englishTitle: "beauty-herbal-blend", type: "PRODUCT", parentId: catMap["damnoosh-tarkibi"] },
      update: { title: "دمنوش زیبایی", englishTitle: "beauty-herbal-blend", parentId: catMap["damnoosh-tarkibi"] },
    });
    catMap["damnoosh-zibai"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "damnoosh-samzodai" },
      create: { title: "دمنوش سم‌زدایی", slug: "damnoosh-samzodai", englishTitle: "detox-herbal-blend", type: "PRODUCT", parentId: catMap["damnoosh-tarkibi"] },
      update: { title: "دمنوش سم‌زدایی", englishTitle: "detox-herbal-blend", parentId: catMap["damnoosh-tarkibi"] },
    });
    catMap["damnoosh-samzodai"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "damnoosh-shadi" },
      create: { title: "دمنوش شادی", slug: "damnoosh-shadi", englishTitle: "joy-herbal-blend", type: "PRODUCT", parentId: catMap["damnoosh-tarkibi"] },
      update: { title: "دمنوش شادی", englishTitle: "joy-herbal-blend", parentId: catMap["damnoosh-tarkibi"] },
    });
    catMap["damnoosh-shadi"] = c.id;
  }
  {
    const c = await prisma.category.upsert({
      where: { slug: "damnoosh-tabestan" },
      create: { title: "دمنوش تابستان", slug: "damnoosh-tabestan", englishTitle: "summer-herbal-blend", type: "PRODUCT", parentId: catMap["damnoosh-tarkibi"] },
      update: { title: "دمنوش تابستان", englishTitle: "summer-herbal-blend", parentId: catMap["damnoosh-tarkibi"] },
    });
    catMap["damnoosh-tabestan"] = c.id;
  }

  console.log(`✅ ${Object.keys(catMap).length} categories upserted`);

  // ── 3. Products ──────────────────────────────────────────────
  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-siyah-momtaz-lahijan" },
      create: {
        title: "چای سیاه ممتاز لاهیجان",
        slug: "chai-siyah-momtaz-lahijan",
        latinTitle: "Premium Lahijan Black Tea",
        description: `چای سیاه ممتاز لاهیجان دشت‌زاد، محصولی ناب از دل سرسبزترین باغ‌های چای شمال ایران در منطقه‌ی لاهیجان گیلان است. این چای با عطری دلنشین و رنگ دم‌کرده‌ای تیره و شفاف، تجربه‌ای اصیل از فرهنگ چای‌نوشی ایرانی را به ارمغان می‌آورد.

باغ‌های چای لاهیجان در دامنه‌های سبز البرز، با آب‌وهوای معتدل و مه‌آلود، شرایطی ایده‌آل برای رشد برگ‌های چای فراهم می‌کنند. دشت‌زاد با انتخاب دقیق برگ‌های سرگل و نوبرانه‌ی فصل بهار، چایی تولید می‌کند که از نظر کیفیت و طعم در اوج است.

فرآیند فرآوری این چای با روش سنتی چرخش و تخمیر انجام می‌شود تا تمام اسانس‌ها و ترکیبات ارزشمند برگ چای حفظ گردند. تانن‌های طبیعی موجود در این چای نه‌تنها به رنگ دلپذیر دم‌کرده کمک می‌کنند، بلکه خاصیت آنتی‌اکسیدانی بالایی نیز دارند.

چای سیاه ممتاز لاهیجان دشت‌زاد را می‌توان بدون شیر یا همراه با کمی شیر تازه میل نمود. این چای با قوری چینی یا سماور سنتی ایرانی به بهترین شکل دم می‌شود. توصیه می‌شود برای هر لیوان چای، یک قاشق چای‌خوری از این محصول را به مدت ۵ تا ۷ دقیقه در آب تازه جوشیده دم کنید.

بسته‌بندی بهداشتی و مقاوم دشت‌زاد تازگی و عطر این چای اصیل ایرانی را تا لحظه‌ی مصرف حفظ می‌کند. این محصول فاقد هرگونه افزودنی مصنوعی، رنگ‌دهنده و طعم‌دهنده‌ی شیمیایی است و کاملاً طبیعی می‌باشد.`,
        brand: "دشت‌زاد",
        price_rial: 80000000,
        offPrice_rial: 72000000,
        discountPercent: 10,
        countInStock: 85,
        tags: ["چای لاهیجان", "چای سیاه", "چای ایرانی", "ارگانیک", "بدون افزودنی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 80000000,
        categoryId: catMap["chai-siyah"] ?? catMap["chai"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
      },
      update: {
        title: "چای سیاه ممتاز لاهیجان",
        latinTitle: "Premium Lahijan Black Tea",
        description: `چای سیاه ممتاز لاهیجان دشت‌زاد، محصولی ناب از دل سرسبزترین باغ‌های چای شمال ایران در منطقه‌ی لاهیجان گیلان است. این چای با عطری دلنشین و رنگ دم‌کرده‌ای تیره و شفاف، تجربه‌ای اصیل از فرهنگ چای‌نوشی ایرانی را به ارمغان می‌آورد.

باغ‌های چای لاهیجان در دامنه‌های سبز البرز، با آب‌وهوای معتدل و مه‌آلود، شرایطی ایده‌آل برای رشد برگ‌های چای فراهم می‌کنند. دشت‌زاد با انتخاب دقیق برگ‌های سرگل و نوبرانه‌ی فصل بهار، چایی تولید می‌کند که از نظر کیفیت و طعم در اوج است.

فرآیند فرآوری این چای با روش سنتی چرخش و تخمیر انجام می‌شود تا تمام اسانس‌ها و ترکیبات ارزشمند برگ چای حفظ گردند. تانن‌های طبیعی موجود در این چای نه‌تنها به رنگ دلپذیر دم‌کرده کمک می‌کنند، بلکه خاصیت آنتی‌اکسیدانی بالایی نیز دارند.

چای سیاه ممتاز لاهیجان دشت‌زاد را می‌توان بدون شیر یا همراه با کمی شیر تازه میل نمود. این چای با قوری چینی یا سماور سنتی ایرانی به بهترین شکل دم می‌شود. توصیه می‌شود برای هر لیوان چای، یک قاشق چای‌خوری از این محصول را به مدت ۵ تا ۷ دقیقه در آب تازه جوشیده دم کنید.

بسته‌بندی بهداشتی و مقاوم دشت‌زاد تازگی و عطر این چای اصیل ایرانی را تا لحظه‌ی مصرف حفظ می‌کند. این محصول فاقد هرگونه افزودنی مصنوعی، رنگ‌دهنده و طعم‌دهنده‌ی شیمیایی است و کاملاً طبیعی می‌باشد.`,
        price_rial: 80000000,
        offPrice_rial: 72000000,
        discountPercent: 10,
        countInStock: 85,
        tags: ["چای لاهیجان", "چای سیاه", "چای ایرانی", "ارگانیک", "بدون افزودنی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
        categoryId: catMap["chai-siyah"] ?? catMap["chai"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/16011-1.webp", alt: "چای سیاه ممتاز لاهیجان", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-siyah-momtaz-lahijan-100g", calculatedPrice_rial: 80000000, price_rial: 80000000, offPrice_rial: 72000000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-siyah-momtaz-lahijan-200g", calculatedPrice_rial: 160000000, price_rial: 160000000, offPrice_rial: 144000000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "chai-siyah-momtaz-lahijan-500g", calculatedPrice_rial: 380000000, price_rial: 380000000, offPrice_rial: 342000000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-siyah-silani-organic" },
      create: {
        title: "چای سیاه سیلانی ارگانیک",
        slug: "chai-siyah-silani-organic",
        latinTitle: "Organic Ceylon Black Tea",
        description: `چای سیاه سیلانی ارگانیک دشت‌زاد از باغ‌های معتبر سریلانکا (سیلان) تهیه می‌شود؛ کشوری که به‌عنوان یکی از بزرگ‌ترین و معتبرترین تولیدکنندگان چای در جهان شناخته می‌شود. ارتفاعات بلند سریلانکا با اقلیم استوایی معتدل، شرایطی بی‌نظیر برای پرورش چایی با طعمی قوی و عطری ماندگار فراهم می‌آورد.

این محصول با گواهینامه‌ی ارگانیک تهیه شده و در تمام مراحل کشت و فرآوری، از هرگونه کود شیمیایی و سموم آفت‌کش دور بوده است. دشت‌زاد با انتخاب چای سیلانی اعلا، محصولی ارائه می‌دهد که هم سالم است و هم سرشار از طعم و عطر اصیل.

چای سیلانی دشت‌زاد با رنگ دم‌کرده‌ی کهربایی روشن، عطری ملایم و طعمی متعادل و اندکی ترش، انتخابی عالی برای کسانی است که چای سبک‌تر و بین‌المللی را ترجیح می‌دهند. این چای را می‌توان صبح‌گاهی یا بعد از ظهر میل نمود و با شیر و شکر یا به صورت ساده لذت برد.

دم‌آوری آن ساده است: آب را تا ۹۵ درجه سانتیگراد گرم کرده، یک قاشق چای‌خوری از این چای را برای هر لیوان اضافه کنید و ۳ تا ۴ دقیقه صبر کنید تا رنگ و طعم مطلوب حاصل شود.

بسته‌بندی زیپ‌دار دشت‌زاد تضمین می‌کند که چای پس از هر بار استفاده کاملاً بسته نگه داشته شود تا تازگی آن محفوظ بماند. این محصول برای خانواده‌هایی که به کیفیت و سلامت اهمیت می‌دهند، ایده‌آل است.`,
        brand: "دشت‌زاد",
        price_rial: 50000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 60,
        tags: ["چای سیلانی", "چای سیاه", "ارگانیک", "سریلانکا", "بدون کافئین بالا"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 50000000,
        categoryId: catMap["chai-siyah"] ?? catMap["chai"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
      },
      update: {
        title: "چای سیاه سیلانی ارگانیک",
        latinTitle: "Organic Ceylon Black Tea",
        description: `چای سیاه سیلانی ارگانیک دشت‌زاد از باغ‌های معتبر سریلانکا (سیلان) تهیه می‌شود؛ کشوری که به‌عنوان یکی از بزرگ‌ترین و معتبرترین تولیدکنندگان چای در جهان شناخته می‌شود. ارتفاعات بلند سریلانکا با اقلیم استوایی معتدل، شرایطی بی‌نظیر برای پرورش چایی با طعمی قوی و عطری ماندگار فراهم می‌آورد.

این محصول با گواهینامه‌ی ارگانیک تهیه شده و در تمام مراحل کشت و فرآوری، از هرگونه کود شیمیایی و سموم آفت‌کش دور بوده است. دشت‌زاد با انتخاب چای سیلانی اعلا، محصولی ارائه می‌دهد که هم سالم است و هم سرشار از طعم و عطر اصیل.

چای سیلانی دشت‌زاد با رنگ دم‌کرده‌ی کهربایی روشن، عطری ملایم و طعمی متعادل و اندکی ترش، انتخابی عالی برای کسانی است که چای سبک‌تر و بین‌المللی را ترجیح می‌دهند. این چای را می‌توان صبح‌گاهی یا بعد از ظهر میل نمود و با شیر و شکر یا به صورت ساده لذت برد.

دم‌آوری آن ساده است: آب را تا ۹۵ درجه سانتیگراد گرم کرده، یک قاشق چای‌خوری از این چای را برای هر لیوان اضافه کنید و ۳ تا ۴ دقیقه صبر کنید تا رنگ و طعم مطلوب حاصل شود.

بسته‌بندی زیپ‌دار دشت‌زاد تضمین می‌کند که چای پس از هر بار استفاده کاملاً بسته نگه داشته شود تا تازگی آن محفوظ بماند. این محصول برای خانواده‌هایی که به کیفیت و سلامت اهمیت می‌دهند، ایده‌آل است.`,
        price_rial: 50000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 60,
        tags: ["چای سیلانی", "چای سیاه", "ارگانیک", "سریلانکا", "بدون کافئین بالا"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
        categoryId: catMap["chai-siyah"] ?? catMap["chai"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/15861-1.webp", alt: "چای سیاه سیلانی ارگانیک", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-siyah-silani-organic-100g", calculatedPrice_rial: 50000000, price_rial: 50000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-siyah-silani-organic-200g", calculatedPrice_rial: 100000000, price_rial: 100000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "chai-siyah-silani-organic-500g", calculatedPrice_rial: 237500000, price_rial: 237500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-sabz-irani-lahijan" },
      create: {
        title: "چای سبز ایرانی لاهیجان",
        slug: "chai-sabz-irani-lahijan",
        latinTitle: "Iranian Green Tea Lahijan",
        description: `چای سبز ایرانی لاهیجان دشت‌زاد از بهترین باغ‌های سرسبز شمال ایران در منطقه‌ی لاهیجان گیلان برداشت می‌شود. این چای با روش سنتی بخاردهی (Steaming) فرآوری شده تا آنزیم‌های اکسیداسیون غیرفعال شوند و رنگ سبز طبیعی و خاصیت‌های مفید برگ تازه حفظ گردد.

چای سبز ایرانی لاهیجان دارای طعمی لطیف، کمی علف‌مانند و ملایم است که از چای سبز چینی و ژاپنی متمایز می‌شود. آب‌وهوای گیلان با رطوبت بالا و درجه حرارت مناسب، عطری خاص و منحصربه‌فرد به این چای می‌بخشد که در هیچ نقطه‌ی دیگری از جهان قابل تکرار نیست.

دشت‌زاد با جمع‌آوری دستی برگ‌های چای در فصل بهار و تابستان، تازه‌ترین و باکیفیت‌ترین برگ‌ها را انتخاب می‌کند. هر برگ به دقت بررسی شده تا تنها برگ‌های جوان و سالم وارد بسته‌بندی شوند.

چای سبز لاهیجان دشت‌زاد سرشار از آنتی‌اکسیدان‌های گروه کاتچین، به‌ویژه EGCG است که در تحقیقات علمی متعدد نقش مفیدی در سلامت قلب و عروق، تقویت سیستم ایمنی و کمک به متابولیسم بدن نشان داده‌اند.

برای دم‌آوری این چای توصیه می‌شود از آب ۷۵ تا ۸۰ درجه سانتیگراد (نه جوش کامل) استفاده شود و آن را فقط ۲ تا ۳ دقیقه دم کنید تا طعمی ملایم و غیرتلخ داشته باشید. این چای بدون شکر یا با اضافه کردن کمی عسل طبیعی، نوشیدنی‌ای سالم و لذیذ است.`,
        brand: "دشت‌زاد",
        price_rial: 75000000,
        offPrice_rial: 67500000,
        discountPercent: 10,
        countInStock: 45,
        tags: ["چای سبز", "چای ایرانی", "لاهیجان", "آنتی اکسیدان", "سلامتی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 75000000,
        categoryId: catMap["chai-sabz"] ?? catMap["chai"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
      },
      update: {
        title: "چای سبز ایرانی لاهیجان",
        latinTitle: "Iranian Green Tea Lahijan",
        description: `چای سبز ایرانی لاهیجان دشت‌زاد از بهترین باغ‌های سرسبز شمال ایران در منطقه‌ی لاهیجان گیلان برداشت می‌شود. این چای با روش سنتی بخاردهی (Steaming) فرآوری شده تا آنزیم‌های اکسیداسیون غیرفعال شوند و رنگ سبز طبیعی و خاصیت‌های مفید برگ تازه حفظ گردد.

چای سبز ایرانی لاهیجان دارای طعمی لطیف، کمی علف‌مانند و ملایم است که از چای سبز چینی و ژاپنی متمایز می‌شود. آب‌وهوای گیلان با رطوبت بالا و درجه حرارت مناسب، عطری خاص و منحصربه‌فرد به این چای می‌بخشد که در هیچ نقطه‌ی دیگری از جهان قابل تکرار نیست.

دشت‌زاد با جمع‌آوری دستی برگ‌های چای در فصل بهار و تابستان، تازه‌ترین و باکیفیت‌ترین برگ‌ها را انتخاب می‌کند. هر برگ به دقت بررسی شده تا تنها برگ‌های جوان و سالم وارد بسته‌بندی شوند.

چای سبز لاهیجان دشت‌زاد سرشار از آنتی‌اکسیدان‌های گروه کاتچین، به‌ویژه EGCG است که در تحقیقات علمی متعدد نقش مفیدی در سلامت قلب و عروق، تقویت سیستم ایمنی و کمک به متابولیسم بدن نشان داده‌اند.

برای دم‌آوری این چای توصیه می‌شود از آب ۷۵ تا ۸۰ درجه سانتیگراد (نه جوش کامل) استفاده شود و آن را فقط ۲ تا ۳ دقیقه دم کنید تا طعمی ملایم و غیرتلخ داشته باشید. این چای بدون شکر یا با اضافه کردن کمی عسل طبیعی، نوشیدنی‌ای سالم و لذیذ است.`,
        price_rial: 75000000,
        offPrice_rial: 67500000,
        discountPercent: 10,
        countInStock: 45,
        tags: ["چای سبز", "چای ایرانی", "لاهیجان", "آنتی اکسیدان", "سلامتی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
        categoryId: catMap["chai-sabz"] ?? catMap["chai"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p4.jpeg", alt: "چای سبز ایرانی لاهیجان", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-sabz-irani-lahijan-100g", calculatedPrice_rial: 75000000, price_rial: 75000000, offPrice_rial: 67500000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-sabz-irani-lahijan-200g", calculatedPrice_rial: 150000000, price_rial: 150000000, offPrice_rial: 135000000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "chai-sabz-irani-lahijan-500g", calculatedPrice_rial: 356250000, price_rial: 356250000, offPrice_rial: 320620000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-sabz-jasmine" },
      create: {
        title: "چای سبز جاسمین",
        slug: "chai-sabz-jasmine",
        latinTitle: "Jasmine Green Tea",
        description: `چای سبز جاسمین دشت‌زاد ترکیبی دلپذیر از چای سبز اعلای چینی با گل‌های تازه‌ی یاسمین است که هنر باستانی چای‌سازی چین را به خانه‌ی شما می‌آورد. در این روش سنتی، برگ‌های چای سبز در مجاورت گل‌های یاسمین تازه قرار می‌گیرند تا عطر خوش گل به صورت طبیعی در برگ‌های چای نفوذ کند.

استان فوجیان چین خاستگاه اصیل چای جاسمین است؛ جایی که در آن هنر ترکیب چای و گل برای بیش از هزار سال پیشینه دارد. دشت‌زاد با همکاری با باغ‌داران معتبر این منطقه، بهترین ترکیب را برای مشتریان ایرانی انتخاب کرده است.

عطر لطیف و زنانه‌ی یاسمین در کنار طعم سبک و آرام‌بخش چای سبز، نوشیدنی‌ای خلق می‌کند که برای هر ساعتی از روز مناسب است؛ چه صبح‌گاهی برای شروع آرام روز، چه بعد از ظهر برای لحظه‌ای استراحت. این چای به‌ویژه در مهمانی‌ها و پذیرایی‌های رسمی انتخابی متمایز و باکلاس است.

چای سبز جاسمین دشت‌زاد حاوی آنتی‌اکسیدان‌های طبیعی گروه فلاونوئید و ترکیبات معطر گل یاسمین است که به آرامش اعصاب کمک می‌کنند. این ترکیب طبیعی بدون هیچ اسانس مصنوعی یا طعم‌دهنده‌ی شیمیایی تهیه شده است.

برای دم‌آوری، آب را به ۸۰ درجه سانتیگراد برسانید و یک قاشق چای‌خوری برای هر فنجان بریزید. ۲ تا ۳ دقیقه دم کنید. می‌توانید دو یا سه بار از همین برگ‌ها دم‌آوری کنید.`,
        brand: "دشت‌زاد",
        price_rial: 55000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 38,
        tags: ["چای سبز", "جاسمین", "یاسمین", "چین", "عطری", "آرام‌بخش"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 55000000,
        categoryId: catMap["chai-sabz"] ?? catMap["chai"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
      },
      update: {
        title: "چای سبز جاسمین",
        latinTitle: "Jasmine Green Tea",
        description: `چای سبز جاسمین دشت‌زاد ترکیبی دلپذیر از چای سبز اعلای چینی با گل‌های تازه‌ی یاسمین است که هنر باستانی چای‌سازی چین را به خانه‌ی شما می‌آورد. در این روش سنتی، برگ‌های چای سبز در مجاورت گل‌های یاسمین تازه قرار می‌گیرند تا عطر خوش گل به صورت طبیعی در برگ‌های چای نفوذ کند.

استان فوجیان چین خاستگاه اصیل چای جاسمین است؛ جایی که در آن هنر ترکیب چای و گل برای بیش از هزار سال پیشینه دارد. دشت‌زاد با همکاری با باغ‌داران معتبر این منطقه، بهترین ترکیب را برای مشتریان ایرانی انتخاب کرده است.

عطر لطیف و زنانه‌ی یاسمین در کنار طعم سبک و آرام‌بخش چای سبز، نوشیدنی‌ای خلق می‌کند که برای هر ساعتی از روز مناسب است؛ چه صبح‌گاهی برای شروع آرام روز، چه بعد از ظهر برای لحظه‌ای استراحت. این چای به‌ویژه در مهمانی‌ها و پذیرایی‌های رسمی انتخابی متمایز و باکلاس است.

چای سبز جاسمین دشت‌زاد حاوی آنتی‌اکسیدان‌های طبیعی گروه فلاونوئید و ترکیبات معطر گل یاسمین است که به آرامش اعصاب کمک می‌کنند. این ترکیب طبیعی بدون هیچ اسانس مصنوعی یا طعم‌دهنده‌ی شیمیایی تهیه شده است.

برای دم‌آوری، آب را به ۸۰ درجه سانتیگراد برسانید و یک قاشق چای‌خوری برای هر فنجان بریزید. ۲ تا ۳ دقیقه دم کنید. می‌توانید دو یا سه بار از همین برگ‌ها دم‌آوری کنید.`,
        price_rial: 55000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 38,
        tags: ["چای سبز", "جاسمین", "یاسمین", "چین", "عطری", "آرام‌بخش"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
        categoryId: catMap["chai-sabz"] ?? catMap["chai"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p4.jpeg", alt: "چای سبز جاسمین", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-sabz-jasmine-100g", calculatedPrice_rial: 55000000, price_rial: 55000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-sabz-jasmine-200g", calculatedPrice_rial: 110000000, price_rial: 110000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "chai-sabz-jasmine-500g", calculatedPrice_rial: 261250000, price_rial: 261250000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-earl-grey-classic" },
      create: {
        title: "چای ارل گری کلاسیک",
        slug: "chai-earl-grey-classic",
        latinTitle: "Classic Earl Grey Tea",
        description: `چای ارل گری کلاسیک دشت‌زاد یکی از معروف‌ترین و محبوب‌ترین چای‌های جهان است که از ترکیب چای سیاه اعلا با روغن طبیعی برگاموت (میوه‌ای خوشبو از خانواده‌ی مرکبات) تهیه می‌شود. این چای با عطر خاص و منحصربه‌فرد برگاموت، برای بیش از دو قرن مورد علاقه‌ی قشر اشراف و چای‌دوستان سراسر جهان بوده است.

ریشه‌ی این چای به اوایل قرن نوزدهم در انگلستان بازمی‌گردد؛ جایی که آن را به افتخار ارل گری دوم، نخست‌وزیر انگلستان نام‌گذاری کردند. امروزه این چای از فرانسه تا ژاپن، از ایران تا کانادا، طرفداران پروپاقرصی دارد.

دشت‌زاد پایه‌ی این چای را از بهترین باغ‌های چای سیلان و هند انتخاب کرده و روغن برگاموت اصیل ایتالیایی از منطقه‌ی کالابریا را به صورت طبیعی به آن می‌افزاید. نتیجه چایی است با رنگ دم‌کرده‌ی تیره و عطری شاداب و زنده که ذهن را هوشیار و خلق را شاد می‌کند.

این چای برای افرادی مناسب است که چای قوی و معطر را دوست دارند. به‌تنهایی، با کمی عسل، یا با شیر بخار داده شده (Latte سبک) به شیوه‌ی انگلیسی نوشیدنی لذیذی است. در کافه‌های معتبر تهران نیز این چای به عنوان گزینه‌ای لاکچری ارائه می‌شود.

بسته‌بندی باکیفیت دشت‌زاد تضمین می‌کند عطر برگاموت تا آخرین لحظه‌ی مصرف تازه و قوی بماند. آب جوشیده را به مدت ۴ تا ۵ دقیقه روی این چای بریزید.`,
        brand: "دشت‌زاد",
        price_rial: 58000000,
        offPrice_rial: 52200000,
        discountPercent: 10,
        countInStock: 52,
        tags: ["ارل گری", "برگاموت", "چای سیاه", "عطری", "کلاسیک", "انگلیسی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 58000000,
        categoryId: catMap["chai-earl-grey"] ?? catMap["chai"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
      },
      update: {
        title: "چای ارل گری کلاسیک",
        latinTitle: "Classic Earl Grey Tea",
        description: `چای ارل گری کلاسیک دشت‌زاد یکی از معروف‌ترین و محبوب‌ترین چای‌های جهان است که از ترکیب چای سیاه اعلا با روغن طبیعی برگاموت (میوه‌ای خوشبو از خانواده‌ی مرکبات) تهیه می‌شود. این چای با عطر خاص و منحصربه‌فرد برگاموت، برای بیش از دو قرن مورد علاقه‌ی قشر اشراف و چای‌دوستان سراسر جهان بوده است.

ریشه‌ی این چای به اوایل قرن نوزدهم در انگلستان بازمی‌گردد؛ جایی که آن را به افتخار ارل گری دوم، نخست‌وزیر انگلستان نام‌گذاری کردند. امروزه این چای از فرانسه تا ژاپن، از ایران تا کانادا، طرفداران پروپاقرصی دارد.

دشت‌زاد پایه‌ی این چای را از بهترین باغ‌های چای سیلان و هند انتخاب کرده و روغن برگاموت اصیل ایتالیایی از منطقه‌ی کالابریا را به صورت طبیعی به آن می‌افزاید. نتیجه چایی است با رنگ دم‌کرده‌ی تیره و عطری شاداب و زنده که ذهن را هوشیار و خلق را شاد می‌کند.

این چای برای افرادی مناسب است که چای قوی و معطر را دوست دارند. به‌تنهایی، با کمی عسل، یا با شیر بخار داده شده (Latte سبک) به شیوه‌ی انگلیسی نوشیدنی لذیذی است. در کافه‌های معتبر تهران نیز این چای به عنوان گزینه‌ای لاکچری ارائه می‌شود.

بسته‌بندی باکیفیت دشت‌زاد تضمین می‌کند عطر برگاموت تا آخرین لحظه‌ی مصرف تازه و قوی بماند. آب جوشیده را به مدت ۴ تا ۵ دقیقه روی این چای بریزید.`,
        price_rial: 58000000,
        offPrice_rial: 52200000,
        discountPercent: 10,
        countInStock: 52,
        tags: ["ارل گری", "برگاموت", "چای سیاه", "عطری", "کلاسیک", "انگلیسی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
        categoryId: catMap["chai-earl-grey"] ?? catMap["chai"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p4.jpeg", alt: "چای ارل گری کلاسیک", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-earl-grey-classic-100g", calculatedPrice_rial: 58000000, price_rial: 58000000, offPrice_rial: 52200000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-earl-grey-classic-200g", calculatedPrice_rial: 116000000, price_rial: 116000000, offPrice_rial: 104400000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "chai-earl-grey-classic-500g", calculatedPrice_rial: 275500000, price_rial: 275500000, offPrice_rial: 247950000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-earl-grey-talai" },
      create: {
        title: "چای ارل گری طلایی",
        slug: "chai-earl-grey-talai",
        latinTitle: "Golden Earl Grey Tea",
        description: `چای ارل گری طلایی دشت‌زاد نسخه‌ی پریمیوم و ممتاز ارل گری کلاسیک است که از ترکیب چای سیاه دارجیلینگ درجه‌یک، روغن برگاموت اصیل ایتالیایی، گل‌برگ‌های گل همیشه‌بهار (کالاندولا) و گل‌های آفتاب‌گردان تهیه شده است. این ترکیب منحصربه‌فرد هم به زیبایی ظاهری چای می‌افزاید و هم عطر و طعمی لایه‌لایه و پیچیده ایجاد می‌کند.

چای دارجیلینگ از ارتفاعات هیمالیا در هند تهیه می‌شود؛ منطقه‌ای که به آن «شامپاین چای» می‌گویند. این چای با رنگ روشن‌تر و طعمی ظریف‌تر از سیلان، پایه‌ای ایده‌آل برای ارل گری طلایی فراهم می‌کند. گل‌برگ‌های آبی گل ذرت که در این ترکیب به کار رفته‌اند، عطری خفیف و زیبایی بصری خاصی می‌بخشند.

دشت‌زاد این محصول را برای مخاطبانی طراحی کرده که به تجربه‌ای فراتر از یک چای معمولی نیاز دارند؛ کسانی که چای‌نوشی را هنر می‌دانند و به ظرافت‌های طعم و عطر توجه می‌کنند. این چای هدیه‌ای بی‌نظیر برای دوستان و عزیزانی است که اهل ذوق هستند.

رنگ دم‌کرده‌ی این چای کهربایی طلایی است که در فنجان شیشه‌ای یا چینی سفید به زیبایی خودنمایی می‌کند. برای بهترین نتیجه آب را به ۹۵ درجه سانتیگراد برسانید و ۴ دقیقه دم کنید. با شکر کندری یا عسل صخره‌ای لذیذ‌تر می‌شود.

این محصول در بسته‌بندی ممتاز و هدیه‌پذیر دشت‌زاد عرضه می‌شود که آن را به انتخابی عالی برای هدایای ویژه تبدیل کرده است.`,
        brand: "دشت‌زاد",
        price_rial: 75000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 30,
        tags: ["ارل گری", "طلایی", "دارجیلینگ", "برگاموت", "پریمیوم", "هدیه"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 75000000,
        categoryId: catMap["chai-earl-grey"] ?? catMap["chai"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
      },
      update: {
        title: "چای ارل گری طلایی",
        latinTitle: "Golden Earl Grey Tea",
        description: `چای ارل گری طلایی دشت‌زاد نسخه‌ی پریمیوم و ممتاز ارل گری کلاسیک است که از ترکیب چای سیاه دارجیلینگ درجه‌یک، روغن برگاموت اصیل ایتالیایی، گل‌برگ‌های گل همیشه‌بهار (کالاندولا) و گل‌های آفتاب‌گردان تهیه شده است. این ترکیب منحصربه‌فرد هم به زیبایی ظاهری چای می‌افزاید و هم عطر و طعمی لایه‌لایه و پیچیده ایجاد می‌کند.

چای دارجیلینگ از ارتفاعات هیمالیا در هند تهیه می‌شود؛ منطقه‌ای که به آن «شامپاین چای» می‌گویند. این چای با رنگ روشن‌تر و طعمی ظریف‌تر از سیلان، پایه‌ای ایده‌آل برای ارل گری طلایی فراهم می‌کند. گل‌برگ‌های آبی گل ذرت که در این ترکیب به کار رفته‌اند، عطری خفیف و زیبایی بصری خاصی می‌بخشند.

دشت‌زاد این محصول را برای مخاطبانی طراحی کرده که به تجربه‌ای فراتر از یک چای معمولی نیاز دارند؛ کسانی که چای‌نوشی را هنر می‌دانند و به ظرافت‌های طعم و عطر توجه می‌کنند. این چای هدیه‌ای بی‌نظیر برای دوستان و عزیزانی است که اهل ذوق هستند.

رنگ دم‌کرده‌ی این چای کهربایی طلایی است که در فنجان شیشه‌ای یا چینی سفید به زیبایی خودنمایی می‌کند. برای بهترین نتیجه آب را به ۹۵ درجه سانتیگراد برسانید و ۴ دقیقه دم کنید. با شکر کندری یا عسل صخره‌ای لذیذ‌تر می‌شود.

این محصول در بسته‌بندی ممتاز و هدیه‌پذیر دشت‌زاد عرضه می‌شود که آن را به انتخابی عالی برای هدایای ویژه تبدیل کرده است.`,
        price_rial: 75000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 30,
        tags: ["ارل گری", "طلایی", "دارجیلینگ", "برگاموت", "پریمیوم", "هدیه"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
        categoryId: catMap["chai-earl-grey"] ?? catMap["chai"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/15861-1.webp", alt: "چای ارل گری طلایی", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-earl-grey-talai-100g", calculatedPrice_rial: 75000000, price_rial: 75000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-earl-grey-talai-200g", calculatedPrice_rial: 150000000, price_rial: 150000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "chai-earl-grey-talai-500g", calculatedPrice_rial: 356250000, price_rial: 356250000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-irani-dorosht-lahijan" },
      create: {
        title: "چای ایرانی درشت لاهیجان",
        slug: "chai-irani-dorosht-lahijan",
        latinTitle: "Coarse Leaf Lahijan Iranian Tea",
        description: `چای ایرانی درشت لاهیجان دشت‌زاد یادآور همان چای اصیل و خوش‌عطری است که مادربزرگ‌هایمان در سماور می‌جوشاندند. این چای از برگ‌های درشت و کامل چای گیلان تهیه شده که به آرامی در دمای مطلوب تخمیر و خشک شده تا تمام ترکیبات معطر آن دست‌نخورده باقی بمانند.

منطقه‌ی لاهیجان با قدمتی بیش از صد سال در کشت چای ایرانی، همچنان بهترین باغ‌های چای کشور را در خود جای داده است. امیر محمد حسن مشیر نظام که چای را در اواخر دوران قاجار به ایران معرفی کرد، همین منطقه را برای کشت انتخاب کرد. دشت‌زاد با احترام به این میراث غنی، از بهترین باغ‌های این منطقه تهیه می‌کند.

چای درشت لاهیجان دشت‌زاد برای کسانی که سماور دارند و چای را به روش قدیمی دم می‌کنند ایده‌آل است. این چای در قوری چینی یا لعابی روی سماور دم می‌شود و با گذشت زمان، رنگ قرمز متمایل به قهوه‌ای شفاف پیدا می‌کند. طعم آن قوی، تانن‌دار و کمی تلخ است که با یک حبه قند کنار آن عالی می‌شود.

این چای صبحانه‌ای مناسب برای شروع روز است. قوری را روی سماور گذاشته، به ازای هر فنجان یک قاشق چای‌خوری از این چای بریزید و اجازه دهید ۱۰ تا ۱۵ دقیقه دم بکشد تا رنگ و طعم عمیق آن آزاد شود.

دشت‌زاد با بسته‌بندی مناسب و حفظ شرایط نگهداری صحیح، ضمانت می‌دهد که چای از باغ تا سفره‌ی شما تازه و باکیفیت باقی بماند.`,
        brand: "دشت‌زاد",
        price_rial: 82000000,
        offPrice_rial: 73800000,
        discountPercent: 10,
        countInStock: 70,
        tags: ["چای ایرانی", "لاهیجان", "درشت", "سنتی", "سماور", "گیلان"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 82000000,
        categoryId: catMap["chai-irani"] ?? catMap["chai"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
      },
      update: {
        title: "چای ایرانی درشت لاهیجان",
        latinTitle: "Coarse Leaf Lahijan Iranian Tea",
        description: `چای ایرانی درشت لاهیجان دشت‌زاد یادآور همان چای اصیل و خوش‌عطری است که مادربزرگ‌هایمان در سماور می‌جوشاندند. این چای از برگ‌های درشت و کامل چای گیلان تهیه شده که به آرامی در دمای مطلوب تخمیر و خشک شده تا تمام ترکیبات معطر آن دست‌نخورده باقی بمانند.

منطقه‌ی لاهیجان با قدمتی بیش از صد سال در کشت چای ایرانی، همچنان بهترین باغ‌های چای کشور را در خود جای داده است. امیر محمد حسن مشیر نظام که چای را در اواخر دوران قاجار به ایران معرفی کرد، همین منطقه را برای کشت انتخاب کرد. دشت‌زاد با احترام به این میراث غنی، از بهترین باغ‌های این منطقه تهیه می‌کند.

چای درشت لاهیجان دشت‌زاد برای کسانی که سماور دارند و چای را به روش قدیمی دم می‌کنند ایده‌آل است. این چای در قوری چینی یا لعابی روی سماور دم می‌شود و با گذشت زمان، رنگ قرمز متمایل به قهوه‌ای شفاف پیدا می‌کند. طعم آن قوی، تانن‌دار و کمی تلخ است که با یک حبه قند کنار آن عالی می‌شود.

این چای صبحانه‌ای مناسب برای شروع روز است. قوری را روی سماور گذاشته، به ازای هر فنجان یک قاشق چای‌خوری از این چای بریزید و اجازه دهید ۱۰ تا ۱۵ دقیقه دم بکشد تا رنگ و طعم عمیق آن آزاد شود.

دشت‌زاد با بسته‌بندی مناسب و حفظ شرایط نگهداری صحیح، ضمانت می‌دهد که چای از باغ تا سفره‌ی شما تازه و باکیفیت باقی بماند.`,
        price_rial: 82000000,
        offPrice_rial: 73800000,
        discountPercent: 10,
        countInStock: 70,
        tags: ["چای ایرانی", "لاهیجان", "درشت", "سنتی", "سماور", "گیلان"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
        categoryId: catMap["chai-irani"] ?? catMap["chai"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/16421-1.webp", alt: "چای ایرانی درشت لاهیجان", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-irani-dorosht-lahijan-100g", calculatedPrice_rial: 82000000, price_rial: 82000000, offPrice_rial: 73800000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-irani-dorosht-lahijan-200g", calculatedPrice_rial: 164000000, price_rial: 164000000, offPrice_rial: 147600000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "chai-irani-dorosht-lahijan-500g", calculatedPrice_rial: 389500000, price_rial: 389500000, offPrice_rial: 350550000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-irani-atri-lahijan" },
      create: {
        title: "چای ایرانی عطری لاهیجان",
        slug: "chai-irani-atri-lahijan",
        latinTitle: "Aromatic Lahijan Iranian Tea",
        description: `چای ایرانی عطری لاهیجان دشت‌زاد انتخاب بی‌نظیری برای مهمانی‌ها و پذیرایی‌های خاص است. این چای از برگ‌های ظریف و سرگل چای گیلان در اوج فصل بهار برداشت شده و با فرآیند خشک‌کردن آهسته در هوای طبیعی، عطر بی‌مانند آن تثبیت می‌شود.

تفاوت اصلی این چای با چای‌های معمولی در انتخاب برگ است. تنها نوک‌های جوان و ظریف شاخه‌ها (که در صنعت چای به آن‌ها «flush» می‌گویند) به کار می‌روند. این برگ‌های نازک و لطیف حاوی بیشترین مقدار اسانس‌های معطر و ترکیبات فعال هستند که طعم و عطری استثنایی ایجاد می‌کنند.

دشت‌زاد در تهیه‌ی این محصول با باغ‌های خانوادگی لاهیجان که نسل‌به‌نسل هنر چای‌کاری را آموخته‌اند همکاری می‌کند. این باغ‌داران سنتی با دانش بومی خود، بهترین زمان برداشت و روش‌های فرآوری را به کار می‌برند که در هیچ کتابی نوشته نشده است.

رنگ دم‌کرده‌ی این چای قرمز طلایی شفاف است و عطری دارد که تمام اتاق را پر می‌کند. طعم آن ملایم‌تر از چای درشت است اما عطرش بسیار قوی‌تر. این چای با نبات سفید یا قند سفید سنتی بهترین هماهنگی طعمی را دارد.

برای حفظ عطر این چای، آن را در ظرف دربسته و دور از نور و رطوبت نگهداری کنید. دشت‌زاد توصیه می‌کند ظرف نگهداری در کابینتی دور از اجاق گاز باشد تا تغییر دما بر کیفیت آن تأثیر نگذارد.`,
        brand: "دشت‌زاد",
        price_rial: 90000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 40,
        tags: ["چای ایرانی", "لاهیجان", "عطری", "سرگل", "بهاره", "پریمیوم"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 90000000,
        categoryId: catMap["chai-irani"] ?? catMap["chai"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
      },
      update: {
        title: "چای ایرانی عطری لاهیجان",
        latinTitle: "Aromatic Lahijan Iranian Tea",
        description: `چای ایرانی عطری لاهیجان دشت‌زاد انتخاب بی‌نظیری برای مهمانی‌ها و پذیرایی‌های خاص است. این چای از برگ‌های ظریف و سرگل چای گیلان در اوج فصل بهار برداشت شده و با فرآیند خشک‌کردن آهسته در هوای طبیعی، عطر بی‌مانند آن تثبیت می‌شود.

تفاوت اصلی این چای با چای‌های معمولی در انتخاب برگ است. تنها نوک‌های جوان و ظریف شاخه‌ها (که در صنعت چای به آن‌ها «flush» می‌گویند) به کار می‌روند. این برگ‌های نازک و لطیف حاوی بیشترین مقدار اسانس‌های معطر و ترکیبات فعال هستند که طعم و عطری استثنایی ایجاد می‌کنند.

دشت‌زاد در تهیه‌ی این محصول با باغ‌های خانوادگی لاهیجان که نسل‌به‌نسل هنر چای‌کاری را آموخته‌اند همکاری می‌کند. این باغ‌داران سنتی با دانش بومی خود، بهترین زمان برداشت و روش‌های فرآوری را به کار می‌برند که در هیچ کتابی نوشته نشده است.

رنگ دم‌کرده‌ی این چای قرمز طلایی شفاف است و عطری دارد که تمام اتاق را پر می‌کند. طعم آن ملایم‌تر از چای درشت است اما عطرش بسیار قوی‌تر. این چای با نبات سفید یا قند سفید سنتی بهترین هماهنگی طعمی را دارد.

برای حفظ عطر این چای، آن را در ظرف دربسته و دور از نور و رطوبت نگهداری کنید. دشت‌زاد توصیه می‌کند ظرف نگهداری در کابینتی دور از اجاق گاز باشد تا تغییر دما بر کیفیت آن تأثیر نگذارد.`,
        price_rial: 90000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 40,
        tags: ["چای ایرانی", "لاهیجان", "عطری", "سرگل", "بهاره", "پریمیوم"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 196, "carb_g": 40, "protein_g": 20, "fat_g": 0.5, "fiber_g": 36, "sugar_g": 0}},
        categoryId: catMap["chai-irani"] ?? catMap["chai"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/16011-1.webp", alt: "چای ایرانی عطری لاهیجان", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-irani-atri-lahijan-100g", calculatedPrice_rial: 90000000, price_rial: 90000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-irani-atri-lahijan-200g", calculatedPrice_rial: 180000000, price_rial: 180000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "chai-irani-atri-lahijan-500g", calculatedPrice_rial: 427500000, price_rial: 427500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "bargeh-zardalu-dashtzad" },
      create: {
        title: "برگه زردآلو دشت‌زاد",
        slug: "bargeh-zardalu-dashtzad",
        latinTitle: "Dried Apricot Slices",
        description: `برگه زردآلو دشت‌زاد، محصولی بی‌نظیر از باغ‌های سرسبز کوهپایه‌های ایران، با طعمی شیرین و ترش و رنگی طلایی که چشم هر بیننده‌ای را به خود می‌کشد. این برگه‌های لطیف از بهترین زردآلوهای رسیده تهیه می‌شوند و در فرآیند خشک‌کردن طبیعی، تمام شیرینی و عطر اصیل میوه در آن‌ها به دام می‌افتد. برگه زردآلو دشت‌زاد بدون هیچ افزودنی مصنوعی، رنگ مصنوعی یا نگهدارنده‌ای تولید می‌شود و سلامت شما در هر لحظه تضمین است.

این محصول سرشار از بتاکاروتن، ویتامین A، پتاسیم و فیبر طبیعی است که برای سلامت چشم، پوست و دستگاه گوارش فواید شگفت‌انگیزی دارد. برگه زردآلو به عنوان میان‌وعده‌ای سالم و دلپذیر، همراه آجیل و چای، در تهیه انواع آش و خورشت، و حتی برای تزئین کیک و دسر فوق‌العاده است.

دشت‌زاد با ایجاد زنجیره‌ای کوتاه از باغ تا سفره، اطمینان می‌دهد که هر تکه برگه که به دست شما می‌رسد از تازه‌ترین و بهترین زردآلوهای فصل تهیه شده است. بسته‌بندی بهداشتی و محکم دشت‌زاد طراوت و کیفیت محصول را تا آخرین لحظه حفظ می‌کند. همین حالا سبد خرید خود را با طعم اصیل ایران پر کنید.`,
        brand: "دشت‌زاد",
        price_rial: 850000,
        offPrice_rial: 720000,
        discountPercent: 15,
        countInStock: 120,
        tags: ["برگه میوه", "زردآلو خشک", "میان‌وعده سالم", "بدون افزودنی", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 850000,
        categoryId: catMap["bargeh-miveh"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 241, "carb_g": 62.6, "protein_g": 3.4, "fat_g": 0.5, "fiber_g": 7.3, "sugar_g": 53.4}},
      },
      update: {
        title: "برگه زردآلو دشت‌زاد",
        latinTitle: "Dried Apricot Slices",
        description: `برگه زردآلو دشت‌زاد، محصولی بی‌نظیر از باغ‌های سرسبز کوهپایه‌های ایران، با طعمی شیرین و ترش و رنگی طلایی که چشم هر بیننده‌ای را به خود می‌کشد. این برگه‌های لطیف از بهترین زردآلوهای رسیده تهیه می‌شوند و در فرآیند خشک‌کردن طبیعی، تمام شیرینی و عطر اصیل میوه در آن‌ها به دام می‌افتد. برگه زردآلو دشت‌زاد بدون هیچ افزودنی مصنوعی، رنگ مصنوعی یا نگهدارنده‌ای تولید می‌شود و سلامت شما در هر لحظه تضمین است.

این محصول سرشار از بتاکاروتن، ویتامین A، پتاسیم و فیبر طبیعی است که برای سلامت چشم، پوست و دستگاه گوارش فواید شگفت‌انگیزی دارد. برگه زردآلو به عنوان میان‌وعده‌ای سالم و دلپذیر، همراه آجیل و چای، در تهیه انواع آش و خورشت، و حتی برای تزئین کیک و دسر فوق‌العاده است.

دشت‌زاد با ایجاد زنجیره‌ای کوتاه از باغ تا سفره، اطمینان می‌دهد که هر تکه برگه که به دست شما می‌رسد از تازه‌ترین و بهترین زردآلوهای فصل تهیه شده است. بسته‌بندی بهداشتی و محکم دشت‌زاد طراوت و کیفیت محصول را تا آخرین لحظه حفظ می‌کند. همین حالا سبد خرید خود را با طعم اصیل ایران پر کنید.`,
        price_rial: 850000,
        offPrice_rial: 720000,
        discountPercent: 15,
        countInStock: 120,
        tags: ["برگه میوه", "زردآلو خشک", "میان‌وعده سالم", "بدون افزودنی", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 241, "carb_g": 62.6, "protein_g": 3.4, "fat_g": 0.5, "fiber_g": 7.3, "sugar_g": 53.4}},
        categoryId: catMap["bargeh-miveh"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2023/12/dried-fruit-plp-barjil-20.webp", alt: "برگه زردآلو دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "bargeh-zardalu-dashtzad-100g", calculatedPrice_rial: 850000, price_rial: 850000, offPrice_rial: 720000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "bargeh-zardalu-dashtzad-250g", calculatedPrice_rial: 2120000, price_rial: 2120000, offPrice_rial: 1800000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "bargeh-zardalu-dashtzad-500g", calculatedPrice_rial: 4040000, price_rial: 4040000, offPrice_rial: 3420000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "bargeh-zardalu-dashtzad-1000g", calculatedPrice_rial: 7650000, price_rial: 7650000, offPrice_rial: 6480000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "bargeh-holu-dashtzad" },
      create: {
        title: "برگه هلو دشت‌زاد",
        slug: "bargeh-holu-dashtzad",
        latinTitle: "Dried Peach Slices",
        description: `برگه هلو دشت‌زاد تجربه‌ای متفاوت از شیرینی طبیعی است؛ ورقه‌های نازک هلوهای رسیده ایرانی که با دقت برش خورده‌اند و در آفتاب کوهستان یا خشک‌کن‌های کنترل‌شده به آرامی به برگه‌هایی معطر و نرم تبدیل می‌شوند. هر تکه از این برگه‌ها داستان یک هلوی کامل را روایت می‌کند؛ رنگ نارنجی طلایی، عطر شیرین و بافتی مطبوع که در دهان آب می‌شود.

برگه هلو دشت‌زاد منبعی غنی از ویتامین C، ویتامین A، پتاسیم و آنتی‌اکسیدان‌های طبیعی است. این محصول برای تقویت سیستم ایمنی، سلامت پوست و حفظ انرژی در طول روز ایده‌آل است. به عنوان میان‌وعده بین‌وعده‌ای برای کودکان و بزرگسالان، ترکیب با ماست و گرانولا برای صبحانه‌ای مغذی، یا عنصری جذاب در آشپزی خلاقانه از کاربردهای متنوع این محصول است.

دشت‌زاد تنها از هلوهای درجه یک و بالغ استفاده می‌کند تا شیرینی طبیعی هلو در هر برگه محفوظ بماند. بدون شکر افزوده، بدون رنگ مصنوعی و بدون سولفیت؛ فقط هلوی ناب ایرانی در بهترین شکل خود. این محصول را به خانواده و دوستان خود هدیه دهید و آن‌ها را شگفت‌زده کنید.`,
        brand: "دشت‌زاد",
        price_rial: 920000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 85,
        tags: ["برگه هلو", "میوه خشک", "میان‌وعده سالم", "بدون شکر افزوده", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 920000,
        categoryId: catMap["bargeh-miveh"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 239, "carb_g": 61.3, "protein_g": 3.6, "fat_g": 0.9, "fiber_g": 8.2, "sugar_g": 52.1}},
      },
      update: {
        title: "برگه هلو دشت‌زاد",
        latinTitle: "Dried Peach Slices",
        description: `برگه هلو دشت‌زاد تجربه‌ای متفاوت از شیرینی طبیعی است؛ ورقه‌های نازک هلوهای رسیده ایرانی که با دقت برش خورده‌اند و در آفتاب کوهستان یا خشک‌کن‌های کنترل‌شده به آرامی به برگه‌هایی معطر و نرم تبدیل می‌شوند. هر تکه از این برگه‌ها داستان یک هلوی کامل را روایت می‌کند؛ رنگ نارنجی طلایی، عطر شیرین و بافتی مطبوع که در دهان آب می‌شود.

برگه هلو دشت‌زاد منبعی غنی از ویتامین C، ویتامین A، پتاسیم و آنتی‌اکسیدان‌های طبیعی است. این محصول برای تقویت سیستم ایمنی، سلامت پوست و حفظ انرژی در طول روز ایده‌آل است. به عنوان میان‌وعده بین‌وعده‌ای برای کودکان و بزرگسالان، ترکیب با ماست و گرانولا برای صبحانه‌ای مغذی، یا عنصری جذاب در آشپزی خلاقانه از کاربردهای متنوع این محصول است.

دشت‌زاد تنها از هلوهای درجه یک و بالغ استفاده می‌کند تا شیرینی طبیعی هلو در هر برگه محفوظ بماند. بدون شکر افزوده، بدون رنگ مصنوعی و بدون سولفیت؛ فقط هلوی ناب ایرانی در بهترین شکل خود. این محصول را به خانواده و دوستان خود هدیه دهید و آن‌ها را شگفت‌زده کنید.`,
        price_rial: 920000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 85,
        tags: ["برگه هلو", "میوه خشک", "میان‌وعده سالم", "بدون شکر افزوده", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 239, "carb_g": 61.3, "protein_g": 3.6, "fat_g": 0.9, "fiber_g": 8.2, "sugar_g": 52.1}},
        categoryId: catMap["bargeh-miveh"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/06/14881.webp", alt: "برگه هلو دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "bargeh-holu-dashtzad-100g", calculatedPrice_rial: 920000, price_rial: 920000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "bargeh-holu-dashtzad-250g", calculatedPrice_rial: 2300000, price_rial: 2300000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "bargeh-holu-dashtzad-500g", calculatedPrice_rial: 4370000, price_rial: 4370000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "bargeh-holu-dashtzad-1000g", calculatedPrice_rial: 8280000, price_rial: 8280000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "bargeh-albaloo-dashtzad" },
      create: {
        title: "برگه آلبالو دشت‌زاد",
        slug: "bargeh-albaloo-dashtzad",
        latinTitle: "Dried Sour Cherry Slices",
        description: `برگه آلبالو دشت‌زاد یکی از نادرترین و لوکس‌ترین خشکبارهای بازار ایران است. آلبالوهای درشت و آبدار باغ‌های شمال و غرب کشور با هنر خشک‌کردن دشت‌زاد به برگه‌هایی تبدیل می‌شوند که ترکیب بی‌نظیری از ترشی ملایم و شیرینی طبیعی دارند. رنگ قرمز تیره و درخشان این برگه‌ها نشانه حضور قوی آنتوسیانین‌ها و آنتی‌اکسیدان‌های قدرتمند است.

برگه آلبالو دشت‌زاد به دلیل داشتن ملاتونین طبیعی، برای بهبود کیفیت خواب توصیه می‌شود. همچنین خواص ضدالتهابی قوی دارد و برای ورزشکاران و کسانی که دنبال بهبود عملکرد و کاهش دردهای عضلانی هستند، یک انتخاب طلایی است. غنی از ویتامین C، پتاسیم و فیبر، این محصول برای سیستم ایمنی و سلامت قلب مفید است.

کاربرد این محصول در آشپزی‌ایرانی بسیار متنوع است؛ از دمنوش آلبالو گرفته تا خورش آلبالو مجلسی، تزئین کیک و چیزکیک، تا تهیه سس‌های خوشمزه برای گوشت. همین ویژگی چندمنظوره بودن است که برگه آلبالو دشت‌زاد را در آشپزخانه هر خانه‌ای ضروری می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 1150000,
        offPrice_rial: 980000,
        discountPercent: 15,
        countInStock: 60,
        tags: ["برگه آلبالو", "آلبالو خشک", "آنتی‌اکسیدان", "بدون افزودنی", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 1150000,
        categoryId: catMap["bargeh-miveh"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 233, "carb_g": 56.3, "protein_g": 3.1, "fat_g": 0.7, "fiber_g": 5.4, "sugar_g": 46.5}},
      },
      update: {
        title: "برگه آلبالو دشت‌زاد",
        latinTitle: "Dried Sour Cherry Slices",
        description: `برگه آلبالو دشت‌زاد یکی از نادرترین و لوکس‌ترین خشکبارهای بازار ایران است. آلبالوهای درشت و آبدار باغ‌های شمال و غرب کشور با هنر خشک‌کردن دشت‌زاد به برگه‌هایی تبدیل می‌شوند که ترکیب بی‌نظیری از ترشی ملایم و شیرینی طبیعی دارند. رنگ قرمز تیره و درخشان این برگه‌ها نشانه حضور قوی آنتوسیانین‌ها و آنتی‌اکسیدان‌های قدرتمند است.

برگه آلبالو دشت‌زاد به دلیل داشتن ملاتونین طبیعی، برای بهبود کیفیت خواب توصیه می‌شود. همچنین خواص ضدالتهابی قوی دارد و برای ورزشکاران و کسانی که دنبال بهبود عملکرد و کاهش دردهای عضلانی هستند، یک انتخاب طلایی است. غنی از ویتامین C، پتاسیم و فیبر، این محصول برای سیستم ایمنی و سلامت قلب مفید است.

کاربرد این محصول در آشپزی‌ایرانی بسیار متنوع است؛ از دمنوش آلبالو گرفته تا خورش آلبالو مجلسی، تزئین کیک و چیزکیک، تا تهیه سس‌های خوشمزه برای گوشت. همین ویژگی چندمنظوره بودن است که برگه آلبالو دشت‌زاد را در آشپزخانه هر خانه‌ای ضروری می‌کند.`,
        price_rial: 1150000,
        offPrice_rial: 980000,
        discountPercent: 15,
        countInStock: 60,
        tags: ["برگه آلبالو", "آلبالو خشک", "آنتی‌اکسیدان", "بدون افزودنی", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 233, "carb_g": 56.3, "protein_g": 3.1, "fat_g": 0.7, "fiber_g": 5.4, "sugar_g": 46.5}},
        categoryId: catMap["bargeh-miveh"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "برگه آلبالو دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "bargeh-albaloo-dashtzad-100g", calculatedPrice_rial: 1150000, price_rial: 1150000, offPrice_rial: 980000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "bargeh-albaloo-dashtzad-250g", calculatedPrice_rial: 2880000, price_rial: 2880000, offPrice_rial: 2450000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "bargeh-albaloo-dashtzad-500g", calculatedPrice_rial: 5460000, price_rial: 5460000, offPrice_rial: 4660000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "alu-bokhara-dashtzad" },
      create: {
        title: "آلو بخارا دشت‌زاد",
        slug: "alu-bokhara-dashtzad",
        latinTitle: "Bukhara Plum",
        description: `آلو بخارا دشت‌زاد از معروف‌ترین و پرطرفدارترین خشکبارهای ایرانی است که قرن‌هاست جایگاه ویژه‌ای در آشپزخانه و فرهنگ خوراک ایرانیان دارد. دانه‌های گرد و براق آلو بخارا دشت‌زاد از بهترین باغات آلوی ایران انتخاب می‌شوند و پس از خشک‌کردن کنترل‌شده، طعمی ترش و شیرین دلنشین پیدا می‌کنند که در هیچ محصول دیگری قابل تکرار نیست.

آلو بخارا دشت‌زاد سرشار از سوربیتول، فیبر طبیعی، ویتامین K، پتاسیم و آهن است. این ترکیب منحصربه‌فرد، آلو بخارا را به یکی از بهترین خوراکی‌ها برای بهبود عملکرد دستگاه گوارش، پیشگیری از یبوست، تقویت استخوان‌ها و حفظ سلامت قلب تبدیل می‌کند. مصرف روزانه چند عدد آلو بخارا توسط متخصصان تغذیه توصیه می‌شود.

در آشپزی ایرانی، آلو بخارا دشت‌زاد در انواع خورشت‌های مجلسی از جمله خورش فسنجان، خورش آلو اسفناج و مرغ با آلو کاربرد دارد. برای تهیه سس آلو، دمنوش و حتی به عنوان میان‌وعده مستقیم نیز عالی است. دشت‌زاد این محصول را با دقت در بسته‌بندی‌های بهداشتی عرضه می‌کند تا تازگی و کیفیت آن تضمین شود.`,
        brand: "دشت‌زاد",
        price_rial: 680000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 200,
        tags: ["آلو بخارا", "آلو خشک", "گوارش", "خشکبار", "سنتی ایرانی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 680000,
        categoryId: catMap["alu-khoshk"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 240, "carb_g": 63.9, "protein_g": 2.2, "fat_g": 0.4, "fiber_g": 7.1, "sugar_g": 38.1}},
      },
      update: {
        title: "آلو بخارا دشت‌زاد",
        latinTitle: "Bukhara Plum",
        description: `آلو بخارا دشت‌زاد از معروف‌ترین و پرطرفدارترین خشکبارهای ایرانی است که قرن‌هاست جایگاه ویژه‌ای در آشپزخانه و فرهنگ خوراک ایرانیان دارد. دانه‌های گرد و براق آلو بخارا دشت‌زاد از بهترین باغات آلوی ایران انتخاب می‌شوند و پس از خشک‌کردن کنترل‌شده، طعمی ترش و شیرین دلنشین پیدا می‌کنند که در هیچ محصول دیگری قابل تکرار نیست.

آلو بخارا دشت‌زاد سرشار از سوربیتول، فیبر طبیعی، ویتامین K، پتاسیم و آهن است. این ترکیب منحصربه‌فرد، آلو بخارا را به یکی از بهترین خوراکی‌ها برای بهبود عملکرد دستگاه گوارش، پیشگیری از یبوست، تقویت استخوان‌ها و حفظ سلامت قلب تبدیل می‌کند. مصرف روزانه چند عدد آلو بخارا توسط متخصصان تغذیه توصیه می‌شود.

در آشپزی ایرانی، آلو بخارا دشت‌زاد در انواع خورشت‌های مجلسی از جمله خورش فسنجان، خورش آلو اسفناج و مرغ با آلو کاربرد دارد. برای تهیه سس آلو، دمنوش و حتی به عنوان میان‌وعده مستقیم نیز عالی است. دشت‌زاد این محصول را با دقت در بسته‌بندی‌های بهداشتی عرضه می‌کند تا تازگی و کیفیت آن تضمین شود.`,
        price_rial: 680000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 200,
        tags: ["آلو بخارا", "آلو خشک", "گوارش", "خشکبار", "سنتی ایرانی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 240, "carb_g": 63.9, "protein_g": 2.2, "fat_g": 0.4, "fiber_g": 7.1, "sugar_g": 38.1}},
        categoryId: catMap["alu-khoshk"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "آلو بخارا دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "alu-bokhara-dashtzad-250g", calculatedPrice_rial: 1700000, price_rial: 1700000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "alu-bokhara-dashtzad-500g", calculatedPrice_rial: 3230000, price_rial: 3230000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "alu-bokhara-dashtzad-1000g", calculatedPrice_rial: 6120000, price_rial: 6120000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "alu-khoshk-bidone-hasteh-irani-dashtzad" },
      create: {
        title: "آلو خشک بدون هسته ایرانی دشت‌زاد",
        slug: "alu-khoshk-bidone-hasteh-irani-dashtzad",
        latinTitle: "Pitted Dried Plum Iranian",
        description: `آلو خشک بدون هسته ایرانی دشت‌زاد؛ همان طعم اصیل آلو ایرانی بدون دردسر هسته. این محصول از آلوهای مرغوب ایرانی تهیه شده که پس از هسته‌گیری دقیق، در شرایط بهداشتی خشک می‌شوند و بافتی نرم و گوشتی به خود می‌گیرند. طعم ترش‌وشیرین منحصربه‌فرد آن‌ها همراه با راحتی استفاده مستقیم، این محصول را به انتخاب اول خانواده‌های ایرانی تبدیل کرده است.

آلو خشک بدون هسته دشت‌زاد منبعی قوی از فیبر غذایی، ویتامین B6، منیزیم و آنتی‌اکسیدان‌های ارزشمند است. مصرف منظم این محصول به بهبود حافظه، تنظیم قند خون و سلامت استخوان‌ها کمک می‌کند. برای افرادی که به دنبال یک میان‌وعده سیرکننده و سالم هستند، آلو خشک دشت‌زاد گزینه‌ای بی‌رقیب است.

در آشپزی، این محصول برای تهیه خورشت‌های لذیذ، پر کردن گوشت و مرغ، تهیه کمپوت و مربا، و حتی در کنار پنیر و گردو برای مجالس رسمی کاربرد دارد. دشت‌زاد با انتخاب دقیق و غربال‌گری محصولات، اطمینان می‌دهد که هر بسته حاوی آلوهای یکنواخت و باکیفیت است. سلامت شما با هر لقمه تضمین است.`,
        brand: "دشت‌زاد",
        price_rial: 750000,
        offPrice_rial: 637000,
        discountPercent: 15,
        countInStock: 150,
        tags: ["آلو خشک", "بدون هسته", "فیبر بالا", "میان‌وعده سالم", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 750000,
        categoryId: catMap["alu-khoshk"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 240, "carb_g": 63.9, "protein_g": 2.2, "fat_g": 0.4, "fiber_g": 7.1, "sugar_g": 38.1}},
      },
      update: {
        title: "آلو خشک بدون هسته ایرانی دشت‌زاد",
        latinTitle: "Pitted Dried Plum Iranian",
        description: `آلو خشک بدون هسته ایرانی دشت‌زاد؛ همان طعم اصیل آلو ایرانی بدون دردسر هسته. این محصول از آلوهای مرغوب ایرانی تهیه شده که پس از هسته‌گیری دقیق، در شرایط بهداشتی خشک می‌شوند و بافتی نرم و گوشتی به خود می‌گیرند. طعم ترش‌وشیرین منحصربه‌فرد آن‌ها همراه با راحتی استفاده مستقیم، این محصول را به انتخاب اول خانواده‌های ایرانی تبدیل کرده است.

آلو خشک بدون هسته دشت‌زاد منبعی قوی از فیبر غذایی، ویتامین B6، منیزیم و آنتی‌اکسیدان‌های ارزشمند است. مصرف منظم این محصول به بهبود حافظه، تنظیم قند خون و سلامت استخوان‌ها کمک می‌کند. برای افرادی که به دنبال یک میان‌وعده سیرکننده و سالم هستند، آلو خشک دشت‌زاد گزینه‌ای بی‌رقیب است.

در آشپزی، این محصول برای تهیه خورشت‌های لذیذ، پر کردن گوشت و مرغ، تهیه کمپوت و مربا، و حتی در کنار پنیر و گردو برای مجالس رسمی کاربرد دارد. دشت‌زاد با انتخاب دقیق و غربال‌گری محصولات، اطمینان می‌دهد که هر بسته حاوی آلوهای یکنواخت و باکیفیت است. سلامت شما با هر لقمه تضمین است.`,
        price_rial: 750000,
        offPrice_rial: 637000,
        discountPercent: 15,
        countInStock: 150,
        tags: ["آلو خشک", "بدون هسته", "فیبر بالا", "میان‌وعده سالم", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 240, "carb_g": 63.9, "protein_g": 2.2, "fat_g": 0.4, "fiber_g": 7.1, "sugar_g": 38.1}},
        categoryId: catMap["alu-khoshk"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "آلو خشک بدون هسته ایرانی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "alu-khoshk-bidone-hasteh-irani-dashtzad-250g", calculatedPrice_rial: 1880000, price_rial: 1880000, offPrice_rial: 1590000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "alu-khoshk-bidone-hasteh-irani-dashtzad-500g", calculatedPrice_rial: 3560000, price_rial: 3560000, offPrice_rial: 3030000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "alu-khoshk-bidone-hasteh-irani-dashtzad-1000g", calculatedPrice_rial: 6750000, price_rial: 6750000, offPrice_rial: 5730000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "tut-sefid-khoshk-kuhi-dashtzad" },
      create: {
        title: "توت سفید خشک کوهی دشت‌زاد",
        slug: "tut-sefid-khoshk-kuhi-dashtzad",
        latinTitle: "Mountain White Mulberry",
        description: `توت سفید خشک کوهی دشت‌زاد؛ گوهری نایاب از دامنه‌های سرسبز کوهستان‌های ایران. این توت‌های کوچک و شیرین که در ارتفاعات بالا در هوای پاک رشد می‌کنند، پس از برداشت با روش سنتی در سایه خشک می‌شوند تا تمام خواص استثنایی‌شان حفظ شود. شیرینی ملایم و طبیعی توت سفید کوهی دشت‌زاد بدون هیچ شکر یا شیرین‌کننده‌ای کاملاً از خود میوه سرچشمه می‌گیرد.

توت سفید کوهی یکی از سالم‌ترین خشکبارهای دنیاست. حاوی رزوراترول، کوئرستین، آنتوسیانین، ویتامین C، آهن و کلسیم در مقادیر قابل توجه است. این ترکیب منحصربه‌فرد به کنترل قند خون، تقویت سیستم ایمنی، بهبود گردش خون و محافظت از قلب کمک می‌کند. برای افراد دیابتی نیز به عنوان جایگزینی سالم برای شیرینی‌جات مناسب است.

توت سفید خشک کوهی دشت‌زاد به تنهایی به عنوان میان‌وعده، مخلوط با آجیل، روی ماست و بستنی، در پخت نان و شیرینی‌های سنتی و حتی در چای کمالی فوق‌العاده است. این محصول نادر که شباهتی به توت‌های معمولی بازار ندارد را تجربه کنید و تفاوت را در اولین لقمه حس کنید.`,
        brand: "دشت‌زاد",
        price_rial: 980000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 90,
        tags: ["توت سفید", "توت کوهی", "کنترل قند خون", "آنتی‌اکسیدان", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 980000,
        categoryId: catMap["tut-khoshk"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 344, "carb_g": 70, "protein_g": 9.8, "fat_g": 3.5, "fiber_g": 12.5, "sugar_g": 59}},
      },
      update: {
        title: "توت سفید خشک کوهی دشت‌زاد",
        latinTitle: "Mountain White Mulberry",
        description: `توت سفید خشک کوهی دشت‌زاد؛ گوهری نایاب از دامنه‌های سرسبز کوهستان‌های ایران. این توت‌های کوچک و شیرین که در ارتفاعات بالا در هوای پاک رشد می‌کنند، پس از برداشت با روش سنتی در سایه خشک می‌شوند تا تمام خواص استثنایی‌شان حفظ شود. شیرینی ملایم و طبیعی توت سفید کوهی دشت‌زاد بدون هیچ شکر یا شیرین‌کننده‌ای کاملاً از خود میوه سرچشمه می‌گیرد.

توت سفید کوهی یکی از سالم‌ترین خشکبارهای دنیاست. حاوی رزوراترول، کوئرستین، آنتوسیانین، ویتامین C، آهن و کلسیم در مقادیر قابل توجه است. این ترکیب منحصربه‌فرد به کنترل قند خون، تقویت سیستم ایمنی، بهبود گردش خون و محافظت از قلب کمک می‌کند. برای افراد دیابتی نیز به عنوان جایگزینی سالم برای شیرینی‌جات مناسب است.

توت سفید خشک کوهی دشت‌زاد به تنهایی به عنوان میان‌وعده، مخلوط با آجیل، روی ماست و بستنی، در پخت نان و شیرینی‌های سنتی و حتی در چای کمالی فوق‌العاده است. این محصول نادر که شباهتی به توت‌های معمولی بازار ندارد را تجربه کنید و تفاوت را در اولین لقمه حس کنید.`,
        price_rial: 980000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 90,
        tags: ["توت سفید", "توت کوهی", "کنترل قند خون", "آنتی‌اکسیدان", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 344, "carb_g": 70, "protein_g": 9.8, "fat_g": 3.5, "fiber_g": 12.5, "sugar_g": 59}},
        categoryId: catMap["tut-khoshk"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "توت سفید خشک کوهی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "tut-sefid-khoshk-kuhi-dashtzad-100g", calculatedPrice_rial: 980000, price_rial: 980000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "tut-sefid-khoshk-kuhi-dashtzad-250g", calculatedPrice_rial: 2450000, price_rial: 2450000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "tut-sefid-khoshk-kuhi-dashtzad-500g", calculatedPrice_rial: 4660000, price_rial: 4660000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "tut-sefid-khoshk-kuhi-dashtzad-1000g", calculatedPrice_rial: 8820000, price_rial: 8820000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "tut-siah-khoshk-dashtzad" },
      create: {
        title: "توت سیاه خشک دشت‌زاد",
        slug: "tut-siah-khoshk-dashtzad",
        latinTitle: "Dried Black Mulberry",
        description: `توت سیاه خشک دشت‌زاد از برترین توت‌های سیاه ایرانی تهیه می‌شود که در شرایط آب‌وهوایی ایده‌آل پرورش یافته و در اوج رسیدگی برداشت می‌شوند. این توت‌های سیاه و براق با طعمی شیرین‌تر از انواع دیگر توت، پس از خشک‌شدن حجمی انبوه از رنگ‌دانه‌های طبیعی در خود جمع می‌کنند که همان رنگ بنفش تیره نشانه آن است.

توت سیاه خشک دشت‌زاد از نظر محتوای آنتوسیانین یکی از قوی‌ترین خشکبارهای موجود در بازار است. این آنتی‌اکسیدان‌های قدرتمند از سلول‌های بدن در برابر رادیکال‌های آزاد محافظت می‌کنند، به بهبود حافظه کمک می‌کنند و خطر بیماری‌های قلبی را کاهش می‌دهند. همچنین سرشار از ویتامین C، E، آهن، منیزیم و اسیدهای آمینه ضروری است.

این محصول برای تهیه مربای توت لوکس، دمنوش‌های گیاهی، اسموتی‌های میوه‌ای، دسرهای خانگی و تزئین انواع کیک و شیرینی کاربرد دارد. به عنوان میان‌وعده مستقیم نیز بسیار دلپذیر است. دشت‌زاد با انتخاب دقیق و فرآوری بهداشتی این محصول کمیاب، آن را برای اولین بار به صورت بسته‌بندی شده و استاندارد به بازار عرضه کرده است.`,
        brand: "دشت‌زاد",
        price_rial: 1050000,
        offPrice_rial: 892000,
        discountPercent: 15,
        countInStock: 75,
        tags: ["توت سیاه", "آنتوسیانین", "آنتی‌اکسیدان قوی", "سیستم ایمنی", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 1050000,
        categoryId: catMap["tut-khoshk"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 317, "carb_g": 65.8, "protein_g": 10.2, "fat_g": 3.8, "fiber_g": 13, "sugar_g": 55}},
      },
      update: {
        title: "توت سیاه خشک دشت‌زاد",
        latinTitle: "Dried Black Mulberry",
        description: `توت سیاه خشک دشت‌زاد از برترین توت‌های سیاه ایرانی تهیه می‌شود که در شرایط آب‌وهوایی ایده‌آل پرورش یافته و در اوج رسیدگی برداشت می‌شوند. این توت‌های سیاه و براق با طعمی شیرین‌تر از انواع دیگر توت، پس از خشک‌شدن حجمی انبوه از رنگ‌دانه‌های طبیعی در خود جمع می‌کنند که همان رنگ بنفش تیره نشانه آن است.

توت سیاه خشک دشت‌زاد از نظر محتوای آنتوسیانین یکی از قوی‌ترین خشکبارهای موجود در بازار است. این آنتی‌اکسیدان‌های قدرتمند از سلول‌های بدن در برابر رادیکال‌های آزاد محافظت می‌کنند، به بهبود حافظه کمک می‌کنند و خطر بیماری‌های قلبی را کاهش می‌دهند. همچنین سرشار از ویتامین C، E، آهن، منیزیم و اسیدهای آمینه ضروری است.

این محصول برای تهیه مربای توت لوکس، دمنوش‌های گیاهی، اسموتی‌های میوه‌ای، دسرهای خانگی و تزئین انواع کیک و شیرینی کاربرد دارد. به عنوان میان‌وعده مستقیم نیز بسیار دلپذیر است. دشت‌زاد با انتخاب دقیق و فرآوری بهداشتی این محصول کمیاب، آن را برای اولین بار به صورت بسته‌بندی شده و استاندارد به بازار عرضه کرده است.`,
        price_rial: 1050000,
        offPrice_rial: 892000,
        discountPercent: 15,
        countInStock: 75,
        tags: ["توت سیاه", "آنتوسیانین", "آنتی‌اکسیدان قوی", "سیستم ایمنی", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 317, "carb_g": 65.8, "protein_g": 10.2, "fat_g": 3.8, "fiber_g": 13, "sugar_g": 55}},
        categoryId: catMap["tut-khoshk"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "توت سیاه خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "tut-siah-khoshk-dashtzad-100g", calculatedPrice_rial: 1050000, price_rial: 1050000, offPrice_rial: 890000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "tut-siah-khoshk-dashtzad-250g", calculatedPrice_rial: 2620000, price_rial: 2620000, offPrice_rial: 2230000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "tut-siah-khoshk-dashtzad-500g", calculatedPrice_rial: 4990000, price_rial: 4990000, offPrice_rial: 4240000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "tut-siah-khoshk-dashtzad-1000g", calculatedPrice_rial: 9450000, price_rial: 9450000, offPrice_rial: 8030000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "anjir-khoshk-estahban-dashtzad" },
      create: {
        title: "انجیر خشک استهبان دشت‌زاد",
        slug: "anjir-khoshk-estahban-dashtzad",
        latinTitle: "Estahban Dried Fig",
        description: `انجیر خشک استهبان دشت‌زاد، ملکه انجیرهای ایران؛ محصولی که شهرت استهبان فارس را به سراسر جهان برده است. این انجیرهای درشت و شیرین در باغ‌های سنگلاخی استهبان که شرایط آب‌وهوایی کاملاً منحصربه‌فردی دارند پرورش می‌یابند و پس از خشک‌شدن طبیعی در آفتاب، به قطعاتی طلایی و معطر تبدیل می‌شوند که بوی بهشت می‌دهند.

انجیر خشک استهبان دشت‌زاد سرشار از فیبر محلول و نامحلول است که بهترین دوست دستگاه گوارش به شمار می‌رود. همچنین حاوی کلسیم بالا، آهن، پتاسیم، منیزیم و ویتامین‌های گروه B است. مطالعات نشان داده مصرف منظم انجیر خشک به کاهش فشار خون، تقویت استخوان‌ها، بهبود خواب و کنترل وزن کمک می‌کند.

انجیر خشک استهبان دشت‌زاد در آشپزی ایرانی جایگاهی بی‌بدیل دارد؛ از دمنوش انجیر برای سرفه گرفته تا خورش انجیر با گوشت بره، از مربای انجیر گرفته تا تزئین پلوی مجلسی. به عنوان هدیه در جعبه‌های تزئینی نیز بسیار محبوب است. دشت‌زاد با ایجاد ارتباط مستقیم با باغداران استهبان، بهترین انجیرهای فصل را برای شما تامین می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 780000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 180,
        tags: ["انجیر استهبان", "انجیر خشک", "فیبر بالا", "سنتی ایرانی", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 780000,
        categoryId: catMap["anjir-khoshk"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 249, "carb_g": 63.9, "protein_g": 3.3, "fat_g": 0.9, "fiber_g": 9.8, "sugar_g": 47.9}},
      },
      update: {
        title: "انجیر خشک استهبان دشت‌زاد",
        latinTitle: "Estahban Dried Fig",
        description: `انجیر خشک استهبان دشت‌زاد، ملکه انجیرهای ایران؛ محصولی که شهرت استهبان فارس را به سراسر جهان برده است. این انجیرهای درشت و شیرین در باغ‌های سنگلاخی استهبان که شرایط آب‌وهوایی کاملاً منحصربه‌فردی دارند پرورش می‌یابند و پس از خشک‌شدن طبیعی در آفتاب، به قطعاتی طلایی و معطر تبدیل می‌شوند که بوی بهشت می‌دهند.

انجیر خشک استهبان دشت‌زاد سرشار از فیبر محلول و نامحلول است که بهترین دوست دستگاه گوارش به شمار می‌رود. همچنین حاوی کلسیم بالا، آهن، پتاسیم، منیزیم و ویتامین‌های گروه B است. مطالعات نشان داده مصرف منظم انجیر خشک به کاهش فشار خون، تقویت استخوان‌ها، بهبود خواب و کنترل وزن کمک می‌کند.

انجیر خشک استهبان دشت‌زاد در آشپزی ایرانی جایگاهی بی‌بدیل دارد؛ از دمنوش انجیر برای سرفه گرفته تا خورش انجیر با گوشت بره، از مربای انجیر گرفته تا تزئین پلوی مجلسی. به عنوان هدیه در جعبه‌های تزئینی نیز بسیار محبوب است. دشت‌زاد با ایجاد ارتباط مستقیم با باغداران استهبان، بهترین انجیرهای فصل را برای شما تامین می‌کند.`,
        price_rial: 780000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 180,
        tags: ["انجیر استهبان", "انجیر خشک", "فیبر بالا", "سنتی ایرانی", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 249, "carb_g": 63.9, "protein_g": 3.3, "fat_g": 0.9, "fiber_g": 9.8, "sugar_g": 47.9}},
        categoryId: catMap["anjir-khoshk"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "انجیر خشک استهبان دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "anjir-khoshk-estahban-dashtzad-250g", calculatedPrice_rial: 1950000, price_rial: 1950000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "anjir-khoshk-estahban-dashtzad-500g", calculatedPrice_rial: 3700000, price_rial: 3700000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "anjir-khoshk-estahban-dashtzad-1000g", calculatedPrice_rial: 7020000, price_rial: 7020000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "anjir-khoshk-siah-dashtzad" },
      create: {
        title: "انجیر خشک سیاه دشت‌زاد",
        slug: "anjir-khoshk-siah-dashtzad",
        latinTitle: "Black Dried Fig",
        description: `انجیر خشک سیاه دشت‌زاد؛ تجربه‌ای متفاوت از دنیای انجیر. این انجیرهای بنفش-سیاه از ارقام تیره‌پوست انجیر تهیه می‌شوند که طعمی عمیق‌تر، شیرینی غنی‌تر و ارزش تغذیه‌ای بالاتری نسبت به انجیرهای معمولی دارند. پوست تیره این انجیرها نشانه تراکم بالای آنتوسیانین و پلی‌فنول‌های ارزشمند است که آن را به یک ابرغذا تبدیل می‌کند.

انجیر سیاه خشک دشت‌زاد یکی از بالاترین محتوای آهن را در میان خشکبارها دارد و برای افراد مبتلا به کم‌خونی فوق‌العاده مناسب است. همچنین منبع خوبی از کلسیم، فسفر، فیبر، ویتامین B6 و آنتی‌اکسیدان‌های قوی است. مصرف این محصول به تقویت سیستم ایمنی، بهبود سلامت پوست و مو و کاهش التهاب کمک می‌کند.

انجیر سیاه خشک دشت‌زاد در مجالس و هدایا به دلیل ظاهر زیبا و طعم استثنایی‌اش بسیار محبوب است. در تهیه دمنوش، مربا، شیرینی‌های سنتی مانند کلوچه انجیر، و حتی در پخت نان‌های سنتی کاربرد دارد. دشت‌زاد این محصول کمیاب را با بالاترین استانداردهای بهداشتی آماده و بسته‌بندی می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 920000,
        offPrice_rial: 782000,
        discountPercent: 15,
        countInStock: 95,
        tags: ["انجیر سیاه", "انجیر خشک", "آهن بالا", "آنتی‌اکسیدان", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 920000,
        categoryId: catMap["anjir-khoshk"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 256, "carb_g": 65.4, "protein_g": 3.7, "fat_g": 1.1, "fiber_g": 10.5, "sugar_g": 49.7}},
      },
      update: {
        title: "انجیر خشک سیاه دشت‌زاد",
        latinTitle: "Black Dried Fig",
        description: `انجیر خشک سیاه دشت‌زاد؛ تجربه‌ای متفاوت از دنیای انجیر. این انجیرهای بنفش-سیاه از ارقام تیره‌پوست انجیر تهیه می‌شوند که طعمی عمیق‌تر، شیرینی غنی‌تر و ارزش تغذیه‌ای بالاتری نسبت به انجیرهای معمولی دارند. پوست تیره این انجیرها نشانه تراکم بالای آنتوسیانین و پلی‌فنول‌های ارزشمند است که آن را به یک ابرغذا تبدیل می‌کند.

انجیر سیاه خشک دشت‌زاد یکی از بالاترین محتوای آهن را در میان خشکبارها دارد و برای افراد مبتلا به کم‌خونی فوق‌العاده مناسب است. همچنین منبع خوبی از کلسیم، فسفر، فیبر، ویتامین B6 و آنتی‌اکسیدان‌های قوی است. مصرف این محصول به تقویت سیستم ایمنی، بهبود سلامت پوست و مو و کاهش التهاب کمک می‌کند.

انجیر سیاه خشک دشت‌زاد در مجالس و هدایا به دلیل ظاهر زیبا و طعم استثنایی‌اش بسیار محبوب است. در تهیه دمنوش، مربا، شیرینی‌های سنتی مانند کلوچه انجیر، و حتی در پخت نان‌های سنتی کاربرد دارد. دشت‌زاد این محصول کمیاب را با بالاترین استانداردهای بهداشتی آماده و بسته‌بندی می‌کند.`,
        price_rial: 920000,
        offPrice_rial: 782000,
        discountPercent: 15,
        countInStock: 95,
        tags: ["انجیر سیاه", "انجیر خشک", "آهن بالا", "آنتی‌اکسیدان", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 256, "carb_g": 65.4, "protein_g": 3.7, "fat_g": 1.1, "fiber_g": 10.5, "sugar_g": 49.7}},
        categoryId: catMap["anjir-khoshk"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "انجیر خشک سیاه دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "anjir-khoshk-siah-dashtzad-250g", calculatedPrice_rial: 2300000, price_rial: 2300000, offPrice_rial: 1960000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "anjir-khoshk-siah-dashtzad-500g", calculatedPrice_rial: 4370000, price_rial: 4370000, offPrice_rial: 3710000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "anjir-khoshk-siah-dashtzad-1000g", calculatedPrice_rial: 8280000, price_rial: 8280000, offPrice_rial: 7040000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "keshmesh-sabz-pelavi-dashtzad" },
      create: {
        title: "کشمش سبز پلویی دشت‌زاد",
        slug: "keshmesh-sabz-pelavi-dashtzad",
        latinTitle: "Green Raisin Plov",
        description: `کشمش سبز پلویی دشت‌زاد، ستاره بلامنازع هر سفره ایرانی. این کشمش‌های سبز و درشت که در سایه‌خانه‌های سنتی ملایر و قزوین خشک می‌شوند، طعمی ترش‌شیرین و منحصربه‌فرد دارند که پلو ایرانی را به آستانه کمال می‌رسانند. هر دانه کشمش پلویی دشت‌زاد گوشتی، درخشان و یکدست است؛ بدون هیچ دانه لَه یا خشکیده‌ای.

کشمش سبز پلویی دشت‌زاد نه‌تنها برای آشپزی، بلکه به عنوان میان‌وعده سریع و دلچسب نیز عالی است. سرشار از آهن، پتاسیم، منیزیم، آنتی‌اکسیدان‌های طبیعی و قندهای دیری‌گداز است که انرژی پایداری به بدن می‌دهند. برای کودکان در حال رشد، ورزشکاران و همه کسانی که به دنبال میان‌وعده‌ای طبیعی هستند ایده‌آل است.

از شیرین‌پلو مجلسی گرفته تا برنج کشمش کشمیری، از آش رشته خانگی گرفته تا کوکوی سبزی‌های خوشمزه، کشمش سبز پلویی دشت‌زاد حضوری پررنگ و ضروری دارد. دشت‌زاد با تامین مستقیم از باغداران معتمد و بسته‌بندی بهداشتی، تازگی و کیفیت این محصول را در هر بار استفاده تضمین می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 580000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 250,
        tags: ["کشمش پلویی", "کشمش سبز", "آشپزی ایرانی", "طبیعی", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 580000,
        categoryId: catMap["keshmesh"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 299, "carb_g": 79.2, "protein_g": 3.1, "fat_g": 0.5, "fiber_g": 4, "sugar_g": 59.2}},
      },
      update: {
        title: "کشمش سبز پلویی دشت‌زاد",
        latinTitle: "Green Raisin Plov",
        description: `کشمش سبز پلویی دشت‌زاد، ستاره بلامنازع هر سفره ایرانی. این کشمش‌های سبز و درشت که در سایه‌خانه‌های سنتی ملایر و قزوین خشک می‌شوند، طعمی ترش‌شیرین و منحصربه‌فرد دارند که پلو ایرانی را به آستانه کمال می‌رسانند. هر دانه کشمش پلویی دشت‌زاد گوشتی، درخشان و یکدست است؛ بدون هیچ دانه لَه یا خشکیده‌ای.

کشمش سبز پلویی دشت‌زاد نه‌تنها برای آشپزی، بلکه به عنوان میان‌وعده سریع و دلچسب نیز عالی است. سرشار از آهن، پتاسیم، منیزیم، آنتی‌اکسیدان‌های طبیعی و قندهای دیری‌گداز است که انرژی پایداری به بدن می‌دهند. برای کودکان در حال رشد، ورزشکاران و همه کسانی که به دنبال میان‌وعده‌ای طبیعی هستند ایده‌آل است.

از شیرین‌پلو مجلسی گرفته تا برنج کشمش کشمیری، از آش رشته خانگی گرفته تا کوکوی سبزی‌های خوشمزه، کشمش سبز پلویی دشت‌زاد حضوری پررنگ و ضروری دارد. دشت‌زاد با تامین مستقیم از باغداران معتمد و بسته‌بندی بهداشتی، تازگی و کیفیت این محصول را در هر بار استفاده تضمین می‌کند.`,
        price_rial: 580000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 250,
        tags: ["کشمش پلویی", "کشمش سبز", "آشپزی ایرانی", "طبیعی", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 299, "carb_g": 79.2, "protein_g": 3.1, "fat_g": 0.5, "fiber_g": 4, "sugar_g": 59.2}},
        categoryId: catMap["keshmesh"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "کشمش سبز پلویی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "keshmesh-sabz-pelavi-dashtzad-100g", calculatedPrice_rial: 580000, price_rial: 580000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "keshmesh-sabz-pelavi-dashtzad-250g", calculatedPrice_rial: 1450000, price_rial: 1450000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "keshmesh-sabz-pelavi-dashtzad-500g", calculatedPrice_rial: 2760000, price_rial: 2760000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "keshmesh-sabz-pelavi-dashtzad-1000g", calculatedPrice_rial: 5220000, price_rial: 5220000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "keshmesh-aftabi-dashtzad" },
      create: {
        title: "کشمش آفتابی دشت‌زاد",
        slug: "keshmesh-aftabi-dashtzad",
        latinTitle: "Sun-Dried Golden Raisin",
        description: `کشمش آفتابی دشت‌زاد؛ محصول آفتاب ایران، محصول مزارع طلایی. این کشمش‌های طلایی‌رنگ که در آفتاب مستقیم و در هوای گرم و خشک خشک می‌شوند، دارای طعمی غنی‌تر، رنگی درخشان‌تر و شیرینی عمیق‌تر از سایر انواع کشمش هستند. رنگ قرمز-قهوه‌ای مطلوب این کشمش‌ها نشان‌دهنده خشک‌شدن کامل طبیعی در برابر تابش مستقیم خورشید است.

کشمش آفتابی دشت‌زاد منبع ارزشمندی از کربوهیدرات‌های طبیعی، آهن، پتاسیم، بور و آنتی‌اکسیدان‌های پلی‌فنولی است. محتوای بالای رسوراترول در کشمش از سلامت قلب حمایت می‌کند و خواص ضدسرطانی آن در مطالعات علمی به اثبات رسیده است. مصرف منظم کشمش آفتابی به تقویت استخوان‌ها و بهبود جذب کلسیم کمک می‌کند.

کشمش آفتابی دشت‌زاد در تهیه کیک، کلوچه، نان‌های خانگی، پودینگ‌های شیری، مخلوط آجیل و میوه خشک برای صبحانه و همچنین در تهیه انواع نوشیدنی‌های گیاهی کاربرد گسترده دارد. دشت‌زاد این محصول پرطرفدار را در بسته‌بندی‌های متنوع عرضه می‌کند تا پاسخگوی نیاز همه خانواده‌ها باشد.`,
        brand: "دشت‌زاد",
        price_rial: 540000,
        offPrice_rial: 459000,
        discountPercent: 15,
        countInStock: 220,
        tags: ["کشمش آفتابی", "کشمش طلایی", "آجیل و خشکبار", "انرژی‌زا", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 540000,
        categoryId: catMap["keshmesh"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 302, "carb_g": 79.5, "protein_g": 3.3, "fat_g": 0.6, "fiber_g": 4.2, "sugar_g": 59.9}},
      },
      update: {
        title: "کشمش آفتابی دشت‌زاد",
        latinTitle: "Sun-Dried Golden Raisin",
        description: `کشمش آفتابی دشت‌زاد؛ محصول آفتاب ایران، محصول مزارع طلایی. این کشمش‌های طلایی‌رنگ که در آفتاب مستقیم و در هوای گرم و خشک خشک می‌شوند، دارای طعمی غنی‌تر، رنگی درخشان‌تر و شیرینی عمیق‌تر از سایر انواع کشمش هستند. رنگ قرمز-قهوه‌ای مطلوب این کشمش‌ها نشان‌دهنده خشک‌شدن کامل طبیعی در برابر تابش مستقیم خورشید است.

کشمش آفتابی دشت‌زاد منبع ارزشمندی از کربوهیدرات‌های طبیعی، آهن، پتاسیم، بور و آنتی‌اکسیدان‌های پلی‌فنولی است. محتوای بالای رسوراترول در کشمش از سلامت قلب حمایت می‌کند و خواص ضدسرطانی آن در مطالعات علمی به اثبات رسیده است. مصرف منظم کشمش آفتابی به تقویت استخوان‌ها و بهبود جذب کلسیم کمک می‌کند.

کشمش آفتابی دشت‌زاد در تهیه کیک، کلوچه، نان‌های خانگی، پودینگ‌های شیری، مخلوط آجیل و میوه خشک برای صبحانه و همچنین در تهیه انواع نوشیدنی‌های گیاهی کاربرد گسترده دارد. دشت‌زاد این محصول پرطرفدار را در بسته‌بندی‌های متنوع عرضه می‌کند تا پاسخگوی نیاز همه خانواده‌ها باشد.`,
        price_rial: 540000,
        offPrice_rial: 459000,
        discountPercent: 15,
        countInStock: 220,
        tags: ["کشمش آفتابی", "کشمش طلایی", "آجیل و خشکبار", "انرژی‌زا", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 302, "carb_g": 79.5, "protein_g": 3.3, "fat_g": 0.6, "fiber_g": 4.2, "sugar_g": 59.9}},
        categoryId: catMap["keshmesh"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "کشمش آفتابی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "keshmesh-aftabi-dashtzad-100g", calculatedPrice_rial: 540000, price_rial: 540000, offPrice_rial: 460000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "keshmesh-aftabi-dashtzad-250g", calculatedPrice_rial: 1350000, price_rial: 1350000, offPrice_rial: 1150000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "keshmesh-aftabi-dashtzad-500g", calculatedPrice_rial: 2560000, price_rial: 2560000, offPrice_rial: 2180000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "keshmesh-aftabi-dashtzad-1000g", calculatedPrice_rial: 4860000, price_rial: 4860000, offPrice_rial: 4130000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "keshmesh-tafti-dashtzad" },
      create: {
        title: "کشمش تفتی دشت‌زاد",
        slug: "keshmesh-tafti-dashtzad",
        latinTitle: "Tafti Raisin",
        description: `کشمش تفتی دشت‌زاد؛ میراث ماندگار انگورستان‌های یزد. کشمش تفت که از انگورهای بومی تفت در استان یزد به دست می‌آید، یکی از اصیل‌ترین و خوشمزه‌ترین انواع کشمش ایرانی است. اقلیم گرم و خشک و نور فراوان آفتاب یزد، شرایطی ایجاد می‌کند که شیرینی انگورهای تفتی را به حداکثر می‌رساند و پس از خشک‌شدن، کشمشی با رنگ قهوه‌ای تیره و طعمی کاراملی به دست می‌آید.

کشمش تفتی دشت‌زاد به دلیل اندازه متوسط، پوست نازک و گوشت فراوان، یکی از بهترین کشمش‌ها برای مصرف مستقیم و آشپزی است. حاوی مقادیر بالای آهن، پتاسیم، ویتامین B6 و آنتی‌اکسیدان‌های طبیعی است که به بهبود سطح انرژی، عملکرد مغز و سلامت عمومی بدن کمک می‌کنند.

کشمش تفتی دشت‌زاد در آشپزی برای تهیه خورشت‌ها، غذاهای ملل، دسرها و شیرینی‌های سنتی استفاده می‌شود. در مخلوط میوه خشک با گردو و پسته نیز جای ثابتی دارد. برای تهیه نوشیدنی آبجو ازگیل و سرکه کشمش ارگانیک نیز از این کشمش استفاده می‌شود. دشت‌زاد این محصول استثنایی را مستقیم از تفت یزد تامین و بسته‌بندی می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 620000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 160,
        tags: ["کشمش تفتی", "کشمش یزد", "سنتی ایرانی", "انگور بومی", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 620000,
        categoryId: catMap["keshmesh"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 296, "carb_g": 78.5, "protein_g": 3, "fat_g": 0.4, "fiber_g": 3.8, "sugar_g": 59}},
      },
      update: {
        title: "کشمش تفتی دشت‌زاد",
        latinTitle: "Tafti Raisin",
        description: `کشمش تفتی دشت‌زاد؛ میراث ماندگار انگورستان‌های یزد. کشمش تفت که از انگورهای بومی تفت در استان یزد به دست می‌آید، یکی از اصیل‌ترین و خوشمزه‌ترین انواع کشمش ایرانی است. اقلیم گرم و خشک و نور فراوان آفتاب یزد، شرایطی ایجاد می‌کند که شیرینی انگورهای تفتی را به حداکثر می‌رساند و پس از خشک‌شدن، کشمشی با رنگ قهوه‌ای تیره و طعمی کاراملی به دست می‌آید.

کشمش تفتی دشت‌زاد به دلیل اندازه متوسط، پوست نازک و گوشت فراوان، یکی از بهترین کشمش‌ها برای مصرف مستقیم و آشپزی است. حاوی مقادیر بالای آهن، پتاسیم، ویتامین B6 و آنتی‌اکسیدان‌های طبیعی است که به بهبود سطح انرژی، عملکرد مغز و سلامت عمومی بدن کمک می‌کنند.

کشمش تفتی دشت‌زاد در آشپزی برای تهیه خورشت‌ها، غذاهای ملل، دسرها و شیرینی‌های سنتی استفاده می‌شود. در مخلوط میوه خشک با گردو و پسته نیز جای ثابتی دارد. برای تهیه نوشیدنی آبجو ازگیل و سرکه کشمش ارگانیک نیز از این کشمش استفاده می‌شود. دشت‌زاد این محصول استثنایی را مستقیم از تفت یزد تامین و بسته‌بندی می‌کند.`,
        price_rial: 620000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 160,
        tags: ["کشمش تفتی", "کشمش یزد", "سنتی ایرانی", "انگور بومی", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 296, "carb_g": 78.5, "protein_g": 3, "fat_g": 0.4, "fiber_g": 3.8, "sugar_g": 59}},
        categoryId: catMap["keshmesh"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "کشمش تفتی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "keshmesh-tafti-dashtzad-100g", calculatedPrice_rial: 620000, price_rial: 620000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "keshmesh-tafti-dashtzad-250g", calculatedPrice_rial: 1550000, price_rial: 1550000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "keshmesh-tafti-dashtzad-500g", calculatedPrice_rial: 2940000, price_rial: 2940000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "keshmesh-tafti-dashtzad-1000g", calculatedPrice_rial: 5580000, price_rial: 5580000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "keshmesh-anguri-dashtzad" },
      create: {
        title: "کشمش انگوری دشت‌زاد",
        slug: "keshmesh-anguri-dashtzad",
        latinTitle: "Grape Raisin",
        description: `کشمش انگوری دشت‌زاد از انگورهای گرد و درشت‌دانه مناطق انگورخیز ایران تهیه می‌شود که شباهت کشمش‌شان به دانه انگور تازه باعث نام‌گذاری آن‌ها شده است. این کشمش‌های درشت، گوشتی و شیرین که پوست ضخیم‌تری دارند، در دهان احساسی شبیه به جویدن انگور تازه ایجاد می‌کنند و طعمی فراموش‌نشدنی دارند.

کشمش انگوری دشت‌زاد به دلیل اندازه بزرگ‌تر و محتوای بالای قند طبیعی، انتخاب اول ورزشکاران و کسانی است که نیاز به انرژی سریع دارند. همچنین سرشار از آنتوسیانین، رسوراترول، آهن، پتاسیم و ویتامین‌های گروه B است که به سلامت قلب، کاهش التهاب و تقویت سیستم ایمنی کمک می‌کنند.

این کشمش درشت در تهیه آجیل‌های مجلسی، مخلوط‌های صبحانه، کیک‌های اسفنجی، دسرهای شیری و پودینگ‌های برنجی کاربرد فراوانی دارد. همچنین برای درست‌کردن سرکه طبیعی کشمش و ترشی‌های سنتی ایرانی نیز مناسب است. دشت‌زاد این کشمش‌های استثنایی را با دقت انتخاب و در بسته‌بندی‌های خاص عرضه می‌کند تا هر دانه از کیفیت یکسانی برخوردار باشد.`,
        brand: "دشت‌زاد",
        price_rial: 660000,
        offPrice_rial: 561000,
        discountPercent: 15,
        countInStock: 175,
        tags: ["کشمش انگوری", "کشمش درشت", "انرژی‌زا", "ورزشکاران", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 660000,
        categoryId: catMap["keshmesh"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 304, "carb_g": 80.3, "protein_g": 3.2, "fat_g": 0.5, "fiber_g": 4.5, "sugar_g": 61.5}},
      },
      update: {
        title: "کشمش انگوری دشت‌زاد",
        latinTitle: "Grape Raisin",
        description: `کشمش انگوری دشت‌زاد از انگورهای گرد و درشت‌دانه مناطق انگورخیز ایران تهیه می‌شود که شباهت کشمش‌شان به دانه انگور تازه باعث نام‌گذاری آن‌ها شده است. این کشمش‌های درشت، گوشتی و شیرین که پوست ضخیم‌تری دارند، در دهان احساسی شبیه به جویدن انگور تازه ایجاد می‌کنند و طعمی فراموش‌نشدنی دارند.

کشمش انگوری دشت‌زاد به دلیل اندازه بزرگ‌تر و محتوای بالای قند طبیعی، انتخاب اول ورزشکاران و کسانی است که نیاز به انرژی سریع دارند. همچنین سرشار از آنتوسیانین، رسوراترول، آهن، پتاسیم و ویتامین‌های گروه B است که به سلامت قلب، کاهش التهاب و تقویت سیستم ایمنی کمک می‌کنند.

این کشمش درشت در تهیه آجیل‌های مجلسی، مخلوط‌های صبحانه، کیک‌های اسفنجی، دسرهای شیری و پودینگ‌های برنجی کاربرد فراوانی دارد. همچنین برای درست‌کردن سرکه طبیعی کشمش و ترشی‌های سنتی ایرانی نیز مناسب است. دشت‌زاد این کشمش‌های استثنایی را با دقت انتخاب و در بسته‌بندی‌های خاص عرضه می‌کند تا هر دانه از کیفیت یکسانی برخوردار باشد.`,
        price_rial: 660000,
        offPrice_rial: 561000,
        discountPercent: 15,
        countInStock: 175,
        tags: ["کشمش انگوری", "کشمش درشت", "انرژی‌زا", "ورزشکاران", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 304, "carb_g": 80.3, "protein_g": 3.2, "fat_g": 0.5, "fiber_g": 4.5, "sugar_g": 61.5}},
        categoryId: catMap["keshmesh"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "کشمش انگوری دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "keshmesh-anguri-dashtzad-100g", calculatedPrice_rial: 660000, price_rial: 660000, offPrice_rial: 560000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "keshmesh-anguri-dashtzad-250g", calculatedPrice_rial: 1650000, price_rial: 1650000, offPrice_rial: 1400000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "keshmesh-anguri-dashtzad-500g", calculatedPrice_rial: 3140000, price_rial: 3140000, offPrice_rial: 2660000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "keshmesh-anguri-dashtzad-1000g", calculatedPrice_rial: 5940000, price_rial: 5940000, offPrice_rial: 5050000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "khorma-mazafati-bam-dashtzad" },
      create: {
        title: "خرمای مضافتی بم دشت‌زاد",
        slug: "khorma-mazafati-bam-dashtzad",
        latinTitle: "Bam Mazafati Date",
        description: `خرمای مضافتی بم دشت‌زاد؛ سلطان خرماهای ایران و دنیا. بم با اقلیم گرم و خشک، آب زیرزمینی معدنی و خاک آهکی منحصربه‌فردش، مهد خرمای مضافتی در جهان است و هیچ جای دیگری نمی‌تواند خرمایی با این طعم تولید کند. مضافتی بم دشت‌زاد از بهترین نخلستان‌های بم انتخاب می‌شود؛ دانه‌هایی درشت، کشیده، با پوستی نازک بنفش-سیاه و گوشتی نرم، مرطوب و کاراملی که در دهان آب می‌شود.

خرمای مضافتی دشت‌زاد حاوی انواع قندهای طبیعی فروکتوز و گلوکز، پتاسیم، منیزیم، مس، منگنز، سلنیوم و ویتامین‌های A، B1، B2، B3 و C است. مصرف روزانه چند عدد خرمای مضافتی به تامین انرژی پایدار، تقویت اعصاب، سلامت استخوان‌ها و بهبود عملکرد مغز کمک می‌کند. در طب سنتی ایرانی خرما داروی دردهای زیادی شناخته می‌شود.

خرمای مضافتی بم دشت‌زاد به تنهایی، با قهوه، با پنیر، با مغزها، در تهیه انواع شیرینی و دسر ایرانی و بین‌المللی، در اسموتی‌های انرژی‌بخش و حتی به عنوان هدیه لوکس کاربرد دارد. این محصول بی‌نظیر را تجربه کنید و بفهمید چرا مضافتی بم لقب ملکه خرماها را گرفته است.`,
        brand: "دشت‌زاد",
        price_rial: 890000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 300,
        tags: ["خرمای مضافتی", "خرمای بم", "خرما", "سنتی ایرانی", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 890000,
        categoryId: catMap["khorma"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 277, "carb_g": 75, "protein_g": 1.8, "fat_g": 0.2, "fiber_g": 6.7, "sugar_g": 63.4}},
      },
      update: {
        title: "خرمای مضافتی بم دشت‌زاد",
        latinTitle: "Bam Mazafati Date",
        description: `خرمای مضافتی بم دشت‌زاد؛ سلطان خرماهای ایران و دنیا. بم با اقلیم گرم و خشک، آب زیرزمینی معدنی و خاک آهکی منحصربه‌فردش، مهد خرمای مضافتی در جهان است و هیچ جای دیگری نمی‌تواند خرمایی با این طعم تولید کند. مضافتی بم دشت‌زاد از بهترین نخلستان‌های بم انتخاب می‌شود؛ دانه‌هایی درشت، کشیده، با پوستی نازک بنفش-سیاه و گوشتی نرم، مرطوب و کاراملی که در دهان آب می‌شود.

خرمای مضافتی دشت‌زاد حاوی انواع قندهای طبیعی فروکتوز و گلوکز، پتاسیم، منیزیم، مس، منگنز، سلنیوم و ویتامین‌های A، B1، B2، B3 و C است. مصرف روزانه چند عدد خرمای مضافتی به تامین انرژی پایدار، تقویت اعصاب، سلامت استخوان‌ها و بهبود عملکرد مغز کمک می‌کند. در طب سنتی ایرانی خرما داروی دردهای زیادی شناخته می‌شود.

خرمای مضافتی بم دشت‌زاد به تنهایی، با قهوه، با پنیر، با مغزها، در تهیه انواع شیرینی و دسر ایرانی و بین‌المللی، در اسموتی‌های انرژی‌بخش و حتی به عنوان هدیه لوکس کاربرد دارد. این محصول بی‌نظیر را تجربه کنید و بفهمید چرا مضافتی بم لقب ملکه خرماها را گرفته است.`,
        price_rial: 890000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 300,
        tags: ["خرمای مضافتی", "خرمای بم", "خرما", "سنتی ایرانی", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 277, "carb_g": 75, "protein_g": 1.8, "fat_g": 0.2, "fiber_g": 6.7, "sugar_g": 63.4}},
        categoryId: catMap["khorma"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2023/12/dried-grocery-plp-barjil-18.webp", alt: "خرمای مضافتی بم دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "khorma-mazafati-bam-dashtzad-250g", calculatedPrice_rial: 2220000, price_rial: 2220000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "khorma-mazafati-bam-dashtzad-500g", calculatedPrice_rial: 4230000, price_rial: 4230000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "khorma-mazafati-bam-dashtzad-1000g", calculatedPrice_rial: 8010000, price_rial: 8010000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 3000, gramValue: 3000, weightUnit: "GRAM", sku: "khorma-mazafati-bam-dashtzad-3000g", calculatedPrice_rial: 24030000, price_rial: 24030000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "khorma-kabkab-dashtzad" },
      create: {
        title: "خرمای کبکاب دشت‌زاد",
        slug: "khorma-kabkab-dashtzad",
        latinTitle: "Kabkab Date",
        description: `خرمای کبکاب دشت‌زاد از مشهورترین و محبوب‌ترین ارقام خرمای ایران است که در نخلستان‌های خوزستان و بوشهر پرورش می‌یابد. این خرمای بزرگ و گوشتی با رنگ قرمز-قهوه‌ای زیبا و طعمی شیرین و عطری دلنشین، یکی از صادراتی‌ترین خرماهای ایرانی است. خرمای کبکاب دشت‌زاد درشت‌ترین دانه‌ها، نرم‌ترین گوشت و خوش‌رنگ‌ترین ظاهر را دارد.

خرمای کبکاب دشت‌زاد از نظر ارزش تغذیه‌ای بسیار غنی است. حاوی گلوکز، فروکتوز، ساکارز، فیبر، پتاسیم، منیزیم، کلسیم، فسفر و ویتامین‌های B و C است. این خرما به دلیل شاخص گلیسمی پایین‌تر نسبت به شیرینی‌های صنعتی، برای افراد دیابتی در مقادیر کنترل‌شده مناسب‌تر است. همچنین برای دوران بارداری، افراد کم‌خون و ورزشکاران بسیار مفید است.

خرمای کبکاب دشت‌زاد در تهیه انواع شیرینی‌های محلی جنوب ایران، کلوچه خرما، رطب‌پلو مجلسی، دسرهای خرمایی و نوشیدنی‌های انرژی‌زا کاربرد دارد. برای صادرات و هدیه‌های لوکس نیز بسیار محبوب است. دشت‌زاد با انتخاب دقیق و فرآوری بهداشتی، بهترین کبکاب‌های جنوب ایران را برای سفره شما فراهم می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 720000,
        offPrice_rial: 612000,
        discountPercent: 15,
        countInStock: 280,
        tags: ["خرمای کبکاب", "خرما", "جنوب ایران", "خوزستان", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 720000,
        categoryId: catMap["khorma"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 271, "carb_g": 73.5, "protein_g": 1.6, "fat_g": 0.2, "fiber_g": 7, "sugar_g": 60.5}},
      },
      update: {
        title: "خرمای کبکاب دشت‌زاد",
        latinTitle: "Kabkab Date",
        description: `خرمای کبکاب دشت‌زاد از مشهورترین و محبوب‌ترین ارقام خرمای ایران است که در نخلستان‌های خوزستان و بوشهر پرورش می‌یابد. این خرمای بزرگ و گوشتی با رنگ قرمز-قهوه‌ای زیبا و طعمی شیرین و عطری دلنشین، یکی از صادراتی‌ترین خرماهای ایرانی است. خرمای کبکاب دشت‌زاد درشت‌ترین دانه‌ها، نرم‌ترین گوشت و خوش‌رنگ‌ترین ظاهر را دارد.

خرمای کبکاب دشت‌زاد از نظر ارزش تغذیه‌ای بسیار غنی است. حاوی گلوکز، فروکتوز، ساکارز، فیبر، پتاسیم، منیزیم، کلسیم، فسفر و ویتامین‌های B و C است. این خرما به دلیل شاخص گلیسمی پایین‌تر نسبت به شیرینی‌های صنعتی، برای افراد دیابتی در مقادیر کنترل‌شده مناسب‌تر است. همچنین برای دوران بارداری، افراد کم‌خون و ورزشکاران بسیار مفید است.

خرمای کبکاب دشت‌زاد در تهیه انواع شیرینی‌های محلی جنوب ایران، کلوچه خرما، رطب‌پلو مجلسی، دسرهای خرمایی و نوشیدنی‌های انرژی‌زا کاربرد دارد. برای صادرات و هدیه‌های لوکس نیز بسیار محبوب است. دشت‌زاد با انتخاب دقیق و فرآوری بهداشتی، بهترین کبکاب‌های جنوب ایران را برای سفره شما فراهم می‌کند.`,
        price_rial: 720000,
        offPrice_rial: 612000,
        discountPercent: 15,
        countInStock: 280,
        tags: ["خرمای کبکاب", "خرما", "جنوب ایران", "خوزستان", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 271, "carb_g": 73.5, "protein_g": 1.6, "fat_g": 0.2, "fiber_g": 7, "sugar_g": 60.5}},
        categoryId: catMap["khorma"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "خرمای کبکاب دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "khorma-kabkab-dashtzad-250g", calculatedPrice_rial: 1800000, price_rial: 1800000, offPrice_rial: 1530000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "khorma-kabkab-dashtzad-500g", calculatedPrice_rial: 3420000, price_rial: 3420000, offPrice_rial: 2910000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "khorma-kabkab-dashtzad-1000g", calculatedPrice_rial: 6480000, price_rial: 6480000, offPrice_rial: 5510000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 3000, gramValue: 3000, weightUnit: "GRAM", sku: "khorma-kabkab-dashtzad-3000g", calculatedPrice_rial: 19440000, price_rial: 19440000, offPrice_rial: 16520000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "khorma-zahedi-dashtzad" },
      create: {
        title: "خرمای زاهدی دشت‌زاد",
        slug: "khorma-zahedi-dashtzad",
        latinTitle: "Zahedi Date",
        description: `خرمای زاهدی دشت‌زاد؛ خرمای نیمه‌خشک ایران، متفاوت از همه. این رقم منحصربه‌فرد خرما که در نخلستان‌های فارس، خوزستان و کرمان پرورش می‌یابد، بر خلاف خرماهای نرم و مرطوب، بافتی نیمه‌خشک و سفت دارد که نگهداری آن را بسیار آسان‌تر می‌کند. رنگ طلایی تا قهوه‌ای روشن، طعم ملایم شیرین و بافت جویدنی آن، خرمای زاهدی را تجربه‌ای کاملاً متفاوت می‌کند.

خرمای زاهدی دشت‌زاد ماندگارترین نوع خرما است و بدون نیاز به یخچال ماه‌ها تازه باقی می‌ماند. سرشار از فیبر، پتاسیم، منیزیم و قندهای طبیعی است. به دلیل بافت خشک‌تر، برای افراد دیابتی در مقادیر کنترل‌شده مناسب‌تر از خرماهای مرطوب است. برای کوهنوردان، مسافران و ورزشکاران که نیاز به منبع انرژی قابل حمل دارند ایده‌آل است.

خرمای زاهدی دشت‌زاد برای تهیه شیره خرما، سرکه خرما، شیرینی‌های محلی و برخی غذاهای سنتی مناطق جنوبی ایران استفاده می‌شود. همچنین برای صادرات به کشورهای عربی، اروپایی و آسیایی بسیار محبوب است. دشت‌زاد این خرما را در بسته‌بندی‌های مناسب صادراتی و خانگی عرضه می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 480000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 350,
        tags: ["خرمای زاهدی", "خرما نیمه‌خشک", "ماندگاری بالا", "صادراتی", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 480000,
        categoryId: catMap["khorma"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 285, "carb_g": 76.5, "protein_g": 2.5, "fat_g": 0.5, "fiber_g": 8.5, "sugar_g": 58}},
      },
      update: {
        title: "خرمای زاهدی دشت‌زاد",
        latinTitle: "Zahedi Date",
        description: `خرمای زاهدی دشت‌زاد؛ خرمای نیمه‌خشک ایران، متفاوت از همه. این رقم منحصربه‌فرد خرما که در نخلستان‌های فارس، خوزستان و کرمان پرورش می‌یابد، بر خلاف خرماهای نرم و مرطوب، بافتی نیمه‌خشک و سفت دارد که نگهداری آن را بسیار آسان‌تر می‌کند. رنگ طلایی تا قهوه‌ای روشن، طعم ملایم شیرین و بافت جویدنی آن، خرمای زاهدی را تجربه‌ای کاملاً متفاوت می‌کند.

خرمای زاهدی دشت‌زاد ماندگارترین نوع خرما است و بدون نیاز به یخچال ماه‌ها تازه باقی می‌ماند. سرشار از فیبر، پتاسیم، منیزیم و قندهای طبیعی است. به دلیل بافت خشک‌تر، برای افراد دیابتی در مقادیر کنترل‌شده مناسب‌تر از خرماهای مرطوب است. برای کوهنوردان، مسافران و ورزشکاران که نیاز به منبع انرژی قابل حمل دارند ایده‌آل است.

خرمای زاهدی دشت‌زاد برای تهیه شیره خرما، سرکه خرما، شیرینی‌های محلی و برخی غذاهای سنتی مناطق جنوبی ایران استفاده می‌شود. همچنین برای صادرات به کشورهای عربی، اروپایی و آسیایی بسیار محبوب است. دشت‌زاد این خرما را در بسته‌بندی‌های مناسب صادراتی و خانگی عرضه می‌کند.`,
        price_rial: 480000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 350,
        tags: ["خرمای زاهدی", "خرما نیمه‌خشک", "ماندگاری بالا", "صادراتی", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 285, "carb_g": 76.5, "protein_g": 2.5, "fat_g": 0.5, "fiber_g": 8.5, "sugar_g": 58}},
        categoryId: catMap["khorma"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "خرمای زاهدی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "khorma-zahedi-dashtzad-250g", calculatedPrice_rial: 1200000, price_rial: 1200000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "khorma-zahedi-dashtzad-500g", calculatedPrice_rial: 2280000, price_rial: 2280000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "khorma-zahedi-dashtzad-1000g", calculatedPrice_rial: 4320000, price_rial: 4320000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 3000, gramValue: 3000, weightUnit: "GRAM", sku: "khorma-zahedi-dashtzad-3000g", calculatedPrice_rial: 12960000, price_rial: 12960000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "khorma-shahani-dashtzad" },
      create: {
        title: "خرمای شاهانی دشت‌زاد",
        slug: "khorma-shahani-dashtzad",
        latinTitle: "Shahani Date",
        description: `خرمای شاهانی دشت‌زاد؛ لایق نام خود است. این خرمای اشرافی که در نخلستان‌های فارس و جنوب ایران پرورش می‌یابد، با دانه‌هایی بلند، کشیده و به شکل قطره، یکی از زیباترین ارقام خرمای ایرانی است. پوستی نازک و براق با رنگ قرمز-قهوه‌ای تیره، گوشتی ضخیم و نرم با طعمی کاراملی غنی و عطری دلنشین که خرمای شاهانی را به انتخاب اول مجالس و هدایا تبدیل کرده است.

خرمای شاهانی دشت‌زاد از نظر کیفیت بصری و طعمی در بالاترین رده قرار دارد. سرشار از قندهای طبیعی گلوکز و فروکتوز، پتاسیم، منیزیم، کلسیم، فسفر، آهن و ویتامین‌های A، B و C است. مصرف این خرما انرژی فوری و پایداری به بدن می‌دهد و برای دوران نقاهت، بارداری و شیردهی نیز بسیار مناسب است.

خرمای شاهانی دشت‌زاد در مجالس رسمی، عروسی‌ها، ماه رمضان و اعیاد ملی و مذهبی جایگاه ویژه‌ای دارد. در تهیه شیرینی‌های مجلسی، دسرهای خرمایی، کلوچه‌های خرما و نوشیدنی‌های مغذی نیز بسیار محبوب است. دشت‌زاد این گوهر نخلستان‌های ایران را در جعبه‌های هدیه زیبا عرضه می‌کند تا هر مناسبتی را یادماندنی کند. همین حالا سفارش دهید.`,
        brand: "دشت‌زاد",
        price_rial: 1050000,
        offPrice_rial: 892000,
        discountPercent: 15,
        countInStock: 200,
        tags: ["خرمای شاهانی", "خرمای مجلسی", "هدیه", "خرمای لوکس", "خشکبار"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 1050000,
        categoryId: catMap["khorma"] ?? catMap["khoshkbar"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 282, "carb_g": 75.8, "protein_g": 2, "fat_g": 0.3, "fiber_g": 7.2, "sugar_g": 64}},
      },
      update: {
        title: "خرمای شاهانی دشت‌زاد",
        latinTitle: "Shahani Date",
        description: `خرمای شاهانی دشت‌زاد؛ لایق نام خود است. این خرمای اشرافی که در نخلستان‌های فارس و جنوب ایران پرورش می‌یابد، با دانه‌هایی بلند، کشیده و به شکل قطره، یکی از زیباترین ارقام خرمای ایرانی است. پوستی نازک و براق با رنگ قرمز-قهوه‌ای تیره، گوشتی ضخیم و نرم با طعمی کاراملی غنی و عطری دلنشین که خرمای شاهانی را به انتخاب اول مجالس و هدایا تبدیل کرده است.

خرمای شاهانی دشت‌زاد از نظر کیفیت بصری و طعمی در بالاترین رده قرار دارد. سرشار از قندهای طبیعی گلوکز و فروکتوز، پتاسیم، منیزیم، کلسیم، فسفر، آهن و ویتامین‌های A، B و C است. مصرف این خرما انرژی فوری و پایداری به بدن می‌دهد و برای دوران نقاهت، بارداری و شیردهی نیز بسیار مناسب است.

خرمای شاهانی دشت‌زاد در مجالس رسمی، عروسی‌ها، ماه رمضان و اعیاد ملی و مذهبی جایگاه ویژه‌ای دارد. در تهیه شیرینی‌های مجلسی، دسرهای خرمایی، کلوچه‌های خرما و نوشیدنی‌های مغذی نیز بسیار محبوب است. دشت‌زاد این گوهر نخلستان‌های ایران را در جعبه‌های هدیه زیبا عرضه می‌کند تا هر مناسبتی را یادماندنی کند. همین حالا سفارش دهید.`,
        price_rial: 1050000,
        offPrice_rial: 892000,
        discountPercent: 15,
        countInStock: 200,
        tags: ["خرمای شاهانی", "خرمای مجلسی", "هدیه", "خرمای لوکس", "خشکبار"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 282, "carb_g": 75.8, "protein_g": 2, "fat_g": 0.3, "fiber_g": 7.2, "sugar_g": 64}},
        categoryId: catMap["khorma"] ?? catMap["khoshkbar"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p2.jpeg", alt: "خرمای شاهانی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "khorma-shahani-dashtzad-250g", calculatedPrice_rial: 2620000, price_rial: 2620000, offPrice_rial: 2230000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "khorma-shahani-dashtzad-500g", calculatedPrice_rial: 4990000, price_rial: 4990000, offPrice_rial: 4240000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "khorma-shahani-dashtzad-1000g", calculatedPrice_rial: 9450000, price_rial: 9450000, offPrice_rial: 8030000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 3000, gramValue: 3000, weightUnit: "GRAM", sku: "khorma-shahani-dashtzad-3000g", calculatedPrice_rial: 28350000, price_rial: 28350000, offPrice_rial: 24080000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "chai-torsh-dashtzad" },
      create: {
        title: "چای ترش دشت‌زاد",
        slug: "chai-torsh-dashtzad",
        latinTitle: "Hibiscus Herbal Tea",
        description: `چای ترش دشت‌زاد، محصولی اصیل از گل‌های هیبیسکوس برگزیده است که با دقت فراوان از مزارع طبیعی تهیه و پس از خشک‌شدن کامل بسته‌بندی می‌شود. رنگ قرمز شفاف و درخشان این دمنوش در فنجان، هر نوشیدنی را به یک تجربه بصری زیبا تبدیل می‌کند. عطر ملایم و طعم ترش‌مزه‌ی آن، احساسی تازه و دلنشین به همراه دارد که هم به‌صورت گرم و هم سرد قابل لذت‌بردن است.

چای ترش سرشار از آنتی‌اکسیدان‌های طبیعی، ویتامین C و آنتوسیانین‌های قوی است. مطالعات نشان داده‌اند که مصرف منظم این گیاه می‌تواند در کاهش فشار خون، تنظیم کلسترول و تقویت سیستم ایمنی بدن موثر باشد. همچنین این دمنوش خاصیت ضدالتهابی داشته و به سلامت کبد کمک می‌کند.

دشت‌زاد با تعهد به کیفیت برتر، گل‌های هیبیسکوس را در اوج شکوفایی برداشت می‌کند تا بیشترین ارزش غذایی و عطر دمنوش حفظ شود. این محصول عاری از هرگونه رنگ مصنوعی، طعم دهنده شیمیایی و مواد نگهدارنده است. یک فنجان چای ترش دشت‌زاد، انتخابی هوشمند برای کسانی است که به سلامت خود اهمیت می‌دهند.`,
        brand: "دشت‌زاد",
        price_rial: 32000000,
        offPrice_rial: 27000000,
        discountPercent: 15,
        countInStock: 120,
        tags: ["چای ترش", "هیبیسکوس", "ضد فشار خون", "آنتی اکسیدان", "دمنوش طبیعی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 32000000,
        categoryId: catMap["chai-torsh"] ?? catMap["damnoosh-paye"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 37, "carb_g": 7.6, "protein_g": 0.4, "fat_g": 0.7, "fiber_g": 2.8, "sugar_g": 1.7}},
      },
      update: {
        title: "چای ترش دشت‌زاد",
        latinTitle: "Hibiscus Herbal Tea",
        description: `چای ترش دشت‌زاد، محصولی اصیل از گل‌های هیبیسکوس برگزیده است که با دقت فراوان از مزارع طبیعی تهیه و پس از خشک‌شدن کامل بسته‌بندی می‌شود. رنگ قرمز شفاف و درخشان این دمنوش در فنجان، هر نوشیدنی را به یک تجربه بصری زیبا تبدیل می‌کند. عطر ملایم و طعم ترش‌مزه‌ی آن، احساسی تازه و دلنشین به همراه دارد که هم به‌صورت گرم و هم سرد قابل لذت‌بردن است.

چای ترش سرشار از آنتی‌اکسیدان‌های طبیعی، ویتامین C و آنتوسیانین‌های قوی است. مطالعات نشان داده‌اند که مصرف منظم این گیاه می‌تواند در کاهش فشار خون، تنظیم کلسترول و تقویت سیستم ایمنی بدن موثر باشد. همچنین این دمنوش خاصیت ضدالتهابی داشته و به سلامت کبد کمک می‌کند.

دشت‌زاد با تعهد به کیفیت برتر، گل‌های هیبیسکوس را در اوج شکوفایی برداشت می‌کند تا بیشترین ارزش غذایی و عطر دمنوش حفظ شود. این محصول عاری از هرگونه رنگ مصنوعی، طعم دهنده شیمیایی و مواد نگهدارنده است. یک فنجان چای ترش دشت‌زاد، انتخابی هوشمند برای کسانی است که به سلامت خود اهمیت می‌دهند.`,
        price_rial: 32000000,
        offPrice_rial: 27000000,
        discountPercent: 15,
        countInStock: 120,
        tags: ["چای ترش", "هیبیسکوس", "ضد فشار خون", "آنتی اکسیدان", "دمنوش طبیعی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 37, "carb_g": 7.6, "protein_g": 0.4, "fat_g": 0.7, "fiber_g": 2.8, "sugar_g": 1.7}},
        categoryId: catMap["chai-torsh"] ?? catMap["damnoosh-paye"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2022/11/Lemongrass-herbal-tea-barjil-867-1.webp", alt: "چای ترش دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "chai-torsh-dashtzad-50g", calculatedPrice_rial: 16000000, price_rial: 16000000, offPrice_rial: 13500000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "chai-torsh-dashtzad-100g", calculatedPrice_rial: 32000000, price_rial: 32000000, offPrice_rial: 27000000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "chai-torsh-dashtzad-200g", calculatedPrice_rial: 64000000, price_rial: 64000000, offPrice_rial: 54000000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "babooneh-dashtzad" },
      create: {
        title: "بابونه دشت‌زاد",
        slug: "babooneh-dashtzad",
        latinTitle: "Chamomile Herbal Tea",
        description: `بابونه دشت‌زاد از گل‌های بابونه تازه‌برداشت‌شده تهیه می‌شود که در دشت‌های پاک و بدون آلودگی کشت داده شده‌اند. این گل ظریف و زیبا قرن‌هاست که در طب سنتی ایران و جهان جایگاه ویژه‌ای داشته و به «سرور گیاهان دارویی» معروف است.

عطر ملایم سیبی و طعم شیرین و آرام‌بخش بابونه دشت‌زاد، هر شب را به یک تجربه‌ی آرام‌بخشی تبدیل می‌کند. این دمنوش به‌خصوص برای کاهش استرس، بهبود کیفیت خواب، تسکین دردهای معده و کاهش علائم PMS شناخته شده است. خاصیت ضدالتهابی قوی آن نیز در تسکین دردهای عضلانی و مفصلی موثر است.

دشت‌زاد گل‌های بابونه را در اوج شکوفایی با دقت دستچین کرده و پس از خشک‌شدن طبیعی در سایه، با حفظ حداکثر خواص دارویی بسته‌بندی می‌کند. بدون هیچ‌گونه افزودنی مصنوعی، این محصول خالص‌ترین بابونه را برای خانواده شما فراهم می‌آورد. یک فنجان بابونه دشت‌زاد قبل از خواب، بهترین هدیه‌ای است که می‌توانید به آرامش خود بدهید.`,
        brand: "دشت‌زاد",
        price_rial: 30000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 95,
        tags: ["بابونه", "آرام‌بخش", "خواب‌آور", "ضد استرس", "گوارشی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 30000000,
        categoryId: catMap["babooneh"] ?? catMap["damnoosh-paye"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 1, "carb_g": 0.2, "protein_g": 0, "fat_g": 0, "fiber_g": 0, "sugar_g": 0}},
      },
      update: {
        title: "بابونه دشت‌زاد",
        latinTitle: "Chamomile Herbal Tea",
        description: `بابونه دشت‌زاد از گل‌های بابونه تازه‌برداشت‌شده تهیه می‌شود که در دشت‌های پاک و بدون آلودگی کشت داده شده‌اند. این گل ظریف و زیبا قرن‌هاست که در طب سنتی ایران و جهان جایگاه ویژه‌ای داشته و به «سرور گیاهان دارویی» معروف است.

عطر ملایم سیبی و طعم شیرین و آرام‌بخش بابونه دشت‌زاد، هر شب را به یک تجربه‌ی آرام‌بخشی تبدیل می‌کند. این دمنوش به‌خصوص برای کاهش استرس، بهبود کیفیت خواب، تسکین دردهای معده و کاهش علائم PMS شناخته شده است. خاصیت ضدالتهابی قوی آن نیز در تسکین دردهای عضلانی و مفصلی موثر است.

دشت‌زاد گل‌های بابونه را در اوج شکوفایی با دقت دستچین کرده و پس از خشک‌شدن طبیعی در سایه، با حفظ حداکثر خواص دارویی بسته‌بندی می‌کند. بدون هیچ‌گونه افزودنی مصنوعی، این محصول خالص‌ترین بابونه را برای خانواده شما فراهم می‌آورد. یک فنجان بابونه دشت‌زاد قبل از خواب، بهترین هدیه‌ای است که می‌توانید به آرامش خود بدهید.`,
        price_rial: 30000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 95,
        tags: ["بابونه", "آرام‌بخش", "خواب‌آور", "ضد استرس", "گوارشی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 1, "carb_g": 0.2, "protein_g": 0, "fat_g": 0, "fiber_g": 0, "sugar_g": 0}},
        categoryId: catMap["babooneh"] ?? catMap["damnoosh-paye"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2022/11/Chamomile-herbal-tea-barjil-873-1-1.webp", alt: "بابونه دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "babooneh-dashtzad-50g", calculatedPrice_rial: 15000000, price_rial: 15000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "babooneh-dashtzad-100g", calculatedPrice_rial: 30000000, price_rial: 30000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "babooneh-dashtzad-200g", calculatedPrice_rial: 60000000, price_rial: 60000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "naana-khoshk-dashtzad" },
      create: {
        title: "نعناع خشک دشت‌زاد",
        slug: "naana-khoshk-dashtzad",
        latinTitle: "Dried Peppermint",
        description: `نعناع خشک دشت‌زاد از برگ‌های تازه نعناع فلفلی که در اوج سرسبزی برداشت شده، تهیه می‌شود. عطر قوی و نافذ نعناع تازه در هر دم‌کشیدن حس تازگی و طراوت را به خانه شما می‌آورد. رنگ سبز روشن برگ‌های خشک‌شده نشانه‌ی حفظ کلروفیل و ترکیبات فعال گیاهی است.

نعناع سرشار از منتول است که خاصیت ضددرد، ضدعفونی‌کننده و گوارشی دارد. این دمنوش در تسکین سردرد، برطرف کردن نفخ و دل‌درد، بهبود تنفس و کاهش تهوع بسیار موثر است. همچنین مصرف نعناع به بهبود تمرکز ذهنی و افزایش انرژی کمک می‌کند.

دشت‌زاد با انتخاب نعناع از مزارع ارگانیک و خشک‌کردن آرام در دمای پایین، تمام ترکیبات ضروری اسانس نعناع را در محصول نهایی حفظ می‌کند. این نعناع خشک هم برای دمنوش تنها و هم به‌عنوان افزودنی در بسیاری از نوشیدنی‌های گیاهی کاربرد دارد. مناسب برای تمام سنین و فصول مختلف سال.`,
        brand: "دشت‌زاد",
        price_rial: 28000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 150,
        tags: ["نعناع", "دمنوش گوارشی", "ضد نفخ", "سردرد", "تازگی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 28000000,
        categoryId: catMap["naana-khoshk"] ?? catMap["damnoosh-paye"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 70, "carb_g": 14.9, "protein_g": 3.8, "fat_g": 0.9, "fiber_g": 8, "sugar_g": 0}},
      },
      update: {
        title: "نعناع خشک دشت‌زاد",
        latinTitle: "Dried Peppermint",
        description: `نعناع خشک دشت‌زاد از برگ‌های تازه نعناع فلفلی که در اوج سرسبزی برداشت شده، تهیه می‌شود. عطر قوی و نافذ نعناع تازه در هر دم‌کشیدن حس تازگی و طراوت را به خانه شما می‌آورد. رنگ سبز روشن برگ‌های خشک‌شده نشانه‌ی حفظ کلروفیل و ترکیبات فعال گیاهی است.

نعناع سرشار از منتول است که خاصیت ضددرد، ضدعفونی‌کننده و گوارشی دارد. این دمنوش در تسکین سردرد، برطرف کردن نفخ و دل‌درد، بهبود تنفس و کاهش تهوع بسیار موثر است. همچنین مصرف نعناع به بهبود تمرکز ذهنی و افزایش انرژی کمک می‌کند.

دشت‌زاد با انتخاب نعناع از مزارع ارگانیک و خشک‌کردن آرام در دمای پایین، تمام ترکیبات ضروری اسانس نعناع را در محصول نهایی حفظ می‌کند. این نعناع خشک هم برای دمنوش تنها و هم به‌عنوان افزودنی در بسیاری از نوشیدنی‌های گیاهی کاربرد دارد. مناسب برای تمام سنین و فصول مختلف سال.`,
        price_rial: 28000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 150,
        tags: ["نعناع", "دمنوش گوارشی", "ضد نفخ", "سردرد", "تازگی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 70, "carb_g": 14.9, "protein_g": 3.8, "fat_g": 0.9, "fiber_g": 8, "sugar_g": 0}},
        categoryId: catMap["naana-khoshk"] ?? catMap["damnoosh-paye"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p5.jpeg", alt: "نعناع خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "naana-khoshk-dashtzad-50g", calculatedPrice_rial: 14000000, price_rial: 14000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "naana-khoshk-dashtzad-100g", calculatedPrice_rial: 28000000, price_rial: 28000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "naana-khoshk-dashtzad-200g", calculatedPrice_rial: 56000000, price_rial: 56000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "avishan-dashtzad" },
      create: {
        title: "آویشن دشت‌زاد",
        slug: "avishan-dashtzad",
        latinTitle: "Thyme Herbal Tea",
        description: `آویشن دشت‌زاد از سرشاخه‌های معطر آویشن کوهی ایران تهیه می‌شود که به دلیل خاک و آب‌وهوای مناسب، دارای بیشترین غلظت تیمول و کارواکرول است. این دو ترکیب فعال، قدرت ضدعفونی‌کننده‌ی آویشن را بسیار بالا می‌برند و آن را به یکی از قوی‌ترین گیاهان دارویی دنیا تبدیل کرده‌اند.

عطر تند و گرم آویشن و طعم تیز و خاص آن، دمنوشی قوی و تاثیرگذار می‌سازد. این گیاه در درمان سرماخوردگی، سرفه، گلودرد، برونشیت و عفونت‌های تنفسی شناخته شده است. آویشن همچنین خاصیت آنتی‌بیوتیکی طبیعی دارد و در درمان عفونت‌های دستگاه گوارش و مشکلات روده موثر است.

دشت‌زاد آویشن را از ارتفاعات پاک کوهستانی برداشت کرده و پس از خشک‌شدن دقیق، در بسته‌بندی بهداشتی که از تبادل رطوبت و نور جلوگیری می‌کند، عرضه می‌نماید. مصرف این دمنوش در فصل‌های سرد سال به‌ویژه توصیه می‌شود. یک نوشیدنی قدرتمند برای سلامت و ایمنی بدن.`,
        brand: "دشت‌زاد",
        price_rial: 32000000,
        offPrice_rial: 27200000,
        discountPercent: 15,
        countInStock: 80,
        tags: ["آویشن", "ضد سرماخوردگی", "آنتی‌بیوتیک طبیعی", "تنفسی", "ضدعفونی‌کننده"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 32000000,
        categoryId: catMap["avishan"] ?? catMap["damnoosh-paye"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 276, "carb_g": 63.9, "protein_g": 9.1, "fat_g": 7.4, "fiber_g": 37, "sugar_g": 1.7}},
      },
      update: {
        title: "آویشن دشت‌زاد",
        latinTitle: "Thyme Herbal Tea",
        description: `آویشن دشت‌زاد از سرشاخه‌های معطر آویشن کوهی ایران تهیه می‌شود که به دلیل خاک و آب‌وهوای مناسب، دارای بیشترین غلظت تیمول و کارواکرول است. این دو ترکیب فعال، قدرت ضدعفونی‌کننده‌ی آویشن را بسیار بالا می‌برند و آن را به یکی از قوی‌ترین گیاهان دارویی دنیا تبدیل کرده‌اند.

عطر تند و گرم آویشن و طعم تیز و خاص آن، دمنوشی قوی و تاثیرگذار می‌سازد. این گیاه در درمان سرماخوردگی، سرفه، گلودرد، برونشیت و عفونت‌های تنفسی شناخته شده است. آویشن همچنین خاصیت آنتی‌بیوتیکی طبیعی دارد و در درمان عفونت‌های دستگاه گوارش و مشکلات روده موثر است.

دشت‌زاد آویشن را از ارتفاعات پاک کوهستانی برداشت کرده و پس از خشک‌شدن دقیق، در بسته‌بندی بهداشتی که از تبادل رطوبت و نور جلوگیری می‌کند، عرضه می‌نماید. مصرف این دمنوش در فصل‌های سرد سال به‌ویژه توصیه می‌شود. یک نوشیدنی قدرتمند برای سلامت و ایمنی بدن.`,
        price_rial: 32000000,
        offPrice_rial: 27200000,
        discountPercent: 15,
        countInStock: 80,
        tags: ["آویشن", "ضد سرماخوردگی", "آنتی‌بیوتیک طبیعی", "تنفسی", "ضدعفونی‌کننده"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 276, "carb_g": 63.9, "protein_g": 9.1, "fat_g": 7.4, "fiber_g": 37, "sugar_g": 1.7}},
        categoryId: catMap["avishan"] ?? catMap["damnoosh-paye"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p5.jpeg", alt: "آویشن دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "avishan-dashtzad-50g", calculatedPrice_rial: 16000000, price_rial: 16000000, offPrice_rial: 13600000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "avishan-dashtzad-100g", calculatedPrice_rial: 32000000, price_rial: 32000000, offPrice_rial: 27200000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "avishan-dashtzad-200g", calculatedPrice_rial: 64000000, price_rial: 64000000, offPrice_rial: 54400000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "gol-gavazaban-dashtzad" },
      create: {
        title: "گل گاوزبان دشت‌زاد",
        slug: "gol-gavazaban-dashtzad",
        latinTitle: "Borage Flower Herbal Tea",
        description: `گل گاوزبان دشت‌زاد از گل‌های آبی ظریف گیاه بوراژ تهیه می‌شود که در ایران سابقه‌ای دیرینه در طب سنتی دارد. گل‌های ستاره‌ای آبی‌رنگ این گیاه نه تنها زیبا هستند، بلکه حامل خواص دارویی چشمگیری نیز می‌باشند.

گاوزبان به‌عنوان «گل شادی» در طب سنتی ایران شناخته می‌شود زیرا تاثیر آن در بهبود خلق‌وخو، کاهش اضطراب و افسردگی خفیف به اثبات رسیده است. این گیاه همچنین دارای خاصیت مدر، ضد التهاب، و تقویت‌کننده قلب و عروق است. مصرف آن در بهبود عملکرد غدد فوق کلیوی و کاهش استرس‌های ناشی از فشارهای روزمره توصیه می‌شود.

دشت‌زاد گل‌های گاوزبان را در اوج شکوفایی دستچین کرده و با روش خشک‌کردن سایه‌ای، رنگ آبی درخشان و خواص درمانی آن‌ها را حفظ می‌کند. دم‌کردن این گل‌ها دمنوشی با رنگ بنفش‌آبی لطیف و طعم ملایم می‌سازد که نوشیدن آن تجربه‌ای خاص است. مناسب برای کاهش فشارهای روحی و تقویت سیستم عصبی.`,
        brand: "دشت‌زاد",
        price_rial: 35000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 60,
        tags: ["گل گاوزبان", "ضد اضطراب", "شادی‌آور", "قلب و عروق", "طب سنتی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 35000000,
        categoryId: catMap["gol-gavazaban"] ?? catMap["damnoosh-paye"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 21, "carb_g": 3, "protein_g": 1.8, "fat_g": 0.7, "fiber_g": 2.6, "sugar_g": 0}},
      },
      update: {
        title: "گل گاوزبان دشت‌زاد",
        latinTitle: "Borage Flower Herbal Tea",
        description: `گل گاوزبان دشت‌زاد از گل‌های آبی ظریف گیاه بوراژ تهیه می‌شود که در ایران سابقه‌ای دیرینه در طب سنتی دارد. گل‌های ستاره‌ای آبی‌رنگ این گیاه نه تنها زیبا هستند، بلکه حامل خواص دارویی چشمگیری نیز می‌باشند.

گاوزبان به‌عنوان «گل شادی» در طب سنتی ایران شناخته می‌شود زیرا تاثیر آن در بهبود خلق‌وخو، کاهش اضطراب و افسردگی خفیف به اثبات رسیده است. این گیاه همچنین دارای خاصیت مدر، ضد التهاب، و تقویت‌کننده قلب و عروق است. مصرف آن در بهبود عملکرد غدد فوق کلیوی و کاهش استرس‌های ناشی از فشارهای روزمره توصیه می‌شود.

دشت‌زاد گل‌های گاوزبان را در اوج شکوفایی دستچین کرده و با روش خشک‌کردن سایه‌ای، رنگ آبی درخشان و خواص درمانی آن‌ها را حفظ می‌کند. دم‌کردن این گل‌ها دمنوشی با رنگ بنفش‌آبی لطیف و طعم ملایم می‌سازد که نوشیدن آن تجربه‌ای خاص است. مناسب برای کاهش فشارهای روحی و تقویت سیستم عصبی.`,
        price_rial: 35000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 60,
        tags: ["گل گاوزبان", "ضد اضطراب", "شادی‌آور", "قلب و عروق", "طب سنتی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 21, "carb_g": 3, "protein_g": 1.8, "fat_g": 0.7, "fiber_g": 2.6, "sugar_g": 0}},
        categoryId: catMap["gol-gavazaban"] ?? catMap["damnoosh-paye"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/mohammadi-flower-bud-barjil-144-1-1.webp", alt: "گل گاوزبان دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "gol-gavazaban-dashtzad-50g", calculatedPrice_rial: 17500000, price_rial: 17500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "gol-gavazaban-dashtzad-100g", calculatedPrice_rial: 35000000, price_rial: 35000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "gol-gavazaban-dashtzad-200g", calculatedPrice_rial: 70000000, price_rial: 70000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "beh-limu-dashtzad" },
      create: {
        title: "به‌لیمو دشت‌زاد",
        slug: "beh-limu-dashtzad",
        latinTitle: "Lemon Verbena Herbal Tea",
        description: `به‌لیمو دشت‌زاد از برگ‌های درخت به‌لیمو (Lippia citriodora) که با عطری شدید از لیمو و تازگی استثنایی شناخته می‌شود، تهیه می‌گردد. این گیاه در ایران با نام‌های «لیمو ترش شیرازی» و «بادرنجبویه لیمویی» نیز شناخته می‌شود و در باغ‌های جنوب ایران به‌وفور یافت می‌شود.

عطر قوی و شاداب به‌لیمو در فضای خانه منتشر می‌شود و فضایی تازه و دلنشین می‌آفریند. خاصیت آرام‌بخشی و ضداضطراب این گیاه آن را به انتخابی ایده‌آل برای پایان روزهای پرتنش تبدیل کرده است. به‌لیمو در بهبود هضم، کاهش تب، تسکین دردهای معده و رفع بی‌خوابی موثر است.

دشت‌زاد با انتخاب برگ‌های جوان و معطر در بهترین زمان برداشت، دمنوشی با بالاترین غلظت اسانس‌های طبیعی تولید می‌کند. هر دم‌کشیدن از این چای، سفری کوتاه به طبیعت سرسبز جنوب ایران است. مناسب برای بعد از شام و قبل از خواب.`,
        brand: "دشت‌زاد",
        price_rial: 33000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 75,
        tags: ["به‌لیمو", "لیمو ترش", "آرام‌بخش", "گوارشی", "ضد تب"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 33000000,
        categoryId: catMap["beh-limu"] ?? catMap["damnoosh-paye"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 41, "carb_g": 8.9, "protein_g": 1.6, "fat_g": 0.5, "fiber_g": 5.4, "sugar_g": 0}},
      },
      update: {
        title: "به‌لیمو دشت‌زاد",
        latinTitle: "Lemon Verbena Herbal Tea",
        description: `به‌لیمو دشت‌زاد از برگ‌های درخت به‌لیمو (Lippia citriodora) که با عطری شدید از لیمو و تازگی استثنایی شناخته می‌شود، تهیه می‌گردد. این گیاه در ایران با نام‌های «لیمو ترش شیرازی» و «بادرنجبویه لیمویی» نیز شناخته می‌شود و در باغ‌های جنوب ایران به‌وفور یافت می‌شود.

عطر قوی و شاداب به‌لیمو در فضای خانه منتشر می‌شود و فضایی تازه و دلنشین می‌آفریند. خاصیت آرام‌بخشی و ضداضطراب این گیاه آن را به انتخابی ایده‌آل برای پایان روزهای پرتنش تبدیل کرده است. به‌لیمو در بهبود هضم، کاهش تب، تسکین دردهای معده و رفع بی‌خوابی موثر است.

دشت‌زاد با انتخاب برگ‌های جوان و معطر در بهترین زمان برداشت، دمنوشی با بالاترین غلظت اسانس‌های طبیعی تولید می‌کند. هر دم‌کشیدن از این چای، سفری کوتاه به طبیعت سرسبز جنوب ایران است. مناسب برای بعد از شام و قبل از خواب.`,
        price_rial: 33000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 75,
        tags: ["به‌لیمو", "لیمو ترش", "آرام‌بخش", "گوارشی", "ضد تب"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 41, "carb_g": 8.9, "protein_g": 1.6, "fat_g": 0.5, "fiber_g": 5.4, "sugar_g": 0}},
        categoryId: catMap["beh-limu"] ?? catMap["damnoosh-paye"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/16091-1.webp", alt: "به‌لیمو دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "beh-limu-dashtzad-50g", calculatedPrice_rial: 16500000, price_rial: 16500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "beh-limu-dashtzad-100g", calculatedPrice_rial: 33000000, price_rial: 33000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "beh-limu-dashtzad-200g", calculatedPrice_rial: 66000000, price_rial: 66000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-eshq-dashtzad" },
      create: {
        title: "دمنوش عشق دشت‌زاد",
        slug: "damnoosh-eshq-dashtzad",
        latinTitle: "Love Herbal Tea Blend",
        description: `دمنوش عشق دشت‌زاد، ترکیبی شاعرانه از گلبرگ‌های رز، هل سبز معطر و چای ترش است که برای لحظه‌های خاص زندگی طراحی شده است. هر عنصر این ترکیب با دقت انتخاب شده تا هارمونی کاملی از عطر، رنگ و طعم خلق شود که قلب را لمس کند.

گلبرگ رز عطر رمانتیک و خاصیت ضداضطراب و بهبود خلق‌وخو دارد. هل سبز با عطر گرم و تندش، گردش خون را تحریک کرده و حس گرما و صمیمیت ایجاد می‌کند. چای ترش با رنگ قرمز شفافش، بار آنتی‌اکسیدانی بالایی به نوشیدنی می‌بخشد و طعم ترش‌مزه‌ای دلنشین می‌آفریند.

دشت‌زاد این سه گیاه را با نسبت‌های دقیق و سنجیده ترکیب کرده تا هر فنجان تجربه‌ای بی‌همتا باشد. رنگ قرمز-صورتی جذاب این دمنوش در فنجان، هر لحظه را رمانتیک‌تر می‌کند. مناسب برای مراسم خاص، هدیه‌دادن یا صرفاً لذت‌بردن از لحظه‌های آرام زندگی.`,
        brand: "دشت‌زاد",
        price_rial: 50000000,
        offPrice_rial: 42500000,
        discountPercent: 15,
        countInStock: 85,
        tags: ["دمنوش عشق", "رز", "هل", "چای ترش", "ترکیبی", "هدیه"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 50000000,
        categoryId: catMap["damnoosh-eshq"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 30, "carb_g": 6, "protein_g": 0.5, "fat_g": 0.3, "fiber_g": 2.5, "sugar_g": 1.2}},
      },
      update: {
        title: "دمنوش عشق دشت‌زاد",
        latinTitle: "Love Herbal Tea Blend",
        description: `دمنوش عشق دشت‌زاد، ترکیبی شاعرانه از گلبرگ‌های رز، هل سبز معطر و چای ترش است که برای لحظه‌های خاص زندگی طراحی شده است. هر عنصر این ترکیب با دقت انتخاب شده تا هارمونی کاملی از عطر، رنگ و طعم خلق شود که قلب را لمس کند.

گلبرگ رز عطر رمانتیک و خاصیت ضداضطراب و بهبود خلق‌وخو دارد. هل سبز با عطر گرم و تندش، گردش خون را تحریک کرده و حس گرما و صمیمیت ایجاد می‌کند. چای ترش با رنگ قرمز شفافش، بار آنتی‌اکسیدانی بالایی به نوشیدنی می‌بخشد و طعم ترش‌مزه‌ای دلنشین می‌آفریند.

دشت‌زاد این سه گیاه را با نسبت‌های دقیق و سنجیده ترکیب کرده تا هر فنجان تجربه‌ای بی‌همتا باشد. رنگ قرمز-صورتی جذاب این دمنوش در فنجان، هر لحظه را رمانتیک‌تر می‌کند. مناسب برای مراسم خاص، هدیه‌دادن یا صرفاً لذت‌بردن از لحظه‌های آرام زندگی.`,
        price_rial: 50000000,
        offPrice_rial: 42500000,
        discountPercent: 15,
        countInStock: 85,
        tags: ["دمنوش عشق", "رز", "هل", "چای ترش", "ترکیبی", "هدیه"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 30, "carb_g": 6, "protein_g": 0.5, "fat_g": 0.3, "fiber_g": 2.5, "sugar_g": 1.2}},
        categoryId: catMap["damnoosh-eshq"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2022/11/Love-herbal-tea-barjil-862-1-1.webp", alt: "دمنوش عشق دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "damnoosh-eshq-dashtzad-50g", calculatedPrice_rial: 25000000, price_rial: 25000000, offPrice_rial: 21250000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "damnoosh-eshq-dashtzad-100g", calculatedPrice_rial: 50000000, price_rial: 50000000, offPrice_rial: 42500000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "damnoosh-eshq-dashtzad-200g", calculatedPrice_rial: 100000000, price_rial: 100000000, offPrice_rial: 85000000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-eshq-dashtzad-sachet" },
      create: {
        title: "دمنوش عشق دشت‌زاد — دمنوشی (ساشه)",
        slug: "damnoosh-eshq-dashtzad-sachet",
        latinTitle: "Love Herbal Tea Blend Sachets",
        description: `دمنوش عشق دشت‌زاد در قالب ساشه‌های مجلل، همان ترکیب بی‌نظیر گلبرگ رز، هل سبز معطر و چای ترش را در بسته‌بندی عملی و شیکی ارائه می‌دهد. هر ساشه به‌گونه‌ای طراحی شده که در دقیقه‌ای دمنوشی کامل با بیشترین عطر و طعم تهیه کنید.

ساشه‌های دشت‌زاد از کاغذ فیلتر غذایی ایمن و قابل تجزیه‌ی زیستی ساخته شده‌اند که هیچ طعم بیگانه‌ای به دمنوش منتقل نمی‌کنند. برگه‌ی گیاهی درون ساشه با دقت آسیاب شده تا سطح تماس با آب داغ به حداکثر برسد و بهترین دم‌کشیدن را در کمترین زمان داشته باشید.

دمنوش عشق دشت‌زاد ساشه، بهترین همراه برای محیط کار، مسافرت و هر موقعیتی است که می‌خواهید سریع اما باکیفیت از چای لذت ببرید. رنگ قرمز-صورتی جذاب و عطر گل رز این دمنوش، حتی کنار میز کارتان هم لحظه‌ای خاص می‌سازد.`,
        brand: "دشت‌زاد",
        price_rial: 55000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 100,
        tags: ["دمنوش عشق", "ساشه", "رز", "هل", "چای ترش", "هدیه"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 55000000,
        categoryId: catMap["damnoosh-eshq"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 30, "carb_g": 6, "protein_g": 0.5, "fat_g": 0.3, "fiber_g": 2.5, "sugar_g": 1.2}},
      },
      update: {
        title: "دمنوش عشق دشت‌زاد — دمنوشی (ساشه)",
        latinTitle: "Love Herbal Tea Blend Sachets",
        description: `دمنوش عشق دشت‌زاد در قالب ساشه‌های مجلل، همان ترکیب بی‌نظیر گلبرگ رز، هل سبز معطر و چای ترش را در بسته‌بندی عملی و شیکی ارائه می‌دهد. هر ساشه به‌گونه‌ای طراحی شده که در دقیقه‌ای دمنوشی کامل با بیشترین عطر و طعم تهیه کنید.

ساشه‌های دشت‌زاد از کاغذ فیلتر غذایی ایمن و قابل تجزیه‌ی زیستی ساخته شده‌اند که هیچ طعم بیگانه‌ای به دمنوش منتقل نمی‌کنند. برگه‌ی گیاهی درون ساشه با دقت آسیاب شده تا سطح تماس با آب داغ به حداکثر برسد و بهترین دم‌کشیدن را در کمترین زمان داشته باشید.

دمنوش عشق دشت‌زاد ساشه، بهترین همراه برای محیط کار، مسافرت و هر موقعیتی است که می‌خواهید سریع اما باکیفیت از چای لذت ببرید. رنگ قرمز-صورتی جذاب و عطر گل رز این دمنوش، حتی کنار میز کارتان هم لحظه‌ای خاص می‌سازد.`,
        price_rial: 55000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 100,
        tags: ["دمنوش عشق", "ساشه", "رز", "هل", "چای ترش", "هدیه"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 30, "carb_g": 6, "protein_g": 0.5, "fat_g": 0.3, "fiber_g": 2.5, "sugar_g": 1.2}},
        categoryId: catMap["damnoosh-eshq"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2022/11/Love-herbal-tea-barjil-862-1-1.webp", alt: "دمنوش عشق دشت‌زاد — دمنوشی (ساشه)", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 10, gramValue: 10, weightUnit: "GRAM", sku: "damnoosh-eshq-dashtzad-sachet-10g", calculatedPrice_rial: 5500000, price_rial: 5500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 20, gramValue: 20, weightUnit: "GRAM", sku: "damnoosh-eshq-dashtzad-sachet-20g", calculatedPrice_rial: 11000000, price_rial: 11000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 40, gramValue: 40, weightUnit: "GRAM", sku: "damnoosh-eshq-dashtzad-sachet-40g", calculatedPrice_rial: 22000000, price_rial: 22000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-aramesh-dashtzad" },
      create: {
        title: "دمنوش آرامش دشت‌زاد",
        slug: "damnoosh-aramesh-dashtzad",
        latinTitle: "Tranquility Herbal Blend",
        description: `دمنوش آرامش دشت‌زاد، ترکیب هنرمندانه‌ای از بابونه، اسطوخودوس و بادرنجبویه است که برای کسانی طراحی شده که به دنبال آرامش واقعی هستند. این سه گیاه قدرتمند در کنار هم، یک سیستم آرام‌بخش جامع و طبیعی ایجاد می‌کنند که نه تنها ذهن را آرام می‌کند بلکه به خواب عمیق‌تر کمک می‌نماید.

بابونه با آپیژنین خود به گیرنده‌های GABA در مغز متصل می‌شود و احساس آرامش ایجاد می‌کند. اسطوخودوس با ترکیبات لیناالول و لینالیل استات، اضطراب را کاهش داده و سیستم عصبی را تنظیم می‌کند. بادرنجبویه نیز اسید روزمارینیک دارد که سطح GABA مغز را افزایش می‌دهد و به کیفیت خواب کمک می‌نماید.

دشت‌زاد این گیاهان را با نسبت‌هایی که حداکثر هم‌افزایی را ایجاد کند، ترکیب می‌نماید. عطر لطیف و آرام‌بخش این دمنوش از همان لحظه دم‌کشیدن، حس آرامش را در فضای خانه پراکنده می‌کند. بهترین انتخاب برای قبل از خواب یا بعد از یک روز طولانی.`,
        brand: "دشت‌زاد",
        price_rial: 52000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 90,
        tags: ["دمنوش آرامش", "بابونه", "اسطوخودوس", "بادرنجبویه", "ضد اضطراب", "خواب"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 52000000,
        categoryId: catMap["damnoosh-aramesh"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 5, "carb_g": 1, "protein_g": 0.1, "fat_g": 0, "fiber_g": 0.5, "sugar_g": 0}},
      },
      update: {
        title: "دمنوش آرامش دشت‌زاد",
        latinTitle: "Tranquility Herbal Blend",
        description: `دمنوش آرامش دشت‌زاد، ترکیب هنرمندانه‌ای از بابونه، اسطوخودوس و بادرنجبویه است که برای کسانی طراحی شده که به دنبال آرامش واقعی هستند. این سه گیاه قدرتمند در کنار هم، یک سیستم آرام‌بخش جامع و طبیعی ایجاد می‌کنند که نه تنها ذهن را آرام می‌کند بلکه به خواب عمیق‌تر کمک می‌نماید.

بابونه با آپیژنین خود به گیرنده‌های GABA در مغز متصل می‌شود و احساس آرامش ایجاد می‌کند. اسطوخودوس با ترکیبات لیناالول و لینالیل استات، اضطراب را کاهش داده و سیستم عصبی را تنظیم می‌کند. بادرنجبویه نیز اسید روزمارینیک دارد که سطح GABA مغز را افزایش می‌دهد و به کیفیت خواب کمک می‌نماید.

دشت‌زاد این گیاهان را با نسبت‌هایی که حداکثر هم‌افزایی را ایجاد کند، ترکیب می‌نماید. عطر لطیف و آرام‌بخش این دمنوش از همان لحظه دم‌کشیدن، حس آرامش را در فضای خانه پراکنده می‌کند. بهترین انتخاب برای قبل از خواب یا بعد از یک روز طولانی.`,
        price_rial: 52000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 90,
        tags: ["دمنوش آرامش", "بابونه", "اسطوخودوس", "بادرنجبویه", "ضد اضطراب", "خواب"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 5, "carb_g": 1, "protein_g": 0.1, "fat_g": 0, "fiber_g": 0.5, "sugar_g": 0}},
        categoryId: catMap["damnoosh-aramesh"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2022/11/Lavender-tea-barjil-870-1.webp", alt: "دمنوش آرامش دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "damnoosh-aramesh-dashtzad-50g", calculatedPrice_rial: 26000000, price_rial: 26000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "damnoosh-aramesh-dashtzad-100g", calculatedPrice_rial: 52000000, price_rial: 52000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "damnoosh-aramesh-dashtzad-200g", calculatedPrice_rial: 104000000, price_rial: 104000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-aramesh-dashtzad-sachet" },
      create: {
        title: "دمنوش آرامش دشت‌زاد — ساشه",
        slug: "damnoosh-aramesh-dashtzad-sachet",
        latinTitle: "Tranquility Herbal Blend Sachets",
        description: `دمنوش آرامش دشت‌زاد در قالب ساشه‌های راحت، ترکیب سه‌گانه بابونه، اسطوخودوس و بادرنجبویه را در بسته‌بندی عملی ارائه می‌دهد. هر ساشه یک دوز دقیق از هر سه گیاه دارد تا بهترین تاثیر آرام‌بخشی را تجربه کنید.

ساشه‌های دشت‌زاد با فناوری بسته‌بندی آروما-لاک تهیه شده‌اند که عطر و خواص گیاه را تا لحظه باز کردن بسته‌بندی تازه نگه می‌دارد. کیفیت گیاهان درون ساشه دقیقاً همان گیاهان فله‌ای است؛ تنها شکل عرضه تفاوت دارد. برای شب‌های پرتنش، سفرهای کاری یا هر موقعیتی که آرامش را فوری نیاز دارید، این ساشه‌ها بهترین انتخاب هستند.

دشت‌زاد ایمان دارد که آرامش حق هر انسانی است؛ به همین دلیل تلاش می‌کند این تجربه را در هر شرایطی در دسترس قرار دهد.`,
        brand: "دشت‌زاد",
        price_rial: 58000000,
        offPrice_rial: 49300000,
        discountPercent: 15,
        countInStock: 110,
        tags: ["دمنوش آرامش", "ساشه", "بابونه", "اسطوخودوس", "بادرنجبویه", "خواب"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 58000000,
        categoryId: catMap["damnoosh-aramesh"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 5, "carb_g": 1, "protein_g": 0.1, "fat_g": 0, "fiber_g": 0.5, "sugar_g": 0}},
      },
      update: {
        title: "دمنوش آرامش دشت‌زاد — ساشه",
        latinTitle: "Tranquility Herbal Blend Sachets",
        description: `دمنوش آرامش دشت‌زاد در قالب ساشه‌های راحت، ترکیب سه‌گانه بابونه، اسطوخودوس و بادرنجبویه را در بسته‌بندی عملی ارائه می‌دهد. هر ساشه یک دوز دقیق از هر سه گیاه دارد تا بهترین تاثیر آرام‌بخشی را تجربه کنید.

ساشه‌های دشت‌زاد با فناوری بسته‌بندی آروما-لاک تهیه شده‌اند که عطر و خواص گیاه را تا لحظه باز کردن بسته‌بندی تازه نگه می‌دارد. کیفیت گیاهان درون ساشه دقیقاً همان گیاهان فله‌ای است؛ تنها شکل عرضه تفاوت دارد. برای شب‌های پرتنش، سفرهای کاری یا هر موقعیتی که آرامش را فوری نیاز دارید، این ساشه‌ها بهترین انتخاب هستند.

دشت‌زاد ایمان دارد که آرامش حق هر انسانی است؛ به همین دلیل تلاش می‌کند این تجربه را در هر شرایطی در دسترس قرار دهد.`,
        price_rial: 58000000,
        offPrice_rial: 49300000,
        discountPercent: 15,
        countInStock: 110,
        tags: ["دمنوش آرامش", "ساشه", "بابونه", "اسطوخودوس", "بادرنجبویه", "خواب"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 5, "carb_g": 1, "protein_g": 0.1, "fat_g": 0, "fiber_g": 0.5, "sugar_g": 0}},
        categoryId: catMap["damnoosh-aramesh"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2022/11/Lavender-tea-barjil-870-1.webp", alt: "دمنوش آرامش دشت‌زاد — ساشه", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 10, gramValue: 10, weightUnit: "GRAM", sku: "damnoosh-aramesh-dashtzad-sachet-10g", calculatedPrice_rial: 5800000, price_rial: 5800000, offPrice_rial: 4930000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 20, gramValue: 20, weightUnit: "GRAM", sku: "damnoosh-aramesh-dashtzad-sachet-20g", calculatedPrice_rial: 11600000, price_rial: 11600000, offPrice_rial: 9860000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 40, gramValue: 40, weightUnit: "GRAM", sku: "damnoosh-aramesh-dashtzad-sachet-40g", calculatedPrice_rial: 23200000, price_rial: 23200000, offPrice_rial: 19720000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-zibai-dashtzad" },
      create: {
        title: "دمنوش زیبایی دشت‌زاد",
        slug: "damnoosh-zibai-dashtzad",
        latinTitle: "Beauty Herbal Blend",
        description: `دمنوش زیبایی دشت‌زاد، رازی است از دل طبیعت برای پوستی شاداب و درخشان. این ترکیب سه‌گانه از میوه رُز هیپ (نسترن)، گل هیبیسکوس و گل یاسمن، یک ترکیب قدرتمند آنتی‌اکسیدانی می‌سازد که از درون به پوست شما جوانی می‌بخشد.

روز هیپ با محتوای ویتامین C که ده برابر پرتقال است، کلاژن‌سازی پوست را تقویت می‌کند و لک‌ها را کاهش می‌دهد. گل هیبیسکوس حاوی اسیدهای هیدروکسی است که پوست را از اثرات رادیکال‌های آزاد محافظت می‌کند. یاسمن با ترکیبات معطر و ضدالتهابی‌اش، التهاب پوست را کاهش داده و تجربه نوشیدن را به یک لذت حسی تبدیل می‌کند.

دشت‌زاد با ایمان به زیبایی طبیعی، این ترکیب را به‌عنوان بخشی از روتین مراقبتی روزانه شما پیشنهاد می‌دهد. رنگ صورتی-قرمز دلنشین این دمنوش در فنجان، خود نوید زیبایی را می‌دهد. مصرف روزانه این دمنوش در کنار تغذیه سالم، به درخشش پوست شما کمک می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 55000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 70,
        tags: ["دمنوش زیبایی", "روز هیپ", "یاسمن", "پوست", "آنتی اکسیدان", "کلاژن"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 55000000,
        categoryId: catMap["damnoosh-zibai"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 162, "carb_g": 38.2, "protein_g": 1.6, "fat_g": 0.6, "fiber_g": 24.1, "sugar_g": 2.6}},
      },
      update: {
        title: "دمنوش زیبایی دشت‌زاد",
        latinTitle: "Beauty Herbal Blend",
        description: `دمنوش زیبایی دشت‌زاد، رازی است از دل طبیعت برای پوستی شاداب و درخشان. این ترکیب سه‌گانه از میوه رُز هیپ (نسترن)، گل هیبیسکوس و گل یاسمن، یک ترکیب قدرتمند آنتی‌اکسیدانی می‌سازد که از درون به پوست شما جوانی می‌بخشد.

روز هیپ با محتوای ویتامین C که ده برابر پرتقال است، کلاژن‌سازی پوست را تقویت می‌کند و لک‌ها را کاهش می‌دهد. گل هیبیسکوس حاوی اسیدهای هیدروکسی است که پوست را از اثرات رادیکال‌های آزاد محافظت می‌کند. یاسمن با ترکیبات معطر و ضدالتهابی‌اش، التهاب پوست را کاهش داده و تجربه نوشیدن را به یک لذت حسی تبدیل می‌کند.

دشت‌زاد با ایمان به زیبایی طبیعی، این ترکیب را به‌عنوان بخشی از روتین مراقبتی روزانه شما پیشنهاد می‌دهد. رنگ صورتی-قرمز دلنشین این دمنوش در فنجان، خود نوید زیبایی را می‌دهد. مصرف روزانه این دمنوش در کنار تغذیه سالم، به درخشش پوست شما کمک می‌کند.`,
        price_rial: 55000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 70,
        tags: ["دمنوش زیبایی", "روز هیپ", "یاسمن", "پوست", "آنتی اکسیدان", "کلاژن"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 162, "carb_g": 38.2, "protein_g": 1.6, "fat_g": 0.6, "fiber_g": 24.1, "sugar_g": 2.6}},
        categoryId: catMap["damnoosh-zibai"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/dried-_rose_-petals_barjil_96-1.webp", alt: "دمنوش زیبایی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "damnoosh-zibai-dashtzad-50g", calculatedPrice_rial: 27500000, price_rial: 27500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "damnoosh-zibai-dashtzad-100g", calculatedPrice_rial: 55000000, price_rial: 55000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "damnoosh-zibai-dashtzad-200g", calculatedPrice_rial: 110000000, price_rial: 110000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-zibai-dashtzad-sachet" },
      create: {
        title: "دمنوش زیبایی دشت‌زاد — ساشه",
        slug: "damnoosh-zibai-dashtzad-sachet",
        latinTitle: "Beauty Herbal Blend Sachets",
        description: `دمنوش زیبایی دشت‌زاد در قالب ساشه‌های مجلل، ترکیب روز هیپ، هیبیسکوس و یاسمن را در دسترس روزانه شما قرار می‌دهد. این ساشه‌ها برای کسانی طراحی شده‌اند که زیبایی را به‌عنوان یک سبک زندگی می‌بینند، نه فقط یک عادت.

هر ساشه را می‌توان در آب ۸۰ تا ۹۰ درجه دم‌کرد تا بهترین ویتامین C و آنتی‌اکسیدان‌های آن استخراج شوند. دمنوش زیبایی دشت‌زاد ساشه، همراه کیف لوازم آرایشی شما در سفرها، محیط کار یا حتی سالن زیبایی مورد استقبال قرار می‌گیرد.

به یاد داشته باشید که زیبایی پایدار از درون می‌آید؛ دشت‌زاد در کنار شماست تا این مسیر را شیرین‌تر کند. رنگ صورتی لطیف این دمنوش در فنجان، همراه‌ترین یادآور مراقبت از خود است.`,
        brand: "دشت‌زاد",
        price_rial: 60000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 65,
        tags: ["دمنوش زیبایی", "ساشه", "روز هیپ", "یاسمن", "پوست", "کلاژن"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 60000000,
        categoryId: catMap["damnoosh-zibai"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 162, "carb_g": 38.2, "protein_g": 1.6, "fat_g": 0.6, "fiber_g": 24.1, "sugar_g": 2.6}},
      },
      update: {
        title: "دمنوش زیبایی دشت‌زاد — ساشه",
        latinTitle: "Beauty Herbal Blend Sachets",
        description: `دمنوش زیبایی دشت‌زاد در قالب ساشه‌های مجلل، ترکیب روز هیپ، هیبیسکوس و یاسمن را در دسترس روزانه شما قرار می‌دهد. این ساشه‌ها برای کسانی طراحی شده‌اند که زیبایی را به‌عنوان یک سبک زندگی می‌بینند، نه فقط یک عادت.

هر ساشه را می‌توان در آب ۸۰ تا ۹۰ درجه دم‌کرد تا بهترین ویتامین C و آنتی‌اکسیدان‌های آن استخراج شوند. دمنوش زیبایی دشت‌زاد ساشه، همراه کیف لوازم آرایشی شما در سفرها، محیط کار یا حتی سالن زیبایی مورد استقبال قرار می‌گیرد.

به یاد داشته باشید که زیبایی پایدار از درون می‌آید؛ دشت‌زاد در کنار شماست تا این مسیر را شیرین‌تر کند. رنگ صورتی لطیف این دمنوش در فنجان، همراه‌ترین یادآور مراقبت از خود است.`,
        price_rial: 60000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 65,
        tags: ["دمنوش زیبایی", "ساشه", "روز هیپ", "یاسمن", "پوست", "کلاژن"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 162, "carb_g": 38.2, "protein_g": 1.6, "fat_g": 0.6, "fiber_g": 24.1, "sugar_g": 2.6}},
        categoryId: catMap["damnoosh-zibai"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/dried-_rose_-petals_barjil_96-1.webp", alt: "دمنوش زیبایی دشت‌زاد — ساشه", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 10, gramValue: 10, weightUnit: "GRAM", sku: "damnoosh-zibai-dashtzad-sachet-10g", calculatedPrice_rial: 6000000, price_rial: 6000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 20, gramValue: 20, weightUnit: "GRAM", sku: "damnoosh-zibai-dashtzad-sachet-20g", calculatedPrice_rial: 12000000, price_rial: 12000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 40, gramValue: 40, weightUnit: "GRAM", sku: "damnoosh-zibai-dashtzad-sachet-40g", calculatedPrice_rial: 24000000, price_rial: 24000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-samzodai-dashtzad" },
      create: {
        title: "دمنوش سم‌زدایی دشت‌زاد",
        slug: "damnoosh-samzodai-dashtzad",
        latinTitle: "Detox Herbal Blend",
        description: `دمنوش سم‌زدایی دشت‌زاد، ترکیبی علمی و دقیق از گزنه، قاصدک و ماریتیغال است که به‌عنوان یکی از قوی‌ترین فرمول‌های پاکسازی طبیعی بدن شناخته می‌شود. این سه گیاه در کنار هم سیستم دفاعی کبد و کلیه را به‌شدت تقویت می‌کنند.

گزنه سرشار از کلروفیل و آهن است که خون‌سازی می‌کند و سموم را از بدن خارج می‌نماید. قاصدک (شیر قاصدک) با اینولین و آنتی‌اکسیدان‌های قوی، عملکرد کبد را بهبود می‌بخشد و جریان صفرا را افزایش می‌دهد. ماریتیغال با سیلیمارین قوی‌اش، یکی از موثرترین محافظ‌های کبد در طبیعت است.

دشت‌زاد این گیاهان را از منابع کنترل‌شده و ارگانیک تهیه کرده و با دقت فراوان ترکیب می‌نماید. مصرف این دمنوش صبح ناشتا، بیشترین تاثیر سم‌زدایی را دارد. برای پاکسازی پس از ایام جشن و تعطیلات، بهبود عملکرد کبد یا شروع یک سبک زندگی سالم‌تر، این دمنوش را انتخاب کنید.`,
        brand: "دشت‌زاد",
        price_rial: 52000000,
        offPrice_rial: 44200000,
        discountPercent: 15,
        countInStock: 55,
        tags: ["سم‌زدایی", "کبد", "گزنه", "قاصدک", "ماریتیغال", "پاکسازی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 52000000,
        categoryId: catMap["damnoosh-samzodai"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 45, "carb_g": 7.2, "protein_g": 2.7, "fat_g": 0.7, "fiber_g": 3.5, "sugar_g": 0.4}},
      },
      update: {
        title: "دمنوش سم‌زدایی دشت‌زاد",
        latinTitle: "Detox Herbal Blend",
        description: `دمنوش سم‌زدایی دشت‌زاد، ترکیبی علمی و دقیق از گزنه، قاصدک و ماریتیغال است که به‌عنوان یکی از قوی‌ترین فرمول‌های پاکسازی طبیعی بدن شناخته می‌شود. این سه گیاه در کنار هم سیستم دفاعی کبد و کلیه را به‌شدت تقویت می‌کنند.

گزنه سرشار از کلروفیل و آهن است که خون‌سازی می‌کند و سموم را از بدن خارج می‌نماید. قاصدک (شیر قاصدک) با اینولین و آنتی‌اکسیدان‌های قوی، عملکرد کبد را بهبود می‌بخشد و جریان صفرا را افزایش می‌دهد. ماریتیغال با سیلیمارین قوی‌اش، یکی از موثرترین محافظ‌های کبد در طبیعت است.

دشت‌زاد این گیاهان را از منابع کنترل‌شده و ارگانیک تهیه کرده و با دقت فراوان ترکیب می‌نماید. مصرف این دمنوش صبح ناشتا، بیشترین تاثیر سم‌زدایی را دارد. برای پاکسازی پس از ایام جشن و تعطیلات، بهبود عملکرد کبد یا شروع یک سبک زندگی سالم‌تر، این دمنوش را انتخاب کنید.`,
        price_rial: 52000000,
        offPrice_rial: 44200000,
        discountPercent: 15,
        countInStock: 55,
        tags: ["سم‌زدایی", "کبد", "گزنه", "قاصدک", "ماریتیغال", "پاکسازی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 45, "carb_g": 7.2, "protein_g": 2.7, "fat_g": 0.7, "fiber_g": 3.5, "sugar_g": 0.4}},
        categoryId: catMap["damnoosh-samzodai"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/16111-1.webp", alt: "دمنوش سم‌زدایی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "damnoosh-samzodai-dashtzad-50g", calculatedPrice_rial: 26000000, price_rial: 26000000, offPrice_rial: 22100000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "damnoosh-samzodai-dashtzad-100g", calculatedPrice_rial: 52000000, price_rial: 52000000, offPrice_rial: 44200000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "damnoosh-samzodai-dashtzad-200g", calculatedPrice_rial: 104000000, price_rial: 104000000, offPrice_rial: 88400000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-samzodai-dashtzad-sachet" },
      create: {
        title: "دمنوش سم‌زدایی دشت‌زاد — ساشه",
        slug: "damnoosh-samzodai-dashtzad-sachet",
        latinTitle: "Detox Herbal Blend Sachets",
        description: `دمنوش سم‌زدایی دشت‌زاد در قالب ساشه‌های عملی، تمام قدرت گزنه، قاصدک و ماریتیغال را در یک بسته‌بندی راحت برای شما فراهم می‌کند. هر ساشه دوز بهینه‌ای از هر سه گیاه دارد که با علم تغذیه محاسبه شده است.

برای شروع یک روتین سم‌زدایی موثر، دشت‌زاد توصیه می‌کند صبح ناشتا یک ساشه را در آب ۹۰ درجه ۱۰ دقیقه دم کنید. این عادت ساده، کبد شما را در شروع هر روز فعال و پاک نگه می‌دارد. ساشه‌های دشت‌زاد با فناوری فیلتر دو جداره طراحی شده‌اند که گیاهان آسیاب‌شده را کاملاً در خود نگه می‌دارند و دمنوشی شفاف و بدون ته‌نشین می‌سازند.`,
        brand: "دشت‌زاد",
        price_rial: 58000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 75,
        tags: ["سم‌زدایی", "ساشه", "کبد", "گزنه", "قاصدک", "ماریتیغال"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 58000000,
        categoryId: catMap["damnoosh-samzodai"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 45, "carb_g": 7.2, "protein_g": 2.7, "fat_g": 0.7, "fiber_g": 3.5, "sugar_g": 0.4}},
      },
      update: {
        title: "دمنوش سم‌زدایی دشت‌زاد — ساشه",
        latinTitle: "Detox Herbal Blend Sachets",
        description: `دمنوش سم‌زدایی دشت‌زاد در قالب ساشه‌های عملی، تمام قدرت گزنه، قاصدک و ماریتیغال را در یک بسته‌بندی راحت برای شما فراهم می‌کند. هر ساشه دوز بهینه‌ای از هر سه گیاه دارد که با علم تغذیه محاسبه شده است.

برای شروع یک روتین سم‌زدایی موثر، دشت‌زاد توصیه می‌کند صبح ناشتا یک ساشه را در آب ۹۰ درجه ۱۰ دقیقه دم کنید. این عادت ساده، کبد شما را در شروع هر روز فعال و پاک نگه می‌دارد. ساشه‌های دشت‌زاد با فناوری فیلتر دو جداره طراحی شده‌اند که گیاهان آسیاب‌شده را کاملاً در خود نگه می‌دارند و دمنوشی شفاف و بدون ته‌نشین می‌سازند.`,
        price_rial: 58000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 75,
        tags: ["سم‌زدایی", "ساشه", "کبد", "گزنه", "قاصدک", "ماریتیغال"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 45, "carb_g": 7.2, "protein_g": 2.7, "fat_g": 0.7, "fiber_g": 3.5, "sugar_g": 0.4}},
        categoryId: catMap["damnoosh-samzodai"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/16111-1.webp", alt: "دمنوش سم‌زدایی دشت‌زاد — ساشه", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 10, gramValue: 10, weightUnit: "GRAM", sku: "damnoosh-samzodai-dashtzad-sachet-10g", calculatedPrice_rial: 5800000, price_rial: 5800000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 20, gramValue: 20, weightUnit: "GRAM", sku: "damnoosh-samzodai-dashtzad-sachet-20g", calculatedPrice_rial: 11600000, price_rial: 11600000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 40, gramValue: 40, weightUnit: "GRAM", sku: "damnoosh-samzodai-dashtzad-sachet-40g", calculatedPrice_rial: 23200000, price_rial: 23200000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-shadi-dashtzad" },
      create: {
        title: "دمنوش شادی دشت‌زاد",
        slug: "damnoosh-shadi-dashtzad",
        latinTitle: "Joy Herbal Blend",
        description: `دمنوش شادی دشت‌زاد، ترکیبی از علم گیاه‌شناسی و هنر ایجاد شادمانی است. این دمنوش از سه گیاه قوی در مقابله با افسردگی خفیف و افزایش شادی تشکیل شده: هایپریکوم (چای کوه)، بادرنجبویه و گل بهارنارنج.

هایپریکوم یا گل سنت جان، با هایپریسین و هایپرفورین خود، عملاً به‌عنوان یک ضدافسردگی طبیعی عمل می‌کند و سطح سروتونین مغز را بهبود می‌بخشد. بادرنجبویه با اسید روزمارینیک و فلاونوئیدها، استرس را کاهش داده و حس رفاه را تقویت می‌نماید. گل بهارنارنج با نرینجین و هسپریدین، اثرات آرام‌بخشی ملایم و افزایش خلق مثبت دارد.

دشت‌زاد این دمنوش را برای کسانی ساخته که می‌خواهند شادی را از طبیعت بگیرند. مصرف منظم این دمنوش در دوره‌های کمبود نور خورشید، پائیز و زمستان، می‌تواند تفاوت محسوسی در کیفیت زندگی ایجاد کند. با دشت‌زاد، شادی در فنجان شماست.`,
        brand: "دشت‌زاد",
        price_rial: 53000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 80,
        tags: ["دمنوش شادی", "ضدافسردگی طبیعی", "هایپریکوم", "بادرنجبویه", "بهارنارنج", "خلق مثبت"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 53000000,
        categoryId: catMap["damnoosh-shadi"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 15, "carb_g": 2.8, "protein_g": 0.4, "fat_g": 0.1, "fiber_g": 1.8, "sugar_g": 0}},
      },
      update: {
        title: "دمنوش شادی دشت‌زاد",
        latinTitle: "Joy Herbal Blend",
        description: `دمنوش شادی دشت‌زاد، ترکیبی از علم گیاه‌شناسی و هنر ایجاد شادمانی است. این دمنوش از سه گیاه قوی در مقابله با افسردگی خفیف و افزایش شادی تشکیل شده: هایپریکوم (چای کوه)، بادرنجبویه و گل بهارنارنج.

هایپریکوم یا گل سنت جان، با هایپریسین و هایپرفورین خود، عملاً به‌عنوان یک ضدافسردگی طبیعی عمل می‌کند و سطح سروتونین مغز را بهبود می‌بخشد. بادرنجبویه با اسید روزمارینیک و فلاونوئیدها، استرس را کاهش داده و حس رفاه را تقویت می‌نماید. گل بهارنارنج با نرینجین و هسپریدین، اثرات آرام‌بخشی ملایم و افزایش خلق مثبت دارد.

دشت‌زاد این دمنوش را برای کسانی ساخته که می‌خواهند شادی را از طبیعت بگیرند. مصرف منظم این دمنوش در دوره‌های کمبود نور خورشید، پائیز و زمستان، می‌تواند تفاوت محسوسی در کیفیت زندگی ایجاد کند. با دشت‌زاد، شادی در فنجان شماست.`,
        price_rial: 53000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 80,
        tags: ["دمنوش شادی", "ضدافسردگی طبیعی", "هایپریکوم", "بادرنجبویه", "بهارنارنج", "خلق مثبت"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 15, "carb_g": 2.8, "protein_g": 0.4, "fat_g": 0.1, "fiber_g": 1.8, "sugar_g": 0}},
        categoryId: catMap["damnoosh-shadi"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2022/11/pleasant-mood-herba-tea-barjil-861-9.webp", alt: "دمنوش شادی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "damnoosh-shadi-dashtzad-50g", calculatedPrice_rial: 26500000, price_rial: 26500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "damnoosh-shadi-dashtzad-100g", calculatedPrice_rial: 53000000, price_rial: 53000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "damnoosh-shadi-dashtzad-200g", calculatedPrice_rial: 106000000, price_rial: 106000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-shadi-dashtzad-sachet" },
      create: {
        title: "دمنوش شادی دشت‌زاد — ساشه",
        slug: "damnoosh-shadi-dashtzad-sachet",
        latinTitle: "Joy Herbal Blend Sachets",
        description: `دمنوش شادی دشت‌زاد در قالب ساشه‌های زیبا، سه‌گانه هایپریکوم، بادرنجبویه و گل بهارنارنج را در دسترس روزانه‌تان قرار می‌دهد. این ساشه‌ها برای شروع صبح‌های روشن طراحی شده‌اند؛ یک ساشه در اولین فنجان روز می‌تواند تن و خلق شما را در مسیر مثبت هدایت کند.

دشت‌زاد برای حفظ حداکثر تاثیر هایپریکوم، گیاهان را در دمای پایین خشک کرده و در ساشه‌های مقاوم به نور بسته‌بندی می‌کند. رنگ زرد-نارنجی دلنشین این دمنوش در فنجان، خودش نوید روز شادی را می‌دهد.

به یاد داشته باشید که اگر داروی ضدافسردگی مصرف می‌کنید، پیش از مصرف هایپریکوم با پزشک خود مشورت کنید. دشت‌زاد سلامت شما را در اولویت قرار می‌دهد.`,
        brand: "دشت‌زاد",
        price_rial: 58000000,
        offPrice_rial: 49300000,
        discountPercent: 15,
        countInStock: 90,
        tags: ["دمنوش شادی", "ساشه", "هایپریکوم", "بادرنجبویه", "خلق مثبت"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 58000000,
        categoryId: catMap["damnoosh-shadi"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 15, "carb_g": 2.8, "protein_g": 0.4, "fat_g": 0.1, "fiber_g": 1.8, "sugar_g": 0}},
      },
      update: {
        title: "دمنوش شادی دشت‌زاد — ساشه",
        latinTitle: "Joy Herbal Blend Sachets",
        description: `دمنوش شادی دشت‌زاد در قالب ساشه‌های زیبا، سه‌گانه هایپریکوم، بادرنجبویه و گل بهارنارنج را در دسترس روزانه‌تان قرار می‌دهد. این ساشه‌ها برای شروع صبح‌های روشن طراحی شده‌اند؛ یک ساشه در اولین فنجان روز می‌تواند تن و خلق شما را در مسیر مثبت هدایت کند.

دشت‌زاد برای حفظ حداکثر تاثیر هایپریکوم، گیاهان را در دمای پایین خشک کرده و در ساشه‌های مقاوم به نور بسته‌بندی می‌کند. رنگ زرد-نارنجی دلنشین این دمنوش در فنجان، خودش نوید روز شادی را می‌دهد.

به یاد داشته باشید که اگر داروی ضدافسردگی مصرف می‌کنید، پیش از مصرف هایپریکوم با پزشک خود مشورت کنید. دشت‌زاد سلامت شما را در اولویت قرار می‌دهد.`,
        price_rial: 58000000,
        offPrice_rial: 49300000,
        discountPercent: 15,
        countInStock: 90,
        tags: ["دمنوش شادی", "ساشه", "هایپریکوم", "بادرنجبویه", "خلق مثبت"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 15, "carb_g": 2.8, "protein_g": 0.4, "fat_g": 0.1, "fiber_g": 1.8, "sugar_g": 0}},
        categoryId: catMap["damnoosh-shadi"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2022/11/pleasant-mood-herba-tea-barjil-861-9.webp", alt: "دمنوش شادی دشت‌زاد — ساشه", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 10, gramValue: 10, weightUnit: "GRAM", sku: "damnoosh-shadi-dashtzad-sachet-10g", calculatedPrice_rial: 5800000, price_rial: 5800000, offPrice_rial: 4930000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 20, gramValue: 20, weightUnit: "GRAM", sku: "damnoosh-shadi-dashtzad-sachet-20g", calculatedPrice_rial: 11600000, price_rial: 11600000, offPrice_rial: 9860000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 40, gramValue: 40, weightUnit: "GRAM", sku: "damnoosh-shadi-dashtzad-sachet-40g", calculatedPrice_rial: 23200000, price_rial: 23200000, offPrice_rial: 19720000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-tabestan-dashtzad" },
      create: {
        title: "دمنوش تابستان دشت‌زاد",
        slug: "damnoosh-tabestan-dashtzad",
        latinTitle: "Summer Herbal Blend",
        description: `دمنوش تابستان دشت‌زاد، نوشیدنی تابستانه‌ای است که از ترکیب نعناع سبز، لیمو ترش و چای ترش ساخته شده و هم گرم و هم سرد (آیس‌تی) فوق‌العاده است. این دمنوش را به‌عنوان بهترین جایگزین نوشابه‌ها و نوشیدنی‌های مصنوعی در فصل گرما توصیه می‌کنیم.

نعناع سبز با منتولش خنکی فوری در دهان ایجاد می‌کند و احساس تشنگی را کاهش می‌دهد. لیمو ترش سرشار از ویتامین C و اسید سیتریک است که کمک می‌کند بدن در گرما بهتر هیدراته بماند. چای ترش با رنگ قرمز پرجذبه و طعم ترش‌مزه‌اش، نوشیدنی را تازه و دلنشین می‌کند.

دشت‌زاد توصیه می‌کند این دمنوش را به‌صورت کنسانتره دم کنید و روی یخ بریزید تا یک آیس‌تی طبیعی و خوشمزه برای تمام خانواده داشته باشید. بدون شکر افزوده، بدون رنگ مصنوعی، کاملاً طبیعی. تابستان امسال را با دشت‌زاد تازه‌تر زندگی کنید.`,
        brand: "دشت‌زاد",
        price_rial: 48000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 100,
        tags: ["دمنوش تابستان", "نعناع", "لیمو", "آیس‌تی", "تازگی", "ضدتشنگی"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 48000000,
        categoryId: catMap["damnoosh-tabestan"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 25, "carb_g": 5.5, "protein_g": 0.3, "fat_g": 0.1, "fiber_g": 2, "sugar_g": 1.5}},
      },
      update: {
        title: "دمنوش تابستان دشت‌زاد",
        latinTitle: "Summer Herbal Blend",
        description: `دمنوش تابستان دشت‌زاد، نوشیدنی تابستانه‌ای است که از ترکیب نعناع سبز، لیمو ترش و چای ترش ساخته شده و هم گرم و هم سرد (آیس‌تی) فوق‌العاده است. این دمنوش را به‌عنوان بهترین جایگزین نوشابه‌ها و نوشیدنی‌های مصنوعی در فصل گرما توصیه می‌کنیم.

نعناع سبز با منتولش خنکی فوری در دهان ایجاد می‌کند و احساس تشنگی را کاهش می‌دهد. لیمو ترش سرشار از ویتامین C و اسید سیتریک است که کمک می‌کند بدن در گرما بهتر هیدراته بماند. چای ترش با رنگ قرمز پرجذبه و طعم ترش‌مزه‌اش، نوشیدنی را تازه و دلنشین می‌کند.

دشت‌زاد توصیه می‌کند این دمنوش را به‌صورت کنسانتره دم کنید و روی یخ بریزید تا یک آیس‌تی طبیعی و خوشمزه برای تمام خانواده داشته باشید. بدون شکر افزوده، بدون رنگ مصنوعی، کاملاً طبیعی. تابستان امسال را با دشت‌زاد تازه‌تر زندگی کنید.`,
        price_rial: 48000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 100,
        tags: ["دمنوش تابستان", "نعناع", "لیمو", "آیس‌تی", "تازگی", "ضدتشنگی"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 25, "carb_g": 5.5, "protein_g": 0.3, "fat_g": 0.1, "fiber_g": 2, "sugar_g": 1.5}},
        categoryId: catMap["damnoosh-tabestan"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/16101-1.webp", alt: "دمنوش تابستان دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 50, gramValue: 50, weightUnit: "GRAM", sku: "damnoosh-tabestan-dashtzad-50g", calculatedPrice_rial: 24000000, price_rial: 24000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "damnoosh-tabestan-dashtzad-100g", calculatedPrice_rial: 48000000, price_rial: 48000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 200, gramValue: 200, weightUnit: "GRAM", sku: "damnoosh-tabestan-dashtzad-200g", calculatedPrice_rial: 96000000, price_rial: 96000000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "damnoosh-tabestan-dashtzad-sachet" },
      create: {
        title: "دمنوش تابستان دشت‌زاد — ساشه",
        slug: "damnoosh-tabestan-dashtzad-sachet",
        latinTitle: "Summer Herbal Blend Sachets",
        description: `دمنوش تابستان دشت‌زاد در قالب ساشه‌های راحت، ترکیب نعناع سبز، لیمو و چای ترش را برای لحظه‌های تابستانی آماده دارد. این ساشه‌ها برای درست کردن سریع یک نوشیدنی خنک و طبیعی ایده‌آل هستند؛ کافی است ساشه را ۵ دقیقه در آب داغ دم کنید، بگذارید خنک شود و روی یخ بریزید.

برای بهترین آیس‌تی، دشت‌زاد توصیه می‌کند آب را دو برابر حجم معمول کم کنید (کنسانتره بگیرید) و سپس روی یخ بریزید تا رقیق شود. می‌توانید با مقداری عسل یا آب لیمو تازه طعم‌اش را حتی بهتر کنید.

ساشه‌های تابستان دشت‌زاد بهترین همراه مهمانی‌های تابستانه، پیک‌نیک و مجالس خانوادگی هستند. در جعبه‌های هدیه نیز عرضه می‌شود — ایده هدیه‌ای متفاوت و باکیفیت برای دوستانتان.`,
        brand: "دشت‌زاد",
        price_rial: 53000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 120,
        tags: ["دمنوش تابستان", "ساشه", "نعناع", "لیمو", "آیس‌تی", "هدیه"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 53000000,
        categoryId: catMap["damnoosh-tabestan"] ?? catMap["damnoosh-tarkibi"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 25, "carb_g": 5.5, "protein_g": 0.3, "fat_g": 0.1, "fiber_g": 2, "sugar_g": 1.5}},
      },
      update: {
        title: "دمنوش تابستان دشت‌زاد — ساشه",
        latinTitle: "Summer Herbal Blend Sachets",
        description: `دمنوش تابستان دشت‌زاد در قالب ساشه‌های راحت، ترکیب نعناع سبز، لیمو و چای ترش را برای لحظه‌های تابستانی آماده دارد. این ساشه‌ها برای درست کردن سریع یک نوشیدنی خنک و طبیعی ایده‌آل هستند؛ کافی است ساشه را ۵ دقیقه در آب داغ دم کنید، بگذارید خنک شود و روی یخ بریزید.

برای بهترین آیس‌تی، دشت‌زاد توصیه می‌کند آب را دو برابر حجم معمول کم کنید (کنسانتره بگیرید) و سپس روی یخ بریزید تا رقیق شود. می‌توانید با مقداری عسل یا آب لیمو تازه طعم‌اش را حتی بهتر کنید.

ساشه‌های تابستان دشت‌زاد بهترین همراه مهمانی‌های تابستانه، پیک‌نیک و مجالس خانوادگی هستند. در جعبه‌های هدیه نیز عرضه می‌شود — ایده هدیه‌ای متفاوت و باکیفیت برای دوستانتان.`,
        price_rial: 53000000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 120,
        tags: ["دمنوش تابستان", "ساشه", "نعناع", "لیمو", "آیس‌تی", "هدیه"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 25, "carb_g": 5.5, "protein_g": 0.3, "fat_g": 0.1, "fiber_g": 2, "sugar_g": 1.5}},
        categoryId: catMap["damnoosh-tabestan"] ?? catMap["damnoosh-tarkibi"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/16101-1.webp", alt: "دمنوش تابستان دشت‌زاد — ساشه", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 10, gramValue: 10, weightUnit: "GRAM", sku: "damnoosh-tabestan-dashtzad-sachet-10g", calculatedPrice_rial: 5300000, price_rial: 5300000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 20, gramValue: 20, weightUnit: "GRAM", sku: "damnoosh-tabestan-dashtzad-sachet-20g", calculatedPrice_rial: 10600000, price_rial: 10600000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 40, gramValue: 40, weightUnit: "GRAM", sku: "damnoosh-tabestan-dashtzad-sachet-40g", calculatedPrice_rial: 21200000, price_rial: 21200000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "piste-akbari-bereshteh-zafrani-dashtzad" },
      create: {
        title: "پسته اکبری برشته زعفرانی دشت‌زاد",
        slug: "piste-akbari-bereshteh-zafrani-dashtzad",
        latinTitle: "Dashtzad Saffron Roasted Akbari Pistachio",
        description: `پسته اکبری دشت‌زاد، شاهکاری از دل باغ‌های سرسبز رفسنجان — قلب طلایی کشت پسته ایران. این پسته با دانه‌های بلند، پر و بدون ترک، از میان بهترین باغ‌های استان کرمان انتخاب شده و با روش برشته‌کاری دو آتشه دشت‌زاد، عطر زعفران اصیل ایرانی را در هر دانه به خاطره‌ای فراموش‌نشدنی تبدیل می‌کند. پوسته‌ای نازک، رنگ سبز پررنگ مغز، و طعم خوش‌بوی زعفران — این سه‌گانه طلایی، پسته اکبری دشت‌زاد را از هر رقیبی متمایز می‌سازد. پسته سرشار از پروتئین گیاهی، فیبر محلول، آنتی‌اکسیدان‌های قوی مانند لوتئین و زآگزانتین، و اسیدهای چرب غیراشباع است که به سلامت قلب، کاهش کلسترول بد، و تقویت بینایی کمک می‌کند. هر بار که جعبه دشت‌زاد را باز می‌کنید، عطری اشتهاآور در فضا می‌پیچد که نشانه تازگی و کیفیت برتر است. مناسب برای پذیرایی مجالس، هدیه دادن، و میان‌وعده‌ای سالم در طول روز. بسته‌بندی بهداشتی دشت‌زاد تازگی محصول را تا لحظه مصرف حفظ می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 37250000,
        offPrice_rial: 33500000,
        discountPercent: 10,
        countInStock: 85,
        tags: ["پسته اکبری", "زعفران", "برشته", "رفسنجان", "premium"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 37250000,
        categoryId: catMap["piste"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 562, "carb_g": 27.5, "protein_g": 20.2, "fat_g": 45.3, "fiber_g": 10.6, "sugar_g": 7.7}},
      },
      update: {
        title: "پسته اکبری برشته زعفرانی دشت‌زاد",
        latinTitle: "Dashtzad Saffron Roasted Akbari Pistachio",
        description: `پسته اکبری دشت‌زاد، شاهکاری از دل باغ‌های سرسبز رفسنجان — قلب طلایی کشت پسته ایران. این پسته با دانه‌های بلند، پر و بدون ترک، از میان بهترین باغ‌های استان کرمان انتخاب شده و با روش برشته‌کاری دو آتشه دشت‌زاد، عطر زعفران اصیل ایرانی را در هر دانه به خاطره‌ای فراموش‌نشدنی تبدیل می‌کند. پوسته‌ای نازک، رنگ سبز پررنگ مغز، و طعم خوش‌بوی زعفران — این سه‌گانه طلایی، پسته اکبری دشت‌زاد را از هر رقیبی متمایز می‌سازد. پسته سرشار از پروتئین گیاهی، فیبر محلول، آنتی‌اکسیدان‌های قوی مانند لوتئین و زآگزانتین، و اسیدهای چرب غیراشباع است که به سلامت قلب، کاهش کلسترول بد، و تقویت بینایی کمک می‌کند. هر بار که جعبه دشت‌زاد را باز می‌کنید، عطری اشتهاآور در فضا می‌پیچد که نشانه تازگی و کیفیت برتر است. مناسب برای پذیرایی مجالس، هدیه دادن، و میان‌وعده‌ای سالم در طول روز. بسته‌بندی بهداشتی دشت‌زاد تازگی محصول را تا لحظه مصرف حفظ می‌کند.`,
        price_rial: 37250000,
        offPrice_rial: 33500000,
        discountPercent: 10,
        countInStock: 85,
        tags: ["پسته اکبری", "زعفران", "برشته", "رفسنجان", "premium"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 562, "carb_g": 27.5, "protein_g": 20.2, "fat_g": 45.3, "fiber_g": 10.6, "sugar_g": 7.7}},
        categoryId: catMap["piste"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/06/high-quality-roasted-saffron-akbari-pistachios-barjil-134-1.webp", alt: "پسته اکبری برشته زعفرانی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "piste-akbari-bereshteh-zafrani-dashtzad-100g", calculatedPrice_rial: 37250000, price_rial: 37250000, offPrice_rial: 33500000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "piste-akbari-bereshteh-zafrani-dashtzad-250g", calculatedPrice_rial: 93120000, price_rial: 93120000, offPrice_rial: 83750000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "piste-akbari-bereshteh-zafrani-dashtzad-500g", calculatedPrice_rial: 176940000, price_rial: 176940000, offPrice_rial: 159120000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "piste-akbari-bereshteh-zafrani-dashtzad-1000g", calculatedPrice_rial: 335250000, price_rial: 335250000, offPrice_rial: 301500000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "piste-ahmadaghaei-kham-dashtzad" },
      create: {
        title: "پسته احمدآقایی خام دشت‌زاد",
        slug: "piste-ahmadaghaei-kham-dashtzad",
        latinTitle: "Dashtzad Raw Ahmad Aghaei Pistachio",
        description: `پسته احمدآقایی دشت‌زاد، یکی از ارزشمندترین واریته‌های پسته ایرانی است که با دانه‌های کشیده و بلند، مغز سبز پررنگ، و طعمی شیرین و ملایم شناخته می‌شود. این پسته بدون هیچ فرآیند حرارتی، به صورت خام و تازه عرضه می‌شود تا تمام مواد مغذی طبیعی آن دست‌نخورده باقی بماند. باغداران منتخب دشت‌زاد در منطقه رفسنجان این پسته را با روش‌های سنتی و پایدار پرورش می‌دهند و ما آن را پس از چیدن، سریعاً فرآوری و بسته‌بندی می‌کنیم. پسته احمدآقایی دشت‌زاد غنی از ویتامین B6، پتاسیم، منیزیم و آنتی‌اکسیدان‌های قوی است. مصرف منظم این پسته به کنترل قند خون، تقویت سیستم ایمنی و حمایت از سلامت سیستم عصبی کمک می‌کند. برای مصرف مستقیم، تهیه شیرینی‌های خانگی، و افزودن به انواع دسر ایده‌آل است. بسته‌بندی ویژه دشت‌زاد با قابلیت آب‌بندی مجدد، تازگی را برای مدت طولانی حفظ می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 29150000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 62,
        tags: ["پسته احمدآقایی", "خام", "ارگانیک", "رفسنجان", "pistachio"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 29150000,
        categoryId: catMap["piste"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 558, "carb_g": 28, "protein_g": 20.6, "fat_g": 44.4, "fiber_g": 10.3, "sugar_g": 7.9}},
      },
      update: {
        title: "پسته احمدآقایی خام دشت‌زاد",
        latinTitle: "Dashtzad Raw Ahmad Aghaei Pistachio",
        description: `پسته احمدآقایی دشت‌زاد، یکی از ارزشمندترین واریته‌های پسته ایرانی است که با دانه‌های کشیده و بلند، مغز سبز پررنگ، و طعمی شیرین و ملایم شناخته می‌شود. این پسته بدون هیچ فرآیند حرارتی، به صورت خام و تازه عرضه می‌شود تا تمام مواد مغذی طبیعی آن دست‌نخورده باقی بماند. باغداران منتخب دشت‌زاد در منطقه رفسنجان این پسته را با روش‌های سنتی و پایدار پرورش می‌دهند و ما آن را پس از چیدن، سریعاً فرآوری و بسته‌بندی می‌کنیم. پسته احمدآقایی دشت‌زاد غنی از ویتامین B6، پتاسیم، منیزیم و آنتی‌اکسیدان‌های قوی است. مصرف منظم این پسته به کنترل قند خون، تقویت سیستم ایمنی و حمایت از سلامت سیستم عصبی کمک می‌کند. برای مصرف مستقیم، تهیه شیرینی‌های خانگی، و افزودن به انواع دسر ایده‌آل است. بسته‌بندی ویژه دشت‌زاد با قابلیت آب‌بندی مجدد، تازگی را برای مدت طولانی حفظ می‌کند.`,
        price_rial: 29150000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 62,
        tags: ["پسته احمدآقایی", "خام", "ارگانیک", "رفسنجان", "pistachio"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 558, "carb_g": 28, "protein_g": 20.6, "fat_g": 44.4, "fiber_g": 10.3, "sugar_g": 7.9}},
        categoryId: catMap["piste"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2024/09/organic-raw-ahmad-aghaei-pistachio-barjil-1266-1.webp", alt: "پسته احمدآقایی خام دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "piste-ahmadaghaei-kham-dashtzad-100g", calculatedPrice_rial: 29150000, price_rial: 29150000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "piste-ahmadaghaei-kham-dashtzad-250g", calculatedPrice_rial: 72880000, price_rial: 72880000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "piste-ahmadaghaei-kham-dashtzad-500g", calculatedPrice_rial: 138460000, price_rial: 138460000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "piste-ahmadaghaei-kham-dashtzad-1000g", calculatedPrice_rial: 262350000, price_rial: 262350000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "piste-kalleh-quchi-bereshteh-dashtzad" },
      create: {
        title: "پسته کله‌قوچی برشته دشت‌زاد",
        slug: "piste-kalleh-quchi-bereshteh-dashtzad",
        latinTitle: "Dashtzad Roasted Ram-Head Pistachio",
        description: `پسته کله‌قوچی دشت‌زاد با فرم گرد و منحصربه‌فرد خود، از دیرباز نماد کیفیت و اصالت پسته ایرانی بوده است. این واریته نادر که به خاطر شکل خاص و شباهت به سر قوچ نامش را گرفته، دانه‌هایی درشت، مغزی کرم رنگ با طعمی بسیار شیرین دارد. دشت‌زاد این پسته را از بهترین باغ‌های کرمان تهیه می‌کند و با دمای کنترل‌شده برشته می‌دهد تا طعم طبیعی شیرین آن حفظ شود. پسته کله‌قوچی دشت‌زاد سرشار از چربی‌های سالم، پروتئین کامل و فیبر بالا است که احساس سیری طولانی‌مدت ایجاد می‌کند. این پسته به دلیل اندازه بزرگ دانه‌ها، برای پذیرایی‌های ویژه و جلسات مهم انتخاب اول است. با هر لقمه، از طعم اصیل ایرانی لذت ببرید — تجربه‌ای که فقط دشت‌زاد می‌تواند برایتان رقم بزند.`,
        brand: "دشت‌زاد",
        price_rial: 36220000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 48,
        tags: ["پسته کله‌قوچی", "برشته", "کرمان", "ممتاز", "pistachio"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 36220000,
        categoryId: catMap["piste"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 560, "carb_g": 27.2, "protein_g": 20, "fat_g": 45.8, "fiber_g": 10.3, "sugar_g": 8}},
      },
      update: {
        title: "پسته کله‌قوچی برشته دشت‌زاد",
        latinTitle: "Dashtzad Roasted Ram-Head Pistachio",
        description: `پسته کله‌قوچی دشت‌زاد با فرم گرد و منحصربه‌فرد خود، از دیرباز نماد کیفیت و اصالت پسته ایرانی بوده است. این واریته نادر که به خاطر شکل خاص و شباهت به سر قوچ نامش را گرفته، دانه‌هایی درشت، مغزی کرم رنگ با طعمی بسیار شیرین دارد. دشت‌زاد این پسته را از بهترین باغ‌های کرمان تهیه می‌کند و با دمای کنترل‌شده برشته می‌دهد تا طعم طبیعی شیرین آن حفظ شود. پسته کله‌قوچی دشت‌زاد سرشار از چربی‌های سالم، پروتئین کامل و فیبر بالا است که احساس سیری طولانی‌مدت ایجاد می‌کند. این پسته به دلیل اندازه بزرگ دانه‌ها، برای پذیرایی‌های ویژه و جلسات مهم انتخاب اول است. با هر لقمه، از طعم اصیل ایرانی لذت ببرید — تجربه‌ای که فقط دشت‌زاد می‌تواند برایتان رقم بزند.`,
        price_rial: 36220000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 48,
        tags: ["پسته کله‌قوچی", "برشته", "کرمان", "ممتاز", "pistachio"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 560, "carb_g": 27.2, "protein_g": 20, "fat_g": 45.8, "fiber_g": 10.3, "sugar_g": 8}},
        categoryId: catMap["piste"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/07/unsalted-roasted-ram-head-pistachios-barjil-577-1.webp", alt: "پسته کله‌قوچی برشته دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "piste-kalleh-quchi-bereshteh-dashtzad-100g", calculatedPrice_rial: 36220000, price_rial: 36220000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "piste-kalleh-quchi-bereshteh-dashtzad-250g", calculatedPrice_rial: 90550000, price_rial: 90550000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "piste-kalleh-quchi-bereshteh-dashtzad-500g", calculatedPrice_rial: 172040000, price_rial: 172040000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "piste-kalleh-quchi-bereshteh-dashtzad-1000g", calculatedPrice_rial: 325980000, price_rial: 325980000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "fandoq-kham-irani-dashtzad" },
      create: {
        title: "فندق خام ایرانی دشت‌زاد",
        slug: "fandoq-kham-irani-dashtzad",
        latinTitle: "Dashtzad Raw Iranian Hazelnut",
        description: `فندق ایرانی دشت‌زاد، جواهری از دل جنگل‌های سرسبز شمال ایران — از منطقه‌ای که بهترین فندق‌های جهان را در دل خود پرورش می‌دهد. این فندق خام با مغزی سفید و شیری، پوستی نازک و طعمی شیرین و ملایم، برای تمام کسانی که به کیفیت اصیل اهمیت می‌دهند انتخاب ایده‌آل است. دشت‌زاد فندق را بدون هیچ افزودنی فرآوری می‌کند تا تمام روغن‌های طبیعی، ویتامین‌ها و مواد معدنی آن محفوظ بماند. فندق سرشار از ویتامین E قوی‌ترین آنتی‌اکسیدان محلول در چربی، منگنز، مس، ویتامین B6 و فولات است. مصرف منظم فندق به سلامت قلب، کاهش التهاب، تقویت سیستم عصبی و بهبود عملکرد مغز کمک می‌کند. برای مصرف مستقیم، تهیه شکلات خانگی، کیک‌ها، بستنی و انواع دسر ایرانی و اروپایی مناسب است. فندق دشت‌زاد را امتحان کنید و تفاوت کیفیت واقعی را احساس کنید.`,
        brand: "دشت‌زاد",
        price_rial: 44070000,
        offPrice_rial: 39650000,
        discountPercent: 10,
        countInStock: 70,
        tags: ["فندق خام", "ایرانی", "شمال ایران", "طبیعی", "hazelnut"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 44070000,
        categoryId: catMap["fandoq"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 628, "carb_g": 16.7, "protein_g": 15, "fat_g": 60.7, "fiber_g": 9.7, "sugar_g": 4.3}},
      },
      update: {
        title: "فندق خام ایرانی دشت‌زاد",
        latinTitle: "Dashtzad Raw Iranian Hazelnut",
        description: `فندق ایرانی دشت‌زاد، جواهری از دل جنگل‌های سرسبز شمال ایران — از منطقه‌ای که بهترین فندق‌های جهان را در دل خود پرورش می‌دهد. این فندق خام با مغزی سفید و شیری، پوستی نازک و طعمی شیرین و ملایم، برای تمام کسانی که به کیفیت اصیل اهمیت می‌دهند انتخاب ایده‌آل است. دشت‌زاد فندق را بدون هیچ افزودنی فرآوری می‌کند تا تمام روغن‌های طبیعی، ویتامین‌ها و مواد معدنی آن محفوظ بماند. فندق سرشار از ویتامین E قوی‌ترین آنتی‌اکسیدان محلول در چربی، منگنز، مس، ویتامین B6 و فولات است. مصرف منظم فندق به سلامت قلب، کاهش التهاب، تقویت سیستم عصبی و بهبود عملکرد مغز کمک می‌کند. برای مصرف مستقیم، تهیه شکلات خانگی، کیک‌ها، بستنی و انواع دسر ایرانی و اروپایی مناسب است. فندق دشت‌زاد را امتحان کنید و تفاوت کیفیت واقعی را احساس کنید.`,
        price_rial: 44070000,
        offPrice_rial: 39650000,
        discountPercent: 10,
        countInStock: 70,
        tags: ["فندق خام", "ایرانی", "شمال ایران", "طبیعی", "hazelnut"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 628, "carb_g": 16.7, "protein_g": 15, "fat_g": 60.7, "fiber_g": 9.7, "sugar_g": 4.3}},
        categoryId: catMap["fandoq"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/06/supreme-raw-hazelnut-kernels-barjil-177-1.webp", alt: "فندق خام ایرانی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "fandoq-kham-irani-dashtzad-100g", calculatedPrice_rial: 44070000, price_rial: 44070000, offPrice_rial: 39650000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "fandoq-kham-irani-dashtzad-250g", calculatedPrice_rial: 110180000, price_rial: 110180000, offPrice_rial: 99120000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "fandoq-kham-irani-dashtzad-500g", calculatedPrice_rial: 209330000, price_rial: 209330000, offPrice_rial: 188340000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "fandoq-kham-irani-dashtzad-1000g", calculatedPrice_rial: 396630000, price_rial: 396630000, offPrice_rial: 356850000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "fandoq-bodadeh-momtaz-dashtzad" },
      create: {
        title: "فندق بوداده ممتاز دشت‌زاد",
        slug: "fandoq-bodadeh-momtaz-dashtzad",
        latinTitle: "Dashtzad Premium Roasted Hazelnut",
        description: `فندق بوداده ممتاز دشت‌زاد، تجربه‌ای بی‌نظیر از عطر و طعم اصیل فندق ایرانی است. دشت‌زاد با دقت فراوان، فندق‌های خام درجه یک شمال ایران را در دمای کنترل‌شده برشته می‌کند تا عطر طلایی و رنگ قهوه‌ای گرم آن‌ها کامل شود بدون اینکه روغن‌های مفید از بین بروند. این فرآیند دقیق، طعمی غنی، کره‌ای و خوش‌بو ایجاد می‌کند که بی‌درنگ اشتها را تحریک می‌کند. فندق بوداده دشت‌زاد بدون هیچ نمک یا طعم‌دهنده‌ای تهیه شده تا طعم طبیعی فندق در کانون توجه باشد. این محصول برای مصرف مستقیم، تهیه کرم فندق خانگی، تزئین انواع کیک و شیرینی، و افزودن به ماست و غلات صبحانه بسیار مناسب است. با خرید فندق بوداده دشت‌زاد، از بهترین محصول شمال ایران لذت ببرید.`,
        brand: "دشت‌زاد",
        price_rial: 45020000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 55,
        tags: ["فندق بوداده", "ممتاز", "بدون نمک", "شمال ایران", "roasted hazelnut"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 45020000,
        categoryId: catMap["fandoq"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 646, "carb_g": 17.3, "protein_g": 15.3, "fat_g": 62.4, "fiber_g": 9.4, "sugar_g": 4.2}},
      },
      update: {
        title: "فندق بوداده ممتاز دشت‌زاد",
        latinTitle: "Dashtzad Premium Roasted Hazelnut",
        description: `فندق بوداده ممتاز دشت‌زاد، تجربه‌ای بی‌نظیر از عطر و طعم اصیل فندق ایرانی است. دشت‌زاد با دقت فراوان، فندق‌های خام درجه یک شمال ایران را در دمای کنترل‌شده برشته می‌کند تا عطر طلایی و رنگ قهوه‌ای گرم آن‌ها کامل شود بدون اینکه روغن‌های مفید از بین بروند. این فرآیند دقیق، طعمی غنی، کره‌ای و خوش‌بو ایجاد می‌کند که بی‌درنگ اشتها را تحریک می‌کند. فندق بوداده دشت‌زاد بدون هیچ نمک یا طعم‌دهنده‌ای تهیه شده تا طعم طبیعی فندق در کانون توجه باشد. این محصول برای مصرف مستقیم، تهیه کرم فندق خانگی، تزئین انواع کیک و شیرینی، و افزودن به ماست و غلات صبحانه بسیار مناسب است. با خرید فندق بوداده دشت‌زاد، از بهترین محصول شمال ایران لذت ببرید.`,
        price_rial: 45020000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 55,
        tags: ["فندق بوداده", "ممتاز", "بدون نمک", "شمال ایران", "roasted hazelnut"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 646, "carb_g": 17.3, "protein_g": 15.3, "fat_g": 62.4, "fiber_g": 9.4, "sugar_g": 4.2}},
        categoryId: catMap["fandoq"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/06/supreme-roasted-hazelnut-kernels-barjil-161-1.webp", alt: "فندق بوداده ممتاز دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "fandoq-bodadeh-momtaz-dashtzad-100g", calculatedPrice_rial: 45020000, price_rial: 45020000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "fandoq-bodadeh-momtaz-dashtzad-250g", calculatedPrice_rial: 112550000, price_rial: 112550000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "fandoq-bodadeh-momtaz-dashtzad-500g", calculatedPrice_rial: 213840000, price_rial: 213840000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "fandoq-bodadeh-momtaz-dashtzad-1000g", calculatedPrice_rial: 405180000, price_rial: 405180000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "gerdoo-kaghazi-irani-dashtzad" },
      create: {
        title: "گردوی کاغذی ایرانی دشت‌زاد",
        slug: "gerdoo-kaghazi-irani-dashtzad",
        latinTitle: "Dashtzad Iranian Paper Walnut",
        description: `گردوی کاغذی ایرانی دشت‌زاد — نام «کاغذی» از نازکی استثنایی پوسته این گردو می‌آید که با فشار انگشت به آسانی می‌شکند و مغزی بزرگ، کامل و روشن را آشکار می‌کند. دشت‌زاد این گردو را از بهترین باغ‌های استان‌های کرمانشاه، همدان و آذربایجان تهیه می‌کند — مناطقی که با آب‌وهوای مناسب و خاک غنی، بهترین گردوی ایران را به دنیا عرضه می‌کنند. گردو ملکه مغزها نامیده می‌شود و دلیل خوبی دارد: سرشار از اسیدهای چرب امگا-۳ (بیشتر از هر مغز دیگری)، ویتامین E، پلی‌فنول‌های قوی و آنتی‌اکسیدان‌هاست. مطالعات علمی نشان می‌دهد مصرف منظم گردو به کاهش کلسترول LDL، بهبود عملکرد مغز، کاهش التهاب مزمن و حفظ سلامت قلب و عروق کمک می‌کند. گردوی کاغذی دشت‌زاد برای مصرف مستقیم، تهیه انواع شیرینی ایرانی، سالاد و غذاهای اصیل ایده‌آل است.`,
        brand: "دشت‌زاد",
        price_rial: 35060000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 90,
        tags: ["گردو کاغذی", "ایرانی", "امگا-۳", "طبیعی", "walnut"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 35060000,
        categoryId: catMap["gerdo"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 654, "carb_g": 13.7, "protein_g": 15.2, "fat_g": 65.2, "fiber_g": 6.7, "sugar_g": 2.6}},
      },
      update: {
        title: "گردوی کاغذی ایرانی دشت‌زاد",
        latinTitle: "Dashtzad Iranian Paper Walnut",
        description: `گردوی کاغذی ایرانی دشت‌زاد — نام «کاغذی» از نازکی استثنایی پوسته این گردو می‌آید که با فشار انگشت به آسانی می‌شکند و مغزی بزرگ، کامل و روشن را آشکار می‌کند. دشت‌زاد این گردو را از بهترین باغ‌های استان‌های کرمانشاه، همدان و آذربایجان تهیه می‌کند — مناطقی که با آب‌وهوای مناسب و خاک غنی، بهترین گردوی ایران را به دنیا عرضه می‌کنند. گردو ملکه مغزها نامیده می‌شود و دلیل خوبی دارد: سرشار از اسیدهای چرب امگا-۳ (بیشتر از هر مغز دیگری)، ویتامین E، پلی‌فنول‌های قوی و آنتی‌اکسیدان‌هاست. مطالعات علمی نشان می‌دهد مصرف منظم گردو به کاهش کلسترول LDL، بهبود عملکرد مغز، کاهش التهاب مزمن و حفظ سلامت قلب و عروق کمک می‌کند. گردوی کاغذی دشت‌زاد برای مصرف مستقیم، تهیه انواع شیرینی ایرانی، سالاد و غذاهای اصیل ایده‌آل است.`,
        price_rial: 35060000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 90,
        tags: ["گردو کاغذی", "ایرانی", "امگا-۳", "طبیعی", "walnut"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 654, "carb_g": 13.7, "protein_g": 15.2, "fat_g": 65.2, "fiber_g": 6.7, "sugar_g": 2.6}},
        categoryId: catMap["gerdo"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/supreme-raw-iranian-walnut-kernels-barjil-42-1.webp", alt: "گردوی کاغذی ایرانی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "gerdoo-kaghazi-irani-dashtzad-100g", calculatedPrice_rial: 35060000, price_rial: 35060000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "gerdoo-kaghazi-irani-dashtzad-250g", calculatedPrice_rial: 87650000, price_rial: 87650000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "gerdoo-kaghazi-irani-dashtzad-500g", calculatedPrice_rial: 166540000, price_rial: 166540000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "gerdoo-kaghazi-irani-dashtzad-1000g", calculatedPrice_rial: 315540000, price_rial: 315540000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "maghz-gerdoo-roghani-momtaz-dashtzad" },
      create: {
        title: "مغز گردوی روغنی ممتاز دشت‌زاد",
        slug: "maghz-gerdoo-roghani-momtaz-dashtzad",
        latinTitle: "Dashtzad Premium Oil-Rich Walnut Kernel",
        description: `مغز گردوی روغنی ممتاز دشت‌زاد، محصولی برای افرادی است که به سلامت و کیفیت در بالاترین سطح اهمیت می‌دهند. این گردو با میزان روغن طبیعی بالاتر از میانگین، طعمی کره‌ای و غنی دارد که روی زبان آب می‌شود. دشت‌زاد مغزهای کامل و بدون ترک را انتخاب می‌کند و تنها نمونه‌هایی که رنگ روشن و عطر تازه دارند برای بسته‌بندی مجاز هستند. گردوی روغنی به دلیل محتوای بالای اسید لینولنیک (امگا-۳)، برای بهبود عملکرد شناختی، کاهش استرس اکسیداتیو و حفاظت از سیستم قلبی-عروقی بسیار موثر است. این محصول برای مادران شیرده، سالمندان، ورزشکاران و همه کسانی که رژیم غذایی سالم دارند توصیه می‌شود. با هر وعده گردوی دشت‌زاد، یک قدم به سلامت کامل نزدیک‌تر می‌شوید.`,
        brand: "دشت‌زاد",
        price_rial: 32000000,
        offPrice_rial: 28800000,
        discountPercent: 10,
        countInStock: 75,
        tags: ["گردو روغنی", "مغز گردو", "ممتاز", "امگا-۳", "organic walnut"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 32000000,
        categoryId: catMap["gerdo"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 654, "carb_g": 13.7, "protein_g": 15.2, "fat_g": 65.2, "fiber_g": 6.7, "sugar_g": 2.6}},
      },
      update: {
        title: "مغز گردوی روغنی ممتاز دشت‌زاد",
        latinTitle: "Dashtzad Premium Oil-Rich Walnut Kernel",
        description: `مغز گردوی روغنی ممتاز دشت‌زاد، محصولی برای افرادی است که به سلامت و کیفیت در بالاترین سطح اهمیت می‌دهند. این گردو با میزان روغن طبیعی بالاتر از میانگین، طعمی کره‌ای و غنی دارد که روی زبان آب می‌شود. دشت‌زاد مغزهای کامل و بدون ترک را انتخاب می‌کند و تنها نمونه‌هایی که رنگ روشن و عطر تازه دارند برای بسته‌بندی مجاز هستند. گردوی روغنی به دلیل محتوای بالای اسید لینولنیک (امگا-۳)، برای بهبود عملکرد شناختی، کاهش استرس اکسیداتیو و حفاظت از سیستم قلبی-عروقی بسیار موثر است. این محصول برای مادران شیرده، سالمندان، ورزشکاران و همه کسانی که رژیم غذایی سالم دارند توصیه می‌شود. با هر وعده گردوی دشت‌زاد، یک قدم به سلامت کامل نزدیک‌تر می‌شوید.`,
        price_rial: 32000000,
        offPrice_rial: 28800000,
        discountPercent: 10,
        countInStock: 75,
        tags: ["گردو روغنی", "مغز گردو", "ممتاز", "امگا-۳", "organic walnut"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 654, "carb_g": 13.7, "protein_g": 15.2, "fat_g": 65.2, "fiber_g": 6.7, "sugar_g": 2.6}},
        categoryId: catMap["gerdo"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/12/organic-walnut-kernels-barjil-745-1.webp", alt: "مغز گردوی روغنی ممتاز دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "maghz-gerdoo-roghani-momtaz-dashtzad-100g", calculatedPrice_rial: 32000000, price_rial: 32000000, offPrice_rial: 28800000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "maghz-gerdoo-roghani-momtaz-dashtzad-250g", calculatedPrice_rial: 80000000, price_rial: 80000000, offPrice_rial: 72000000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "maghz-gerdoo-roghani-momtaz-dashtzad-500g", calculatedPrice_rial: 152000000, price_rial: 152000000, offPrice_rial: 136800000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "maghz-gerdoo-roghani-momtaz-dashtzad-1000g", calculatedPrice_rial: 288000000, price_rial: 288000000, offPrice_rial: 259200000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "badam-kaghazi-momtaz-dashtzad" },
      create: {
        title: "بادام کاغذی ممتاز دشت‌زاد",
        slug: "badam-kaghazi-momtaz-dashtzad",
        latinTitle: "Dashtzad Premium Paper Almond",
        description: `بادام کاغذی ممتاز دشت‌زاد، انتخاب هوشمندانه برای کسانی است که بهترین را می‌خواهند. پوسته نازک این بادام مانند کاغذ است و مغزی درشت، سفید و شیری را در خود نگه می‌دارد. دشت‌زاد این بادام را از بهترین باغ‌های ایران و با کنترل کیفیت دقیق تهیه می‌کند. بادام درختی یکی از کامل‌ترین مغزهاست: غنی از ویتامین E (بیش از ۳۷٪ نیاز روزانه در ۱۰۰ گرم)، منیزیم، کلسیم، فیبر و پروتئین کامل. مصرف روزانه یک مشت بادام به کاهش خطر بیماری قلبی، کنترل قند خون در دیابتی‌ها، تقویت استخوان‌ها و بهبود سلامت پوست کمک می‌کند. بادام کاغذی دشت‌زاد برای مصرف روزانه، تهیه شیر بادام خانگی، انواع شیرینی سنتی و مدرن، و رژیم‌های غذایی کتو و پالئو ایده‌آل است. کیفیتی که انتظارش را داشتید، اکنون در بسته‌بندی ممتاز دشت‌زاد.`,
        brand: "دشت‌زاد",
        price_rial: 41190000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 95,
        tags: ["بادام کاغذی", "ممتاز", "ویتامین E", "طبیعی", "almond"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 41190000,
        categoryId: catMap["badam-derakht"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 576, "carb_g": 21.6, "protein_g": 21.2, "fat_g": 49.9, "fiber_g": 12.5, "sugar_g": 4.4}},
      },
      update: {
        title: "بادام کاغذی ممتاز دشت‌زاد",
        latinTitle: "Dashtzad Premium Paper Almond",
        description: `بادام کاغذی ممتاز دشت‌زاد، انتخاب هوشمندانه برای کسانی است که بهترین را می‌خواهند. پوسته نازک این بادام مانند کاغذ است و مغزی درشت، سفید و شیری را در خود نگه می‌دارد. دشت‌زاد این بادام را از بهترین باغ‌های ایران و با کنترل کیفیت دقیق تهیه می‌کند. بادام درختی یکی از کامل‌ترین مغزهاست: غنی از ویتامین E (بیش از ۳۷٪ نیاز روزانه در ۱۰۰ گرم)، منیزیم، کلسیم، فیبر و پروتئین کامل. مصرف روزانه یک مشت بادام به کاهش خطر بیماری قلبی، کنترل قند خون در دیابتی‌ها، تقویت استخوان‌ها و بهبود سلامت پوست کمک می‌کند. بادام کاغذی دشت‌زاد برای مصرف روزانه، تهیه شیر بادام خانگی، انواع شیرینی سنتی و مدرن، و رژیم‌های غذایی کتو و پالئو ایده‌آل است. کیفیتی که انتظارش را داشتید، اکنون در بسته‌بندی ممتاز دشت‌زاد.`,
        price_rial: 41190000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 95,
        tags: ["بادام کاغذی", "ممتاز", "ویتامین E", "طبیعی", "almond"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 576, "carb_g": 21.6, "protein_g": 21.2, "fat_g": 49.9, "fiber_g": 12.5, "sugar_g": 4.4}},
        categoryId: catMap["badam-derakht"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/12/organic-almond-kernels-barjil-741-1.webp", alt: "بادام کاغذی ممتاز دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "badam-kaghazi-momtaz-dashtzad-100g", calculatedPrice_rial: 41190000, price_rial: 41190000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "badam-kaghazi-momtaz-dashtzad-250g", calculatedPrice_rial: 102980000, price_rial: 102980000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "badam-kaghazi-momtaz-dashtzad-500g", calculatedPrice_rial: 195650000, price_rial: 195650000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "badam-kaghazi-momtaz-dashtzad-1000g", calculatedPrice_rial: 370710000, price_rial: 370710000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "badam-mamaei-bereshteh-zafrani-dashtzad" },
      create: {
        title: "بادام مامایی برشته زعفرانی دشت‌زاد",
        slug: "badam-mamaei-bereshteh-zafrani-dashtzad",
        latinTitle: "Dashtzad Saffron Roasted Mamra Almond",
        description: `بادام مامایی دشت‌زاد، یک موهبت خاص از طبیعت ایران است. این بادام با دانه‌های ریزتر اما با تراکم مواد مغذی بالاتر، در کوه‌پایه‌های ایران به صورت نیمه‌وحشی رشد می‌کند و طعمی عمیق‌تر و غنی‌تر از بادام‌های پرورشی دارد. دشت‌زاد بادام مامایی را با زعفران درجه یک قائنات برشته می‌کند تا ترکیبی بی‌نظیر از طعم، عطر و رنگ طلایی ایجاد شود. بادام مامایی به دلیل روغن بیشتر در مقایسه با سایر واریته‌ها، طعمی خامه‌ای‌تر دارد و برای تهیه روغن بادام، شیر بادام و محصولات آرایشی استفاده می‌شود. سرشار از اسید اولئیک (امگا-۹) مانند روغن زیتون، ویتامین E، کلسیم و آهن است. این محصول نادر و ارزشمند را از دشت‌زاد تهیه کنید و از طعم بی‌همتای آن لذت ببرید.`,
        brand: "دشت‌زاد",
        price_rial: 56850000,
        offPrice_rial: 51160000,
        discountPercent: 10,
        countInStock: 35,
        tags: ["بادام مامایی", "زعفران", "برشته", "نادر", "mamra almond"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 56850000,
        categoryId: catMap["badam-derakht"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 598, "carb_g": 19.7, "protein_g": 21.4, "fat_g": 52.8, "fiber_g": 12.2, "sugar_g": 4.8}},
      },
      update: {
        title: "بادام مامایی برشته زعفرانی دشت‌زاد",
        latinTitle: "Dashtzad Saffron Roasted Mamra Almond",
        description: `بادام مامایی دشت‌زاد، یک موهبت خاص از طبیعت ایران است. این بادام با دانه‌های ریزتر اما با تراکم مواد مغذی بالاتر، در کوه‌پایه‌های ایران به صورت نیمه‌وحشی رشد می‌کند و طعمی عمیق‌تر و غنی‌تر از بادام‌های پرورشی دارد. دشت‌زاد بادام مامایی را با زعفران درجه یک قائنات برشته می‌کند تا ترکیبی بی‌نظیر از طعم، عطر و رنگ طلایی ایجاد شود. بادام مامایی به دلیل روغن بیشتر در مقایسه با سایر واریته‌ها، طعمی خامه‌ای‌تر دارد و برای تهیه روغن بادام، شیر بادام و محصولات آرایشی استفاده می‌شود. سرشار از اسید اولئیک (امگا-۹) مانند روغن زیتون، ویتامین E، کلسیم و آهن است. این محصول نادر و ارزشمند را از دشت‌زاد تهیه کنید و از طعم بی‌همتای آن لذت ببرید.`,
        price_rial: 56850000,
        offPrice_rial: 51160000,
        discountPercent: 10,
        countInStock: 35,
        tags: ["بادام مامایی", "زعفران", "برشته", "نادر", "mamra almond"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 598, "carb_g": 19.7, "protein_g": 21.4, "fat_g": 52.8, "fiber_g": 12.2, "sugar_g": 4.8}},
        categoryId: catMap["badam-derakht"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/10/mamra-almond-kernels-barjil-714-1.webp", alt: "بادام مامایی برشته زعفرانی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "badam-mamaei-bereshteh-zafrani-dashtzad-100g", calculatedPrice_rial: 56850000, price_rial: 56850000, offPrice_rial: 51160000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "badam-mamaei-bereshteh-zafrani-dashtzad-250g", calculatedPrice_rial: 142120000, price_rial: 142120000, offPrice_rial: 127900000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "badam-mamaei-bereshteh-zafrani-dashtzad-500g", calculatedPrice_rial: 270040000, price_rial: 270040000, offPrice_rial: 243010000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "badam-hendi-kham-momtaz-dashtzad" },
      create: {
        title: "بادام هندی خام ممتاز دشت‌زاد",
        slug: "badam-hendi-kham-momtaz-dashtzad",
        latinTitle: "Dashtzad Premium Raw Cashew",
        description: `بادام هندی خام ممتاز دشت‌زاد از بهترین مزارع ویتنام و هند انتخاب می‌شود — مناطقی که آب‌وهوای گرمسیری ایده‌آل برای رشد بادام هندی با کیفیت برتر را دارند. دشت‌زاد تنها بادام هندی‌های درجه یک (W240 و W320) را که بزرگ‌ترین و کامل‌ترین دانه‌ها هستند وارد می‌کند. رنگ کرم روشن، شکل کامل بدون شکستگی، و طعم شیرین کره‌ای — این معیارها انتخاب دشت‌زاد را از هر نمونه معمولی متمایز می‌کند. بادام هندی خام سرشار از مس (برای تولید رنگدانه مو و پوست)، منیزیم (برای آرامش عضلات)، روی (برای سیستم ایمنی) و آهن (برای پیشگیری از کم‌خونی) است. همچنین حاوی اسیدهای چرب غیراشباع تک‌زنجیره است که به کاهش کلسترول بد کمک می‌کند. ایده‌آل برای رژیم‌های گیاهی، وگان، و هر کسی که به تغذیه سالم اهمیت می‌دهد.`,
        brand: "دشت‌زاد",
        price_rial: 28650000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 80,
        tags: ["بادام هندی", "خام", "ممتاز", "cashew", "وگان"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 28650000,
        categoryId: catMap["badam-hendi"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 553, "carb_g": 30.2, "protein_g": 18.2, "fat_g": 43.9, "fiber_g": 3.3, "sugar_g": 5.9}},
      },
      update: {
        title: "بادام هندی خام ممتاز دشت‌زاد",
        latinTitle: "Dashtzad Premium Raw Cashew",
        description: `بادام هندی خام ممتاز دشت‌زاد از بهترین مزارع ویتنام و هند انتخاب می‌شود — مناطقی که آب‌وهوای گرمسیری ایده‌آل برای رشد بادام هندی با کیفیت برتر را دارند. دشت‌زاد تنها بادام هندی‌های درجه یک (W240 و W320) را که بزرگ‌ترین و کامل‌ترین دانه‌ها هستند وارد می‌کند. رنگ کرم روشن، شکل کامل بدون شکستگی، و طعم شیرین کره‌ای — این معیارها انتخاب دشت‌زاد را از هر نمونه معمولی متمایز می‌کند. بادام هندی خام سرشار از مس (برای تولید رنگدانه مو و پوست)، منیزیم (برای آرامش عضلات)، روی (برای سیستم ایمنی) و آهن (برای پیشگیری از کم‌خونی) است. همچنین حاوی اسیدهای چرب غیراشباع تک‌زنجیره است که به کاهش کلسترول بد کمک می‌کند. ایده‌آل برای رژیم‌های گیاهی، وگان، و هر کسی که به تغذیه سالم اهمیت می‌دهد.`,
        price_rial: 28650000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 80,
        tags: ["بادام هندی", "خام", "ممتاز", "cashew", "وگان"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 553, "carb_g": 30.2, "protein_g": 18.2, "fat_g": 43.9, "fiber_g": 3.3, "sugar_g": 5.9}},
        categoryId: catMap["badam-hendi"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/06/high-quality-raw-cashews-barjil-69-1.webp", alt: "بادام هندی خام ممتاز دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "badam-hendi-kham-momtaz-dashtzad-100g", calculatedPrice_rial: 28650000, price_rial: 28650000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "badam-hendi-kham-momtaz-dashtzad-250g", calculatedPrice_rial: 71620000, price_rial: 71620000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "badam-hendi-kham-momtaz-dashtzad-500g", calculatedPrice_rial: 136090000, price_rial: 136090000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "badam-hendi-kham-momtaz-dashtzad-1000g", calculatedPrice_rial: 257850000, price_rial: 257850000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "badam-hendi-bereshteh-namaki-dashtzad" },
      create: {
        title: "بادام هندی برشته نمکی دشت‌زاد",
        slug: "badam-hendi-bereshteh-namaki-dashtzad",
        latinTitle: "Dashtzad Salted Roasted Cashew",
        description: `بادام هندی برشته نمکی دشت‌زاد، ترکیبی عالی از کیفیت و طعم است که هر بار خوردنش را به یک لحظه لذت‌بخش تبدیل می‌کند. دشت‌زاد بادام هندی درجه یک را در دمای کنترل‌شده برشته می‌دهد تا رنگ طلایی یکنواخت و عطر مطبوع آن به اوج برسد. سپس با نمک دریای خالص و با مقدار بهینه طعم‌دهی می‌شود — نه بیش از حد شور، نه بی‌مزه. این تعادل دقیق است که طرفداران جدی بادام هندی برشته دشت‌زاد را بارها و بارها به خرید وا می‌دارد. بادام هندی برشته‌شده میزان چربی کمتری نسبت به سایر مغزها دارد و با ۵۵۳ کالری در ۱۰۰ گرم، انتخاب هوشمندانه‌تری برای کنترل وزن محسوب می‌شود. برای پذیرایی روزمره، مجالس دوستانه، میان‌وعده کاری و هدیه دادن عالی است.`,
        brand: "دشت‌زاد",
        price_rial: 30340000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 110,
        tags: ["بادام هندی", "برشته", "نمکی", "salted cashew", "میان‌وعده"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 30340000,
        categoryId: catMap["badam-hendi"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 574, "carb_g": 28.7, "protein_g": 17.4, "fat_g": 46.4, "fiber_g": 3.1, "sugar_g": 5.5}},
      },
      update: {
        title: "بادام هندی برشته نمکی دشت‌زاد",
        latinTitle: "Dashtzad Salted Roasted Cashew",
        description: `بادام هندی برشته نمکی دشت‌زاد، ترکیبی عالی از کیفیت و طعم است که هر بار خوردنش را به یک لحظه لذت‌بخش تبدیل می‌کند. دشت‌زاد بادام هندی درجه یک را در دمای کنترل‌شده برشته می‌دهد تا رنگ طلایی یکنواخت و عطر مطبوع آن به اوج برسد. سپس با نمک دریای خالص و با مقدار بهینه طعم‌دهی می‌شود — نه بیش از حد شور، نه بی‌مزه. این تعادل دقیق است که طرفداران جدی بادام هندی برشته دشت‌زاد را بارها و بارها به خرید وا می‌دارد. بادام هندی برشته‌شده میزان چربی کمتری نسبت به سایر مغزها دارد و با ۵۵۳ کالری در ۱۰۰ گرم، انتخاب هوشمندانه‌تری برای کنترل وزن محسوب می‌شود. برای پذیرایی روزمره، مجالس دوستانه، میان‌وعده کاری و هدیه دادن عالی است.`,
        price_rial: 30340000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 110,
        tags: ["بادام هندی", "برشته", "نمکی", "salted cashew", "میان‌وعده"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 574, "carb_g": 28.7, "protein_g": 17.4, "fat_g": 46.4, "fiber_g": 3.1, "sugar_g": 5.5}},
        categoryId: catMap["badam-hendi"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/06/high-quality-roasted-saffron-cashews-barjil-67-1.webp", alt: "بادام هندی برشته نمکی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "badam-hendi-bereshteh-namaki-dashtzad-100g", calculatedPrice_rial: 30340000, price_rial: 30340000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "badam-hendi-bereshteh-namaki-dashtzad-250g", calculatedPrice_rial: 75850000, price_rial: 75850000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "badam-hendi-bereshteh-namaki-dashtzad-500g", calculatedPrice_rial: 144120000, price_rial: 144120000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "badam-hendi-bereshteh-namaki-dashtzad-1000g", calculatedPrice_rial: 273060000, price_rial: 273060000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "badam-zamini-poostgerefteh-kham-dashtzad" },
      create: {
        title: "بادام زمینی پوست‌گرفته خام دشت‌زاد",
        slug: "badam-zamini-poostgerefteh-kham-dashtzad",
        latinTitle: "Dashtzad Raw Blanched Peanut Kernels",
        description: `بادام زمینی پوست‌گرفته خام دشت‌زاد، خالص‌ترین شکل این مغز پرطرفدار است. دانه‌های انتخابی دشت‌زاد از مزارع برتر ایران تأمین می‌شوند و پس از پوست‌گیری کامل، سفیدی و تمیزی آن‌ها چشم را نواز می‌کند. این محصول بدون هیچ افزودنی، رنگ‌دهنده یا نگهدارنده‌ای آماده شده و برای مصرف مستقیم یا استفاده در آشپزی ایده‌آل است. بادام زمینی منبع فوق‌العاده‌ای از پروتئین گیاهی است — با ۲۵ گرم پروتئین در ۱۰۰ گرم، یکی از بالاترین میزان‌های پروتئین در بین مغزها را دارد. همچنین سرشار از نیاسین، ویتامین B۳، فولات و رزوراترول است که با کاهش خطر بیماری قلبی و بهبود عملکرد شناختی مرتبط است. برای تهیه کره بادام زمینی خانگی، انواع شیرینی، سس ساتای، و غذاهای تایلندی و آسیایی عالی است. اقتصادی، مغذی و خوشمزه — این است بادام زمینی دشت‌زاد.`,
        brand: "دشت‌زاد",
        price_rial: 8630000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 150,
        tags: ["بادام زمینی", "پوست‌گرفته", "خام", "پروتئین بالا", "peanut"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 8630000,
        categoryId: catMap["badam-zamini"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 567, "carb_g": 16.1, "protein_g": 25.8, "fat_g": 49.2, "fiber_g": 8.5, "sugar_g": 4.7}},
      },
      update: {
        title: "بادام زمینی پوست‌گرفته خام دشت‌زاد",
        latinTitle: "Dashtzad Raw Blanched Peanut Kernels",
        description: `بادام زمینی پوست‌گرفته خام دشت‌زاد، خالص‌ترین شکل این مغز پرطرفدار است. دانه‌های انتخابی دشت‌زاد از مزارع برتر ایران تأمین می‌شوند و پس از پوست‌گیری کامل، سفیدی و تمیزی آن‌ها چشم را نواز می‌کند. این محصول بدون هیچ افزودنی، رنگ‌دهنده یا نگهدارنده‌ای آماده شده و برای مصرف مستقیم یا استفاده در آشپزی ایده‌آل است. بادام زمینی منبع فوق‌العاده‌ای از پروتئین گیاهی است — با ۲۵ گرم پروتئین در ۱۰۰ گرم، یکی از بالاترین میزان‌های پروتئین در بین مغزها را دارد. همچنین سرشار از نیاسین، ویتامین B۳، فولات و رزوراترول است که با کاهش خطر بیماری قلبی و بهبود عملکرد شناختی مرتبط است. برای تهیه کره بادام زمینی خانگی، انواع شیرینی، سس ساتای، و غذاهای تایلندی و آسیایی عالی است. اقتصادی، مغذی و خوشمزه — این است بادام زمینی دشت‌زاد.`,
        price_rial: 8630000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 150,
        tags: ["بادام زمینی", "پوست‌گرفته", "خام", "پروتئین بالا", "peanut"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 567, "carb_g": 16.1, "protein_g": 25.8, "fat_g": 49.2, "fiber_g": 8.5, "sugar_g": 4.7}},
        categoryId: catMap["badam-zamini"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2019/12/raw-peanut-kernels-barjil-321-1.webp", alt: "بادام زمینی پوست‌گرفته خام دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "badam-zamini-poostgerefteh-kham-dashtzad-100g", calculatedPrice_rial: 8630000, price_rial: 8630000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "badam-zamini-poostgerefteh-kham-dashtzad-250g", calculatedPrice_rial: 21580000, price_rial: 21580000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "badam-zamini-poostgerefteh-kham-dashtzad-500g", calculatedPrice_rial: 40990000, price_rial: 40990000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "badam-zamini-poostgerefteh-kham-dashtzad-1000g", calculatedPrice_rial: 77670000, price_rial: 77670000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "badam-zamini-bereshteh-shoor-dashtzad" },
      create: {
        title: "بادام زمینی برشته شور دشت‌زاد",
        slug: "badam-zamini-bereshteh-shoor-dashtzad",
        latinTitle: "Dashtzad Salted Roasted Peanut",
        description: `بادام زمینی برشته شور دشت‌زاد — این محصول ساده اما کامل‌شده، میان‌وعده‌ای است که هیچ‌کس نمی‌تواند تنها به یک دانه اکتفا کند. دشت‌زاد دانه‌های درشت و یکنواخت بادام زمینی را انتخاب می‌کند، آن‌ها را در دمای بهینه برشته می‌دهد تا ترد و خوشمزه شوند، و سپس با نمک دریای طبیعی به اندازه مناسب طعم‌دار می‌کند. نتیجه: ترکیبی از ترد بودن، شوری متعادل و طعم غنی که نمی‌توانید مقاومت کنید. بادام زمینی برشته نه تنها خوشمزه است، بلکه به افزایش متابولیسم، کاهش قند خون بعد از وعده غذایی و تأمین انرژی پایدار کمک می‌کند. مناسب برای ورزشکاران قبل از تمرین، دانش‌آموزان به عنوان میان‌وعده مدرسه، و همه افرادی که به دنبال گزینه‌ای سالم‌تر از تنقلات فراوری‌شده هستند.`,
        brand: "دشت‌زاد",
        price_rial: 9350000,
        offPrice_rial: 8420000,
        discountPercent: 10,
        countInStock: 200,
        tags: ["بادام زمینی", "برشته", "شور", "میان‌وعده", "roasted peanut"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 9350000,
        categoryId: catMap["badam-zamini"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 585, "carb_g": 15.3, "protein_g": 24.6, "fat_g": 51.8, "fiber_g": 8, "sugar_g": 3.8}},
      },
      update: {
        title: "بادام زمینی برشته شور دشت‌زاد",
        latinTitle: "Dashtzad Salted Roasted Peanut",
        description: `بادام زمینی برشته شور دشت‌زاد — این محصول ساده اما کامل‌شده، میان‌وعده‌ای است که هیچ‌کس نمی‌تواند تنها به یک دانه اکتفا کند. دشت‌زاد دانه‌های درشت و یکنواخت بادام زمینی را انتخاب می‌کند، آن‌ها را در دمای بهینه برشته می‌دهد تا ترد و خوشمزه شوند، و سپس با نمک دریای طبیعی به اندازه مناسب طعم‌دار می‌کند. نتیجه: ترکیبی از ترد بودن، شوری متعادل و طعم غنی که نمی‌توانید مقاومت کنید. بادام زمینی برشته نه تنها خوشمزه است، بلکه به افزایش متابولیسم، کاهش قند خون بعد از وعده غذایی و تأمین انرژی پایدار کمک می‌کند. مناسب برای ورزشکاران قبل از تمرین، دانش‌آموزان به عنوان میان‌وعده مدرسه، و همه افرادی که به دنبال گزینه‌ای سالم‌تر از تنقلات فراوری‌شده هستند.`,
        price_rial: 9350000,
        offPrice_rial: 8420000,
        discountPercent: 10,
        countInStock: 200,
        tags: ["بادام زمینی", "برشته", "شور", "میان‌وعده", "roasted peanut"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 585, "carb_g": 15.3, "protein_g": 24.6, "fat_g": 51.8, "fiber_g": 8, "sugar_g": 3.8}},
        categoryId: catMap["badam-zamini"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/03/roasted-peanut-kernels-barjil-378-1-1.webp", alt: "بادام زمینی برشته شور دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "badam-zamini-bereshteh-shoor-dashtzad-100g", calculatedPrice_rial: 9350000, price_rial: 9350000, offPrice_rial: 8420000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "badam-zamini-bereshteh-shoor-dashtzad-250g", calculatedPrice_rial: 23380000, price_rial: 23380000, offPrice_rial: 21050000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "badam-zamini-bereshteh-shoor-dashtzad-500g", calculatedPrice_rial: 44410000, price_rial: 44410000, offPrice_rial: 40000000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "badam-zamini-bereshteh-shoor-dashtzad-1000g", calculatedPrice_rial: 84150000, price_rial: 84150000, offPrice_rial: 75780000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "daneh-kadu-bereshteh-zafrani-dashtzad" },
      create: {
        title: "دانه کدو برشته زعفرانی دشت‌زاد",
        slug: "daneh-kadu-bereshteh-zafrani-dashtzad",
        latinTitle: "Dashtzad Saffron Roasted Pumpkin Seeds",
        description: `دانه کدو برشته زعفرانی دشت‌زاد، ترکیبی هوشمندانه از طعم و سلامت است. دانه‌های بزرگ کدو گوشتی ایرانی با خاصیت استثنایی، در کارخانه دشت‌زاد با زعفران اصیل ایرانی برشته می‌شوند تا رنگ طلایی زیبا و عطر دلنشین به آن‌ها ببخشند. دانه کدو یکی از قدرتمندترین دانه‌های خوراکی دنیاست: سرشار از روی (برای تقویت ایمنی و باروری)، منیزیم (برای سلامت قلب)، تریپتوفان (پیش‌ساز سروتونین برای بهبود خواب)، آنتی‌اکسیدان‌های کاروتنوئید و فیتواسترول‌هایی که با سرطان پروستات مقابله می‌کنند. مطالعات نشان می‌دهد که دانه کدو به کاهش علائم پروستات بزرگ‌شده، بهبود کیفیت خواب، و کاهش قند خون در دیابتی‌ها کمک می‌کند. این محصول برای مردان بالای ۴۰ سال به ویژه توصیه می‌شود. با دانه کدو زعفرانی دشت‌زاد، از یک میان‌وعده ساده به یک برنامه سلامت هوشمند قدم بگذارید.`,
        brand: "دشت‌زاد",
        price_rial: 12860000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 120,
        tags: ["دانه کدو", "زعفران", "برشته", "پروتئین بالا", "pumpkin seeds"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 12860000,
        categoryId: catMap["danehaye-khorakhi"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 559, "carb_g": 10.7, "protein_g": 30.2, "fat_g": 49.1, "fiber_g": 6, "sugar_g": 1.4}},
      },
      update: {
        title: "دانه کدو برشته زعفرانی دشت‌زاد",
        latinTitle: "Dashtzad Saffron Roasted Pumpkin Seeds",
        description: `دانه کدو برشته زعفرانی دشت‌زاد، ترکیبی هوشمندانه از طعم و سلامت است. دانه‌های بزرگ کدو گوشتی ایرانی با خاصیت استثنایی، در کارخانه دشت‌زاد با زعفران اصیل ایرانی برشته می‌شوند تا رنگ طلایی زیبا و عطر دلنشین به آن‌ها ببخشند. دانه کدو یکی از قدرتمندترین دانه‌های خوراکی دنیاست: سرشار از روی (برای تقویت ایمنی و باروری)، منیزیم (برای سلامت قلب)، تریپتوفان (پیش‌ساز سروتونین برای بهبود خواب)، آنتی‌اکسیدان‌های کاروتنوئید و فیتواسترول‌هایی که با سرطان پروستات مقابله می‌کنند. مطالعات نشان می‌دهد که دانه کدو به کاهش علائم پروستات بزرگ‌شده، بهبود کیفیت خواب، و کاهش قند خون در دیابتی‌ها کمک می‌کند. این محصول برای مردان بالای ۴۰ سال به ویژه توصیه می‌شود. با دانه کدو زعفرانی دشت‌زاد، از یک میان‌وعده ساده به یک برنامه سلامت هوشمند قدم بگذارید.`,
        price_rial: 12860000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 120,
        tags: ["دانه کدو", "زعفران", "برشته", "پروتئین بالا", "pumpkin seeds"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 559, "carb_g": 10.7, "protein_g": 30.2, "fat_g": 49.1, "fiber_g": 6, "sugar_g": 1.4}},
        categoryId: catMap["danehaye-khorakhi"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2024/08/roasted-saffaron-large-pumpkin-seeds-barjil-1277-1.webp", alt: "دانه کدو برشته زعفرانی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "daneh-kadu-bereshteh-zafrani-dashtzad-100g", calculatedPrice_rial: 12860000, price_rial: 12860000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "daneh-kadu-bereshteh-zafrani-dashtzad-250g", calculatedPrice_rial: 32150000, price_rial: 32150000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "daneh-kadu-bereshteh-zafrani-dashtzad-500g", calculatedPrice_rial: 61080000, price_rial: 61080000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "daneh-kadu-bereshteh-zafrani-dashtzad-1000g", calculatedPrice_rial: 115740000, price_rial: 115740000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "maghz-aftabgardan-poostkandeh-bodadeh-dashtzad" },
      create: {
        title: "مغز آفتابگردان پوست‌کنده بوداده دشت‌زاد",
        slug: "maghz-aftabgardan-poostkandeh-bodadeh-dashtzad",
        latinTitle: "Dashtzad Roasted Sunflower Seed Kernels",
        description: `مغز آفتابگردان پوست‌کنده بوداده دشت‌زاد — این دانه‌های طلایی‌رنگ که در نور آفتاب می‌درخشند، نه تنها یک میان‌وعده خوشمزه، بلکه یک مکمل غذایی کامل هستند. دشت‌زاد دانه‌های آفتابگردان را از مزارع منتخب جمع‌آوری، پوست می‌کند و در دمای بهینه می‌پزد تا هم طعم بی‌نظیری داشته باشند هم مواد مغذی‌شان حفظ شود. مغز آفتابگردان سرشار از ویتامین E (بالاترین مقدار در بین تمام مغزها و دانه‌ها)، سلنیوم، منگنز، اسید فولیک، ویتامین B1 و B6 است. ویتامین E موجود در آن پوست را جوان نگه می‌دارد، از سلول‌ها در برابر رادیکال‌های آزاد محافظت می‌کند و با التهاب مبارزه می‌کند. این دانه‌ها را می‌توانید به سالاد، ماست، غلات صبحانه، نان خانگی، اسموتی یا هر وعده غذایی اضافه کنید. سبک، خوشمزه و فوق‌العاده مغذی — این است مغز آفتابگردان دشت‌زاد.`,
        brand: "دشت‌زاد",
        price_rial: 7830000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 135,
        tags: ["آفتابگردان", "پوست‌کنده", "ویتامین E", "دانه", "sunflower seeds"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 7830000,
        categoryId: catMap["danehaye-khorakhi"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 584, "carb_g": 20, "protein_g": 20.8, "fat_g": 51.5, "fiber_g": 8.6, "sugar_g": 2.6}},
      },
      update: {
        title: "مغز آفتابگردان پوست‌کنده بوداده دشت‌زاد",
        latinTitle: "Dashtzad Roasted Sunflower Seed Kernels",
        description: `مغز آفتابگردان پوست‌کنده بوداده دشت‌زاد — این دانه‌های طلایی‌رنگ که در نور آفتاب می‌درخشند، نه تنها یک میان‌وعده خوشمزه، بلکه یک مکمل غذایی کامل هستند. دشت‌زاد دانه‌های آفتابگردان را از مزارع منتخب جمع‌آوری، پوست می‌کند و در دمای بهینه می‌پزد تا هم طعم بی‌نظیری داشته باشند هم مواد مغذی‌شان حفظ شود. مغز آفتابگردان سرشار از ویتامین E (بالاترین مقدار در بین تمام مغزها و دانه‌ها)، سلنیوم، منگنز، اسید فولیک، ویتامین B1 و B6 است. ویتامین E موجود در آن پوست را جوان نگه می‌دارد، از سلول‌ها در برابر رادیکال‌های آزاد محافظت می‌کند و با التهاب مبارزه می‌کند. این دانه‌ها را می‌توانید به سالاد، ماست، غلات صبحانه، نان خانگی، اسموتی یا هر وعده غذایی اضافه کنید. سبک، خوشمزه و فوق‌العاده مغذی — این است مغز آفتابگردان دشت‌زاد.`,
        price_rial: 7830000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 135,
        tags: ["آفتابگردان", "پوست‌کنده", "ویتامین E", "دانه", "sunflower seeds"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 584, "carb_g": 20, "protein_g": 20.8, "fat_g": 51.5, "fiber_g": 8.6, "sugar_g": 2.6}},
        categoryId: catMap["danehaye-khorakhi"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2020/02/roasted-sunflower-seed-kernels-barjil-357-1.webp", alt: "مغز آفتابگردان پوست‌کنده بوداده دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "maghz-aftabgardan-poostkandeh-bodadeh-dashtzad-100g", calculatedPrice_rial: 7830000, price_rial: 7830000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "maghz-aftabgardan-poostkandeh-bodadeh-dashtzad-250g", calculatedPrice_rial: 19580000, price_rial: 19580000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "maghz-aftabgardan-poostkandeh-bodadeh-dashtzad-500g", calculatedPrice_rial: 37190000, price_rial: 37190000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "maghz-aftabgardan-poostkandeh-bodadeh-dashtzad-1000g", calculatedPrice_rial: 70470000, price_rial: 70470000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "tokhme-aftabgardan-shoor-dashtzad" },
      create: {
        title: "تخمه آفتابگردان شور دشت‌زاد",
        slug: "tokhme-aftabgardan-shoor-dashtzad",
        latinTitle: "Dashtzad Salted Sunflower Seeds",
        description: `تخمه آفتابگردان شور دشت‌زاد — این تخمه کلاسیک ایرانی که در هر مجلس و هر مهمانی جای خالی‌اش احساس می‌شود، اکنون با کیفیت دشت‌زاد تجربه‌ای تازه و برتر پیدا کرده است. دشت‌زاد دانه‌های بزرگ و یکنواخت آفتابگردان دور سفید را انتخاب می‌کند — آنهایی که پوستشان سفید و مغزشان پر و درشت است. برشته‌کاری در دمای دقیق و نمک‌زنی با نمک دریای خالص، این تخمه‌ها را به میان‌وعده‌ای اعتیادآور تبدیل می‌کند. هر تخمه‌ای که می‌شکنید، صدای ترد و خوشایندی دارد که خودش اشتها می‌آورد. تخمه آفتابگردان حاوی ویتامین E، آنتی‌اکسیدان‌های قوی، و اسیدهای چرب مفید است که در زیر پوسته نازکش محفوظ مانده‌اند. با تخمه دشت‌زاد، شب‌های دورهمی، تماشای فیلم، و مجالس خانوادگی‌تان را کامل کنید.`,
        brand: "دشت‌زاد",
        price_rial: 9510000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 180,
        tags: ["تخمه آفتابگردان", "شور", "سنتی", "میان‌وعده", "sunflower"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 9510000,
        categoryId: catMap["tokhme"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 582, "carb_g": 20, "protein_g": 20.8, "fat_g": 51.5, "fiber_g": 8.6, "sugar_g": 2.6}},
      },
      update: {
        title: "تخمه آفتابگردان شور دشت‌زاد",
        latinTitle: "Dashtzad Salted Sunflower Seeds",
        description: `تخمه آفتابگردان شور دشت‌زاد — این تخمه کلاسیک ایرانی که در هر مجلس و هر مهمانی جای خالی‌اش احساس می‌شود، اکنون با کیفیت دشت‌زاد تجربه‌ای تازه و برتر پیدا کرده است. دشت‌زاد دانه‌های بزرگ و یکنواخت آفتابگردان دور سفید را انتخاب می‌کند — آنهایی که پوستشان سفید و مغزشان پر و درشت است. برشته‌کاری در دمای دقیق و نمک‌زنی با نمک دریای خالص، این تخمه‌ها را به میان‌وعده‌ای اعتیادآور تبدیل می‌کند. هر تخمه‌ای که می‌شکنید، صدای ترد و خوشایندی دارد که خودش اشتها می‌آورد. تخمه آفتابگردان حاوی ویتامین E، آنتی‌اکسیدان‌های قوی، و اسیدهای چرب مفید است که در زیر پوسته نازکش محفوظ مانده‌اند. با تخمه دشت‌زاد، شب‌های دورهمی، تماشای فیلم، و مجالس خانوادگی‌تان را کامل کنید.`,
        price_rial: 9510000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 180,
        tags: ["تخمه آفتابگردان", "شور", "سنتی", "میان‌وعده", "sunflower"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 582, "carb_g": 20, "protein_g": 20.8, "fat_g": 51.5, "fiber_g": 8.6, "sugar_g": 2.6}},
        categoryId: catMap["tokhme"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2026/03/14461.webp", alt: "تخمه آفتابگردان شور دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "tokhme-aftabgardan-shoor-dashtzad-100g", calculatedPrice_rial: 9510000, price_rial: 9510000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "tokhme-aftabgardan-shoor-dashtzad-250g", calculatedPrice_rial: 23780000, price_rial: 23780000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "tokhme-aftabgardan-shoor-dashtzad-500g", calculatedPrice_rial: 45170000, price_rial: 45170000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "tokhme-aftabgardan-shoor-dashtzad-1000g", calculatedPrice_rial: 85590000, price_rial: 85590000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "tokhme-hendavaneh-bereshteh-dashtzad" },
      create: {
        title: "تخمه هندوانه برشته دشت‌زاد",
        slug: "tokhme-hendavaneh-bereshteh-dashtzad",
        latinTitle: "Dashtzad Roasted Watermelon Seeds",
        description: `تخمه هندوانه برشته دشت‌زاد، میراث آشپزی ایران است. این تخمه که از دیرباز در خانه‌های ایرانی بوداده می‌شده، حالا با استانداردهای کیفی دشت‌زاد و فرآیند بهداشتی مدرن عرضه می‌شود. تخمه هندوانه یک فوق‌غذا واقعی است که کمتر کسی از خواص شگفت‌انگیزش آگاه است: حاوی ۳۰ گرم پروتئین در ۱۰۰ گرم (بیشتر از گوشت!)، آرژینین بالا (که به گردش خون و قلب کمک می‌کند)، منیزیم، آهن، روی و اسیدهای چرب مفید. آرژینین موجود در تخمه هندوانه در بدن به نیتریک اکسید تبدیل می‌شود که رگ‌های خونی را گشاد می‌کند و به کاهش فشار خون کمک می‌کند. دشت‌زاد تخمه‌های درشت را با برشته‌کاری سبک و نمک متعادل آماده می‌کند تا هم خوشمزه باشد هم مواد مغذی‌اش سالم بماند. یک انتخاب سنتی با ارزش مدرن.`,
        brand: "دشت‌زاد",
        price_rial: 11660000,
        offPrice_rial: 10490000,
        discountPercent: 10,
        countInStock: 100,
        tags: ["تخمه هندوانه", "برشته", "پروتئین بالا", "سنتی", "watermelon seeds"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 11660000,
        categoryId: catMap["tokhme"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 557, "carb_g": 15.3, "protein_g": 28.3, "fat_g": 47.4, "fiber_g": 0.5, "sugar_g": 0}},
      },
      update: {
        title: "تخمه هندوانه برشته دشت‌زاد",
        latinTitle: "Dashtzad Roasted Watermelon Seeds",
        description: `تخمه هندوانه برشته دشت‌زاد، میراث آشپزی ایران است. این تخمه که از دیرباز در خانه‌های ایرانی بوداده می‌شده، حالا با استانداردهای کیفی دشت‌زاد و فرآیند بهداشتی مدرن عرضه می‌شود. تخمه هندوانه یک فوق‌غذا واقعی است که کمتر کسی از خواص شگفت‌انگیزش آگاه است: حاوی ۳۰ گرم پروتئین در ۱۰۰ گرم (بیشتر از گوشت!)، آرژینین بالا (که به گردش خون و قلب کمک می‌کند)، منیزیم، آهن، روی و اسیدهای چرب مفید. آرژینین موجود در تخمه هندوانه در بدن به نیتریک اکسید تبدیل می‌شود که رگ‌های خونی را گشاد می‌کند و به کاهش فشار خون کمک می‌کند. دشت‌زاد تخمه‌های درشت را با برشته‌کاری سبک و نمک متعادل آماده می‌کند تا هم خوشمزه باشد هم مواد مغذی‌اش سالم بماند. یک انتخاب سنتی با ارزش مدرن.`,
        price_rial: 11660000,
        offPrice_rial: 10490000,
        discountPercent: 10,
        countInStock: 100,
        tags: ["تخمه هندوانه", "برشته", "پروتئین بالا", "سنتی", "watermelon seeds"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 557, "carb_g": 15.3, "protein_g": 28.3, "fat_g": 47.4, "fiber_g": 0.5, "sugar_g": 0}},
        categoryId: catMap["tokhme"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p1.jpeg", alt: "تخمه هندوانه برشته دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "tokhme-hendavaneh-bereshteh-dashtzad-100g", calculatedPrice_rial: 11660000, price_rial: 11660000, offPrice_rial: 10490000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "tokhme-hendavaneh-bereshteh-dashtzad-250g", calculatedPrice_rial: 29150000, price_rial: 29150000, offPrice_rial: 26220000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "tokhme-hendavaneh-bereshteh-dashtzad-500g", calculatedPrice_rial: 55380000, price_rial: 55380000, offPrice_rial: 49830000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "tokhme-hendavaneh-bereshteh-dashtzad-1000g", calculatedPrice_rial: 104940000, price_rial: 104940000, offPrice_rial: 94410000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "ajil-mokhallat-momtaz-dashtzad" },
      create: {
        title: "آجیل مخلوط ممتاز دشت‌زاد",
        slug: "ajil-mokhallat-momtaz-dashtzad",
        latinTitle: "Dashtzad Premium Mixed Nuts",
        description: `آجیل مخلوط ممتاز دشت‌زاد — وقتی بهترین‌ها کنار هم قرار می‌گیرند، یک شاهکار به وجود می‌آید. این مجموعه طلایی شامل پسته اکبری برشته زعفرانی، بادام هندی درجه یک، گردوی کاغذی، بادام کاغذی، فندق بوداده، و کشمش سبز است — هر کدام بهترین نمونه از نوع خود. دشت‌زاد این مجموعه را با نسبت‌های دقیق فرموله کرده تا هر کیلوگرم از آجیل مخلوط ممتاز، تعادل ایده‌آل از طعم، بافت، رنگ و ارزش غذایی داشته باشد. این آجیل به شکل طبیعی انرژی‌بخش، پر از پروتئین، فیبر، چربی‌های سالم، ویتامین‌ها و مواد معدنی است. هر مشت از این آجیل، بهتر از هر مکمل ویتامینی است. مناسب برای پذیرایی مهمانی‌های رسمی و دوستانه، جعبه هدیه، و میان‌وعده روزانه. با آجیل مخلوط ممتاز دشت‌زاد، هر جمعی را به یادماندنی تبدیل کنید.`,
        brand: "دشت‌زاد",
        price_rial: 30620000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 65,
        tags: ["آجیل مخلوط", "ممتاز", "پذیرایی", "هدیه", "mixed nuts"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 30620000,
        categoryId: catMap["ajil-mokhallat"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 590, "carb_g": 22, "protein_g": 18.5, "fat_g": 52, "fiber_g": 7.5, "sugar_g": 8.5}},
      },
      update: {
        title: "آجیل مخلوط ممتاز دشت‌زاد",
        latinTitle: "Dashtzad Premium Mixed Nuts",
        description: `آجیل مخلوط ممتاز دشت‌زاد — وقتی بهترین‌ها کنار هم قرار می‌گیرند، یک شاهکار به وجود می‌آید. این مجموعه طلایی شامل پسته اکبری برشته زعفرانی، بادام هندی درجه یک، گردوی کاغذی، بادام کاغذی، فندق بوداده، و کشمش سبز است — هر کدام بهترین نمونه از نوع خود. دشت‌زاد این مجموعه را با نسبت‌های دقیق فرموله کرده تا هر کیلوگرم از آجیل مخلوط ممتاز، تعادل ایده‌آل از طعم، بافت، رنگ و ارزش غذایی داشته باشد. این آجیل به شکل طبیعی انرژی‌بخش، پر از پروتئین، فیبر، چربی‌های سالم، ویتامین‌ها و مواد معدنی است. هر مشت از این آجیل، بهتر از هر مکمل ویتامینی است. مناسب برای پذیرایی مهمانی‌های رسمی و دوستانه، جعبه هدیه، و میان‌وعده روزانه. با آجیل مخلوط ممتاز دشت‌زاد، هر جمعی را به یادماندنی تبدیل کنید.`,
        price_rial: 30620000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 65,
        tags: ["آجیل مخلوط", "ممتاز", "پذیرایی", "هدیه", "mixed nuts"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 590, "carb_g": 22, "protein_g": 18.5, "fat_g": 52, "fiber_g": 7.5, "sugar_g": 8.5}},
        categoryId: catMap["ajil-mokhallat"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/02/4-nuts-mix-barjil-372-1.webp", alt: "آجیل مخلوط ممتاز دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "ajil-mokhallat-momtaz-dashtzad-100g", calculatedPrice_rial: 30620000, price_rial: 30620000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "ajil-mokhallat-momtaz-dashtzad-250g", calculatedPrice_rial: 76550000, price_rial: 76550000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "ajil-mokhallat-momtaz-dashtzad-500g", calculatedPrice_rial: 145440000, price_rial: 145440000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "ajil-mokhallat-momtaz-dashtzad-1000g", calculatedPrice_rial: 275580000, price_rial: 275580000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "ajil-shab-yalda-dashtzad" },
      create: {
        title: "آجیل شب یلدا دشت‌زاد",
        slug: "ajil-shab-yalda-dashtzad",
        latinTitle: "Dashtzad Yalda Night Special Mixed Nuts",
        description: `آجیل شب یلدا دشت‌زاد — بلندترین شب سال را با بهترین آجیل ایران جشن بگیرید. دشت‌زاد برای این مناسبت فرهنگی عزیز، آجیلی ویژه فرموله کرده که ترکیب سنتی شب یلدا را با کیفیت برتر ارائه می‌دهد. این آجیل شامل انجیر خشک شیرین، کشمش سبز آفتابی، گردوی کاغذی با مغز روشن، بادام درختی، فندق بوداده، پسته احمدآقایی، و تخمه هندوانه است. هر جزء این ترکیب به دقت انتخاب شده و تازگی آن تا لحظه تحویل تضمین‌شده است. نسبت‌های سنتی را رعایت کرده‌ایم اما با انتخاب بهترین نمونه از هر نوع، این آجیل را به سطحی ارتقا داده‌ایم که شایسته بلندترین شب سال باشد. بسته‌بندی زیبا و جذاب دشت‌زاد، این آجیل را به یک هدیه ارزشمند برای عزیزانتان تبدیل می‌کند. یلدایتان پر از گرما، شادی و طعم‌های اصیل باشد.`,
        brand: "دشت‌زاد",
        price_rial: 25330000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 45,
        tags: ["آجیل شب یلدا", "مخلوط سنتی", "هدیه", "یلدا", "Yalda night"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 25330000,
        categoryId: catMap["ajil-mokhallat"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 520, "carb_g": 35, "protein_g": 14, "fat_g": 42, "fiber_g": 8, "sugar_g": 22}},
      },
      update: {
        title: "آجیل شب یلدا دشت‌زاد",
        latinTitle: "Dashtzad Yalda Night Special Mixed Nuts",
        description: `آجیل شب یلدا دشت‌زاد — بلندترین شب سال را با بهترین آجیل ایران جشن بگیرید. دشت‌زاد برای این مناسبت فرهنگی عزیز، آجیلی ویژه فرموله کرده که ترکیب سنتی شب یلدا را با کیفیت برتر ارائه می‌دهد. این آجیل شامل انجیر خشک شیرین، کشمش سبز آفتابی، گردوی کاغذی با مغز روشن، بادام درختی، فندق بوداده، پسته احمدآقایی، و تخمه هندوانه است. هر جزء این ترکیب به دقت انتخاب شده و تازگی آن تا لحظه تحویل تضمین‌شده است. نسبت‌های سنتی را رعایت کرده‌ایم اما با انتخاب بهترین نمونه از هر نوع، این آجیل را به سطحی ارتقا داده‌ایم که شایسته بلندترین شب سال باشد. بسته‌بندی زیبا و جذاب دشت‌زاد، این آجیل را به یک هدیه ارزشمند برای عزیزانتان تبدیل می‌کند. یلدایتان پر از گرما، شادی و طعم‌های اصیل باشد.`,
        price_rial: 25330000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 45,
        tags: ["آجیل شب یلدا", "مخلوط سنتی", "هدیه", "یلدا", "Yalda night"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 520, "carb_g": 35, "protein_g": 14, "fat_g": 42, "fiber_g": 8, "sugar_g": 22}},
        categoryId: catMap["ajil-mokhallat"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2021/02/nowruz-ajil-mix-barjil-375-1.webp", alt: "آجیل شب یلدا دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "ajil-shab-yalda-dashtzad-250g", calculatedPrice_rial: 63320000, price_rial: 63320000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "ajil-shab-yalda-dashtzad-500g", calculatedPrice_rial: 120320000, price_rial: 120320000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "ajil-shab-yalda-dashtzad-1000g", calculatedPrice_rial: 227970000, price_rial: 227970000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "badam-rookesh-shokolatee-dashtzad" },
      create: {
        title: "بادام روکش شکلاتی دشت‌زاد",
        slug: "badam-rookesh-shokolatee-dashtzad",
        latinTitle: "Dashtzad Chocolate-Coated Almond",
        description: `بادام روکش شکلاتی دشت‌زاد — ترکیبی که همیشه جواب می‌دهد: یک بادام ترد و خوشمزه زیر لایه‌ای از شکلات تلخ اصیل. دشت‌زاد از بادام کاغذی درجه یک استفاده می‌کند و آن را با شکلات تلخ پوشانده که از کاکائوی برزیلی با درصد بالا تهیه شده است. هر دانه با دقت پوشش داده می‌شود تا لایه‌ای یکنواخت و براق از شکلات داشته باشد. در دهان که می‌گذارید، ابتدا تلخی لطیف شکلات، سپس شیرینی ملایم و در نهایت ترد بودن بادام را حس می‌کنید — یک تجربه سه‌گانه بی‌نظیر. شکلات تلخ سرشار از فلاوانول‌های کاکائو است که به بهبود جریان خون، کاهش فشار خون و ارتقای خلق‌وخو کمک می‌کند. ترکیب آن با بادام، این خوراکی را از یک تنقلات لذیذ به یک میان‌وعده هوشمند تبدیل می‌کند. برای هدیه، مجالس ویژه و پذیرایی شیک عالی است.`,
        brand: "دشت‌زاد",
        price_rial: 18500000,
        offPrice_rial: 16650000,
        discountPercent: 10,
        countInStock: 70,
        tags: ["بادام روکش‌دار", "شکلات تلخ", "لاکچری", "هدیه", "chocolate almond"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 18500000,
        categoryId: catMap["ajil-rokooshdhar"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 530, "carb_g": 40.5, "protein_g": 12, "fat_g": 38, "fiber_g": 6.5, "sugar_g": 28}},
      },
      update: {
        title: "بادام روکش شکلاتی دشت‌زاد",
        latinTitle: "Dashtzad Chocolate-Coated Almond",
        description: `بادام روکش شکلاتی دشت‌زاد — ترکیبی که همیشه جواب می‌دهد: یک بادام ترد و خوشمزه زیر لایه‌ای از شکلات تلخ اصیل. دشت‌زاد از بادام کاغذی درجه یک استفاده می‌کند و آن را با شکلات تلخ پوشانده که از کاکائوی برزیلی با درصد بالا تهیه شده است. هر دانه با دقت پوشش داده می‌شود تا لایه‌ای یکنواخت و براق از شکلات داشته باشد. در دهان که می‌گذارید، ابتدا تلخی لطیف شکلات، سپس شیرینی ملایم و در نهایت ترد بودن بادام را حس می‌کنید — یک تجربه سه‌گانه بی‌نظیر. شکلات تلخ سرشار از فلاوانول‌های کاکائو است که به بهبود جریان خون، کاهش فشار خون و ارتقای خلق‌وخو کمک می‌کند. ترکیب آن با بادام، این خوراکی را از یک تنقلات لذیذ به یک میان‌وعده هوشمند تبدیل می‌کند. برای هدیه، مجالس ویژه و پذیرایی شیک عالی است.`,
        price_rial: 18500000,
        offPrice_rial: 16650000,
        discountPercent: 10,
        countInStock: 70,
        tags: ["بادام روکش‌دار", "شکلات تلخ", "لاکچری", "هدیه", "chocolate almond"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 530, "carb_g": 40.5, "protein_g": 12, "fat_g": 38, "fiber_g": 6.5, "sugar_g": 28}},
        categoryId: catMap["ajil-rokooshdhar"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p1.jpeg", alt: "بادام روکش شکلاتی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "badam-rookesh-shokolatee-dashtzad-100g", calculatedPrice_rial: 18500000, price_rial: 18500000, offPrice_rial: 16650000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "badam-rookesh-shokolatee-dashtzad-250g", calculatedPrice_rial: 46250000, price_rial: 46250000, offPrice_rial: 41620000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "badam-rookesh-shokolatee-dashtzad-500g", calculatedPrice_rial: 87880000, price_rial: 87880000, offPrice_rial: 79090000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "nokhodchi-rookeshdar-zafrani-dashtzad" },
      create: {
        title: "نخودچی روکش‌دار زعفرانی دشت‌زاد",
        slug: "nokhodchi-rookeshdar-zafrani-dashtzad",
        latinTitle: "Dashtzad Saffron Coated Chickpeas",
        description: `نخودچی روکش‌دار زعفرانی دشت‌زاد — این تنقلات سنتی ایرانی در لباسی نو و فاخر. دشت‌زاد نخودهای ممتاز را در آرد طلایی برپوشی می‌کند و با زعفران اصیل ایرانی رنگ و عطر می‌بخشد تا نخودچی‌ای خلق شود که از هر نخودچی معمولی در بازار متفاوت باشد. پوسته ترد و ضخیم در دهان می‌شکند و نخودِ نرم و پخته زیرش را آشکار می‌کند — یک تضاد بافتی دلنشین که هرگز خسته‌کننده نمی‌شود. نخودچی روکش‌دار دشت‌زاد منبع خوبی از کربوهیدرات پیچیده، پروتئین گیاهی و فیبر است که انرژی پایدار تأمین می‌کند. نمک متعادل و عطر زعفران آن را به بهترین همراه چای بعدازظهر، پذیرایی مجالس و دورهمی‌های خانوادگی تبدیل می‌کند. بسته‌بندی تازه و بهداشتی دشت‌زاد، ترد بودن نخودچی را تا آخرین دانه حفظ می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 8500000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 130,
        tags: ["نخودچی", "روکش‌دار", "زعفران", "سنتی", "coated chickpeas"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 8500000,
        categoryId: catMap["ajil-rokooshdhar"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 450, "carb_g": 62, "protein_g": 14.5, "fat_g": 16.5, "fiber_g": 8, "sugar_g": 5}},
      },
      update: {
        title: "نخودچی روکش‌دار زعفرانی دشت‌زاد",
        latinTitle: "Dashtzad Saffron Coated Chickpeas",
        description: `نخودچی روکش‌دار زعفرانی دشت‌زاد — این تنقلات سنتی ایرانی در لباسی نو و فاخر. دشت‌زاد نخودهای ممتاز را در آرد طلایی برپوشی می‌کند و با زعفران اصیل ایرانی رنگ و عطر می‌بخشد تا نخودچی‌ای خلق شود که از هر نخودچی معمولی در بازار متفاوت باشد. پوسته ترد و ضخیم در دهان می‌شکند و نخودِ نرم و پخته زیرش را آشکار می‌کند — یک تضاد بافتی دلنشین که هرگز خسته‌کننده نمی‌شود. نخودچی روکش‌دار دشت‌زاد منبع خوبی از کربوهیدرات پیچیده، پروتئین گیاهی و فیبر است که انرژی پایدار تأمین می‌کند. نمک متعادل و عطر زعفران آن را به بهترین همراه چای بعدازظهر، پذیرایی مجالس و دورهمی‌های خانوادگی تبدیل می‌کند. بسته‌بندی تازه و بهداشتی دشت‌زاد، ترد بودن نخودچی را تا آخرین دانه حفظ می‌کند.`,
        price_rial: 8500000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 130,
        tags: ["نخودچی", "روکش‌دار", "زعفران", "سنتی", "coated chickpeas"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 450, "carb_g": 62, "protein_g": 14.5, "fat_g": 16.5, "fiber_g": 8, "sugar_g": 5}},
        categoryId: catMap["ajil-rokooshdhar"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p1.jpeg", alt: "نخودچی روکش‌دار زعفرانی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "nokhodchi-rookeshdar-zafrani-dashtzad-100g", calculatedPrice_rial: 8500000, price_rial: 8500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "nokhodchi-rookeshdar-zafrani-dashtzad-250g", calculatedPrice_rial: 21250000, price_rial: 21250000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "nokhodchi-rookeshdar-zafrani-dashtzad-500g", calculatedPrice_rial: 40380000, price_rial: 40380000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "nokhodchi-rookeshdar-zafrani-dashtzad-1000g", calculatedPrice_rial: 76500000, price_rial: 76500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "ajil-eqtesadi-khanevadegi-dashtzad" },
      create: {
        title: "آجیل اقتصادی خانوادگی دشت‌زاد",
        slug: "ajil-eqtesadi-khanevadegi-dashtzad",
        latinTitle: "Dashtzad Family Economy Mixed Nuts",
        description: `آجیل اقتصادی خانوادگی دشت‌زاد — بهترین کیفیت با قیمتی که به همه می‌رسد. دشت‌زاد باور دارد که همه خانواده‌های ایرانی حق دارند از آجیل با کیفیت واقعی لذت ببرند، نه اینکه بین قیمت و کیفیت دست به گزینش بزنند. برای همین این آجیل با ترکیبی هوشمندانه از مغزها و دانه‌ها فرموله شده که هم مقرون‌به‌صرفه باشد، هم مغذی، هم خوشمزه. این آجیل شامل بادام زمینی برشته شور، تخمه آفتابگردان، نخودچی، کشمش و مقداری بادام درختی است — ترکیبی که به همه ذائقه‌ها پاسخ می‌دهد. برای شب‌های دورهمی، تلویزیون دیدن، و نگه داشتن در خانه برای مهمان‌های ناگهانی ایده‌آل است. کیفیت دشت‌زاد در قالبی اقتصادی — چون کیفیت نباید گران باشد.`,
        brand: "دشت‌زاد",
        price_rial: 9800000,
        offPrice_rial: 8820000,
        discountPercent: 10,
        countInStock: 250,
        tags: ["آجیل اقتصادی", "خانوادگی", "مقرون‌به‌صرفه", "مخلوط", "economy nuts"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 9800000,
        categoryId: catMap["ajil-eqtesadi"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 498, "carb_g": 32, "protein_g": 16.5, "fat_g": 38.5, "fiber_g": 7, "sugar_g": 12}},
      },
      update: {
        title: "آجیل اقتصادی خانوادگی دشت‌زاد",
        latinTitle: "Dashtzad Family Economy Mixed Nuts",
        description: `آجیل اقتصادی خانوادگی دشت‌زاد — بهترین کیفیت با قیمتی که به همه می‌رسد. دشت‌زاد باور دارد که همه خانواده‌های ایرانی حق دارند از آجیل با کیفیت واقعی لذت ببرند، نه اینکه بین قیمت و کیفیت دست به گزینش بزنند. برای همین این آجیل با ترکیبی هوشمندانه از مغزها و دانه‌ها فرموله شده که هم مقرون‌به‌صرفه باشد، هم مغذی، هم خوشمزه. این آجیل شامل بادام زمینی برشته شور، تخمه آفتابگردان، نخودچی، کشمش و مقداری بادام درختی است — ترکیبی که به همه ذائقه‌ها پاسخ می‌دهد. برای شب‌های دورهمی، تلویزیون دیدن، و نگه داشتن در خانه برای مهمان‌های ناگهانی ایده‌آل است. کیفیت دشت‌زاد در قالبی اقتصادی — چون کیفیت نباید گران باشد.`,
        price_rial: 9800000,
        offPrice_rial: 8820000,
        discountPercent: 10,
        countInStock: 250,
        tags: ["آجیل اقتصادی", "خانوادگی", "مقرون‌به‌صرفه", "مخلوط", "economy nuts"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 498, "carb_g": 32, "protein_g": 16.5, "fat_g": 38.5, "fiber_g": 7, "sugar_g": 12}},
        categoryId: catMap["ajil-eqtesadi"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2023/05/student-nuts-mix-barjil-282-1.webp", alt: "آجیل اقتصادی خانوادگی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "ajil-eqtesadi-khanevadegi-dashtzad-250g", calculatedPrice_rial: 24500000, price_rial: 24500000, offPrice_rial: 22050000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "ajil-eqtesadi-khanevadegi-dashtzad-500g", calculatedPrice_rial: 46550000, price_rial: 46550000, offPrice_rial: 41900000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "ajil-eqtesadi-khanevadegi-dashtzad-1000g", calculatedPrice_rial: 88200000, price_rial: 88200000, offPrice_rial: 79380000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "ajil-eqtesadi-daneshjui-dashtzad" },
      create: {
        title: "آجیل اقتصادی دانشجویی دشت‌زاد",
        slug: "ajil-eqtesadi-daneshjui-dashtzad",
        latinTitle: "Dashtzad Student Economy Mixed Nuts",
        description: `آجیل اقتصادی دانشجویی دشت‌زاد، همراه مطمئن دانشجویان، برنامه‌نویسان، و همه کسانی که ساعات طولانی کار و مطالعه دارند. این آجیل برای تأمین انرژی پایدار در ساعات کاری و درسی طراحی شده — ترکیبی که قند خون را یکنواخت نگه می‌دارد، تمرکز را بالا می‌برد و از کاهش انرژی ناگهانی جلوگیری می‌کند. شامل بادام زمینی، نخودچی، کشمش، تخمه کدو، و کمی آجیل ترد است. بر خلاف تنقلات صنعتی که پر از قند مصنوعی و رنگ‌دهنده هستند، آجیل دانشجویی دشت‌زاد کاملاً طبیعی و بدون افزودنی مضر است. یک بسته ۲۵۰ گرمی که در کیف می‌گذارید و چند روز انرژی طبیعی در اختیارتان قرار می‌دهد. چون دشت‌زاد به نسل آینده ایران اهمیت می‌دهد.`,
        brand: "دشت‌زاد",
        price_rial: 8500000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 200,
        tags: ["آجیل دانشجویی", "اقتصادی", "انرژی", "طبیعی", "student nuts"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 8500000,
        categoryId: catMap["ajil-eqtesadi"] ?? catMap["ajil-va-maghzha"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 480, "carb_g": 35, "protein_g": 15, "fat_g": 35, "fiber_g": 6.5, "sugar_g": 14}},
      },
      update: {
        title: "آجیل اقتصادی دانشجویی دشت‌زاد",
        latinTitle: "Dashtzad Student Economy Mixed Nuts",
        description: `آجیل اقتصادی دانشجویی دشت‌زاد، همراه مطمئن دانشجویان، برنامه‌نویسان، و همه کسانی که ساعات طولانی کار و مطالعه دارند. این آجیل برای تأمین انرژی پایدار در ساعات کاری و درسی طراحی شده — ترکیبی که قند خون را یکنواخت نگه می‌دارد، تمرکز را بالا می‌برد و از کاهش انرژی ناگهانی جلوگیری می‌کند. شامل بادام زمینی، نخودچی، کشمش، تخمه کدو، و کمی آجیل ترد است. بر خلاف تنقلات صنعتی که پر از قند مصنوعی و رنگ‌دهنده هستند، آجیل دانشجویی دشت‌زاد کاملاً طبیعی و بدون افزودنی مضر است. یک بسته ۲۵۰ گرمی که در کیف می‌گذارید و چند روز انرژی طبیعی در اختیارتان قرار می‌دهد. چون دشت‌زاد به نسل آینده ایران اهمیت می‌دهد.`,
        price_rial: 8500000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 200,
        tags: ["آجیل دانشجویی", "اقتصادی", "انرژی", "طبیعی", "student nuts"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 480, "carb_g": 35, "protein_g": 15, "fat_g": 35, "fiber_g": 6.5, "sugar_g": 14}},
        categoryId: catMap["ajil-eqtesadi"] ?? catMap["ajil-va-maghzha"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2023/05/student-nuts-mix-barjil-282-1.webp", alt: "آجیل اقتصادی دانشجویی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "ajil-eqtesadi-daneshjui-dashtzad-100g", calculatedPrice_rial: 8500000, price_rial: 8500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "ajil-eqtesadi-daneshjui-dashtzad-250g", calculatedPrice_rial: 21250000, price_rial: 21250000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "ajil-eqtesadi-daneshjui-dashtzad-500g", calculatedPrice_rial: 40380000, price_rial: 40380000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-apple-slices" },
      create: {
        title: "سیب خشک ورقه‌ای دشت‌زاد",
        slug: "dried-apple-slices",
        latinTitle: "Dried Apple Slices",
        description: `سیب خشک ورقه‌ای دشت‌زاد، محصولی برتر از باغات سرسبز مراغه و آذربایجان شرقی است که با دقت و مهارت تهیه می‌شود. دشت‌زاد با انتخاب بهترین سیب‌های بومی و خشک کردن آن‌ها به روش طبیعی، طعمی اصیل و بی‌نظیر را برای شما به ارمغان می‌آورد. هر ورقه از این سیب خشک، ترکیبی بی‌نظیر از طعم ترش و شیرین بهاری را در خود دارد که یادآور باغ‌های سرسبز اواخر تابستان است. این محصول بدون افزودنی‌های مصنوعی و مواد نگهدارنده، کاملاً طبیعی و سالم تهیه شده و سرشار از فیبر غذایی، ویتامین C و آنتی‌اکسیدان‌های طبیعی است. مصرف روزانه سیب خشک دشت‌زاد به تقویت سیستم ایمنی بدن، بهبود گوارش، حفظ سلامت قلب و کنترل قند خون کمک می‌کند. این خوراکی مغذی و خوشمزه برای تمام افراد خانواده، از کودکان تا سالمندان، مناسب است و می‌توان آن را به عنوان میان‌وعده‌ای سالم، همراه با چای، در پذیرایی‌ها یا ترکیب با غلات صبحانه مصرف کرد. بسته‌بندی مدرن و بهداشتی دشت‌زاد طراوت و کیفیت محصول را تا لحظه مصرف حفظ می‌کند. همچنین این محصول منبع غنی از پتاسیم و منیزیم است که به سلامت عضلات و استخوان‌ها کمک می‌نماید. سیب خشک دشت‌زاد ایده‌آل برای سفر، محیط کار و مدرسه است.`,
        brand: "دشت‌زاد",
        price_rial: 2430000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 120,
        tags: ["سیب خشک", "میوه خشک ورقه‌ای", "طبیعی", "بدون افزودنی", "مراغه", "آذربایجان"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 2430000,
        categoryId: catMap["miveh-khoshk-varaqei"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 243, "carb_g": 62.4, "protein_g": 3.3, "fat_g": 1.1, "fiber_g": 10.1, "sugar_g": 48.4}},
      },
      update: {
        title: "سیب خشک ورقه‌ای دشت‌زاد",
        latinTitle: "Dried Apple Slices",
        description: `سیب خشک ورقه‌ای دشت‌زاد، محصولی برتر از باغات سرسبز مراغه و آذربایجان شرقی است که با دقت و مهارت تهیه می‌شود. دشت‌زاد با انتخاب بهترین سیب‌های بومی و خشک کردن آن‌ها به روش طبیعی، طعمی اصیل و بی‌نظیر را برای شما به ارمغان می‌آورد. هر ورقه از این سیب خشک، ترکیبی بی‌نظیر از طعم ترش و شیرین بهاری را در خود دارد که یادآور باغ‌های سرسبز اواخر تابستان است. این محصول بدون افزودنی‌های مصنوعی و مواد نگهدارنده، کاملاً طبیعی و سالم تهیه شده و سرشار از فیبر غذایی، ویتامین C و آنتی‌اکسیدان‌های طبیعی است. مصرف روزانه سیب خشک دشت‌زاد به تقویت سیستم ایمنی بدن، بهبود گوارش، حفظ سلامت قلب و کنترل قند خون کمک می‌کند. این خوراکی مغذی و خوشمزه برای تمام افراد خانواده، از کودکان تا سالمندان، مناسب است و می‌توان آن را به عنوان میان‌وعده‌ای سالم، همراه با چای، در پذیرایی‌ها یا ترکیب با غلات صبحانه مصرف کرد. بسته‌بندی مدرن و بهداشتی دشت‌زاد طراوت و کیفیت محصول را تا لحظه مصرف حفظ می‌کند. همچنین این محصول منبع غنی از پتاسیم و منیزیم است که به سلامت عضلات و استخوان‌ها کمک می‌نماید. سیب خشک دشت‌زاد ایده‌آل برای سفر، محیط کار و مدرسه است.`,
        price_rial: 2430000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 120,
        tags: ["سیب خشک", "میوه خشک ورقه‌ای", "طبیعی", "بدون افزودنی", "مراغه", "آذربایجان"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 243, "carb_g": 62.4, "protein_g": 3.3, "fat_g": 1.1, "fiber_g": 10.1, "sugar_g": 48.4}},
        categoryId: catMap["miveh-khoshk-varaqei"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/sliced-dried-sour-apple-barjil-141-1.webp", alt: "سیب خشک ورقه‌ای دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-apple-slices-100g", calculatedPrice_rial: 2430000, price_rial: 2430000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-apple-slices-250g", calculatedPrice_rial: 6080000, price_rial: 6080000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-apple-slices-500g", calculatedPrice_rial: 11540000, price_rial: 11540000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-banana-slices" },
      create: {
        title: "موز خشک ورقه‌ای دشت‌زاد",
        slug: "dried-banana-slices",
        latinTitle: "Dried Banana Slices",
        description: `موز خشک ورقه‌ای دشت‌زاد، لذتی استوایی در قالبی سالم و مغذی است که از بهترین موزهای برگزیده تهیه می‌شود. دشت‌زاد با بهره‌گیری از فرآیند خشک‌کردن کنترل‌شده، طعم شیرین و دلپذیر موز تازه را در این برش‌های طلایی حفظ کرده است. هر ورقه موز خشک دشت‌زاد، سرشار از پتاسیم، فیبر غذایی، ویتامین‌های A و C و آنتی‌اکسیدان‌های طبیعی است که به سلامت قلب، تقویت انرژی و بهبود عملکرد عضلانی کمک می‌کنند. این محصول کاملاً بدون شکر افزوده و مواد نگهدارنده مصنوعی تهیه شده و گزینه‌ای ایده‌آل برای افرادی است که به تغذیه سالم اهمیت می‌دهند. موز خشک ورقه‌ای دشت‌زاد با طعم شیرین طبیعی خود، جایگزینی عالی برای شیرینی‌جات و تنقلات ناسالم است. این محصول برای ورزشکاران، دانش‌آموزان و همه کسانی که به دنبال میان‌وعده‌ای پرانرژی هستند بسیار مناسب است. می‌توان آن را به تنهایی مصرف کرد یا با بستنی، ماست، اسموتی یا غلات صبحانه ترکیب نمود. بسته‌بندی زیپ‌دار دشت‌زاد تازگی محصول را برای مدت طولانی حفظ می‌کند. هر بار که دهانتان شیرین‌خواه است، به موز خشک دشت‌زاد اعتماد کنید.`,
        brand: "دشت‌زاد",
        price_rial: 2072000,
        offPrice_rial: 1864800,
        discountPercent: 10,
        countInStock: 85,
        tags: ["موز خشک", "میوه خشک ورقه‌ای", "استوایی", "پتاسیم", "انرژی‌زا"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 2072000,
        categoryId: catMap["miveh-khoshk-varaqei"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 346, "carb_g": 88.3, "protein_g": 3.9, "fat_g": 1.8, "fiber_g": 9.9, "sugar_g": 47.3}},
      },
      update: {
        title: "موز خشک ورقه‌ای دشت‌زاد",
        latinTitle: "Dried Banana Slices",
        description: `موز خشک ورقه‌ای دشت‌زاد، لذتی استوایی در قالبی سالم و مغذی است که از بهترین موزهای برگزیده تهیه می‌شود. دشت‌زاد با بهره‌گیری از فرآیند خشک‌کردن کنترل‌شده، طعم شیرین و دلپذیر موز تازه را در این برش‌های طلایی حفظ کرده است. هر ورقه موز خشک دشت‌زاد، سرشار از پتاسیم، فیبر غذایی، ویتامین‌های A و C و آنتی‌اکسیدان‌های طبیعی است که به سلامت قلب، تقویت انرژی و بهبود عملکرد عضلانی کمک می‌کنند. این محصول کاملاً بدون شکر افزوده و مواد نگهدارنده مصنوعی تهیه شده و گزینه‌ای ایده‌آل برای افرادی است که به تغذیه سالم اهمیت می‌دهند. موز خشک ورقه‌ای دشت‌زاد با طعم شیرین طبیعی خود، جایگزینی عالی برای شیرینی‌جات و تنقلات ناسالم است. این محصول برای ورزشکاران، دانش‌آموزان و همه کسانی که به دنبال میان‌وعده‌ای پرانرژی هستند بسیار مناسب است. می‌توان آن را به تنهایی مصرف کرد یا با بستنی، ماست، اسموتی یا غلات صبحانه ترکیب نمود. بسته‌بندی زیپ‌دار دشت‌زاد تازگی محصول را برای مدت طولانی حفظ می‌کند. هر بار که دهانتان شیرین‌خواه است، به موز خشک دشت‌زاد اعتماد کنید.`,
        price_rial: 2072000,
        offPrice_rial: 1864800,
        discountPercent: 10,
        countInStock: 85,
        tags: ["موز خشک", "میوه خشک ورقه‌ای", "استوایی", "پتاسیم", "انرژی‌زا"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 346, "carb_g": 88.3, "protein_g": 3.9, "fat_g": 1.8, "fiber_g": 9.9, "sugar_g": 47.3}},
        categoryId: catMap["miveh-khoshk-varaqei"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/sliced-dried-banana-barjil-4-1.webp", alt: "موز خشک ورقه‌ای دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-banana-slices-100g", calculatedPrice_rial: 2070000, price_rial: 2070000, offPrice_rial: 1860000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-banana-slices-250g", calculatedPrice_rial: 5180000, price_rial: 5180000, offPrice_rial: 4660000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-banana-slices-500g", calculatedPrice_rial: 9840000, price_rial: 9840000, offPrice_rial: 8860000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-pineapple-slices" },
      create: {
        title: "آناناس خشک ورقه‌ای دشت‌زاد",
        slug: "dried-pineapple-slices",
        latinTitle: "Dried Pineapple Slices",
        description: `آناناس خشک ورقه‌ای دشت‌زاد، شاهکاری از طعم استوایی است که از آناناس‌های شیرین و رسیده تهیه شده است. این محصول با فرآیند خشک‌کردن تدریجی و دمای کنترل‌شده، تمامی ارزش‌های غذایی و آنتی‌اکسیدان‌های ارزشمند آناناس تازه را حفظ می‌کند. آناناس خشک دشت‌زاد حاوی آنزیم بروملین است که در هضم پروتئین‌ها نقش مهمی دارد و به بهبود گوارش و کاهش التهاب کمک می‌کند. همچنین این میوه خشک منبع غنی از ویتامین C، منگنز و فلاونوئیدها است. طعم شیرین و کمی ترش این محصول، هر روز را با طراوت و انرژی آغاز می‌کند. می‌توان آناناس خشک دشت‌زاد را در پخت کیک، شیرینی و دسرها استفاده کرد یا به عنوان تنقل سالم در طول روز میل نمود. این محصول بدون افزودنی و در بسته‌بندی بهداشتی عرضه می‌شود و تازگی خود را تا مدت طولانی حفظ می‌کند. ترکیب آناناس خشک با آجیل و سایر میوه‌های خشک دشت‌زاد، یک میان‌وعده فوق‌العاده متنوع و مغذی فراهم می‌آورد که برای تمام مناسبت‌ها مناسب است.`,
        brand: "دشت‌زاد",
        price_rial: 1382000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 70,
        tags: ["آناناس خشک", "میوه خشک ورقه‌ای", "استوایی", "بروملین", "ویتامین C"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 1382000,
        categoryId: catMap["miveh-khoshk-varaqei"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 357, "carb_g": 89.1, "protein_g": 3, "fat_g": 1, "fiber_g": 11.5, "sugar_g": 66}},
      },
      update: {
        title: "آناناس خشک ورقه‌ای دشت‌زاد",
        latinTitle: "Dried Pineapple Slices",
        description: `آناناس خشک ورقه‌ای دشت‌زاد، شاهکاری از طعم استوایی است که از آناناس‌های شیرین و رسیده تهیه شده است. این محصول با فرآیند خشک‌کردن تدریجی و دمای کنترل‌شده، تمامی ارزش‌های غذایی و آنتی‌اکسیدان‌های ارزشمند آناناس تازه را حفظ می‌کند. آناناس خشک دشت‌زاد حاوی آنزیم بروملین است که در هضم پروتئین‌ها نقش مهمی دارد و به بهبود گوارش و کاهش التهاب کمک می‌کند. همچنین این میوه خشک منبع غنی از ویتامین C، منگنز و فلاونوئیدها است. طعم شیرین و کمی ترش این محصول، هر روز را با طراوت و انرژی آغاز می‌کند. می‌توان آناناس خشک دشت‌زاد را در پخت کیک، شیرینی و دسرها استفاده کرد یا به عنوان تنقل سالم در طول روز میل نمود. این محصول بدون افزودنی و در بسته‌بندی بهداشتی عرضه می‌شود و تازگی خود را تا مدت طولانی حفظ می‌کند. ترکیب آناناس خشک با آجیل و سایر میوه‌های خشک دشت‌زاد، یک میان‌وعده فوق‌العاده متنوع و مغذی فراهم می‌آورد که برای تمام مناسبت‌ها مناسب است.`,
        price_rial: 1382000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 70,
        tags: ["آناناس خشک", "میوه خشک ورقه‌ای", "استوایی", "بروملین", "ویتامین C"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 357, "carb_g": 89.1, "protein_g": 3, "fat_g": 1, "fiber_g": 11.5, "sugar_g": 66}},
        categoryId: catMap["miveh-khoshk-varaqei"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/sliced-dried-pineapples-barjil-7-1.webp", alt: "آناناس خشک ورقه‌ای دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-pineapple-slices-100g", calculatedPrice_rial: 1380000, price_rial: 1380000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-pineapple-slices-250g", calculatedPrice_rial: 3460000, price_rial: 3460000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-pineapple-slices-500g", calculatedPrice_rial: 6560000, price_rial: 6560000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-kiwi-slices" },
      create: {
        title: "کیوی خشک ورقه‌ای دشت‌زاد",
        slug: "dried-kiwi-slices",
        latinTitle: "Dried Kiwi Slices",
        description: `کیوی خشک ورقه‌ای دشت‌زاد، یکی از محبوب‌ترین میوه‌های خشک در میان خانواده‌های ایرانی است که از کیوی‌های ممتاز کشت‌شده در باغات مازندران تهیه می‌شود. مازندران با آب‌وهوای مرطوب و خاک غنی، یکی از بهترین مناطق کشت کیوی در ایران است و دشت‌زاد با افتخار از این میوه‌های درجه یک استفاده می‌کند. هر ورقه کیوی خشک دشت‌زاد، دارای طعمی ترش و دلنشین است و سرشار از ویتامین C، پتاسیم، فیبر و آنتی‌اکسیدان‌های قوی است. مطالعات نشان می‌دهند مصرف کیوی به تقویت سیستم ایمنی، بهبود خواب، کاهش فشار خون و سلامت پوست کمک می‌کند. کیوی خشک دشت‌زاد بدون هیچ‌گونه افزودنی، مواد نگهدارنده یا رنگ مصنوعی تهیه شده و در بسته‌بندی زیپ‌دار بهداشتی عرضه می‌شود. این محصول برای مصرف به عنوان میان‌وعده روزانه، همراه با یوگورت و دسرهای مختلف، در سالادها و پذیرایی‌های رسمی ایده‌آل است. کیوی خشک دشت‌زاد هدیه‌ای ارزشمند به افراد مورد علاقه‌تان است.`,
        brand: "دشت‌زاد",
        price_rial: 2592000,
        offPrice_rial: 2203200,
        discountPercent: 15,
        countInStock: 95,
        tags: ["کیوی خشک", "میوه خشک ورقه‌ای", "مازندران", "ویتامین C", "ترش"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 2592000,
        categoryId: catMap["miveh-khoshk-varaqei"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 331, "carb_g": 80.5, "protein_g": 3.8, "fat_g": 1.1, "fiber_g": 10.5, "sugar_g": 56.4}},
      },
      update: {
        title: "کیوی خشک ورقه‌ای دشت‌زاد",
        latinTitle: "Dried Kiwi Slices",
        description: `کیوی خشک ورقه‌ای دشت‌زاد، یکی از محبوب‌ترین میوه‌های خشک در میان خانواده‌های ایرانی است که از کیوی‌های ممتاز کشت‌شده در باغات مازندران تهیه می‌شود. مازندران با آب‌وهوای مرطوب و خاک غنی، یکی از بهترین مناطق کشت کیوی در ایران است و دشت‌زاد با افتخار از این میوه‌های درجه یک استفاده می‌کند. هر ورقه کیوی خشک دشت‌زاد، دارای طعمی ترش و دلنشین است و سرشار از ویتامین C، پتاسیم، فیبر و آنتی‌اکسیدان‌های قوی است. مطالعات نشان می‌دهند مصرف کیوی به تقویت سیستم ایمنی، بهبود خواب، کاهش فشار خون و سلامت پوست کمک می‌کند. کیوی خشک دشت‌زاد بدون هیچ‌گونه افزودنی، مواد نگهدارنده یا رنگ مصنوعی تهیه شده و در بسته‌بندی زیپ‌دار بهداشتی عرضه می‌شود. این محصول برای مصرف به عنوان میان‌وعده روزانه، همراه با یوگورت و دسرهای مختلف، در سالادها و پذیرایی‌های رسمی ایده‌آل است. کیوی خشک دشت‌زاد هدیه‌ای ارزشمند به افراد مورد علاقه‌تان است.`,
        price_rial: 2592000,
        offPrice_rial: 2203200,
        discountPercent: 15,
        countInStock: 95,
        tags: ["کیوی خشک", "میوه خشک ورقه‌ای", "مازندران", "ویتامین C", "ترش"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 331, "carb_g": 80.5, "protein_g": 3.8, "fat_g": 1.1, "fiber_g": 10.5, "sugar_g": 56.4}},
        categoryId: catMap["miveh-khoshk-varaqei"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/sliced-dried-kiwi-barjil-140-1.webp", alt: "کیوی خشک ورقه‌ای دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-kiwi-slices-100g", calculatedPrice_rial: 2590000, price_rial: 2590000, offPrice_rial: 2200000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-kiwi-slices-250g", calculatedPrice_rial: 6480000, price_rial: 6480000, offPrice_rial: 5510000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-kiwi-slices-500g", calculatedPrice_rial: 12310000, price_rial: 12310000, offPrice_rial: 10470000, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "dried-kiwi-slices-1000g", calculatedPrice_rial: 23330000, price_rial: 23330000, offPrice_rial: 19830000, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-strawberry" },
      create: {
        title: "توت‌فرنگی خشک دشت‌زاد",
        slug: "dried-strawberry",
        latinTitle: "Dried Strawberry",
        description: `توت‌فرنگی خشک دشت‌زاد، لذتی سرخ و معطر از دل باغ‌های پربار کردستان است که با دقت و عشق تهیه می‌شود. استان کردستان با آب‌وهوای کوهستانی و خاک حاصلخیز، خاستگاه بهترین توت‌فرنگی‌های ایران است و دشت‌زاد این افتخار را دارد که از محصول مستقیم باغداران بومی این منطقه استفاده کند. هر حبه از توت‌فرنگی خشک دشت‌زاد، سرشار از آنتی‌اکسیدان‌های قوی از جمله آنتوسیانین است که به مبارزه با رادیکال‌های آزاد و پیشگیری از بیماری‌های مزمن کمک می‌کند. این محصول دارای ویتامین C بالا، فیبر، پتاسیم و مواد معدنی ضروری برای بدن است. طعم ترش‌وشیرین توت‌فرنگی خشک دشت‌زاد آن را برای مصرف مستقیم، تزئین دسرها، کیک‌ها و شیرینی‌جات بسیار مناسب می‌سازد. همچنین می‌توان آن را به اسموتی، ماست و غلات صبحانه افزود. این محصول بدون افزودنی مصنوعی و در بسته‌بندی بهداشتی زیپ‌دار دشت‌زاد عرضه می‌شود که طراوت و عطر آن را برای مدت طولانی حفظ می‌نماید. هدیه‌ای ایده‌آل برای علاقه‌مندان به تغذیه سالم.`,
        brand: "دشت‌زاد",
        price_rial: 2699000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 110,
        tags: ["توت فرنگی خشک", "میوه خشک حبه‌ای", "کردستان", "آنتی‌اکسیدان", "ویتامین C"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 2699000,
        categoryId: catMap["miveh-khoshk-habbei"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 319, "carb_g": 82.4, "protein_g": 3.8, "fat_g": 0.7, "fiber_g": 14.5, "sugar_g": 63.4}},
      },
      update: {
        title: "توت‌فرنگی خشک دشت‌زاد",
        latinTitle: "Dried Strawberry",
        description: `توت‌فرنگی خشک دشت‌زاد، لذتی سرخ و معطر از دل باغ‌های پربار کردستان است که با دقت و عشق تهیه می‌شود. استان کردستان با آب‌وهوای کوهستانی و خاک حاصلخیز، خاستگاه بهترین توت‌فرنگی‌های ایران است و دشت‌زاد این افتخار را دارد که از محصول مستقیم باغداران بومی این منطقه استفاده کند. هر حبه از توت‌فرنگی خشک دشت‌زاد، سرشار از آنتی‌اکسیدان‌های قوی از جمله آنتوسیانین است که به مبارزه با رادیکال‌های آزاد و پیشگیری از بیماری‌های مزمن کمک می‌کند. این محصول دارای ویتامین C بالا، فیبر، پتاسیم و مواد معدنی ضروری برای بدن است. طعم ترش‌وشیرین توت‌فرنگی خشک دشت‌زاد آن را برای مصرف مستقیم، تزئین دسرها، کیک‌ها و شیرینی‌جات بسیار مناسب می‌سازد. همچنین می‌توان آن را به اسموتی، ماست و غلات صبحانه افزود. این محصول بدون افزودنی مصنوعی و در بسته‌بندی بهداشتی زیپ‌دار دشت‌زاد عرضه می‌شود که طراوت و عطر آن را برای مدت طولانی حفظ می‌نماید. هدیه‌ای ایده‌آل برای علاقه‌مندان به تغذیه سالم.`,
        price_rial: 2699000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 110,
        tags: ["توت فرنگی خشک", "میوه خشک حبه‌ای", "کردستان", "آنتی‌اکسیدان", "ویتامین C"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 319, "carb_g": 82.4, "protein_g": 3.8, "fat_g": 0.7, "fiber_g": 14.5, "sugar_g": 63.4}},
        categoryId: catMap["miveh-khoshk-habbei"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/sliced-dried-strawberry-barjil-3-1.webp", alt: "توت‌فرنگی خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-strawberry-100g", calculatedPrice_rial: 2700000, price_rial: 2700000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-strawberry-250g", calculatedPrice_rial: 6750000, price_rial: 6750000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-strawberry-500g", calculatedPrice_rial: 12820000, price_rial: 12820000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-barberry" },
      create: {
        title: "زرشک خشک دشت‌زاد",
        slug: "dried-barberry",
        latinTitle: "Dried Barberry",
        description: `زرشک خشک دشت‌زاد، جوهر سرزمین خراسان جنوبی است؛ منطقه‌ای که بیش از ۹۵ درصد تولید زرشک ایران از آن می‌آید و شهرت جهانی دارد. دشت‌زاد با انتخاب زرشک‌های درشت، تازه و با کیفیت برتر از باغ‌های دستکاری‌نشده قاینات و بیرجند، محصولی استثنایی را به سفره ایرانیان عرضه می‌کند. زرشک خشک دشت‌زاد با طعم ترش و دلنشین خود، نه‌تنها یک تنقل سالم است بلکه در آشپزی ایرانی نیز جایگاه ویژه‌ای دارد؛ زرشک‌پلو، خورش‌ها و دسرهای متنوعی با آن تهیه می‌شود. این میوه خشک کوچک اما قدرتمند سرشار از ویتامین C، آنتوسیانین، اسید ماژنتین و آلکالوئید بربرین است که خواص ضدالتهابی، کنترل قند خون، تقویت سیستم ایمنی و بهبود سلامت کبد را دارد. دشت‌زاد این محصول را بدون هیچ افزودنی، رنگ یا ماده نگهدارنده مصنوعی در بسته‌بندی بهداشتی عرضه می‌کند. زرشک خشک دشت‌زاد هدیه‌ای اصیل از طبیعت ایران است.`,
        brand: "دشت‌زاد",
        price_rial: 1800000,
        offPrice_rial: 1530000,
        discountPercent: 15,
        countInStock: 140,
        tags: ["زرشک خشک", "میوه خشک حبه‌ای", "خراسان", "قاینات", "آنتی‌اکسیدان"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 1800000,
        categoryId: catMap["miveh-khoshk-habbei"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 316, "carb_g": 77.5, "protein_g": 3.5, "fat_g": 1.5, "fiber_g": 24.6, "sugar_g": 43.9}},
      },
      update: {
        title: "زرشک خشک دشت‌زاد",
        latinTitle: "Dried Barberry",
        description: `زرشک خشک دشت‌زاد، جوهر سرزمین خراسان جنوبی است؛ منطقه‌ای که بیش از ۹۵ درصد تولید زرشک ایران از آن می‌آید و شهرت جهانی دارد. دشت‌زاد با انتخاب زرشک‌های درشت، تازه و با کیفیت برتر از باغ‌های دستکاری‌نشده قاینات و بیرجند، محصولی استثنایی را به سفره ایرانیان عرضه می‌کند. زرشک خشک دشت‌زاد با طعم ترش و دلنشین خود، نه‌تنها یک تنقل سالم است بلکه در آشپزی ایرانی نیز جایگاه ویژه‌ای دارد؛ زرشک‌پلو، خورش‌ها و دسرهای متنوعی با آن تهیه می‌شود. این میوه خشک کوچک اما قدرتمند سرشار از ویتامین C، آنتوسیانین، اسید ماژنتین و آلکالوئید بربرین است که خواص ضدالتهابی، کنترل قند خون، تقویت سیستم ایمنی و بهبود سلامت کبد را دارد. دشت‌زاد این محصول را بدون هیچ افزودنی، رنگ یا ماده نگهدارنده مصنوعی در بسته‌بندی بهداشتی عرضه می‌کند. زرشک خشک دشت‌زاد هدیه‌ای اصیل از طبیعت ایران است.`,
        price_rial: 1800000,
        offPrice_rial: 1530000,
        discountPercent: 15,
        countInStock: 140,
        tags: ["زرشک خشک", "میوه خشک حبه‌ای", "خراسان", "قاینات", "آنتی‌اکسیدان"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 316, "carb_g": 77.5, "protein_g": 3.5, "fat_g": 1.5, "fiber_g": 24.6, "sugar_g": 43.9}},
        categoryId: catMap["miveh-khoshk-habbei"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p3.jpeg", alt: "زرشک خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-barberry-100g", calculatedPrice_rial: 1800000, price_rial: 1800000, offPrice_rial: 1530000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-barberry-250g", calculatedPrice_rial: 4500000, price_rial: 4500000, offPrice_rial: 3820000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-barberry-500g", calculatedPrice_rial: 8550000, price_rial: 8550000, offPrice_rial: 7270000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-blueberry" },
      create: {
        title: "بلوبری خشک دشت‌زاد",
        slug: "dried-blueberry",
        latinTitle: "Dried Blueberry",
        description: `بلوبری خشک دشت‌زاد، سوپرفودی با قدرت آنتی‌اکسیدانی شگفت‌انگیز است که از بهترین مزارع بلوبری آمریکای شمالی تأمین می‌شود. این میوه آبی‌رنگ کوچک یکی از قوی‌ترین منابع آنتی‌اکسیدان در جهان به شمار می‌آید و مطالعات علمی متعددی نشان داده‌اند که مصرف منظم آن با بهبود حافظه، سلامت مغز، کاهش ریسک بیماری‌های قلبی و حمایت از سیستم ایمنی در ارتباط است. بلوبری خشک دشت‌زاد حاوی مقادیر قابل توجهی از ویتامین C، ویتامین K، منگنز و فیبر غذایی است. دشت‌زاد با دقت در فرآیند خشک‌کردن و بسته‌بندی، تمام ارزش‌های غذایی این میوه ارزشمند را حفظ می‌کند. بلوبری خشک را می‌توان به عنوان میان‌وعده مستقیم، با ماست، با جو دو سر، در پخت مافین، کیک و کلوچه استفاده کرد. این محصول برای همه سنین به خصوص سالمندان و کسانی که به دنبال سلامت مغز و حافظه هستند بسیار مفید است. بسته‌بندی خاص دشت‌زاد تازگی و طراوت بلوبری خشک را تا مدت طولانی نگه می‌دارد.`,
        brand: "دشت‌زاد",
        price_rial: 4080000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 60,
        tags: ["بلوبری خشک", "میوه خشک حبه‌ای", "سوپرفود", "آنتی‌اکسیدان", "سلامت مغز"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 4080000,
        categoryId: catMap["miveh-khoshk-habbei"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 325, "carb_g": 82.4, "protein_g": 3.7, "fat_g": 1.5, "fiber_g": 10.1, "sugar_g": 58}},
      },
      update: {
        title: "بلوبری خشک دشت‌زاد",
        latinTitle: "Dried Blueberry",
        description: `بلوبری خشک دشت‌زاد، سوپرفودی با قدرت آنتی‌اکسیدانی شگفت‌انگیز است که از بهترین مزارع بلوبری آمریکای شمالی تأمین می‌شود. این میوه آبی‌رنگ کوچک یکی از قوی‌ترین منابع آنتی‌اکسیدان در جهان به شمار می‌آید و مطالعات علمی متعددی نشان داده‌اند که مصرف منظم آن با بهبود حافظه، سلامت مغز، کاهش ریسک بیماری‌های قلبی و حمایت از سیستم ایمنی در ارتباط است. بلوبری خشک دشت‌زاد حاوی مقادیر قابل توجهی از ویتامین C، ویتامین K، منگنز و فیبر غذایی است. دشت‌زاد با دقت در فرآیند خشک‌کردن و بسته‌بندی، تمام ارزش‌های غذایی این میوه ارزشمند را حفظ می‌کند. بلوبری خشک را می‌توان به عنوان میان‌وعده مستقیم، با ماست، با جو دو سر، در پخت مافین، کیک و کلوچه استفاده کرد. این محصول برای همه سنین به خصوص سالمندان و کسانی که به دنبال سلامت مغز و حافظه هستند بسیار مفید است. بسته‌بندی خاص دشت‌زاد تازگی و طراوت بلوبری خشک را تا مدت طولانی نگه می‌دارد.`,
        price_rial: 4080000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 60,
        tags: ["بلوبری خشک", "میوه خشک حبه‌ای", "سوپرفود", "آنتی‌اکسیدان", "سلامت مغز"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 325, "carb_g": 82.4, "protein_g": 3.7, "fat_g": 1.5, "fiber_g": 10.1, "sugar_g": 58}},
        categoryId: catMap["miveh-khoshk-habbei"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2019/02/dried-blueberry-barjil-183-1.webp", alt: "بلوبری خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-blueberry-100g", calculatedPrice_rial: 4080000, price_rial: 4080000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-blueberry-250g", calculatedPrice_rial: 10200000, price_rial: 10200000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-blueberry-500g", calculatedPrice_rial: 19380000, price_rial: 19380000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-cranberry" },
      create: {
        title: "کرن‌بری خشک دشت‌زاد",
        slug: "dried-cranberry",
        latinTitle: "Dried Cranberry",
        description: `کرن‌بری خشک دشت‌زاد، یک سوپرفود قرمزرنگ از بهترین مناطق کشت کرن‌بری در آمریکای شمالی است که به خاطر خواص دارویی و غذایی منحصربه‌فردش شهرت جهانی دارد. کرن‌بری که در ایران با نام قره‌قات نیز شناخته می‌شود، یکی از برترین میوه‌های ضدعفونی دستگاه ادراری، تقویت‌کننده سیستم ایمنی و ضدالتهاب طبیعی است. دشت‌زاد با فرآیند کنترل‌شده خشک‌کردن، تمام فلاونوئیدها، پروآنتوسیانیدین‌ها و ویتامین C این میوه ارزشمند را حفظ کرده است. طعم ترش‌وشیرین کرن‌بری خشک دشت‌زاد آن را برای مصرف مستقیم، پخت انواع کیک، بیسکوییت، گرانولا و ترکیب با دیگر خشکبار بسیار مطلوب می‌سازد. این محصول برای خانم‌ها، ورزشکاران و افرادی که به سلامت دستگاه ادراری اهمیت می‌دهند توصیه می‌شود. بسته‌بندی دشت‌زاد تازگی این میوه خشک لاکشری را برای مدت طولانی تضمین می‌کند. کرن‌بری خشک دشت‌زاد انتخابی هوشمندانه برای سبک زندگی سالم است.`,
        brand: "دشت‌زاد",
        price_rial: 2915000,
        offPrice_rial: 2477750,
        discountPercent: 15,
        countInStock: 75,
        tags: ["کرن‌بری خشک", "میوه خشک حبه‌ای", "ضدعفونی", "سیستم ایمنی", "سوپرفود"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 2915000,
        categoryId: catMap["miveh-khoshk-habbei"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 308, "carb_g": 82.4, "protein_g": 0.1, "fat_g": 1.4, "fiber_g": 5.7, "sugar_g": 72.6}},
      },
      update: {
        title: "کرن‌بری خشک دشت‌زاد",
        latinTitle: "Dried Cranberry",
        description: `کرن‌بری خشک دشت‌زاد، یک سوپرفود قرمزرنگ از بهترین مناطق کشت کرن‌بری در آمریکای شمالی است که به خاطر خواص دارویی و غذایی منحصربه‌فردش شهرت جهانی دارد. کرن‌بری که در ایران با نام قره‌قات نیز شناخته می‌شود، یکی از برترین میوه‌های ضدعفونی دستگاه ادراری، تقویت‌کننده سیستم ایمنی و ضدالتهاب طبیعی است. دشت‌زاد با فرآیند کنترل‌شده خشک‌کردن، تمام فلاونوئیدها، پروآنتوسیانیدین‌ها و ویتامین C این میوه ارزشمند را حفظ کرده است. طعم ترش‌وشیرین کرن‌بری خشک دشت‌زاد آن را برای مصرف مستقیم، پخت انواع کیک، بیسکوییت، گرانولا و ترکیب با دیگر خشکبار بسیار مطلوب می‌سازد. این محصول برای خانم‌ها، ورزشکاران و افرادی که به سلامت دستگاه ادراری اهمیت می‌دهند توصیه می‌شود. بسته‌بندی دشت‌زاد تازگی این میوه خشک لاکشری را برای مدت طولانی تضمین می‌کند. کرن‌بری خشک دشت‌زاد انتخابی هوشمندانه برای سبک زندگی سالم است.`,
        price_rial: 2915000,
        offPrice_rial: 2477750,
        discountPercent: 15,
        countInStock: 75,
        tags: ["کرن‌بری خشک", "میوه خشک حبه‌ای", "ضدعفونی", "سیستم ایمنی", "سوپرفود"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 308, "carb_g": 82.4, "protein_g": 0.1, "fat_g": 1.4, "fiber_g": 5.7, "sugar_g": 72.6}},
        categoryId: catMap["miveh-khoshk-habbei"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/dried-cranberry-barjil-60-1.webp", alt: "کرن‌بری خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-cranberry-100g", calculatedPrice_rial: 2920000, price_rial: 2920000, offPrice_rial: 2480000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-cranberry-250g", calculatedPrice_rial: 7290000, price_rial: 7290000, offPrice_rial: 6190000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-cranberry-500g", calculatedPrice_rial: 13850000, price_rial: 13850000, offPrice_rial: 11770000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-sour-cherry" },
      create: {
        title: "آلبالو خشک دشت‌زاد",
        slug: "dried-sour-cherry",
        latinTitle: "Dried Sour Cherry",
        description: `آلبالو خشک دشت‌زاد، یادآور بوی خوش باغ‌های ایرانی در فصل تابستان است که از آلبالوهای قرمز درشت و آبدار مناطق سمنان، لرستان و کردستان تهیه می‌شود. این مناطق با آب‌وهوای مناسب و خاک آهکی، بهترین آلبالوهای ایران را تولید می‌کنند که دشت‌زاد آن‌ها را با دقت و هنر انتخاب می‌کند. آلبالو خشک دشت‌زاد به صورت درسته خشک شده و طعم منحصربه‌فرد ترش‌وشیرین آن کاملاً حفظ شده است. این میوه خشک سرشار از آنتوسیانین، ملاتونین و ترکیبات ضدالتهابی است که مطالعات نشان می‌دهند به بهبود خواب، کاهش درد عضلانی بعد از ورزش، کنترل اوریک اسید و سلامت مفاصل کمک می‌کنند. آلبالو خشک دشت‌زاد برای مصرف مستقیم، در چای، در پخت آلبالوپلو، مربا و دسرهای متنوع ایده‌آل است. بدون هیچ افزودنی مصنوعی، در بسته‌بندی بهداشتی عرضه می‌شود. طعم اصیل ایرانی در هر حبه آلبالو خشک دشت‌زاد.`,
        brand: "دشت‌زاد",
        price_rial: 2850000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 90,
        tags: ["آلبالو خشک", "میوه خشک درسته", "ترش", "سمنان", "ملاتونین"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 2850000,
        categoryId: catMap["miveh-khoshk-dareste"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 240, "carb_g": 63.4, "protein_g": 2.5, "fat_g": 0.4, "fiber_g": 7.1, "sugar_g": 53.4}},
      },
      update: {
        title: "آلبالو خشک دشت‌زاد",
        latinTitle: "Dried Sour Cherry",
        description: `آلبالو خشک دشت‌زاد، یادآور بوی خوش باغ‌های ایرانی در فصل تابستان است که از آلبالوهای قرمز درشت و آبدار مناطق سمنان، لرستان و کردستان تهیه می‌شود. این مناطق با آب‌وهوای مناسب و خاک آهکی، بهترین آلبالوهای ایران را تولید می‌کنند که دشت‌زاد آن‌ها را با دقت و هنر انتخاب می‌کند. آلبالو خشک دشت‌زاد به صورت درسته خشک شده و طعم منحصربه‌فرد ترش‌وشیرین آن کاملاً حفظ شده است. این میوه خشک سرشار از آنتوسیانین، ملاتونین و ترکیبات ضدالتهابی است که مطالعات نشان می‌دهند به بهبود خواب، کاهش درد عضلانی بعد از ورزش، کنترل اوریک اسید و سلامت مفاصل کمک می‌کنند. آلبالو خشک دشت‌زاد برای مصرف مستقیم، در چای، در پخت آلبالوپلو، مربا و دسرهای متنوع ایده‌آل است. بدون هیچ افزودنی مصنوعی، در بسته‌بندی بهداشتی عرضه می‌شود. طعم اصیل ایرانی در هر حبه آلبالو خشک دشت‌زاد.`,
        price_rial: 2850000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 90,
        tags: ["آلبالو خشک", "میوه خشک درسته", "ترش", "سمنان", "ملاتونین"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 240, "carb_g": 63.4, "protein_g": 2.5, "fat_g": 0.4, "fiber_g": 7.1, "sugar_g": 53.4}},
        categoryId: catMap["miveh-khoshk-dareste"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/dried-cherries-barjil-1-5.webp", alt: "آلبالو خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-sour-cherry-100g", calculatedPrice_rial: 2850000, price_rial: 2850000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-sour-cherry-250g", calculatedPrice_rial: 7120000, price_rial: 7120000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-sour-cherry-500g", calculatedPrice_rial: 13540000, price_rial: 13540000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-jujube" },
      create: {
        title: "عناب خشک دشت‌زاد",
        slug: "dried-jujube",
        latinTitle: "Dried Jujube",
        description: `عناب خشک دشت‌زاد، میراث طب سنتی ایران است که از باغ‌های اصیل سمنان و خراسان به دست شما می‌رسد. عناب از دیرباز در طب سنتی ایرانی و چینی به عنوان یکی از قوی‌ترین میوه‌های دارویی شناخته شده و امروزه علم مدرن نیز خواص شگفت‌انگیز آن را تأیید می‌کند. عناب خشک دشت‌زاد با طعم شیرین و کمی گس خود، سرشار از ویتامین C، ویتامین B، پتاسیم، منیزیم و آنتی‌اکسیدان‌های قوی است. تحقیقات نشان داده‌اند که مصرف منظم عناب به بهبود کیفیت خواب، آرامش اعصاب، تقویت سیستم ایمنی، بهبود عملکرد کبد و کنترل وزن کمک می‌کند. عناب خشک دشت‌زاد به صورت کامل و درسته خشک شده تا بیشترین ارزش غذایی و دارویی خود را حفظ کند. این محصول در چای، دمنوش، به عنوان میان‌وعده و برای استفاده در داروهای سنتی ایده‌آل است. دشت‌زاد این محصول اصیل را بدون هیچ‌گونه افزودنی و در بسته‌بندی بهداشتی عرضه می‌کند. عناب خشک دشت‌زاد، هدیه طبیعت ایران برای سلامت شماست.`,
        brand: "دشت‌زاد",
        price_rial: 1900000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 80,
        tags: ["عناب خشک", "میوه خشک درسته", "طب سنتی", "سمنان", "خواب"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 1900000,
        categoryId: catMap["miveh-khoshk-dareste"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 287, "carb_g": 73.6, "protein_g": 3.7, "fat_g": 1.1, "fiber_g": 10.4, "sugar_g": 53.4}},
      },
      update: {
        title: "عناب خشک دشت‌زاد",
        latinTitle: "Dried Jujube",
        description: `عناب خشک دشت‌زاد، میراث طب سنتی ایران است که از باغ‌های اصیل سمنان و خراسان به دست شما می‌رسد. عناب از دیرباز در طب سنتی ایرانی و چینی به عنوان یکی از قوی‌ترین میوه‌های دارویی شناخته شده و امروزه علم مدرن نیز خواص شگفت‌انگیز آن را تأیید می‌کند. عناب خشک دشت‌زاد با طعم شیرین و کمی گس خود، سرشار از ویتامین C، ویتامین B، پتاسیم، منیزیم و آنتی‌اکسیدان‌های قوی است. تحقیقات نشان داده‌اند که مصرف منظم عناب به بهبود کیفیت خواب، آرامش اعصاب، تقویت سیستم ایمنی، بهبود عملکرد کبد و کنترل وزن کمک می‌کند. عناب خشک دشت‌زاد به صورت کامل و درسته خشک شده تا بیشترین ارزش غذایی و دارویی خود را حفظ کند. این محصول در چای، دمنوش، به عنوان میان‌وعده و برای استفاده در داروهای سنتی ایده‌آل است. دشت‌زاد این محصول اصیل را بدون هیچ‌گونه افزودنی و در بسته‌بندی بهداشتی عرضه می‌کند. عناب خشک دشت‌زاد، هدیه طبیعت ایران برای سلامت شماست.`,
        price_rial: 1900000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 80,
        tags: ["عناب خشک", "میوه خشک درسته", "طب سنتی", "سمنان", "خواب"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 287, "carb_g": 73.6, "protein_g": 3.7, "fat_g": 1.1, "fiber_g": 10.4, "sugar_g": 53.4}},
        categoryId: catMap["miveh-khoshk-dareste"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p3.jpeg", alt: "عناب خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-jujube-100g", calculatedPrice_rial: 1900000, price_rial: 1900000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-jujube-250g", calculatedPrice_rial: 4750000, price_rial: 4750000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-jujube-500g", calculatedPrice_rial: 9020000, price_rial: 9020000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-sweet-cherry" },
      create: {
        title: "گیلاس خشک دشت‌زاد",
        slug: "dried-sweet-cherry",
        latinTitle: "Dried Sweet Cherry",
        description: `گیلاس خشک دشت‌زاد، لذتی شیرین و اشرافی از بهترین باغ‌های گیلاس ایران است که ارادت خاصی به کیفیت دارند. گیلاس‌های قرمز درشت و شیرین از مناطق مرتفع البرز و آذربایجان برداشت شده و با فرآیند خشک‌کردن ملایم، تمام شیرینی و طعم طبیعی آن‌ها حفظ می‌شود. گیلاس خشک دشت‌زاد به صورت کامل و درسته با دانه محفوظ در داخل آن عرضه می‌شود تا بیشترین طعم و مواد مغذی را ارائه دهد. این میوه خشک سرشار از آنتوسیانین، ویتامین C و پتاسیم است و به کاهش التهاب، بهبود خواب، سلامت قلب و مبارزه با استرس اکسیداتیو کمک می‌کند. طعم شیرین و جذاب گیلاس خشک دشت‌زاد آن را برای مصرف مستقیم، تزئین کیک و شیرینی، افزودن به انواع دسر و میان‌وعده بسیار مناسب می‌سازد. کودکان و بزرگسالان به یک اندازه عاشق این خوراکی لذیذ هستند. دشت‌زاد این محصول را بدون افزودنی در بسته‌بندی زیپ‌دار بهداشتی عرضه می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 3200000,
        offPrice_rial: 2880000,
        discountPercent: 10,
        countInStock: 55,
        tags: ["گیلاس خشک", "میوه خشک درسته", "البرز", "شیرین", "آنتوسیانین"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 3200000,
        categoryId: catMap["miveh-khoshk-dareste"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 253, "carb_g": 67.7, "protein_g": 3.4, "fat_g": 0.3, "fiber_g": 7, "sugar_g": 58.3}},
      },
      update: {
        title: "گیلاس خشک دشت‌زاد",
        latinTitle: "Dried Sweet Cherry",
        description: `گیلاس خشک دشت‌زاد، لذتی شیرین و اشرافی از بهترین باغ‌های گیلاس ایران است که ارادت خاصی به کیفیت دارند. گیلاس‌های قرمز درشت و شیرین از مناطق مرتفع البرز و آذربایجان برداشت شده و با فرآیند خشک‌کردن ملایم، تمام شیرینی و طعم طبیعی آن‌ها حفظ می‌شود. گیلاس خشک دشت‌زاد به صورت کامل و درسته با دانه محفوظ در داخل آن عرضه می‌شود تا بیشترین طعم و مواد مغذی را ارائه دهد. این میوه خشک سرشار از آنتوسیانین، ویتامین C و پتاسیم است و به کاهش التهاب، بهبود خواب، سلامت قلب و مبارزه با استرس اکسیداتیو کمک می‌کند. طعم شیرین و جذاب گیلاس خشک دشت‌زاد آن را برای مصرف مستقیم، تزئین کیک و شیرینی، افزودن به انواع دسر و میان‌وعده بسیار مناسب می‌سازد. کودکان و بزرگسالان به یک اندازه عاشق این خوراکی لذیذ هستند. دشت‌زاد این محصول را بدون افزودنی در بسته‌بندی زیپ‌دار بهداشتی عرضه می‌کند.`,
        price_rial: 3200000,
        offPrice_rial: 2880000,
        discountPercent: 10,
        countInStock: 55,
        tags: ["گیلاس خشک", "میوه خشک درسته", "البرز", "شیرین", "آنتوسیانین"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 253, "carb_g": 67.7, "protein_g": 3.4, "fat_g": 0.3, "fiber_g": 7, "sugar_g": 58.3}},
        categoryId: catMap["miveh-khoshk-dareste"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p3.jpeg", alt: "گیلاس خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-sweet-cherry-100g", calculatedPrice_rial: 3200000, price_rial: 3200000, offPrice_rial: 2880000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-sweet-cherry-250g", calculatedPrice_rial: 8000000, price_rial: 8000000, offPrice_rial: 7200000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-sweet-cherry-500g", calculatedPrice_rial: 15200000, price_rial: 15200000, offPrice_rial: 13680000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "dried-raspberry" },
      create: {
        title: "تمشک خشک دشت‌زاد",
        slug: "dried-raspberry",
        latinTitle: "Dried Raspberry",
        description: `تمشک خشک دشت‌زاد، جواهری کوچک از دل جنگل‌های شمالی ایران است که از تمشک‌های وحشی و کوهستانی مناطق مرتفع گیلان و مازندران تهیه می‌شود. تمشک وحشی ایران با طعمی منحصربه‌فرد و ترش‌وشیرین از بهترین تمشک‌های جهان محسوب می‌شود و دشت‌زاد با مراقبت از این میراث طبیعی، بهترین نمونه‌ها را برای محصول خود انتخاب می‌کند. تمشک خشک دشت‌زاد به صورت درسته خشک شده تا طعم طبیعی و کامل آن محفوظ بماند. این میوه خشک دارای بالاترین سطح آنتی‌اکسیدان در میان میوه‌های خشک است و سرشار از الاژیک اسید، آنتوسیانین، ویتامین C و فیبر غذایی بالا است. تحقیقات نشان می‌دهند که مصرف تمشک به کاهش التهاب، حمایت از سلامت قلب، کنترل وزن و تقویت سیستم ایمنی کمک می‌کند. این محصول را می‌توان در چای، اسموتی، دسر، کیک و به عنوان میان‌وعده میل کرد. بسته‌بندی ویژه دشت‌زاد تازگی و طعم این میوه منحصربه‌فرد را حفظ می‌کند.`,
        brand: "دشت‌زاد",
        price_rial: 3500000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 45,
        tags: ["تمشک خشک", "میوه خشک درسته", "گیلان", "مازندران", "آنتی‌اکسیدان بالا"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 3500000,
        categoryId: catMap["miveh-khoshk-dareste"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 299, "carb_g": 73.4, "protein_g": 3.4, "fat_g": 1.7, "fiber_g": 23.4, "sugar_g": 37.8}},
      },
      update: {
        title: "تمشک خشک دشت‌زاد",
        latinTitle: "Dried Raspberry",
        description: `تمشک خشک دشت‌زاد، جواهری کوچک از دل جنگل‌های شمالی ایران است که از تمشک‌های وحشی و کوهستانی مناطق مرتفع گیلان و مازندران تهیه می‌شود. تمشک وحشی ایران با طعمی منحصربه‌فرد و ترش‌وشیرین از بهترین تمشک‌های جهان محسوب می‌شود و دشت‌زاد با مراقبت از این میراث طبیعی، بهترین نمونه‌ها را برای محصول خود انتخاب می‌کند. تمشک خشک دشت‌زاد به صورت درسته خشک شده تا طعم طبیعی و کامل آن محفوظ بماند. این میوه خشک دارای بالاترین سطح آنتی‌اکسیدان در میان میوه‌های خشک است و سرشار از الاژیک اسید، آنتوسیانین، ویتامین C و فیبر غذایی بالا است. تحقیقات نشان می‌دهند که مصرف تمشک به کاهش التهاب، حمایت از سلامت قلب، کنترل وزن و تقویت سیستم ایمنی کمک می‌کند. این محصول را می‌توان در چای، اسموتی، دسر، کیک و به عنوان میان‌وعده میل کرد. بسته‌بندی ویژه دشت‌زاد تازگی و طعم این میوه منحصربه‌فرد را حفظ می‌کند.`,
        price_rial: 3500000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 45,
        tags: ["تمشک خشک", "میوه خشک درسته", "گیلان", "مازندران", "آنتی‌اکسیدان بالا"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 299, "carb_g": 73.4, "protein_g": 3.4, "fat_g": 1.7, "fiber_g": 23.4, "sugar_g": 37.8}},
        categoryId: catMap["miveh-khoshk-dareste"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p3.jpeg", alt: "تمشک خشک دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "dried-raspberry-100g", calculatedPrice_rial: 3500000, price_rial: 3500000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "dried-raspberry-250g", calculatedPrice_rial: 8750000, price_rial: 8750000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "dried-raspberry-500g", calculatedPrice_rial: 16620000, price_rial: 16620000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "premium-mixed-dried-fruit" },
      create: {
        title: "میوه خشک مخلوط ممتاز دشت‌زاد",
        slug: "premium-mixed-dried-fruit",
        latinTitle: "Premium Mixed Dried Fruit",
        description: `میوه خشک مخلوط ممتاز دشت‌زاد، برترین انتخاب برای کسانی است که می‌خواهند در یک بسته، بهترین‌های طبیعت ایران و جهان را تجربه کنند. این مخلوط لاکشری شامل ورقه‌های سیب، گلابی، هلو، موز، کیوی، آناناس، انبه، آلو قرمز، پرتقال، توت‌فرنگی و زردآلو خشک است که هر کدام از باغ‌های برگزیده داخلی و خارجی تأمین شده‌اند. دشت‌زاد با دقت در انتخاب هر یک از اجزاء این مخلوط، تعادلی بی‌نظیر از طعم‌های شیرین، ترش و معطر را خلق کرده است. میوه خشک مخلوط ممتاز دشت‌زاد سرشار از ویتامین‌های A، C و E، فیبر غذایی، آنتی‌اکسیدان‌های متنوع، پتاسیم و منیزیم است که هر روز بدن شما را با مواد مغذی ضروری تغذیه می‌کند. این محصول برای پذیرایی از مهمانان، هدیه به دوستان و خانواده، یا مصرف روزانه به عنوان میان‌وعده سالم ایده‌آل است. بسته‌بندی شیک و بهداشتی دشت‌زاد این محصول را به یک هدیه لاکشری تبدیل می‌کند. لذت تنوع در هر لقمه با میوه خشک مخلوط ممتاز دشت‌زاد.`,
        brand: "دشت‌زاد",
        price_rial: 2446000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 100,
        tags: ["میوه خشک مخلوط", "ممتاز", "هدیه", "پذیرایی", "تنوع"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 2446000,
        categoryId: catMap["miveh-khoshk-mokhallat"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 295, "carb_g": 74.2, "protein_g": 2.8, "fat_g": 0.8, "fiber_g": 8.5, "sugar_g": 57}},
      },
      update: {
        title: "میوه خشک مخلوط ممتاز دشت‌زاد",
        latinTitle: "Premium Mixed Dried Fruit",
        description: `میوه خشک مخلوط ممتاز دشت‌زاد، برترین انتخاب برای کسانی است که می‌خواهند در یک بسته، بهترین‌های طبیعت ایران و جهان را تجربه کنند. این مخلوط لاکشری شامل ورقه‌های سیب، گلابی، هلو، موز، کیوی، آناناس، انبه، آلو قرمز، پرتقال، توت‌فرنگی و زردآلو خشک است که هر کدام از باغ‌های برگزیده داخلی و خارجی تأمین شده‌اند. دشت‌زاد با دقت در انتخاب هر یک از اجزاء این مخلوط، تعادلی بی‌نظیر از طعم‌های شیرین، ترش و معطر را خلق کرده است. میوه خشک مخلوط ممتاز دشت‌زاد سرشار از ویتامین‌های A، C و E، فیبر غذایی، آنتی‌اکسیدان‌های متنوع، پتاسیم و منیزیم است که هر روز بدن شما را با مواد مغذی ضروری تغذیه می‌کند. این محصول برای پذیرایی از مهمانان، هدیه به دوستان و خانواده، یا مصرف روزانه به عنوان میان‌وعده سالم ایده‌آل است. بسته‌بندی شیک و بهداشتی دشت‌زاد این محصول را به یک هدیه لاکشری تبدیل می‌کند. لذت تنوع در هر لقمه با میوه خشک مخلوط ممتاز دشت‌زاد.`,
        price_rial: 2446000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 100,
        tags: ["میوه خشک مخلوط", "ممتاز", "هدیه", "پذیرایی", "تنوع"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 295, "carb_g": 74.2, "protein_g": 2.8, "fat_g": 0.8, "fiber_g": 8.5, "sugar_g": 57}},
        categoryId: catMap["miveh-khoshk-mokhallat"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "https://www.barjil.com/wp-content/uploads/2018/12/dried-fruits-mix-barjil-43_1.webp", alt: "میوه خشک مخلوط ممتاز دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "premium-mixed-dried-fruit-100g", calculatedPrice_rial: 2450000, price_rial: 2450000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "premium-mixed-dried-fruit-250g", calculatedPrice_rial: 6120000, price_rial: 6120000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "premium-mixed-dried-fruit-500g", calculatedPrice_rial: 11620000, price_rial: 11620000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
      { productId: prod.id, weightValue: 1000, gramValue: 1000, weightUnit: "GRAM", sku: "premium-mixed-dried-fruit-1000g", calculatedPrice_rial: 22010000, price_rial: 22010000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 3 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "diet-dried-fruit-mix" },
      create: {
        title: "میوه خشک رژیمی دشت‌زاد",
        slug: "diet-dried-fruit-mix",
        latinTitle: "Diet Dried Fruit Mix",
        description: `میوه خشک رژیمی دشت‌زاد، فرمولی هوشمند برای کسانی است که می‌خواهند بدون کنار گذاشتن لذت، رژیم غذایی سالمی داشته باشند. دشت‌زاد با همکاری متخصصان تغذیه، ترکیبی دقیق از میوه‌های خشک کم‌قند و پرفیبر را در این محصول گردآوری کرده است. مخلوط رژیمی دشت‌زاد شامل زرشک خشک، آلبالو خشک، تمشک خشک، کرن‌بری خشک و سیب ترش خشک است که همگی دارای شاخص گلیسمی پایین و فیبر غذایی بالا هستند. این ترکیب ویژه به کنترل قند خون، کاهش اشتها، افزایش احساس سیری و حمایت از کاهش وزن سالم کمک می‌کند. برخلاف بسیاری از تنقلات رژیمی موجود در بازار، میوه خشک رژیمی دشت‌زاد طعمی واقعی و لذیذ دارد و هیچ طعم مصنوعی، شیرین‌کننده کاذب یا ماده افزودنی در آن به کار نرفته است. این محصول برای افراد دیابتی (با مشاوره پزشک)، افراد در رژیم کاهش وزن و هر کسی که می‌خواهد قند مصرفی خود را کنترل کند توصیه می‌شود. دشت‌زاد معتقد است که سالم بودن نباید از خوشمزه بودن کم کند.`,
        brand: "دشت‌زاد",
        price_rial: 2800000,
        offPrice_rial: 2380000,
        discountPercent: 15,
        countInStock: 65,
        tags: ["میوه خشک رژیمی", "کم‌قند", "پرفیبر", "رژیم", "دیابت"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 2800000,
        categoryId: catMap["miveh-khoshk-mokhallat"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 270, "carb_g": 69.5, "protein_g": 3, "fat_g": 0.8, "fiber_g": 14.2, "sugar_g": 42}},
      },
      update: {
        title: "میوه خشک رژیمی دشت‌زاد",
        latinTitle: "Diet Dried Fruit Mix",
        description: `میوه خشک رژیمی دشت‌زاد، فرمولی هوشمند برای کسانی است که می‌خواهند بدون کنار گذاشتن لذت، رژیم غذایی سالمی داشته باشند. دشت‌زاد با همکاری متخصصان تغذیه، ترکیبی دقیق از میوه‌های خشک کم‌قند و پرفیبر را در این محصول گردآوری کرده است. مخلوط رژیمی دشت‌زاد شامل زرشک خشک، آلبالو خشک، تمشک خشک، کرن‌بری خشک و سیب ترش خشک است که همگی دارای شاخص گلیسمی پایین و فیبر غذایی بالا هستند. این ترکیب ویژه به کنترل قند خون، کاهش اشتها، افزایش احساس سیری و حمایت از کاهش وزن سالم کمک می‌کند. برخلاف بسیاری از تنقلات رژیمی موجود در بازار، میوه خشک رژیمی دشت‌زاد طعمی واقعی و لذیذ دارد و هیچ طعم مصنوعی، شیرین‌کننده کاذب یا ماده افزودنی در آن به کار نرفته است. این محصول برای افراد دیابتی (با مشاوره پزشک)، افراد در رژیم کاهش وزن و هر کسی که می‌خواهد قند مصرفی خود را کنترل کند توصیه می‌شود. دشت‌زاد معتقد است که سالم بودن نباید از خوشمزه بودن کم کند.`,
        price_rial: 2800000,
        offPrice_rial: 2380000,
        discountPercent: 15,
        countInStock: 65,
        tags: ["میوه خشک رژیمی", "کم‌قند", "پرفیبر", "رژیم", "دیابت"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 270, "carb_g": 69.5, "protein_g": 3, "fat_g": 0.8, "fiber_g": 14.2, "sugar_g": 42}},
        categoryId: catMap["miveh-khoshk-mokhallat"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p3.jpeg", alt: "میوه خشک رژیمی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "diet-dried-fruit-mix-100g", calculatedPrice_rial: 2800000, price_rial: 2800000, offPrice_rial: 2380000, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "diet-dried-fruit-mix-250g", calculatedPrice_rial: 7000000, price_rial: 7000000, offPrice_rial: 5950000, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "diet-dried-fruit-mix-500g", calculatedPrice_rial: 13300000, price_rial: 13300000, offPrice_rial: 11300000, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  {
    const prod = await prisma.product.upsert({
      where: { slug: "sport-dried-fruit-mix" },
      create: {
        title: "میوه خشک ورزشی دشت‌زاد",
        slug: "sport-dried-fruit-mix",
        latinTitle: "Sport Dried Fruit Mix",
        description: `میوه خشک ورزشی دشت‌زاد، میان‌وعده‌ای پرانرژی و متعادل است که برای نیازهای تغذیه‌ای ورزشکاران طراحی شده است. این مخلوط قدرتمند شامل موز خشک ورقه‌ای، انجیر خشک، خرما، آناناس خشک، گیلاس خشک و آلبالو خشک است که با هم ترکیبی ایده‌آل از قندهای طبیعی سریع‌الاثر و دیرهضم، پتاسیم، منیزیم و آنتی‌اکسیدان‌های ضدالتهابی را فراهم می‌کنند. موز و انجیر انرژی فوری قبل از تمرین می‌دهند، در حالی که گیلاس و آلبالو به کاهش درد عضلانی بعد از ورزش و بهبود ریکاوری کمک می‌کنند. میوه خشک ورزشی دشت‌زاد جایگزین طبیعی و سالم ژل‌های انرژی‌زای مصنوعی است. این محصول کاملاً طبیعی و بدون شکر افزوده است. بسته‌بندی سبک و زیپ‌دار دشت‌زاد آن را برای حمل در کیف ورزشی، سفر و فضای باز ایده‌آل می‌کند. دشت‌زاد همراه ورزشکاران ایرانی در هر مسیری است.`,
        brand: "دشت‌زاد",
        price_rial: 3100000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 80,
        tags: ["میوه خشک ورزشی", "انرژی‌زا", "ریکاوری", "ورزشکار", "قبل از تمرین"],
        isActive: true,
        basePriceUnit: "GRAM",
        basePrice_rial: 3100000,
        categoryId: catMap["miveh-khoshk-mokhallat"] ?? catMap["miveh-khoshk"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 315, "carb_g": 79.8, "protein_g": 3.2, "fat_g": 0.9, "fiber_g": 9.1, "sugar_g": 62.5}},
      },
      update: {
        title: "میوه خشک ورزشی دشت‌زاد",
        latinTitle: "Sport Dried Fruit Mix",
        description: `میوه خشک ورزشی دشت‌زاد، میان‌وعده‌ای پرانرژی و متعادل است که برای نیازهای تغذیه‌ای ورزشکاران طراحی شده است. این مخلوط قدرتمند شامل موز خشک ورقه‌ای، انجیر خشک، خرما، آناناس خشک، گیلاس خشک و آلبالو خشک است که با هم ترکیبی ایده‌آل از قندهای طبیعی سریع‌الاثر و دیرهضم، پتاسیم، منیزیم و آنتی‌اکسیدان‌های ضدالتهابی را فراهم می‌کنند. موز و انجیر انرژی فوری قبل از تمرین می‌دهند، در حالی که گیلاس و آلبالو به کاهش درد عضلانی بعد از ورزش و بهبود ریکاوری کمک می‌کنند. میوه خشک ورزشی دشت‌زاد جایگزین طبیعی و سالم ژل‌های انرژی‌زای مصنوعی است. این محصول کاملاً طبیعی و بدون شکر افزوده است. بسته‌بندی سبک و زیپ‌دار دشت‌زاد آن را برای حمل در کیف ورزشی، سفر و فضای باز ایده‌آل می‌کند. دشت‌زاد همراه ورزشکاران ایرانی در هر مسیری است.`,
        price_rial: 3100000,
        offPrice_rial: null,
        discountPercent: 0,
        countInStock: 80,
        tags: ["میوه خشک ورزشی", "انرژی‌زا", "ریکاوری", "ورزشکار", "قبل از تمرین"],
        pdpContent: {"nutritionPer100g": {"energy_kcal": 315, "carb_g": 79.8, "protein_g": 3.2, "fat_g": 0.9, "fiber_g": 9.1, "sugar_g": 62.5}},
        categoryId: catMap["miveh-khoshk-mokhallat"] ?? catMap["miveh-khoshk"],
      },
    });
    // image
    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.create({ data: { productId: prod.id, url: "/products/p3.jpeg", alt: "میوه خشک ورزشی دشت‌زاد", sortOrder: 0 } });
    // variants
    await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
    await prisma.productVariant.createMany({ data: [
      { productId: prod.id, weightValue: 100, gramValue: 100, weightUnit: "GRAM", sku: "sport-dried-fruit-mix-100g", calculatedPrice_rial: 3100000, price_rial: 3100000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 0 },
      { productId: prod.id, weightValue: 250, gramValue: 250, weightUnit: "GRAM", sku: "sport-dried-fruit-mix-250g", calculatedPrice_rial: 7750000, price_rial: 7750000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 1 },
      { productId: prod.id, weightValue: 500, gramValue: 500, weightUnit: "GRAM", sku: "sport-dried-fruit-mix-500g", calculatedPrice_rial: 14720000, price_rial: 14720000, offPrice_rial: null, stock: 25, isActive: true, sortOrder: 2 },
    ] });
  }

  console.log("✅ All products seeded.");
}

main()
  .then(async () => {
    console.log("🎉 Dashtzad catalog seed complete!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });