"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Pencil, Trash2, Star, Phone, User } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { PanelEmpty, PanelError, PanelLoading } from "../ui";
import { useToast } from "../Toast";
import { jsonGet, jsonSend } from "../fetcher";
import { ACCOUNT_QUERY_KEYS, type AddressDTO } from "@/lib/account/types";
import { toPersianNumbers } from "@/lib/price";

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

const LABEL_PRESETS = ["خانه", "محل کار", "سفارشی"];

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
        <PanelLoading />
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
          {addresses.map((a) => (
            <div key={a.id} className="flex flex-col rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-store-primary-soft text-store-primary-hover">
                  <MapPin className="size-4" />
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
                  {toPersianNumbers(a.phone)} <Phone className="size-3.5 shrink-0 text-store-text-faint" />
                </p>
                <p className="leading-7 text-store-text">
                  {a.province}، {a.city}، {a.line}
                  {a.plaque ? `، پلاک ${toPersianNumbers(a.plaque)}` : ""}
                  {a.unit ? `، واحد ${toPersianNumbers(a.unit)}` : ""}
                </p>
                <p className="text-xs text-store-text-faint">کد پستی: {toPersianNumbers(a.postalCode)}</p>
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
                  <button type="button" onClick={() => openEdit(a)} className="store-btn store-btn-secondary text-sm">
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
          ))}
        </div>
      )}

      <Modal
        open={editing !== null}
        title={editing === "new" ? "افزودن آدرس" : "ویرایش آدرس"}
        icon={<MapPin className="size-4" />}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button type="submit" form="address-form" disabled={save.isPending} className="store-btn store-btn-primary flex-1">
              {save.isPending ? "در حال ذخیره…" : "ذخیره آدرس"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="store-btn store-btn-secondary">
              انصراف
            </button>
          </>
        }
      >
        <form id="address-form" onSubmit={submit} className="flex flex-col gap-3.5">
          {error && (
            <div className="rounded-xl bg-store-clay-soft px-3.5 py-2.5 text-sm text-store-clay-deep">{error}</div>
          )}
          <div>
            <div className="mb-1.5 text-sm font-medium text-store-text">عنوان آدرس</div>
            <div className="flex flex-wrap gap-1.5">
              {LABEL_PRESETS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm({ ...form, title: l })}
                  className={`store-chip ${form.title === l ? "is-on" : ""}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <Field label="نام گیرنده" value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} placeholder="نام و نام خانوادگی" />
          <Field label="موبایل گیرنده" dir="ltr" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="۰۹…" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="استان" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            <Field label="شهر" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <Field label="نشانی" value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} placeholder="خیابان، کوچه…" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="پلاک" optional dir="ltr" value={form.plaque} onChange={(e) => setForm({ ...form, plaque: e.target.value })} />
            <Field label="واحد" optional dir="ltr" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <Field label="کد پستی" dir="ltr" inputMode="numeric" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="۱۰ رقم" />
          <Field label="یادداشت تحویل" optional value={form.deliveryNote} onChange={(e) => setForm({ ...form, deliveryNote: e.target.value })} placeholder="مثلاً: زنگ واحد خراب است" />
          <label className="flex items-center gap-2 text-sm text-store-text">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="size-4 accent-store-primary"
            />
            این آدرس پیش‌فرض باشد
          </label>
        </form>
      </Modal>
    </div>
  );
}
