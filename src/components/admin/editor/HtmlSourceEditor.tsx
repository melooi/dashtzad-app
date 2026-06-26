"use client";

/**
 * Code / source mode: a monospaced LTR textarea over the raw HTML. Content is
 * sanitized on save (server) and when switching back to the visual editor, so
 * dangerous markup typed here never survives.
 */
export function HtmlSourceEditor({
  value,
  onChange,
  onBlur,
  disabled,
  minHeight = 200,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  minHeight?: number;
}) {
  return (
    <textarea
      dir="ltr"
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      style={{ minHeight }}
      placeholder="<p>…</p>"
      className="block w-full resize-y border-0 bg-white px-4 py-3 font-mono text-xs leading-6 text-dz-a-primary-900 outline-none placeholder:text-dz-a-primary-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dz-a-night-card dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-faint"
    />
  );
}
