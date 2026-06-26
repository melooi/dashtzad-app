import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import type { CategoryFormValues } from "@/lib/admin/categories";

// Pure category business logic (no auth, no revalidation) so it can be unit /
// integration tested directly against the DB and reused by the server actions.

/**
 * Validate business rules AFTER Zod parsing. Returns a Persian error message,
 * or null if the values are valid. Enforces: unique slug, parent exists + same
 * type, no self/circular parent relationship.
 */
export async function assertCategoryRules(
  values: CategoryFormValues,
  opts: { excludeId?: string } = {},
): Promise<string | null> {
  const { excludeId } = opts;

  const slugOwner = await prisma.category.findUnique({ where: { slug: values.slug } });
  if (slugOwner && slugOwner.id !== excludeId) {
    return "این نامک قبلاً برای دسته‌ی دیگری استفاده شده است.";
  }

  if (values.parentId) {
    if (values.parentId === excludeId) {
      return "یک دسته نمی‌تواند والد خودش باشد.";
    }
    const parent = await prisma.category.findUnique({ where: { id: values.parentId } });
    if (!parent) return "دسته‌ی والد یافت نشد.";
    if (parent.type !== values.type) {
      return "دسته‌ی والد باید از همان نوع (محصول/نوشته) باشد.";
    }
    if (excludeId) {
      const seen = new Set<string>();
      let cursorParentId: string | null = parent.parentId;
      while (cursorParentId) {
        if (cursorParentId === excludeId) {
          return "این انتخاب یک رابطه‌ی حلقوی ایجاد می‌کند.";
        }
        if (seen.has(cursorParentId)) break;
        seen.add(cursorParentId);
        const next = await prisma.category.findUnique({
          where: { id: cursorParentId },
          select: { parentId: true },
        });
        cursorParentId = next?.parentId ?? null;
      }
    }
  }

  return null;
}

/** Find a free slug for a duplicate: "<slug>-copy", then "-copy-2", … */
export async function nextAvailableCopySlug(slug: string): Promise<string> {
  return ensureUniqueSlug(`${slug}-copy`, async (candidate) => {
    const clash = await prisma.category.findUnique({ where: { slug: candidate } });
    return clash !== null;
  });
}

/**
 * Reason a category cannot be deleted (children / products / posts attached),
 * or null if it is safe to delete.
 */
export async function categoryDeleteBlockReason(id: string): Promise<string | null> {
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true, products: true, posts: true } } },
  });
  if (!cat) return "دسته‌بندی یافت نشد.";
  if (cat._count.children > 0) {
    return "این دسته زیرمجموعه دارد؛ ابتدا زیرمجموعه‌ها را منتقل یا حذف کنید.";
  }
  if (cat._count.products > 0) {
    return "این دسته به محصولات متصل است و قابل حذف نیست.";
  }
  if (cat._count.posts > 0) {
    return "این دسته به نوشته‌ها متصل است و قابل حذف نیست.";
  }
  return null;
}
