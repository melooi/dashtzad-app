"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { adjustCreditAction, addNoteAction } from "@/app/admin/customers/[id]/actions";

const input =
  "w-full rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2.5 text-sm text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg";
const btn = "rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700 disabled:opacity-60";

const CREDIT_TYPES = [
  { value: "GIFT", label: "هدیه" },
  { value: "RETURN", label: "بازگشت وجه" },
  { value: "COMPENSATION", label: "جبران خسارت" },
  { value: "MANUAL_ADJUSTMENT", label: "اصلاح دستی" },
  { value: "CAMPAIGN", label: "کمپین" },
];

export function CreditAdjustForm({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("GIFT");
  const [direction, setDirection] = useState("IN");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      setMsg(null);
      const r = await adjustCreditAction(userId, { amountToman: amount, type, direction, reason });
      if (r.ok) {
        setMsg("اعتبار ثبت شد");
        setAmount("");
        setReason("");
      } else {
        setMsg(r.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" dir="ltr" placeholder="مبلغ (تومان)" className={input} />
        <select value={direction} onChange={(e) => setDirection(e.target.value)} className={input}>
          <option value="IN">واریز (افزایش)</option>
          <option value="OUT">برداشت (کاهش)</option>
        </select>
      </div>
      <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
        {CREDIT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="توضیح (اختیاری)" className={input} />
      <button type="submit" disabled={pending} className={btn}>
        ثبت اعتبار
      </button>
      {msg && (
        <p className="inline-flex items-center gap-1.5 text-sm text-dz-a-success">
          <Check className="size-4" /> {msg}
        </p>
      )}
    </form>
  );
}

export function CustomerNoteForm({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    start(async () => {
      setMsg(null);
      const r = await addNoteAction(userId, text);
      if (r.ok) {
        setBody("");
        setMsg("یادداشت ثبت شد");
      } else {
        setMsg(r.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="یادداشت داخلی دربارهٔ این مشتری…"
        className={`${input} resize-y`}
      />
      <button type="submit" disabled={pending} className={`${btn} inline-flex items-center justify-center gap-1.5`}>
        <Plus className="size-4" /> افزودن یادداشت
      </button>
      {msg && (
        <p className="inline-flex items-center gap-1.5 text-sm text-dz-a-success">
          <Check className="size-4" /> {msg}
        </p>
      )}
    </form>
  );
}
