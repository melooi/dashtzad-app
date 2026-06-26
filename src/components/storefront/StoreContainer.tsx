import type { ReactNode } from "react";

/**
 * Storefront width container. Keeps the public store on one consistent measure
 * (matches Header/Footer max-w-6xl) so pages line up edge-to-edge.
 */
export function StoreContainer({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "main";
}) {
  return <Tag className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</Tag>;
}
