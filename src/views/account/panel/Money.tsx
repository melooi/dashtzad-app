import { formatToman } from "@/lib/price";

/**
 * Toman amount rendered with the toman.svg mask (SKILL §D — never the word).
 * Uses the existing `.store-toman` class (currentColor mask). `rial` is the
 * stored Rial integer; display is Toman.
 */
export function Money({
  rial,
  strong = false,
  big = false,
  className = "",
}: {
  rial: number;
  strong?: boolean;
  big?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap ${
        strong ? "font-bold" : "font-semibold"
      } ${className}`}
    >
      {formatToman(rial)}
      <span
        className="store-toman"
        role="img"
        aria-label="تومان"
        style={big ? { inlineSize: "0.78em", blockSize: "0.68em" } : undefined}
      />
    </span>
  );
}
