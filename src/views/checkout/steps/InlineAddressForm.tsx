"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { AddressDTO } from "@/lib/account/types";

const PROVINCES = [
  "آذربایجان شرقی","آذربایجان غربی","اردبیل","اصفهان","البرز","ایلام","بوشهر","تهران",
  "چهارمحال و بختیاری","خراسان جنوبی","خراسان رضوی","خراسان شمالی","خوزستان","زنجان",
  "سمنان","سیستان و بلوچستان","فارس","قزوین","قم","کردستان","کرمان","کرمانشاه",
  "کهگیلویه و بویراحمد","گلستان","گیلان","لرستان","مازندران","مرکزی","هرمزگان","همدان","یزد",
];

type FormState = {
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  line: string;
  plaque: string;
  unit: string;
  postalCode: string;
};

type Props = {
  onSaved: (address: AddressDTO) => void;
  onCancel?: () => void;
};

function Field({
  label, required, dir, inputMode, placeholder, value, onChange, type = "text",
}: {
  label: string; required?: boolean; dir?: "ltr" | "rtl";
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-store-text">
        {label}{required && <span className="text-store-clay"> *</span>}
      </span>
      <input
        type={type} dir={dir} inputMode={inputMode} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-lg border border-store-border bg-store-surface px-3 py-2 text-sm text-store-text outline-none transition-colors placeholder:text-store-text-faint focus:border-store-primary"
      />
    </label>
  );
}

export function InlineAddressForm({ onSaved, onCancel }: Props) {
  const [form, setForm] = useState<FormState>({
    receiverName: "", phone: "", province: "", city: "",
    line: "", plaque: "", unit: "", postalCode: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isDefault: false }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "خطا در ذخیره آدرس."); return; }
    // API returns the address object directly or wrapped in { address: ... }
    const saved: AddressDTO = data.address ?? data;
    onSaved(saved);
  };

  return (
    <div className="mt-3 rounded-2xl border border-store-primary/30 bg-store-primary-soft/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-store-text">افزودن آدرس جدید</span>
        <button type="button" onClick={onCancel} className="rounded-lg p-1 text-store-text-faint hover:text-store-text">
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {error && (
          <div className="rounded-lg bg-store-clay-soft px-3 py-2 text-xs text-store-clay-deep">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="نام گیرنده" required value={form.receiverName} onChange={(v) => set("receiverName", v)} />
          <Field label="موبایل" required dir="ltr" inputMode="numeric" placeholder="09..." value={form.phone} onChange={(v) => set("phone", v)} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-store-text">استان <span className="text-store-clay">*</span></span>
            <select
              value={form.province}
              onChange={(e) => set("province", e.target.value)}
              required
              className="rounded-lg border border-store-border bg-store-surface px-3 py-2 text-sm text-store-text outline-none focus:border-store-primary"
            >
              <option value="">انتخاب کنید</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <Field label="شهر" required value={form.city} onChange={(v) => set("city", v)} />
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-store-text">آدرس کامل <span className="text-store-clay">*</span></span>
          <textarea
            value={form.line}
            onChange={(e) => set("line", e.target.value)}
            required
            rows={2}
            placeholder="خیابان، کوچه، نشانی دقیق"
            className="resize-none rounded-lg border border-store-border bg-store-surface px-3 py-2 text-sm text-store-text outline-none transition-colors placeholder:text-store-text-faint focus:border-store-primary"
          />
        </label>

        <div className="grid grid-cols-3 gap-2.5">
          <Field label="پلاک" dir="ltr" value={form.plaque} onChange={(v) => set("plaque", v)} />
          <Field label="واحد" dir="ltr" value={form.unit} onChange={(v) => set("unit", v)} />
          <Field label="کد پستی" required dir="ltr" inputMode="numeric" placeholder="10 رقم" value={form.postalCode} onChange={(v) => set("postalCode", v)} />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving} className="store-btn store-btn-primary flex-1 justify-center gap-2 text-sm">
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "ذخیره…" : "ذخیره و انتخاب این آدرس"}
          </button>
          <button type="button" onClick={onCancel} className="store-btn store-btn-secondary text-sm">
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
