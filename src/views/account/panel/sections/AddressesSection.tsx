"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Pencil, Trash2, Star, Phone, User, Navigation } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { PanelEmpty, PanelError, SkeletonList } from "../ui";
import { useToast } from "../Toast";
import { jsonGet, jsonSend } from "../fetcher";
import { ACCOUNT_QUERY_KEYS, type AddressDTO } from "@/lib/account/types";
import { toPersianNumbers } from "@/lib/price";

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */

const TITLE_PRESETS = [
  { label: "خانه", icon: "🏠" },
  { label: "محل کار", icon: "💼" },
  { label: "هدیه", icon: "🎁" },
  { label: "سوپرایز", icon: "🎉" },
  { label: "پارتنر", icon: "💑" },
  { label: "ناشناس", icon: "🕵️" },
];

const PROVINCES = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
];

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type FormState = {
  title: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  line: string;
  plaque: string;
  unit: string;
  deliveryNote: string;
  isDefault: boolean;
};

const EMPTY: FormState = {
  title: "",
  receiverName: "",
  phone: "",
  province: "",
  city: "",
  postalCode: "",
  line: "",
  plaque: "",
  unit: "",
  deliveryNote: "",
  isDefault: false,
};

function fromDTO(a: AddressDTO): FormState {
  return {
    title: a.title ?? "",
    receiverName: a.receiverName,
    phone: a.phone,
    province: a.province,
    city: a.city,
    postalCode: a.postalCode,
    line: a.line,
    plaque: a.plaque ?? "",
    unit: a.unit ?? "",
    deliveryNote: a.deliveryNote ?? "",
    isDefault: a.isDefault,
  };
}

/* ------------------------------------------------------------------ */
/* Address form (inside Modal)                                          */
/* ------------------------------------------------------------------ */

function AddressForm({
  form,
  setForm,
  error,
  onSubmit,
  isPending,
  onCancel,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const isPreset = TITLE_PRESETS.some((p) => p.label === form.title);
  const showCustom = !isPreset && form.title !== "";

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm({ ...form, [k]: v });

  return (
    <form id="address-form" onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl bg-store-clay-soft px-3.5 py-2.5 text-sm text-store-clay-deep">
          {error}
        </div>
      )}

      {/* ── عنوان آدرس ───────────────────────────────── */}
      <div>
        <div className="mb-2 text-sm font-medium text-store-text">عنوان آدرس</div>
        <div className="flex flex-wrap gap-2">
          {TITLE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => set("title", p.label)}
              className={`store-chip gap-1.5 ${form.title === p.label ? "is-on" : ""}`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-2 rounded-xl border border-store-border bg-store-surface-soft p-3">
          <div className="flex justify-end gap-2 border-b border-store-border pb-3">
            {TITLE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                title={p.label}
                onClick={() => set("title", p.label)}
                className={`grid size-9 shrink-0 place-items-center rounded-lg text-base transition-colors ${
                  form.title === p.label
                    ? "bg-store-primary text-white"
                    : "bg-store-surface text-store-text-muted hover:bg-store-primary-soft"
                }`}
              >
                {p.icon}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={isPreset ? "" : form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="عنوان دلخواه…"
            className="mt-2.5 w-full bg-transparent text-sm text-store-text outline-none placeholder:text-store-text-faint"
          />
        </div>
      </div>

      {/* ── پیش‌فرض checkbox ─────────────────────────── */}
      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-store-border bg-store-surface px-4 py-3 transition-colors hover:border-store-primary">
        <Star className={`size-4 shrink-0 ${form.isDefault ? "fill-amber-400 text-amber-400" : "text-store-text-faint"}`} />
        <span className="flex-1 text-sm font-medium text-store-text">تنظیم به‌عنوان آدرس پیش‌فرض</span>
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="size-4 accent-store-primary"
        />
      </label>

      {/* ── گیرنده ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="نام گیرنده"
          value={form.receiverName}
          onChange={(e) => set("receiverName", e.target.value)}
          placeholder="نام و نام خانوادگی"
          required
          icon={<User className="size-4" />}
        />
        <Field
          label="شماره موبایل"
          dir="ltr"
          inputMode="numeric"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          required
          icon={<Phone className="size-4" />}
        />
      </div>

      {/* ── استان و شهر ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-store-text">
            استان <span className="text-store-clay">*</span>
          </span>
          <select
            value={form.province}
            onChange={(e) => set("province", e.target.value)}
            required
            className="rounded-xl border border-store-border bg-store-surface px-3.5 py-2.5 text-sm text-store-text outline-none transition-colors focus:border-store-primary"
          >
            <option value="">انتخاب کنید</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="شهر"
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="نام شهر"
          required
        />
      </div>

      {/* ── آدرس کامل ────────────────────────────────── */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-store-text">
          آدرس کامل <span className="text-store-clay">*</span>
        </span>
        <textarea
          value={form.line}
          onChange={(e) => set("line", e.target.value)}
          placeholder="خیابان، کوچه، نشانی دقیق"
          required
          rows={3}
          className="rounded-xl border border-store-border bg-store-surface px-3.5 py-2.5 text-sm text-store-text outline-none placeholder:text-store-text-faint transition-colors focus:border-store-primary resize-none"
        />
      </label>

      {/* ── پلاک · واحد · کد پستی ───────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <Field
          label="پلاک"
          optional
          dir="ltr"
          value={form.plaque}
          onChange={(e) => set("plaque", e.target.value)}
        />
        <Field
          label="واحد"
          optional
          dir="ltr"
          value={form.unit}
          onChange={(e) => set("unit", e.target.value)}
        />
        <Field
          label="کد پستی"
          dir="ltr"
          inputMode="numeric"
          value={form.postalCode}
          onChange={(e) => set("postalCode", e.target.value)}
          placeholder="۱۰ رقم"
          required
        />
      </div>

      {/* ── map picker placeholder ────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-dashed border-store-border bg-store-surface-soft">
        <div className="flex h-28 items-center justify-center gap-3 text-store-text-faint">
          <div className="flex flex-col items-center gap-1.5">
            <span className="grid size-10 place-items-center rounded-full bg-store-surface text-store-primary-hover shadow-store-xs">
              <Navigation className="size-5" />
            </span>
            <span className="text-sm font-medium text-store-text-muted">انتخاب موقعیت روی نقشه</span>
            <span className="text-xs text-store-text-faint">به‌زودی فعال می‌شود</span>
          </div>
        </div>
      </div>

      {/* ── یادداشت ──────────────────────────────────── */}
      <Field
        label="یادداشت تحویل"
        optional
        value={form.deliveryNote}
        onChange={(e) => set("deliveryNote", e.target.value)}
        placeholder="مثلاً: زنگ واحد خراب است"
      />

      {/* ── footer buttons ────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-t border-store-border pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="store-btn store-btn-primary flex-1"
        >
          {isPending ? "در حال ذخیره…" : "ذخیره آدرس"}
        </button>
        <button type="button" onClick={onCancel} className="store-btn store-btn-secondary">
          انصراف
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Main section                                                         */
/* ------------------------------------------------------------------ */

export function AddressesSection() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<AddressDTO | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.addresses,
    queryFn: () => jsonGet<{ addresses: AddressDTO[] }>("/api/account/addresses"),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.addresses });
    qc.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.overview });
  };

  const save = useMutation({
    mutationFn: (vars: { id: string | null; data: FormState }) =>
      vars.id
        ? jsonSend(`/api/account/addresses/${vars.id}`, "PATCH", vars.data)
        : jsonSend("/api/account/addresses", "POST", vars.data),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast("آدرس ذخیره شد");
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "خطا در ذخیره."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => jsonSend(`/api/account/addresses/${id}`, "DELETE"),
    onSuccess: () => {
      invalidate();
      setConfirmId(null);
      toast("آدرس حذف شد");
    },
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => jsonSend(`/api/account/addresses/${id}/default`, "POST"),
    onSuccess: () => {
      invalidate();
      toast("آدرس پیش‌فرض تغییر کرد");
    },
  });

  const openNew = () => {
    setForm(EMPTY);
    setError(null);
    setEditing("new");
  };
  const openEdit = (a: AddressDTO) => {
    setForm(fromDTO(a));
    setError(null);
    setEditing(a);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    save.mutate({ id: editing && editing !== "new" ? editing.id : null, data: form });
  };

  const addresses = q.data?.addresses ?? [];

  /* title emoji badge */
  const titleIcon = (title: string | null) =>
    TITLE_PRESETS.find((p) => p.label === title)?.icon ?? null;

  return (
    <div>
      <SectionHead
        title="آدرس‌های من"
        sub="آدرس‌های تحویل سفارش را مدیریت کن"
        action={
          <button type="button" onClick={openNew} className="store-btn store-btn-primary">
            <Plus className="size-4" /> افزودن آدرس
          </button>
        }
      />

      {q.isLoading ? (
        <SkeletonList rows={3} />
      ) : q.isError ? (
        <PanelError onRetry={() => q.refetch()} />
      ) : addresses.length === 0 ? (
        <PanelEmpty
          icon={<MapPin className="size-7" />}
          title="هنوز آدرسی ثبت نکرده‌ای"
          desc="برای ثبت سریع‌تر سفارش، آدرس تحویل‌ات را اضافه کن."
          action={
            <button type="button" onClick={openNew} className="store-btn store-btn-primary">
              <Plus className="size-4" /> افزودن آدرس
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {addresses.map((a) => {
            const icon = titleIcon(a.title);
            return (
              <div
                key={a.id}
                className={`flex flex-col rounded-2xl border bg-store-surface p-4 shadow-store-xs transition-colors ${
                  a.isDefault ? "border-store-primary" : "border-store-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-store-primary-soft text-lg">
                    {icon ?? <MapPin className="size-4 text-store-primary-hover" />}
                  </span>
                  <span className="font-bold text-store-text">{a.title || "آدرس"}</span>
                  {a.isDefault && (
                    <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-store-primary-soft px-2 py-0.5 text-xs font-bold text-store-primary-hover">
                      <Star className="size-3 fill-current" /> پیش‌فرض
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-store-text-muted">
                  <p className="flex items-center gap-1.5">
                    <User className="size-3.5 shrink-0 text-store-text-faint" /> {a.receiverName}
                  </p>
                  <p dir="ltr" className="flex items-center justify-end gap-1.5 text-right">
                    {toPersianNumbers(a.phone)}{" "}
                    <Phone className="size-3.5 shrink-0 text-store-text-faint" />
                  </p>
                  <p className="leading-7 text-store-text">
                    {a.province}، {a.city}، {a.line}
                    {a.plaque ? `، پلاک ${toPersianNumbers(a.plaque)}` : ""}
                    {a.unit ? `، واحد ${toPersianNumbers(a.unit)}` : ""}
                  </p>
                  <p className="text-xs text-store-text-faint">
                    کد پستی: {toPersianNumbers(a.postalCode)}
                  </p>
                  {a.deliveryNote && (
                    <p className="text-xs text-store-text-faint">یادداشت: {a.deliveryNote}</p>
                  )}
                </div>

                {confirmId === a.id ? (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-store-clay-soft px-3 py-2 text-sm text-store-clay-deep">
                    حذف شود؟
                    <button
                      type="button"
                      onClick={() => remove.mutate(a.id)}
                      disabled={remove.isPending}
                      className="ms-auto font-bold underline"
                    >
                      بله، حذف
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="font-bold">
                      انصراف
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-store-border pt-3">
                    {!a.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefault.mutate(a.id)}
                        className="store-btn store-btn-soft text-sm"
                      >
                        <Star className="size-3.5" /> پیش‌فرض
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      className="store-btn store-btn-secondary text-sm"
                    >
                      <Pencil className="size-3.5" /> ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(a.id)}
                      className="store-btn store-btn-secondary text-sm text-store-clay"
                    >
                      <Trash2 className="size-3.5" /> حذف
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={editing !== null}
        title={editing === "new" ? "افزودن آدرس جدید" : "ویرایش آدرس"}
        icon={<MapPin className="size-4" />}
        onClose={() => setEditing(null)}
      >
        <AddressForm
          form={form}
          setForm={setForm}
          error={error}
          onSubmit={submit}
          isPending={save.isPending}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    </div>
  );
}
