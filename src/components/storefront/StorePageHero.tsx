import type { ReactNode } from "react";

/**
 * The one storefront page hero — a warm-stone band with an optional eyebrow,
 * a Kalameh title and a subtitle. Replaces the hand-rolled hero markup that
 * was copy-pasted across products/about/contact/faq/terms.
 */
export function StorePageHero({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  align = "start",
  children,
  className = "",
}: {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  align?: "start" | "center";
  children?: ReactNode;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-store-border-soft bg-linear-to-bl from-store-cream via-store-bg to-store-surface px-6 py-9 md:px-10 md:py-12 ${className}`}
    >
      <div
        className="pointer-events-none absolute -top-24 -start-16 size-64 rounded-full bg-store-primary-soft/40 blur-3xl"
        aria-hidden
      />
      <div className={`relative flex flex-col gap-3 ${centered ? "items-center text-center" : ""}`}>
        {eyebrow && (
          <span className="store-eyebrow">
            {eyebrowIcon}
            {eyebrow}
          </span>
        )}
        <h1 className="font-heading text-3xl font-bold text-store-text md:text-4xl">{title}</h1>
        {subtitle && (
          <p className={`leading-8 text-store-text-muted ${centered ? "max-w-2xl text-lg" : "max-w-2xl"}`}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
