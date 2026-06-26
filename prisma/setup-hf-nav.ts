// FRONT-HF-LOCK-CP1 — documented, idempotent STARTER navigation setup.
//
// This does NOT inject fake content. It builds two starter menus from data that
// ALREADY EXISTS in the database (real product categories + real storefront
// pages) and wires them to the header/footer globals, so the mega menu and the
// footer columns render with the shop's real catalog. Everything created here
// is fully editable / deletable in /admin/collections/menus and the header /
// footer global settings. Safe to re-run (upserts by slug, re-syncs items).
//
//   Run:  npx tsx prisma/setup-hf-nav.ts
//   Undo: delete the "mega-shop" / "footer-about" menus in the admin, then
//         clear megaMenuId / footerMenuTertiaryId in header/footer settings.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { headerSchema, footerSchema } from "../src/lib/admin/globals";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Map a real product-category slug → a meaningful curated icon key.
const CATEGORY_ICON: Record<string, string> = {
  berenj: "wheat",
  ajeel: "nut",
  "saffron-spices": "spice",
};

async function upsertMenu(slug: string, title: string, location: "HEADER_MAIN" | "CUSTOM" | "FOOTER_SECONDARY") {
  return prisma.menu.upsert({
    where: { slug },
    update: { title, isActive: true },
    create: { slug, title, location, isActive: true },
  });
}

/** Replace a menu's flat items with the given list (keeps the menu in sync). */
async function setItems(
  menuId: string,
  items: { label: string; href: string; icon?: string | null; linkType: string }[],
) {
  await prisma.menuItem.deleteMany({ where: { menuId } });
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    await prisma.menuItem.create({
      data: {
        menuId,
        label: it.label,
        href: it.href,
        icon: it.icon ?? null,
        linkType: it.linkType as never,
        sortOrder: i,
        isActive: true,
        desktopVisible: true,
        mobileVisible: true,
      },
    });
  }
}

async function mergeGlobal<S extends { parse: (v: unknown) => unknown }>(
  key: string,
  schema: S,
  patch: Record<string, unknown>,
) {
  const row = await prisma.globalSetting.findUnique({ where: { key } });
  const merged = schema.parse({ ...((row?.data as object) ?? {}), ...patch });
  await prisma.globalSetting.upsert({
    where: { key },
    update: { data: merged as object },
    create: { key, data: merged as object },
  });
}

async function main() {
  // 1) Mega menu from REAL product categories.
  const cats = await prisma.category.findMany({
    where: { type: "PRODUCT" },
    orderBy: { title: "asc" },
    select: { slug: true, title: true },
  });

  if (cats.length === 0) {
    console.log("⚠ No product categories found — skipping mega menu (no fake categories injected).");
  } else {
    const mega = await upsertMenu("mega-shop", "دسته‌بندی محصولات", "CUSTOM");
    await setItems(
      mega.id,
      cats.map((c) => ({
        label: c.title,
        href: `/products?cat=${c.slug}`,
        icon: CATEGORY_ICON[c.slug] ?? null,
        linkType: "CATEGORY",
      })),
    );
    await mergeGlobal("header", headerSchema, { megaMenuId: mega.id, showMegaMenu: true });
    console.log(`✓ Mega menu "mega-shop" → ${cats.length} real categories: ${cats.map((c) => c.title).join("، ")}`);
  }

  // 1b) Separate BLOG/editorial nav (shop ≠ blog) from REAL post categories.
  const postCats = await prisma.category.findMany({
    where: { type: "POST" },
    orderBy: { title: "asc" },
    select: { slug: true, title: true },
  });
  const blog = await upsertMenu("header-blog", "مجله دشت‌زاد", "HEADER_MAIN");
  await setItems(blog.id, [
    { label: "همه نوشته‌ها", href: "/blog", icon: "magazine", linkType: "INTERNAL" },
    ...postCats.map((c) => ({
      label: c.title,
      href: `/blog?cat=${c.slug}`,
      icon: "article" as string,
      linkType: "CATEGORY",
    })),
  ]);
  await mergeGlobal("header", headerSchema, { secondaryMenuId: blog.id });
  console.log(`✓ Blog nav "header-blog" → /blog + ${postCats.length} real post categories`);

  // 2) Footer "درباره دشت‌زاد" column from REAL pages (3rd footer column).
  const about = await upsertMenu("footer-about", "درباره دشت‌زاد", "CUSTOM");
  await setItems(about.id, [
    { label: "داستان ما", href: "/about", linkType: "PAGE" },
    { label: "فروشگاه دشت‌زاد", href: "/products", linkType: "INTERNAL" },
    { label: "مجله دشت‌زاد", href: "/blog", linkType: "INTERNAL" },
  ]);
  await mergeGlobal("footer", footerSchema, { footerMenuTertiaryId: about.id });
  console.log('✓ Footer column "footer-about" → /about, /products, /blog');

  console.log("\nDone. Edit or remove these starter menus anytime in /admin/collections/menus.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
