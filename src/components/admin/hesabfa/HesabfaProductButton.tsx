"use client";

import { useState } from "react";
import { Package, Link2, Check } from "lucide-react";
import { exportProductToHesabfaAction, setProductHesabfaCodeAction } from "@/app/admin/hesabfa/actions";

export function HesabfaProductButton({
  productId,
  initialCode,
}: {
  productId: string;
  initialCode?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [currentCode, setCurrentCode] = useState(initialCode ?? "");
  const [editing, setEditing] = useState(false);
  const [codeInput, setCodeInput] = useState(initialCode ?? "");

  async function handleExport() {
    setLoading(true);
    setResult(null);
    const r = await exportProductToHesabfaAction(productId);
    setLoading(false);
    if (r.ok) {
      setCurrentCode(r.itemCode ?? currentCode);
      setCodeInput(r.itemCode ?? currentCode);
      setResult({ ok: true, message: `قلم با کد ${r.itemCode ?? "—"} در حسابفا ثبت/به‌روز شد.` });
    } else {
      setResult({ ok: false, message: r.error ?? "خطای نامشخص" });
    }
  }

  async function handleSaveCode() {
    if (!codeInput.trim()) return;
    setLoading(true);
    setResult(null);
    const r = await setProductHesabfaCodeAction(productId, codeInput);
    setLoading(false);
    if (r.ok) {
      setCurrentCode(codeInput.trim());
      setEditing(false);
      setResult({ ok: true, message: "کد حسابفا ذخیره شد." });
    } else {
      setResult({ ok: false, message: r.error ?? "خطا در ذخیره" });
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Code display / edit */}
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="کد قلم در حسابفا (مثلاً 110001)"
            dir="ltr"
            className="w-40 rounded-xl border border-dz-a-primary-200 px-3 py-1.5 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
          />
          <button
            onClick={handleSaveCode}
            disabled={loading}
            className="flex items-center gap-1 rounded-xl border border-emerald-300 px-2.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-500/30 dark:text-emerald-400"
          >
            <Check className="size-3" /> ذخیره
          </button>
          <button
            onClick={() => { setEditing(false); setCodeInput(currentCode); }}
            className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted"
          >
            لغو
          </button>
        </div>
      ) : currentCode ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Link2 className="size-3" /> کد حسابفا: {currentCode}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-dz-a-fg-muted underline dark:text-dz-a-night-muted"
          >
            تغییر
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-xl border border-dashed border-dz-a-primary-200 px-3 py-1.5 text-xs text-dz-a-fg-muted hover:border-dz-a-primary-400 dark:border-dz-a-night-border dark:text-dz-a-night-muted"
        >
          <Link2 className="size-3.5" /> لینک به کد حسابفا
        </button>
      )}

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-fg hover:bg-dz-a-primary-50 transition-colors disabled:opacity-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
      >
        <Package className="size-3.5" />
        {loading ? "در حال ثبت..." : currentCode ? "به‌روزرسانی در حسابفا" : "ثبت در حسابفا"}
      </button>

      {result && (
        <p className={`text-xs ${result.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
