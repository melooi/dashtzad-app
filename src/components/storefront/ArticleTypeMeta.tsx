import { ARTICLE_TYPES, type ArticleTypeKey } from "@/lib/admin/article-types";

/**
 * Renders an article's type-specific fields (Post.typeMeta) for the public
 * template: textarea fields become accent "highlight" blocks, short fields
 * become a labelled chip strip. The `disclaimer` field is rendered separately.
 */
export function ArticleTypeMeta({
  articleType,
  meta,
  accent,
}: {
  articleType: ArticleTypeKey;
  meta: Record<string, string>;
  accent: string;
}) {
  const fields = ARTICLE_TYPES[articleType].metaFields.filter((f) => f.key !== "disclaimer" && (meta[f.key] ?? "").trim());
  const highlights = fields.filter((f) => f.input === "textarea");
  const chips = fields.filter((f) => f.input !== "textarea");

  if (highlights.length === 0 && chips.length === 0) return null;

  const labelFor = (key: string, fallback: string) => {
    if (key === "reviewedBy") return "بازبینی";
    return fallback;
  };

  return (
    <div className="my-5 flex flex-col gap-3">
      {highlights.map((f) => (
        <div
          key={f.key}
          className="rounded-xl bg-store-surface-warm p-4"
          style={{ borderInlineStart: `3px solid ${accent}` }}
        >
          <p className="mb-1 text-xs font-bold" style={{ color: accent }}>
            {f.label}
          </p>
          <p className="text-sm leading-7 text-store-text-muted">{meta[f.key]}</p>
        </div>
      ))}

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.flatMap((f) => {
            const raw = meta[f.key];
            if (f.input === "tags") {
              return raw
                .split(/[,،]/)
                .map((v) => v.trim())
                .filter(Boolean)
                .map((v, i) => (
                  <span key={`${f.key}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-store-surface-soft px-3 py-1 text-xs text-store-text-muted">
                    <span className="text-store-text-faint">{f.label}:</span> {v}
                  </span>
                ));
            }
            // selects map raw values → labels
            let display = raw;
            if (f.input === "select" && f.options) {
              display = f.options.find((o) => o.value === raw)?.label ?? raw;
            }
            return [
              <span key={f.key} className="inline-flex items-center gap-1 rounded-full bg-store-surface-soft px-3 py-1 text-xs text-store-text-muted">
                <span className="text-store-text-faint">{labelFor(f.key, f.label)}:</span> {display}
              </span>,
            ];
          })}
        </div>
      )}
    </div>
  );
}
