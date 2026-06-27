import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as fs from "fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter } as any);

const priceUpdates = JSON.parse(fs.readFileSync("/tmp/price_updates.json", "utf-8"));
const missingProducts = JSON.parse(fs.readFileSync("/tmp/missing_filtered.json", "utf-8"));

function variantPrice(baseRial: number, grams: number): number {
  let price = Math.round(baseRial * grams / 100);
  if (grams >= 1000) price = Math.round(price * 0.90);
  else if (grams >= 500) price = Math.round(price * 0.95);
  return price;
}

async function main() {
  // Step 1: Update prices for existing products
  console.log(`\n=== Step 1: Price Updates (${priceUpdates.length}) ===`);
  let priceUpdated = 0;
  let priceSkipped = 0;

  for (const pu of priceUpdates) {
    const product = await prisma.product.findUnique({ where: { slug: pu.slug }, select: { id: true } });
    if (!product) { priceSkipped++; continue; }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        price_rial: pu.price_rial,
        ...(pu.offPrice_rial ? { offPrice_rial: pu.offPrice_rial } : {}),
        discountPercent: pu.discountPercent || 0,
      }
    });

    // Update image if barjil URL
    if (pu.imageUrl && pu.imageUrl.includes('barjil.com')) {
      const img = await prisma.productImage.findFirst({ where: { productId: product.id }, orderBy: { sortOrder: 'asc' } });
      if (img) {
        await prisma.productImage.update({ where: { id: img.id }, data: { url: pu.imageUrl } });
      }
    }
    priceUpdated++;
    if (priceUpdated % 10 === 0) console.log(`  Updated ${priceUpdated}/${priceUpdates.length - priceSkipped}...`);
  }
  console.log(`  ✅ ${priceUpdated} updated, ${priceSkipped} not found in DB`);

  // Build category slug→id map
  const cats = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catMap = new Map(cats.map(c => [c.slug, c.id]));

  // Step 2: Get existing slugs 
  const existingProducts = await prisma.product.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existingProducts.map(p => p.slug));

  // Step 3: Insert missing products
  console.log(`\n=== Step 2: Insert ${missingProducts.length} New Products ===`);
  let codeNum = 220082;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of missingProducts) {
    if (existingSlugs.has(p.slug)) { skipped++; continue; }

    const catId = catMap.get(p.subcategorySlug) || catMap.get(p.mainCategorySlug);
    if (!catId) {
      console.log(`  ⚠️  Category not found: ${p.subcategorySlug} / ${p.mainCategorySlug} — skipping ${p.slug}`);
      errors++;
      continue;
    }

    const weights: number[] = p.weights || [100, 250, 500, 1000];
    const priceRial = p.price_rial || 5000000;
    const hesabfaCode = `dz-${codeNum}`;

    try {
      await prisma.product.create({
        data: {
          slug: p.slug,
          title: p.title,
          latinTitle: p.latinTitle || p.title,
          description: p.description || '',
          brand: 'دشت‌زاد',
          price_rial: priceRial,
          offPrice_rial: p.offPrice_rial || null,
          discountPercent: p.discountPercent || 0,
          isActive: true,
          basePriceUnit: 'GRAM',
          hesabfaCode,
          categoryId: catId,
          tags: p.tags || [],
          pdpContent: {
            nutritionPer100g: p.nutrition ? {
              energy_kcal: p.nutrition.energy_kcal || 0,
              carb_g: p.nutrition.carb_g || 0,
              protein_g: p.nutrition.protein_g || 0,
              fat_g: p.nutrition.fat_g || 0,
              fiber_g: p.nutrition.fiber_g || 0,
              sugar_g: p.nutrition.sugar_g || 0,
            } : {}
          },
          images: {
            create: [{
              url: p.imageUrl || '/products/placeholder.jpg',
              alt: p.title,
              sortOrder: 0,
            }]
          },
          variants: {
            create: weights.map((g: number, i: number) => ({
              weightValue: g,
              gramValue: g,
              weightUnit: 'GRAM',
              sku: `${p.slug}-${g}g`,
              price_rial: variantPrice(priceRial, g),
              calculatedPrice_rial: variantPrice(priceRial, g),
              offPrice_rial: p.offPrice_rial ? variantPrice(p.offPrice_rial, g) : null,
              stock: p.countInStock || 30,
              isActive: true,
              sortOrder: i,
            }))
          }
        }
      });
      existingSlugs.add(p.slug);
      inserted++;
      codeNum++;
      if (inserted % 10 === 0) console.log(`  Inserted ${inserted}...`);
    } catch (err: any) {
      console.log(`  ❌ Error on ${p.slug}: ${err.message?.slice(0,80)}`);
      errors++;
    }
  }

  console.log(`\n  ✅ ${inserted} products inserted`);
  console.log(`  ⏭️  ${skipped} already existed`);
  console.log(`  ❌ ${errors} errors`);

  const total = await prisma.product.count();
  console.log(`\n=== FINAL: Total products in DB: ${total} ===`);
  console.log(`Last hesabfaCode assigned: dz-${codeNum - 1}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
