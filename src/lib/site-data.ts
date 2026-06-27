import { prisma } from "@/lib/prisma";
import {
  getHeaderConfig,
  getFooterConfig,
  getBrandSettings,
  getSiteSettings,
  getBusinessInfo,
  getContactInfo,
  getSocialLinks,
} from "@/lib/admin/global-service";

export type NavContext = "main" | "blog";

// ============================================================
// Public site data (ADMIN-CP4). Server-only resolvers that turn admin globals
// + menus + banners into render-ready structures. Everything degrades to safe
// fallbacks so a public page never crashes on incomplete admin data.
// ============================================================

export type NavLink = {
  label: string;
  href: string;
  target: string;
  icon: string | null;
  badge: string | null;
  description: string | null;
  desktopVisible: boolean;
  mobileVisible: boolean;
  children: NavLink[];
};

/** Resolve an active menu (by id) into a nested nav tree. [] if missing. */
export async function getMenuNav(menuId: string | null | undefined): Promise<NavLink[]> {
  if (!menuId) return [];
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { items: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    });
    if (!menu || !menu.isActive) return [];
    const items = menu.items;
    const toNav = (it: (typeof items)[number]): NavLink => ({
      label: it.label,
      href: it.href,
      target: it.target,
      icon: it.icon,
      badge: it.badge,
      description: it.description,
      desktopVisible: it.desktopVisible,
      mobileVisible: it.mobileVisible,
      children: items.filter((c) => c.parentId === it.id).map(toNav),
    });
    return items.filter((i) => !i.parentId).map(toNav);
  } catch {
    return [];
  }
}

export type FooterColumn = { title: string; items: NavLink[] };

/** Resolve an active menu into a titled column (heading = menu title). */
export async function getMenuColumn(
  menuId: string | null | undefined,
): Promise<FooterColumn | null> {
  if (!menuId) return null;
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { items: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    });
    if (!menu || !menu.isActive) return null;
    const items = menu.items;
    const toNav = (it: (typeof items)[number]): NavLink => ({
      label: it.label,
      href: it.href,
      target: it.target,
      icon: it.icon,
      badge: it.badge,
      description: it.description,
      desktopVisible: it.desktopVisible,
      mobileVisible: it.mobileVisible,
      children: items.filter((c) => c.parentId === it.id).map(toNav),
    });
    return { title: menu.title, items: items.filter((i) => !i.parentId).map(toNav) };
  } catch {
    return null;
  }
}

export type PublicBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  linkLabel: string | null;
  linkHref: string | null;
};

/** Active banners for a placement, respecting the start/end window. */
export async function getActiveBanners(placement: string): Promise<PublicBanner[]> {
  try {
    const now = new Date();
    const list = await prisma.banner.findMany({
      where: {
        placement: placement as never,
        isActive: true,
        deletedAt: null,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
    return list.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      description: b.description,
      imageUrl: b.imageUrl,
      mobileImageUrl: b.mobileImageUrl,
      linkLabel: b.linkLabel,
      linkHref: b.linkHref,
    }));
  } catch {
    return [];
  }
}

/** Active FAQ items of a group (by id). [] if missing. */
export async function getFaqGroupItems(groupId: string | null | undefined) {
  if (!groupId) return null;
  try {
    const group = await prisma.fAQGroup.findUnique({
      where: { id: groupId },
      include: { items: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    });
    if (!group || !group.isActive) return null;
    return {
      title: group.title,
      description: group.description,
      items: group.items.map((i) => ({ id: i.id, question: i.question, answer: i.answer })),
    };
  } catch {
    return null;
  }
}

// Super mega-menu (design: wp/preview/super-mega-menu.html) — REAL data only.
export type MegaProduct = {
  name: string;
  href: string;
  priceRial: number;
  oldPriceRial: number | null;
  offPercent: number | null;
  imageUrl: string | null;
};
export type MegaCategory = {
  id: string;
  name: string;
  href: string;
  description: string;
  count: number;
  subs: { label: string; href: string }[];
  featured: MegaProduct[];
};

const FEATURED_PRODUCT_SELECT = {
  title: true,
  slug: true,
  price_rial: true,
  offPrice_rial: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true } },
} as const;

function mapFeatured(p: {
  title: string; slug: string; price_rial: number; offPrice_rial: number | null;
  images: { url: string }[];
}) {
  const now = p.offPrice_rial ?? p.price_rial;
  const off =
    p.offPrice_rial && p.price_rial > 0
      ? Math.round(((p.price_rial - p.offPrice_rial) / p.price_rial) * 100)
      : null;
  return {
    name: p.title, href: `/products/${p.slug}`, priceRial: now,
    oldPriceRial: p.offPrice_rial ? p.price_rial : null, offPercent: off,
    imageUrl: p.images[0]?.url ?? null,
  };
}

/** Resolve real product categories enriched for the super mega-menu.
 *  Products live in subcategories, so counts and featured items are
 *  aggregated from children as well as direct products. */
export async function getMegaMenuData(): Promise<MegaCategory[]> {
  try {
    const cats = await prisma.category.findMany({
      where: { type: "PRODUCT", parentId: null, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { products: true } },
        products: {
          where: { isActive: true },
          orderBy: [{ offPrice_rial: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
          take: 2,
          select: FEATURED_PRODUCT_SELECT,
        },
        children: {
          orderBy: { title: "asc" },
          select: {
            title: true,
            slug: true,
            _count: { select: { products: true } },
            products: {
              where: { isActive: true },
              orderBy: [{ offPrice_rial: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
              take: 2,
              select: FEATURED_PRODUCT_SELECT,
            },
          },
        },
      },
    });
    return cats.map((c) => {
      const childCount = c.children.reduce((sum, ch) => sum + ch._count.products, 0);
      const totalCount = c._count.products + childCount;
      const featured = [
        ...c.products,
        ...c.children.flatMap((ch) => ch.products),
      ].slice(0, 2).map(mapFeatured);
      return {
        id: c.id,
        name: c.title,
        href: `/products?cat=${c.slug}`,
        description: c.description ?? "",
        count: totalCount,
        subs: c.children.map((ch) => ({ label: ch.title, href: `/products?cat=${ch.slug}` })),
        featured,
      };
    });
  } catch {
    return [];
  }
}

/** All data the public header needs (shop + blog nav, mega tree, bottom nav). */
export async function getHeaderData() {
  const [config, brand, site, business, contact] = await Promise.all([
    getHeaderConfig(),
    getBrandSettings(),
    getSiteSettings(),
    getBusinessInfo(),
    getContactInfo(),
  ]);
  const [mainNav, secondaryNav, megaNav, bottomNav, megaData] = await Promise.all([
    getMenuNav(config.mainMenuId),
    getMenuNav(config.secondaryMenuId),
    config.showMegaMenu ? getMenuNav(config.megaMenuId) : Promise.resolve([] as NavLink[]),
    config.showBottomNav ? getMenuNav(config.bottomNavMenuId) : Promise.resolve([] as NavLink[]),
    config.showMegaMenu ? getMegaMenuData() : Promise.resolve([] as MegaCategory[]),
  ]);

  // Announcement bar: shown only when the header flag AND the siteSettings
  // content are both enabled and non-empty (no fake campaign).
  const announcement =
    config.showAnnouncement && site.announcementActive && site.announcementText
      ? { text: site.announcementText, href: site.announcementHref }
      : null;

  // Header phone: explicit override wins; otherwise fall back to contact info.
  const phone =
    config.phoneHref || config.phoneLabel
      ? { label: config.phoneLabel || contact.primaryPhone, href: config.phoneHref }
      : contact.showContactInHeader && contact.primaryPhone
        ? { label: contact.primaryPhone, href: `tel:${contact.primaryPhone}` }
        : null;

  return {
    config,
    brand,
    site,
    business,
    contact,
    mainNav,
    secondaryNav,
    megaNav,
    megaData,
    bottomNav,
    announcement,
    phone,
  };
}

/** All data the public footer needs (up to 4 admin-assignable columns). */
export async function getFooterData() {
  const [config, brand, business, contact, social] = await Promise.all([
    getFooterConfig(),
    getBrandSettings(),
    getBusinessInfo(),
    getContactInfo(),
    getSocialLinks(),
  ]);
  const rawColumns = await Promise.all([
    getMenuColumn(config.footerMenuPrimaryId),
    getMenuColumn(config.footerMenuSecondaryId),
    getMenuColumn(config.footerMenuTertiaryId),
    getMenuColumn(config.footerMenuQuaternaryId),
  ]);
  // Honest: only render columns that exist AND have at least one link.
  const columns = rawColumns.filter(
    (c): c is FooterColumn => c !== null && c.items.length > 0,
  );
  return { config, brand, business, contact, social, columns };
}
