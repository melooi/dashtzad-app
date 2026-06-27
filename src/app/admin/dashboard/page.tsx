import { Package, FolderTree, FileText, ShoppingCart, Users, MessageSquare, Star, Headset, ImageOff, AlertTriangle, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardCard } from "@/components/admin/DashboardCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    products,
    categories,
    posts,
    orders,
    users,
    pendingComments,
    pendingReviews,
    newChats,
    ordersToFulfill,
    productsNoImage,
    draftPosts,
    newContactMessages,
    lowStockVariants,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.postComment.count({ where: { status: "PENDING" } }),
    prisma.productReview.count({ where: { status: "PENDING" } }),
    prisma.conversation.count({ where: { status: "NEW" } }),
    // --- action-oriented, all from real data ---
    prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.product.count({ where: { images: { none: {} }, deletedAt: null } }),
    prisma.post.count({ where: { status: "DRAFT", deletedAt: null } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.productVariant.count({ where: { isActive: true, stock: { lte: 3 } } }),
  ]);

  return (
    <div>
      <div className="mb-7 border-b border-dz-a-primary-100 dark:border-dz-a-night-border pb-5">
        <p className="font-heading text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">پنل مدیریت دشت‌زاد</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          خوش آمدید
        </h1>
        <p className="mt-1.5 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
          نمای کلی فروشگاه و محتوای سایت. از این‌جا به بخش‌های پرکاربرد دسترسی دارید.
        </p>
      </div>

      <section className="mb-7">
        <h2 className="mb-3 text-xs font-bold text-dz-a-primary-400 dark:text-dz-a-night-faint">نیازمند اقدام</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard label="سفارش‌های آمادهٔ ارسال" value={ordersToFulfill} icon={ShoppingCart} href="/admin/collections/orders" highlight />
          <DashboardCard label="پیام‌های بی‌پاسخ تماس" value={newContactMessages} icon={Inbox} href="/admin/collections/contact-messages" highlight />
          <DashboardCard label="محصولات بدون تصویر" value={productsNoImage} icon={ImageOff} href="/admin/collections/products" highlight />
          <DashboardCard label="موجودی کم (مدل‌های فروش)" value={lowStockVariants} icon={AlertTriangle} href="/admin/collections/products" highlight />
          <DashboardCard label="مقاله‌های پیش‌نویس" value={draftPosts} icon={FileText} href="/admin/content/articles?status=DRAFT" highlight />
        </div>
      </section>

      <section className="mb-7">
        <h2 className="mb-3 text-xs font-bold text-dz-a-primary-400 dark:text-dz-a-night-faint">فروشگاه و محتوا</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard label="محصولات" value={products} icon={Package} href="/admin/collections/products" />
          <DashboardCard label="دسته‌بندی‌ها" value={categories} icon={FolderTree} href="/admin/collections/categories" />
          <DashboardCard label="نوشته‌ها" value={posts} icon={FileText} href="/admin/collections/posts" />
          <DashboardCard label="سفارش‌ها" value={orders} icon={ShoppingCart} href="/admin/collections/orders" />
          <DashboardCard label="کاربران" value={users} icon={Users} href="/admin/customers" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold text-dz-a-primary-400 dark:text-dz-a-night-faint">در انتظار رسیدگی</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard label="گفت‌وگوهای جدید چت" value={newChats} icon={Headset} href="/admin/chat" highlight />
          <DashboardCard label="نظرات در انتظار" value={pendingComments} icon={MessageSquare} href="/admin/collections/comments" highlight />
          <DashboardCard label="نقدهای در انتظار" value={pendingReviews} icon={Star} href="/admin/collections/reviews" highlight />
        </div>
      </section>
    </div>
  );
}
