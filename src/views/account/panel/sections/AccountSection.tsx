"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  User as UserIcon,
  Phone,
  Mail,
  BadgeCheck,
  Calendar,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { SectionHead } from "../SectionHead";
import { useToast } from "../Toast";
import {
  ACCOUNT_QUERY_KEYS,
  type AccountOverview,
  type AccountProfile,
} from "@/lib/account/types";
import { formatJalali, formatJalaliNumeric } from "@/lib/date";
import { toPersianNumbers } from "@/lib/price";

type FormState = { name: string; email: string; nationalId: string; birthDate: string };

function initForm(user: AccountProfile): FormState {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    nationalId: user.nationalId ? toPersianNumbers(user.nationalId) : "",
    birthDate: user.birthDateISO ? formatJalaliNumeric(user.birthDateISO) : "",
  };
}

export function AccountSection({
  user,
  onUpdated,
  overview,
}: {
  user: AccountProfile;
  onUpdated: (u: AccountProfile) => void;
  overview?: AccountOverview;
}) {
  const toast = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => initForm(user));
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: FormState) => {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "خطا در ذخیره اطلاعات.");
      return data as AccountProfile;
    },
    onSuccess: (data) => {
      onUpdated(data);
      qc.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.overview });
      setOpen(false);
      toast("اطلاعات حساب ذخیره شد");
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "خطا در ذخیره اطلاعات."),
  });

  const startEdit = () => {
    setForm(initForm(user));
    setError(null);
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(form);
  };

  const rows: {
    icon: typeof UserIcon;
    label: string;
    value: string | null;
    ltr?: boolean;
    locked?: boolean;
  }[] = [
    { icon: UserIcon, label: "نام و نام خانوادگی", value: user.name },
    {
      icon: Phone,
      label: "شماره موبایل",
      value: toPersianNumbers(user.phoneNumber),
      ltr: true,
      locked: true,
    },
    { icon: Mail, label: "ایمیل", value: user.email, ltr: true },
    {
      icon: BadgeCheck,
      label: "کد ملی",
      value: user.nationalId ? toPersianNumbers(user.nationalId) : null,
      ltr: true,
    },
    {
      icon: Calendar,
      label: "تاریخ تولد",
      value: user.birthDateISO ? formatJalaliNumeric(user.birthDateISO) : null,
    },
    { icon: ShieldCheck, label: "نوع حساب", value: user.role === "ADMIN" ? "مدیر" : "کاربر" },
  ];

  return (
    <div>
      <SectionHead
        title="اطلاعات حساب"
        sub="اطلاعات شخصی و حساب کاربری‌ات را اینجا مدیریت کن"
        action={
          <button type="button" onClick={startEdit} className="store-btn store-btn-secondary">
            <Pencil className="size-4" /> ویرایش
          </button>
        }
      />

      {overview && overview.profileCompletion < 100 && (
        <div className="mb-4 rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-store-text">تکمیل پروفایل</span>
            <span className="font-bold text-store-primary-hover">
              {toPersianNumbers(overview.profileCompletion)}٪
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-store-border">
            <div
              className="h-full rounded-full bg-store-primary"
              style={{ width: `${overview.profileCompletion}%` }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-store-border bg-store-surface shadow-store-xs">
        <ul className="divide-y divide-store-border">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <li key={r.label} className="flex items-center gap-3 px-5 py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-store-surface-soft text-store-text-muted">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm text-store-text-faint">{r.label}</span>
                <span
                  dir={r.ltr ? "ltr" : undefined}
                  className={`ms-auto text-sm font-medium ${
                    r.value ? "text-store-text" : "text-store-text-faint"
                  }`}
                >
                  {r.value || "ثبت نشده"}
                  {r.locked && (
                    <span className="ms-2 text-xs text-store-text-faint">(غیرقابل تغییر)</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-store-border px-5 py-3 text-xs text-store-text-faint">
          عضو دشت‌زاد از {formatJalali(user.createdAtISO)}
          {overview?.lastLoginISO ? ` · آخرین ورود: ${formatJalali(overview.lastLoginISO)}` : ""}
        </div>
      </div>

      {user.role === "ADMIN" && (
        <Link href="/admin" className="store-btn store-btn-soft mt-4">
          <LayoutDashboard className="size-4" /> ورود به پنل مدیریت
        </Link>
      )}

      <Modal
        open={open}
        title="ویرایش اطلاعات حساب"
        icon={<Pencil className="size-4" />}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button
              type="submit"
              form="account-edit-form"
              disabled={mutation.isPending}
              className="store-btn store-btn-primary flex-1"
            >
              {mutation.isPending ? "در حال ذخیره…" : "ذخیره تغییرات"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="store-btn store-btn-secondary"
            >
              انصراف
            </button>
          </>
        }
      >
        <form id="account-edit-form" onSubmit={submit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-store-clay-soft px-3.5 py-2.5 text-sm text-store-clay-deep">
              {error}
            </div>
          )}
          <Field
            label="نام و نام خانوادگی"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="نام کامل"
          />
          <Field
            label="ایمیل"
            optional
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
          <Field
            label="کد ملی"
            optional
            inputMode="numeric"
            dir="ltr"
            value={form.nationalId}
            onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
            placeholder="۱۰ رقم"
          />
          <Field
            label="تاریخ تولد"
            optional
            dir="ltr"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            placeholder="۱۳۷۳/۸/۲۷"
            hint="به‌صورت شمسی، مثل ۱۳۷۳/۸/۲۷"
          />
          <p className="text-xs leading-6 text-store-text-faint">
            شماره موبایل ({toPersianNumbers(user.phoneNumber)}) شناسهٔ ورود توست و از این بخش قابل
            تغییر نیست.
          </p>
        </form>
      </Modal>
    </div>
  );
}
