import Image from "next/image";
import Link from "next/link";
import { Clock, User, Newspaper } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";

export type PostCardData = {
  slug: string;
  title: string;
  briefText: string;
  coverImage?: string | null | Record<string, unknown>;
  readingTime: number;
  authorName: string | null;
  createdAt: Date | string;
};

function resolveImageUrl(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const s = raw.trim();
    return s.length > 0 ? s : null;
  }
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const candidate = obj.url ?? obj.src ?? obj.publicUrl ?? obj.imageUrl;
    if (typeof candidate === "string" && candidate.trim().length > 0) return candidate.trim();
  }
  return null;
}

export function PostCard({ post }: { post: PostCardData }) {
  const imageUrl = resolveImageUrl(post.coverImage);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-store-border bg-store-surface shadow-store-xs transition-all hover:-translate-y-0.5 hover:border-store-primary/30 hover:shadow-store-card"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-store-surface-soft">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-store-surface-soft">
            <Newspaper className="size-10 text-store-text-faint opacity-30" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-lg font-bold text-store-text transition-colors group-hover:text-store-primary">
          {post.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-store-text-muted">
          {post.briefText}
        </p>
        <div className="flex items-center gap-4 text-xs text-store-text-faint">
          {post.authorName && (
            <span className="flex items-center gap-1">
              <User className="size-3.5" />
              {post.authorName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {toPersianNumbers(post.readingTime)} دقیقه
          </span>
          <span className="ms-auto">{formatJalali(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
