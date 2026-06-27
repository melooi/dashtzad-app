"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Search, X, Plus, Tag } from "lucide-react";

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,،\n]/)
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  );
}

function stringifyTags(tags: string[]): string {
  return tags.join("، ");
}

export function TagChipInput({
  name = "tags",
  placeholder = "جستجو یا ساخت برچسب…",
}: {
  name?: string;
  placeholder?: string;
}) {
  const { watch, setValue } = useFormContext();
  const rawValue: string = watch(name) ?? "";
  const chips = parseTags(rawValue);

  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (!term.trim()) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tags?q=${encodeURIComponent(term.trim())}`);
      const data: string[] = await res.json();
      setSuggestions(data.filter((t) => !chips.includes(t)));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [chips]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = (tag: string) => {
    const cleaned = tag.trim();
    if (!cleaned || chips.includes(cleaned)) return;
    setValue(name, stringifyTags([...chips, cleaned]), { shouldDirty: true });
    setQ("");
    setSuggestions([]);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    setValue(name, stringifyTags(chips.filter((c) => c !== tag)), { shouldDirty: true });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < suggestions.length) {
        addTag(suggestions[activeIdx]);
      } else if (q.trim()) {
        addTag(q.trim());
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIdx(-1);
    } else if (e.key === "Backspace" && !q && chips.length > 0) {
      removeTag(chips[chips.length - 1]);
    }
  };

  const showDropdown = q.trim().length > 0;
  const canCreate = q.trim() && !chips.includes(q.trim()) && !suggestions.includes(q.trim());

  return (
    <div className="flex flex-col gap-2">
      {/* Input */}
      <div className="relative">
        <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActiveIdx(-1); }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-dz-a-primary-200 bg-white py-2 ps-3 pe-9 text-sm text-dz-a-primary-900 outline-none transition-colors focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
        />
        {loading && (
          <span className="pointer-events-none absolute end-9 top-1/2 size-3 -translate-y-1/2 animate-spin rounded-full border border-dz-a-primary-300 border-t-transparent dark:border-dz-a-night-muted dark:border-t-transparent" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="overflow-hidden rounded-xl border border-dz-a-primary-100 shadow-sm dark:border-dz-a-night-border">
          <ul className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-line">
            {suggestions.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => addTag(s)}
                  className={`focus-ring flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm transition-colors ${
                    i === activeIdx
                      ? "bg-dz-a-primary-50 text-dz-a-primary-800 dark:bg-white/5 dark:text-dz-a-night-fg"
                      : "text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:text-dz-a-night-fg dark:hover:bg-white/5"
                  }`}
                >
                  <Tag className="size-3.5 shrink-0 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
                  {s}
                </button>
              </li>
            ))}
            {canCreate && (
              <li>
                <button
                  type="button"
                  onClick={() => addTag(q.trim())}
                  className={`focus-ring flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm transition-colors ${
                    activeIdx === suggestions.length
                      ? "bg-dz-a-primary-50 text-dz-a-primary-700 dark:bg-white/5 dark:text-dz-a-night-fg"
                      : "text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:text-dz-a-primary-300 dark:hover:bg-white/5"
                  }`}
                >
                  <Plus className="size-3.5 shrink-0" />
                  ساخت برچسب «{q.trim()}»
                </button>
              </li>
            )}
            {!suggestions.length && !canCreate && (
              <li className="p-3 text-center text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                نتیجه‌ای یافت نشد.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg bg-dz-a-primary-100 px-2 py-1 text-xs text-dz-a-primary-800 dark:bg-dz-a-primary-500/25 dark:text-dz-a-night-fg"
            >
              <Tag className="size-3 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`حذف برچسب ${tag}`}
                className="focus-ring rounded text-dz-a-primary-500 hover:text-dz-a-error dark:text-dz-a-night-muted"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
