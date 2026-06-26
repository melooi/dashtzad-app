import { formatToman } from "@/lib/price";

// Always renders the toman.svg icon (SKILL §D) — never the word "تومان".
export function Price({
  rial,
  offRial,
  size = "md",
  className = "",
}: {
  rial: number;
  offRial?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hasOff = !!offRial && offRial < rial;
  const effective = hasOff ? offRial! : rial;

  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  const icon = size === "lg" ? 18 : size === "sm" ? 12 : 14;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hasOff && (
        <span className="text-xs text-dz-primary-400 line-through">
          {formatToman(rial)}
        </span>
      )}
      <span className={`flex items-center gap-1 font-bold text-dz-primary-800 ${text}`}>
        {formatToman(effective)}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/toman.svg" width={icon} height={icon} alt="" aria-hidden className="inline-block shrink-0" />
      </span>
    </div>
  );
}
