import { looksLikeHtml, sanitizeRichHtml } from "@/lib/richtext/sanitize";

/**
 * Renders admin-authored rich text safely on public pages (ADMIN-RICH-EDITOR-CP1).
 *
 * - HTML content is sanitized server-side against the Dashtzad allowlist before
 *   it is injected (no script / style / iframe / event handlers ever reach the DOM).
 * - Legacy plain-text content (saved before the editor existed) is rendered with
 *   `whitespace-pre-line`, exactly as before — so nothing breaks during migration.
 *
 * The `.dz-rich` class supplies the warm Persian typography + custom quote /
 * callout / leaf-list styles (see globals.css). Server Component (no client JS).
 */
export function RichTextRenderer({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const content = (value ?? "").trim();
  if (content === "") return null;

  const cls = `dz-rich${className ? ` ${className}` : ""}`;

  // Legacy plain text → preserve line breaks, no HTML injection.
  if (!looksLikeHtml(content)) {
    return (
      <div className={cls} dir="rtl">
        <p style={{ whiteSpace: "pre-line" }}>{content}</p>
      </div>
    );
  }

  const safe = sanitizeRichHtml(content);
  if (safe.trim() === "") return null;

  return <div className={cls} dir="rtl" dangerouslySetInnerHTML={{ __html: safe }} />;
}
