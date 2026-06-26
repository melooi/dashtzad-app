import Image from "next/image";

// Logo files are temporary (SKILL §E) — keep the variant→file mapping HERE only,
// so a file swap touches just this component.
type Variant = "mark" | "full" | "1313";

const MAP: Record<Variant, { src: string; w: number; h: number; alt: string }> = {
  full: { src: "/logo/dashtzad-logo-1.svg", w: 168, h: 81, alt: "دشت‌زاد" },
  mark: { src: "/logo/download-1.svg", w: 40, h: 40, alt: "دشت‌زاد" },
  1313: { src: "/logo/3-1.png", w: 56, h: 61, alt: "دشت‌زاد از ۱۳۱۳" },
};

export function Logo({
  variant = "full",
  className = "",
  priority = false,
}: {
  variant?: Variant;
  className?: string;
  priority?: boolean;
}) {
  const { src, w, h, alt } = MAP[variant];
  return (
    <Image
      src={src}
      width={w}
      height={h}
      alt={alt}
      priority={priority}
      className={className}
    />
  );
}
