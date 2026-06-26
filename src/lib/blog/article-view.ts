// ============================================================
// Frontend helpers for magazine article templates (CONTENT-CP1).
// Pure server-safe utilities (no React).
// ============================================================

/** Extract H2 heading texts from sanitized body HTML (for the table of contents). */
export function extractH2Headings(html: string | null | undefined): string[] {
  const out: string[] = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(String(html ?? "")))) {
    const text = m[1].replace(/<[^>]*>/g, "").trim();
    if (text) out.push(text);
  }
  return out;
}

export type SourceItem = { label: string; url: string; note: string };

/** Normalize Post.sources Json into a clean, label-required list. */
export function parseSources(sources: unknown): SourceItem[] {
  if (!Array.isArray(sources)) return [];
  return (sources as unknown[])
    .map((s) => (s && typeof s === "object" ? (s as Record<string, unknown>) : {}))
    .map((s) => ({
      label: String(s.label ?? "").trim(),
      url: String(s.url ?? "").trim(),
      note: String(s.note ?? "").trim(),
    }))
    .filter((s) => s.label);
}

/** Normalize Post.typeMeta Json into a string map. */
export function typeMetaMap(meta: unknown): Record<string, string> {
  if (!meta || typeof meta !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(meta as Record<string, unknown>)) {
    const val = String(v ?? "").trim();
    if (val) out[k] = val;
  }
  return out;
}
