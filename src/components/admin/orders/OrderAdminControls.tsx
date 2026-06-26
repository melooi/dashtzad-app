"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { ADMIN_ORDER_STATUSES } from "@/lib/admin/order-status";
import { setTrackingAction, updateOrderStatusAction } from "@/app/admin/collections/orders/[id]/actions";
import type { OrderStatus } from "@/generated/prisma/enums";

const input =
  "w-full rounded-xl border border-dz-primary-200 bg-white px-3 py-2.5 text-sm text-dz-primary-900 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg";
const btn = "rounded-xl bg-dz-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-primary-700 disabled:opacity-60";

export function OrderAdminControls({
  orderId,
  status,
  trackingCode,
}: {
  orderId: string;
  status: OrderStatus;
  trackingCode: string | null;
}) {
  const [pending, start] = useTransition();
  const [nextStatus, setNextStatus] = useState<OrderStatus>(status);
  const [note, setNote] = useState("");
  const [code, setCode] = useState(trackingCode ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  const saveStatus = () =>
    start(async () => {
      setMsg(null);
      const r = await updateOrderStatusAction(orderId, nextStatus, note);
      setMsg(r.ok ? "وضعیت ثبت شد" : r.error);
      if (r.ok) setNote("");
    });

  const saveTracking = () =>
    start(async () => {
      setMsg(null);
      const r = await setTrackingAction(orderId, code);
      setMsg(r.ok ? "کد رهگیری ثبت شد" : "error" in r ? r.error : "خطا");
    });

  return (
    <div className="rounded-2xl border border-dz-primary-100 bg-white p-5 dark:border-dz-night-border dark:bg-dz-night-card">
      <h2 className="mb-4 font-bold text-dz-primary-800 dark:text-dz-night-fg">مدیریت سفارش</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-dz-primary-600 dark:text-dz-night-muted">تغییر وضعیت</label>
          <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value as OrderStatus)} className={input}>
            {ADMIN_ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت (اختیاری)" className={input} />
          <button type="button" onClick={saveStatus} disabled={pending} className={btn}>
            ثبت وضعیت
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-dz-primary-600 dark:text-dz-night-muted">کد رهگیری پستی</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" placeholder="کد رهگیری" className={input} />
          <button type="button" onClick={saveTracking} disabled={pending} className={btn}>
            ثبت کد رهگیری
          </button>
        </div>
      </div>
      {msg && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-dz-success">
          <Check className="size-4" /> {msg}
        </p>
      )}
    </div>
  );
}
