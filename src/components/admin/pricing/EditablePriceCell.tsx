"use client";

import { useEffect, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle, Lock } from "lucide-react";
import { toPersianNumbers, toPersianNumbersWithComma } from "@/lib/price";
import {
  PRICE_MESSAGES,
  parseTomanRequired,
  parseTomanNullable,
  parsePackagingToman,
  parseStock,
  type ParseResult,
} from "@/lib/admin/pricing-input";
import { useGridNav } from "./PricingGrid";

export type CellKind = "money-required" | "money-nullable" | "packaging" | "stock";

export type CellSaveResult = { ok: boolean; error?: string };

function parseByKind(kind: CellKind, raw: string): ParseResult<number | null> {
  switch (kind) {
    case "money-required":
      return parseTomanRequired(raw);
    case "packaging":
      return parsePackagingToman(raw);
    case "stock":
      return parseStock(raw);
    case "money-nullable":
      return parseTomanNullable(raw);
  }
}

function formatValue(kind: CellKind, value: number | null, emptyLabel: string): string {
  if (value == null) return emptyLabel;
  if (kind === "stock") return toPersianNumbers(value);
  return toPersianNumbersWithComma(value);
}

type Status = "idle" | "saving" | "saved" | "error";
type LeaveOpts = { move?: 1 | -1; refocus?: boolean; force?: boolean; stay?: boolean };

/**
 * One inline-editable pricing/stock cell. Read state is a focusable button
 * (pretty Persian number). Click / Enter / F2 / typing a digit enters edit mode.
 * Enter or blur commits; Esc cancels; Tab commits + moves; Cmd/Ctrl+S commits.
 * All amounts are Toman (money kinds); the server converts to Rial.
 */
export function EditablePriceCell({
  value,
  kind,
  ariaLabel,
  onSave,
  validate,
  locked = false,
  emptyLabel = "—",
  title,
  confirmHugeMessage = "مبلغ واردشده بسیار بزرگ است؛ ادامه می‌دهید؟",
}: {
  value: number | null;
  kind: CellKind;
  ariaLabel: string;
  /** Persist the new value (Toman, or null to clear). */
  onSave: (value: number | null) => Promise<CellSaveResult>;
  /** Extra client-side check (e.g. offPrice < price). Returns a Persian error or null. */
  validate?: (value: number | null) => string | null;
  locked?: boolean;
  emptyLabel?: string;
  title?: string;
  confirmHugeMessage?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [, startSaving] = useTransition();
  const { move } = useGridNav();

  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipBlur = useRef(false);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const begin = (initial?: string) => {
    setError(null);
    setStatus((s) => (s === "error" ? "idle" : s));
    setDraft(initial ?? (value == null ? "" : String(value)));
    setEditing(true);
  };

  const leaveEdit = (opts: LeaveOpts) => {
    if (opts.stay) return;
    skipBlur.current = true;
    setEditing(false);
    if (opts.move) move(wrapRef.current, opts.move);
    else if (opts.refocus) requestAnimationFrame(() => btnRef.current?.focus());
  };

  const cancel = (refocus: boolean) => {
    setError(null);
    setStatus((s) => (s === "error" ? "idle" : s));
    skipBlur.current = true;
    setEditing(false);
    if (refocus) requestAnimationFrame(() => btnRef.current?.focus());
  };

  const commit = (opts: LeaveOpts) => {
    const parsed = parseByKind(kind, draft);
    if (!parsed.ok) {
      setError(parsed.error);
      setStatus("error");
      if (opts.force) leaveEdit({ move: opts.move, refocus: opts.refocus });
      return;
    }
    const extra = validate?.(parsed.value) ?? null;
    if (extra) {
      setError(extra);
      setStatus("error");
      if (opts.force) leaveEdit({ move: opts.move, refocus: opts.refocus });
      return;
    }
    // Unchanged → no server round-trip.
    if (parsed.value === value) {
      setError(null);
      setStatus((s) => (s === "error" ? "idle" : s));
      leaveEdit(opts);
      return;
    }
    if (parsed.warn && !window.confirm(confirmHugeMessage)) {
      if (opts.force) leaveEdit({ move: opts.move, refocus: opts.refocus });
      return;
    }

    setError(null);
    setStatus("saving");
    leaveEdit(opts);
    const next = parsed.value;
    startSaving(async () => {
      const res = await onSave(next);
      if (res.ok) {
        setStatus("saved");
        router.refresh();
        window.setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
      } else {
        setError(res.error ?? PRICE_MESSAGES.saveFailed);
        setStatus("error");
      }
    });
  };

  const onReadKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      move(wrapRef.current, e.shiftKey ? -1 : 1);
      return;
    }
    if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      begin();
      return;
    }
    if (/^[0-9۰-۹٠-٩]$/.test(e.key)) {
      e.preventDefault();
      begin(e.key);
    }
  };

  const onEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit({ refocus: true });
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      commit({ move: e.shiftKey ? -1 : 1 });
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      commit({ stay: true });
    }
  };

  const onBlur = () => {
    if (skipBlur.current) {
      skipBlur.current = false;
      return;
    }
    commit({ force: true });
  };

  const dirty = editing && draft !== (value == null ? "" : String(value));

  const stateRing =
    status === "error"
      ? "border-dz-a-error/70 focus:ring-dz-a-error/20 dark:border-dz-a-error/70"
      : dirty
        ? "border-dz-a-warning/70 focus:ring-dz-a-warning/20 dark:border-dz-a-warning/70"
        : "border-dz-a-primary-200 hover:border-dz-a-primary-400 focus:border-dz-a-primary-500 focus:ring-dz-a-primary-500/15 dark:border-dz-a-night-border dark:hover:border-dz-a-primary-500/60 dark:focus:border-dz-a-primary-400 dark:focus:ring-dz-a-primary-400/25";

  if (editing) {
    return (
      <div ref={wrapRef} data-pcell className="relative inline-flex flex-col items-stretch">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onEditKey}
          onBlur={onBlur}
          dir="ltr"
          inputMode="numeric"
          aria-label={ariaLabel}
          aria-invalid={status === "error"}
          className={`focus-ring w-24 rounded-lg border bg-white px-2 py-1 text-center text-xs tabular-nums text-dz-a-primary-900 shadow-xs outline-none transition-[border-color,box-shadow] focus:ring-3 dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg ${stateRing}`}
        />
        {status === "error" && error && (
          <span className="absolute top-full z-10 mt-1 w-max max-w-[200px] rounded-md bg-dz-a-error px-2 py-1 text-[10px] text-white shadow-md">
            {error}
          </span>
        )}
      </div>
    );
  }

  const indicator =
    status === "saving" ? (
      <Loader2 className="size-3 animate-spin text-dz-a-primary-400" />
    ) : status === "saved" ? (
      <Check className="size-3 text-dz-a-success" />
    ) : status === "error" ? (
      <AlertCircle className="size-3 text-dz-a-error" />
    ) : null;

  return (
    <div ref={wrapRef} data-pcell className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        onClick={() => begin()}
        onKeyDown={onReadKey}
        title={status === "error" && error ? error : title}
        aria-label={ariaLabel}
        className={`focus-ring group inline-flex min-w-[3.5rem] items-center justify-center gap-1 rounded-lg border border-transparent px-2 py-1 text-xs tabular-nums transition-colors hover:border-dz-a-primary-200 hover:bg-dz-a-primary-50/60 dark:hover:border-dz-a-night-border dark:hover:bg-white/5 ${
          status === "error"
            ? "border-dz-a-error/40 text-dz-a-error dark:text-dz-a-error-300"
            : locked
              ? "font-bold text-dz-a-warning dark:text-dz-a-warning-300"
              : "text-dz-a-primary-800 dark:text-dz-a-night-fg"
        }`}
      >
        {locked && <Lock className="size-3 shrink-0" />}
        <span>{formatValue(kind, value, emptyLabel)}</span>
        {indicator}
      </button>
    </div>
  );
}
