import type { ReactNode } from "react";
import { StoreContainer } from "@/components/storefront/StoreContainer";

/**
 * A titled storefront section with the brand "olive bar" heading treatment
 * (matches the homepage Section look). Use for PLP/PDP content groups.
 */
export function StoreSection({
  title,
  subtitle,
  action,
  children,
  className = "",
  contained = true,
  id,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** When false, the section spans full width (caller handles padding). */
  contained?: boolean;
  id?: string;
}) {
  const header = (title || subtitle || action) && (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {title && (
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-1.5 rounded-full bg-store-primary" aria-hidden />
            <h2 className="font-heading text-2xl font-bold text-store-text">{title}</h2>
          </div>
        )}
        {subtitle && <p className="mt-2 ps-4 text-sm text-store-text-faint">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );

  const body = (
    <>
      {header}
      {children}
    </>
  );

  if (!contained) {
    return (
      <section id={id} className={className}>
        {body}
      </section>
    );
  }

  return (
    <StoreContainer as="section" className={`py-10 md:py-12 ${className}`}>
      <div id={id}>{body}</div>
    </StoreContainer>
  );
}
