import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, User, ShieldAlert, ChevronLeft, Layers, BookOpen, Calendar, FolderTree, Share2, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ArticleToc } from "@/components/storefront/ArticleToc";
import { ArticleTypeMeta } from "@/components/storefront/ArticleTypeMeta";
import { ShareButtons } from "@/components/storefront/ShareButtons";
import { RichTextRenderer } from "@/components/storefront/RichTextRenderer";
import { SidebarProductRotator } from "@/components/storefront/SidebarProductRotator";
import { RecipeCard } from "@/components/storefront/RecipeCard";
import { RecipeRating } from "@/components/storefront/RecipeRating";
import { RecipeLikeButton } from "@/components/storefront/RecipeLikeButton";
import { RecipeSuggestForm } from "@/components/storefront/RecipeSuggestForm";
import { toProductCardData } from "@/lib/storefront/product-card";
import { CommentForm } from "@/views/blog/CommentForm";
import { StructuredData } from "@/components/StructuredData";
import { getEntitySchemaOverride } from "@/lib/seo/schema-override";
import { articleSchema, breadcrumbSchema, recipeSchema } from "@/lib/jsonld";
import { parseRecipeMeta, parseMinutes, minutesToISO, scaleQty, formatQty } from "@/lib/blog/recipe";
import { getApprovedRatingAggregate } from "@/lib/blog/recipe-ratings";
import { buildEntityMetadata } from "@/lib/seo/meta";
import { stripHtmlForMeta } from "@/lib/seo/text";
import { getCurrentUser } from "@/lib/auth/session";
import { toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";
import { ARTICLE_TYPES, ARTICLE_DISCLAIMERS, articleTypeLabel, type ArticleTypeKey } from "@/lib/admin/article-types";
import { extractH2Headings, parseSources, typeMetaMap } from "@/lib/blog/article-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, title: true, briefText: true, coverImage: true },
  });
  if (!post) return { title: "نوشته یافت نشد", robots: { index: false, follow: true } };
  return buildEntityMetadata("POST", post.id, {
    title: post.title,
    description: stripHtmlForMeta(post.briefText),
    path: `/blog/${slug}`,
    image: post.coverImage || undefined,
    type: "article",
  });
}

const variantInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
  category: { select: { title: true } },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      gramValue: true,
      price_rial: true,
      offPrice_rial: true,
      stock: true,
      marketingBadge: true,
      weight: { select: { id: true, title: true, gramValue: true } },
      packaging: { select: { id: true, title: true } },
    },
  },
} as const;

const ARTICLE_COL = "lg:max-w-[760px]";

// ---- small sidebar building blocks ----
function SidebarCard({ title, icon, children }: { title?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-store-border bg-store-surface p-4">
      {title && (
        <h2 className="mb-3 flex items-center gap-1.5 font-heading text-sm font-bold text-store-text">
          {icon}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function SidebarArticleItem({
  a,
}: {
  a: { slug: string; title: string; coverImage: string; readingTime: number };
}) {
  return (
    <Link href={`/blog/${a.slug}`} className="group flex gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-store-surface-soft">
        {a.coverImage ? (
          <Image src={a.coverImage} alt={a.title} fill sizes="56px" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-store-text-faint"><BookOpen className="size-5" /></span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-6 text-store-text transition-colors group-hover:text-store-primary">{a.title}</p>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-store-text-faint"><Clock className="size-3" />{toPersianNumbers(a.readingTime)} دقیقه</span>
      </div>
    </Link>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true, avatar: true, biography: true } },
      category: { select: { title: true, slug: true } },
      series: { select: { title: true, slug: true, status: true } },
      comments: {
        where: { status: "APPROVED", parentId: null },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!post) notFound();

  const typeKey: ArticleTypeKey | null = post.articleType && post.articleType in ARTICLE_TYPES ? (post.articleType as ArticleTypeKey) : null;
  const identity = typeKey ? ARTICLE_TYPES[typeKey] : null;
  const accent = identity?.accent ?? "#15803d";
  const meta = typeMetaMap(post.typeMeta);
  const sources = parseSources(post.sources);
  const headings = extractH2Headings(post.text);
  const disclaimerText = typeKey ? meta.disclaimer || ARTICLE_DISCLAIMERS[typeKey] || "" : "";
  const isCaseFile = typeKey === "CASE_FILE";
  const isRecipe = typeKey === "RECIPE";
  const recipe = isRecipe ? parseRecipeMeta(post.recipeMeta) : null;

  const [relatedProductsRaw, relatedArticlesRaw, latestPosts, user] = await Promise.all([
    post.relatedProductIds.length
      ? prisma.product.findMany({ where: { id: { in: post.relatedProductIds }, isActive: true }, include: variantInclude })
      : Promise.resolve([]),
    post.relatedPostIds.length
      ? prisma.post.findMany({
          where: { id: { in: post.relatedPostIds }, status: "PUBLISHED" },
          select: { id: true, slug: true, title: true, briefText: true, coverImage: true, readingTime: true, articleType: true },
        })
      : Promise.resolve([]),
    prisma.post.findMany({
      where: { status: "PUBLISHED", id: { not: post.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, slug: true, title: true, coverImage: true, readingTime: true },
    }),
    getCurrentUser(),
  ]);

  // Recipe engagement — real PostRating aggregate + PostLike count + the
  // current user's own rating/like (honest data only).
  let recipeRating = { average: 0, count: 0, userValue: null as number | null, userPending: false };
  let recipeLike = { count: 0, liked: false };
  if (isRecipe && recipe) {
    const [agg, likeCount, myRating, myLike] = await Promise.all([
      getApprovedRatingAggregate(post.id), // APPROVED ratings only
      prisma.postLike.count({ where: { postId: post.id } }),
      user ? prisma.postRating.findUnique({ where: { userId_postId: { userId: user.id, postId: post.id } }, select: { value: true, status: true } }) : Promise.resolve(null),
      user ? prisma.postLike.findUnique({ where: { userId_postId: { userId: user.id, postId: post.id } }, select: { id: true } }) : Promise.resolve(null),
    ]);
    recipeRating = {
      average: agg.average,
      count: agg.count,
      userValue: myRating?.value ?? null,
      userPending: myRating ? myRating.status !== "APPROVED" : false,
    };
    recipeLike = { count: likeCount, liked: Boolean(myLike) };
  }

  const relatedProducts = post.relatedProductIds.map((id) => relatedProductsRaw.find((p) => p.id === id)).filter(Boolean) as typeof relatedProductsRaw;

  // Sidebar products: explicit related → tag-matched real products → recent real
  // products. Always real store data; the heading stays honest about which it is.
  let sidebarProducts = relatedProducts;
  let productsLabel = "محصولات مرتبط";
  if (sidebarProducts.length === 0) {
    const tagMatched = post.tags.length
      ? await prisma.product.findMany({
          where: {
            isActive: true,
            OR: [{ tags: { hasSome: post.tags } }, ...post.tags.map((t) => ({ title: { contains: t, mode: "insensitive" as const } }))],
          },
          include: variantInclude,
          take: 8,
        })
      : [];
    if (tagMatched.length > 0) {
      sidebarProducts = tagMatched;
      productsLabel = "محصولات مرتبط";
    } else {
      sidebarProducts = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, include: variantInclude, take: 8 });
      productsLabel = "پیشنهاد فروشگاه دشت‌زاد";
    }
  }

  let relatedArticles = post.relatedPostIds.map((id) => relatedArticlesRaw.find((p) => p.id === id)).filter(Boolean) as typeof relatedArticlesRaw;
  if (relatedArticles.length === 0) {
    relatedArticles = await prisma.post.findMany({
      where: { categoryId: post.categoryId, status: "PUBLISHED", id: { not: post.id } },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, briefText: true, coverImage: true, readingTime: true, articleType: true },
    });
  }

  const publishDate = post.publishedAt ?? post.createdAt;

  const recipeLd =
    isRecipe && recipe
      ? recipeSchema({
          name: post.title,
          description: stripHtmlForMeta(post.briefText) || post.briefText,
          image: post.coverImage || null,
          datePublished: publishDate,
          author: post.author?.name || null,
          prepTime: minutesToISO(parseMinutes(recipe.prepTime)),
          cookTime: minutesToISO(parseMinutes(recipe.cookTime)),
          totalTime: minutesToISO(((parseMinutes(recipe.prepTime) ?? 0) + (parseMinutes(recipe.cookTime) ?? 0)) || null),
          recipeYield: `${toPersianNumbers(recipe.baseServings)} نفر`,
          recipeCategory: post.category?.title || null,
          keywords: post.tags,
          ingredients: recipe.ingredients.map((i) =>
            i.qty != null
              ? `${formatQty(scaleQty(i.qty, recipe.baseServings))}${i.unit ? " " + i.unit : ""} ${i.name}`.trim()
              : `${i.name}${i.unit ? " (" + i.unit + ")" : ""}`,
          ),
          instructions: recipe.steps.map((s) => ({ name: s.title, text: s.desc || s.title })),
          nutrition: {
            calories: recipe.nutrition.calories,
            protein: recipe.nutrition.protein,
            carbohydrate: recipe.nutrition.carb,
            fat: recipe.nutrition.fat,
          },
          aggregateRating: recipeRating.count > 0 ? { ratingValue: recipeRating.average, ratingCount: recipeRating.count } : null,
        })
      : null;

  const seriesActive = post.series && post.series.status === "PUBLISHED";
  // latest list excludes the current article and the ones already shown as related.
  const relatedIds = new Set(relatedArticles.map((a) => a.id));
  const latest = latestPosts.filter((p) => !relatedIds.has(p.id)).slice(0, 4);

  // Optional admin-authored extra JSON-LD for this article (validated + safe).
  const schemaOverride = await getEntitySchemaOverride("POST", post.id);

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 md:py-10 text-store-text">
      <StructuredData
        data={[
          articleSchema({
            title: post.title,
            slug: post.slug,
            description: post.briefText,
            image: post.coverImage,
            datePublished: publishDate,
            dateModified: post.updatedAt,
          }),
          breadcrumbSchema([
            { name: "خانه", url: "/" },
            { name: "مجله دشت‌زاد", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
          ...(recipeLd ? [recipeLd] : []),
          ...schemaOverride,
        ]}
      />

      {/* breadcrumb */}
      <nav aria-label="مسیر" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-store-text-faint">
        <Link href="/" className="hover:text-store-primary">خانه</Link>
        <ChevronLeft className="size-3" />
        <Link href="/blog" className="hover:text-store-primary">مجله دشت‌زاد</Link>
        {post.category && (
          <>
            <ChevronLeft className="size-3" />
            <Link href={`/blog/category/${post.category.slug}`} className="hover:text-store-primary">{post.category.title}</Link>
          </>
        )}
      </nav>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 xl:gap-14">
        {/* ===================== MAIN COLUMN ===================== */}
        <div className="min-w-0">
          <article className={ARTICLE_COL}>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: accent }}>
                {identity?.badge ?? articleTypeLabel(post.articleType)}
              </span>
              {post.category && (
                <Link href={`/blog/category/${post.category.slug}`} className="text-xs text-store-text-muted hover:text-store-primary">{post.category.title}</Link>
              )}
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight text-store-text md:text-4xl">{post.title}</h1>
            {post.subtitle && <p className="mt-3 text-lg leading-8 text-store-text-muted">{post.subtitle}</p>}

            {/* meta line — mobile only (the sidebar carries it on desktop) */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-store-text-faint lg:hidden">
              {post.author?.name && <span className="flex items-center gap-1"><User className="size-4" />{post.author.name}</span>}
              <span className="flex items-center gap-1"><Clock className="size-4" />{toPersianNumbers(post.readingTime)} دقیقه</span>
              <span className="flex items-center gap-1"><Calendar className="size-4" />{formatJalali(publishDate)}</span>
            </div>

            {/* mobile TOC accordion */}
            {headings.length >= 2 && <ArticleToc headings={headings} variant="mobile" className="mt-5 lg:hidden" />}

            {post.coverImage && (
              <div className={`relative mt-6 overflow-hidden rounded-2xl bg-store-surface-soft ${isCaseFile ? "aspect-[21/9]" : "aspect-[16/9]"}`}>
                <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" priority />
              </div>
            )}

            {/* structured recipe card (RECIPE-CP1) */}
            {isRecipe && recipe && (
              <div className="mt-6">
                <RecipeCard
                  meta={recipe}
                  rating={
                    <RecipeRating
                      postId={post.id}
                      average={recipeRating.average}
                      count={recipeRating.count}
                      userValue={recipeRating.userValue}
                      userPending={recipeRating.userPending}
                    />
                  }
                  actions={
                    <>
                      <RecipeLikeButton postId={post.id} initialLiked={recipeLike.liked} initialCount={recipeLike.count} />
                      <RecipeSuggestForm postId={post.id} />
                    </>
                  }
                />
              </div>
            )}

            {post.briefText && (
              <p className="mt-6 rounded-xl bg-store-surface-soft p-4 text-base leading-8 text-store-text-muted">{post.briefText}</p>
            )}

            {typeKey && <ArticleTypeMeta articleType={typeKey} meta={meta} accent={accent} />}

            {disclaimerText && (
              <div className="my-5 flex items-start gap-2.5 rounded-xl border border-store-gold/30 bg-store-amber-soft/40 p-4 text-sm leading-7 text-store-text-muted">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-store-gold-deep" />
                <span><span className="font-bold text-store-text">سلب مسئولیت: </span>{disclaimerText}</span>
              </div>
            )}

            {/* body */}
            <div className="dz-article-body mt-6 text-[1.05rem] leading-8">
              <RichTextRenderer value={post.text} />
            </div>

            {sources.length > 0 && (
              <section className="mt-8 rounded-2xl border border-store-border bg-store-surface-warm p-5">
                <h2 className="mb-3 flex items-center gap-1.5 font-heading text-base font-bold text-store-text">
                  <BookOpen className="size-4 text-store-primary" /> منابع و ارجاعات
                </h2>
                <ol className="flex list-decimal flex-col gap-2 ps-5 text-sm text-store-text-muted">
                  {sources.map((s, i) => (
                    <li key={i}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-store-primary hover:underline">{s.label}</a>
                      ) : (
                        <span>{s.label}</span>
                      )}
                      {s.note && <span className="text-store-text-faint"> — {s.note}</span>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="rounded-full bg-store-surface-soft px-3 py-1 text-xs text-store-text-muted">#{t}</span>
                ))}
              </div>
            )}
          </article>

          {/* author box */}
          {post.author?.name && (post.author.biography || post.author.avatar) && (
            <section className={`mt-10 flex items-start gap-4 rounded-2xl border border-store-border bg-store-surface-warm p-5 ${ARTICLE_COL}`}>
              {post.author.avatar ? (
                <Image src={post.author.avatar} alt={post.author.name} width={56} height={56} className="size-14 rounded-full object-cover" />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-full bg-store-primary-soft text-store-primary"><User className="size-6" /></span>
              )}
              <div>
                <p className="font-heading text-sm font-bold text-store-text">{post.author.name}</p>
                {post.author.biography && <p className="mt-1 text-sm leading-7 text-store-text-muted">{post.author.biography}</p>}
              </div>
            </section>
          )}
        </div>

        {/* ===================== SIDEBAR ===================== */}
        <aside className="mt-12 lg:mt-0">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            {/* TOC — desktop */}
            {headings.length >= 2 && <ArticleToc headings={headings} variant="sidebar" className="hidden lg:block" />}

            {/* article info — desktop */}
            <div className="hidden lg:block">
              <SidebarCard title="اطلاعات مقاله">
                <ul className="flex flex-col gap-2.5 text-sm">
                  {post.category && (
                    <li className="flex items-center gap-2 text-store-text-muted"><FolderTree className="size-4 text-store-text-faint" /><Link href={`/blog/category/${post.category.slug}`} className="hover:text-store-primary">{post.category.title}</Link></li>
                  )}
                  <li className="flex items-center gap-2 text-store-text-muted"><Clock className="size-4 text-store-text-faint" />{toPersianNumbers(post.readingTime)} دقیقه مطالعه</li>
                  <li className="flex items-center gap-2 text-store-text-muted"><Calendar className="size-4 text-store-text-faint" />{formatJalali(publishDate)}</li>
                  {post.author?.name && <li className="flex items-center gap-2 text-store-text-muted"><User className="size-4 text-store-text-faint" />{post.author.name}</li>}
                </ul>
              </SidebarCard>
            </div>

            {/* related case file */}
            {seriesActive && (
              <SidebarCard title="پرونده مرتبط" icon={<Layers className="size-4 text-store-primary" />}>
                <Link href={`/blog/case-files/${post.series!.slug}`} className="group flex items-center gap-2 text-sm text-store-text-muted transition-colors hover:text-store-primary">
                  <span className="font-medium text-store-text group-hover:text-store-primary">{post.series!.title}</span>
                  <ChevronLeft className="ms-auto size-4" />
                </Link>
              </SidebarCard>
            )}

            {/* related articles */}
            {relatedArticles.length > 0 && (
              <SidebarCard title={isCaseFile ? "در همین پرونده" : "مقاله‌های مرتبط"} icon={<BookOpen className="size-4 text-store-primary" />}>
                <div className="flex flex-col gap-4">
                  {relatedArticles.slice(0, 4).map((a) => (
                    <SidebarArticleItem key={a.id} a={a} />
                  ))}
                </div>
              </SidebarCard>
            )}

            {/* related / suggested products — slideshow-style auto-rotation when > 3 */}
            {sidebarProducts.length > 0 && (
              <SidebarCard title={productsLabel} icon={<Sparkles className="size-4 text-store-primary" />}>
                <SidebarProductRotator products={sidebarProducts.map((raw) => toProductCardData(raw))} />
              </SidebarCard>
            )}

            {/* share */}
            <SidebarCard title="اشتراک‌گذاری" icon={<Share2 className="size-4 text-store-primary" />}>
              <ShareButtons title={post.title} />
            </SidebarCard>

            {/* latest */}
            {latest.length > 0 && (
              <SidebarCard title="تازه‌ترین مطالب" icon={<Sparkles className="size-4 text-store-primary" />}>
                <div className="flex flex-col gap-4">
                  {latest.map((a) => (
                    <SidebarArticleItem key={a.id} a={a} />
                  ))}
                </div>
              </SidebarCard>
            )}
          </div>
        </aside>
      </div>

      {/* ===================== COMMENTS (below, aligned to article) ===================== */}
      <section className={`mt-12 ${ARTICLE_COL}`}>
        <h2 className="mb-4 font-heading text-xl font-bold text-store-text">نظرات ({toPersianNumbers(post.comments.length)})</h2>
        <div className="mb-6">
          {user ? (
            <CommentForm postId={post.id} withRating={isRecipe} />
          ) : (
            <p className="rounded-xl bg-store-surface-soft p-4 text-sm text-store-text-muted">
              برای گذاشتن نظر <Link href="/auth" className="font-bold text-store-primary hover:underline">وارد شوید</Link>.
            </p>
          )}
        </div>
        {post.comments.length === 0 ? (
          <p className="text-sm text-store-text-faint">هنوز نظری ثبت نشده است.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {post.comments.map((c) => (
              <li key={c.id} className="rounded-xl border border-store-border p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-store-text">{c.user.name ?? "کاربر"}</span>
                  <span className="text-xs text-store-text-faint">{formatJalali(c.createdAt)}</span>
                </div>
                <p className="text-sm text-store-text-muted">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
