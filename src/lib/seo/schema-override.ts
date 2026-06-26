// ============================================================
// SEO schemaOverride → public JSON-LD (SEO-CP1).
// The admin SeoMeta form stores an optional `schemaOverride` JSON blob per
// entity. It is validated as "parseable JSON object" on save, but was never
// rendered anywhere. This module safely normalises that stored value into an
// array of schema.org objects ready to drop into a <StructuredData> block.
//
// Safety rules (never break the page, never emit garbage):
//  - Accept a single object OR an array of objects.
//  - Each item must be a plain object carrying a non-empty string `@type`.
//  - Inject `@context: "https://schema.org"` when an item omits it.
//  - Cap item count and total size so a bad row can't bloat the document.
//  - Anything else → [] (render nothing).
// ============================================================

import { resolveSeoMeta, type SeoEntityType } from "@/lib/seo/meta";

const MAX_ITEMS = 10;
const MAX_BYTES = 50_000; // ~50KB of JSON-LD is already very generous.
const SCHEMA_CONTEXT = "https://schema.org";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

/** A schema.org node must be a plain object with a non-empty string `@type`. */
function isSchemaNode(v: unknown): v is Record<string, unknown> {
  return isPlainObject(v) && typeof v["@type"] === "string" && v["@type"].trim().length > 0;
}

/**
 * Normalise a stored schemaOverride value (already-parsed JSON from the DB, so
 * `unknown`) into a safe array of schema.org objects. Returns [] for anything
 * invalid — callers can spread the result unconditionally.
 */
export function normalizeSchemaOverride(raw: unknown): Record<string, unknown>[] {
  if (raw == null) return [];

  const candidates = Array.isArray(raw) ? raw : [raw];
  const valid = candidates.filter(isSchemaNode).slice(0, MAX_ITEMS);
  if (valid.length === 0) return [];

  const normalised = valid.map((node) =>
    "@context" in node ? node : { "@context": SCHEMA_CONTEXT, ...node },
  );

  // Final guard: reject the whole override if it serialises beyond the size cap
  // (defends against deeply-nested or oversized payloads).
  try {
    if (JSON.stringify(normalised).length > MAX_BYTES) return [];
  } catch {
    return []; // circular / non-serialisable → render nothing.
  }

  return normalised;
}

/**
 * Fetch + normalise the schemaOverride for an entity. Safe: never throws,
 * returns [] when no override is authored or it is invalid.
 */
export async function getEntitySchemaOverride(
  entityType: SeoEntityType,
  entityId: string,
): Promise<Record<string, unknown>[]> {
  const meta = await resolveSeoMeta(entityType, entityId);
  return normalizeSchemaOverride(meta?.schemaOverride);
}
