import Link from "next/link";
import { headers } from "next/headers";
import { permanentRedirect, redirect } from "next/navigation";
import { ArrowRight, PackageX, Search } from "lucide-react";
import { StoreStatusPage } from "@/components/storefront/StoreStatusPage";
import { prisma } from "@/lib/prisma";

async function resolveRedirectOrLog(pathname: string): Promise<void> {
  if (!pathname || pathname === "/") return;

  // Check for an active redirect rule
  const rule = await prisma.redirect.findFirst({
    where: { source: pathname, isActive: true },
    select: { destination: true, statusCode: true },
  });

  if (rule) {
    if (rule.statusCode === 301) {
      permanentRedirect(rule.destination);
    } else {
      redirect(rule.destination);
    }
  }

  // No redirect found — log the 404 hit (fire-and-forget style via upsert)
  await prisma.error404Log
    .upsert({
      where: { path: pathname },
      update: { hitCount: { increment: 1 } },
      create: { path: pathname },
    })
    .catch(() => {
      // Never let logging crash the page
    });
}

export default async function NotFound() {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";

  await resolveRedirectOrLog(pathname);

  return (
    <StoreStatusPage
      icon={<PackageX className="size-9" aria-hidden />}
      tone="neutral"
      title="صفحه پیدا نشد"
      description="صفحه‌ای که دنبالش بودید وجود ندارد یا منتقل شده است. می‌توانید به خانه برگردید یا محصولات دشت‌زاد را ببینید."
      actions={
        <>
          <Link href="/" className="store-btn store-btn-primary">
            <ArrowRight className="size-4" aria-hidden />
            بازگشت به خانه
          </Link>
          <Link href="/products" className="store-btn store-btn-secondary">
            <Search className="size-4" aria-hidden />
            مشاهده‌ی محصولات
          </Link>
        </>
      }
    />
  );
}
