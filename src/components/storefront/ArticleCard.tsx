import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";
import { ARTICLE_TYPES, type ArticleTypeKey } from "@/lib/admin/article-types";

export type ArticleCardData = {
  slug: string;
  title: string;
  briefText: string;
  coverImage: string;
  readingTime: number;
  articleType: string | null;
};

/** Magazine article card with a type badge (accent-coloured). */
export function ArticleCard({ article }: { article: ArticleCardData }) {
  const identity = article.articleType && article.articleType in ARTICLE_TYPES ? ARTICLE_TYPES[article.articleType as ArticleTypeKey] : null;

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="store-card group flex flex-col overflow-hidden focus:outline-none"
    >
      <div className="store-card__media-wrap">
        <div className="store-card__media relative aspect-[16/10]">
          {article.coverImage ? (
            <Image src={article.coverImage} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-store-surface-soft text-xs text-store-text-faint">بدون تصویر</div>
          )}
          {identity && (
            <span
              className="absolute end-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-store-xs"
              style={{ background: identity.accent }}
            >
              {identity.badge}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-bold leading-7 text-store-text transition-colors group-hover:text-store-primary">
          {article.title}
        </h3>
        {article.briefText && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-store-text-muted">{article.briefText}</p>
        )}
        <div className="mt-3 flex items-center gap-1 text-xs text-store-text-faint">
          <Clock className="size-3.5" />
          {toPersianNumbers(article.readingTime)} دقیقه مطالعه
        </div>
      </div>
    </Link>
  );
}
