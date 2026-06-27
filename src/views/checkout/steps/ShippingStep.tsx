"use client";

import { useState } from "react";
import { Calendar, Zap, Package2, Receipt, FileX, ChevronDown } from "lucide-react";

/* ── constants ──────────────────────────────────────────────────────── */

const SLOTS = [
  { id: "morning", label: "۸ تا ۱۰", sub: "اول صبح" },
  { id: "noon", label: "۱۰ تا ۱۲", sub: "صبح" },
  { id: "afternoon", label: "۱۲ تا ۱۴", sub: "ظهر" },
  { id: "evening", label: "۱۴ تا ۱۶", sub: "بعدازظهر" },
] as const;
type Slot = (typeof SLOTS)[number]["id"];

const METHODS = [
  {
    id: "express",
    label: "اکسپرس",
    badge: "سریع‌ترین",
    badgeClass: "bg-amber-100 text-amber-700",
    icon: Zap,
    desc: "تحویل در همان بازه انتخابی",
    priceRial: 1_179_000,
  },
  {
    id: "economy",
    label: "ارزان‌تر",
    badge: "صرفه‌جویی",
    badgeClass: "bg-store-primary-soft text-store-primary-hover",
    icon: Package2,
    desc: "تحویل ۱ تا ۲ روز کاری دیرتر",
    priceRial: 590_000,
  },
] as const;
type Method = (typeof METHODS)[number]["id"];

/* ── helpers ──────────────────────────────────────────────────────── */

const FA_DAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const FA_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];

function toJalaliCompact(date: Date): { weekday: string; day: string; month: string } {
  const g2j = (gy: number, gm: number, gd: number) => {
    let jy = 0, jm = 0, jd = 0;
    const g_d_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
    const g_days_in_month = [31, gm > 2 && gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let i = 0;
    for (i = 0; i < gm - 1; i++) { jd += g_days_in_month[i]; }
    jd += gd;
    const j_d_no = g_d_no - 79;
    const j_np = Math.floor(j_d_no / 12053); jy = 979 + 33 * j_np;
    const j_rem = j_d_no % 12053;
    jy += 4 * Math.floor(j_rem / 1461);
    const j_rem2 = j_rem % 1461;
    if (j_rem2 >= 366) { jy += Math.floor((j_rem2 - 1) / 365); jd = (j_rem2 - 1) % 365 + 1; }
    else { jd = j_rem2 + 1; }
    jm = jd <= 186 ? Math.ceil(jd / 31) : Math.ceil((jd - 6) / 30);
    jd -= jm <= 6 ? (jm - 1) * 31 : (jm - 1) * 30 + 6;
    return { jy, jm, jd };
  };
  const { jm, jd } = g2j(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const weekday = FA_DAYS[date.getDay()];
  return { weekday, day: String(jd), month: FA_MONTHS[jm - 1] };
}

function getDeliveryDates(count = 5): Date[] {
  const dates: Date[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < count) {
    if (d.getDay() !== 5) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function toPersian(n: number | string) {
  return String(n).replace(/\d/g, (c) => "۰۱۲۳۴۵۶۷۸۹"[+c]);
}

/* ── types ──────────────────────────────────────────────────────── */

export type ShippingStepData = {
  deliveryDate: string;
  deliverySlot: Slot;
  shippingMethod: Method;
  includeInvoice: boolean;
  note: string;
  shippingRial: number;
};

/* ── component ──────────────────────────────────────────────────── */

export function ShippingStep({ onNext, onBack }: { onNext: (d: ShippingStepData) => void; onBack: () => void }) {
  const dates = getDeliveryDates();
  const [date, setDate] = useState(dates[0].toISOString());
  const [slot, setSlot] = useState<Slot>("morning");
  const [method, setMethod] = useState<Method>("express");
  const [invoice, setInvoice] = useState(true);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const selectedMethod = METHODS.find((m) => m.id === method)!;

  const handleNext = () => {
    onNext({
      deliveryDate: date,
      deliverySlot: slot,
      shippingMethod: method,
      includeInvoice: invoice,
      note,
      shippingRial: selectedMethod.priceRial,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-store-text">زمان و روش ارسال</h2>
        <p className="mt-0.5 text-sm text-store-text-faint">زمان دریافت و شیوه ارسال</p>
      </div>

      {/* delivery date */}
      <section>
        <div className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-store-text">
          <Calendar className="size-4 text-store-primary-hover" />
          زمان ارسال
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((d) => {
            const iso = d.toISOString();
            const { weekday, day, month } = toJalaliCompact(d);
            const active = date === iso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDate(iso)}
                className={`flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2.5 text-center transition-all ${
                  active
                    ? "border-store-primary bg-store-primary text-white shadow-[0_2px_8px] shadow-store-primary/30"
                    : "border-store-border bg-store-surface text-store-text hover:border-store-primary/50"
                }`}
              >
                <span className={`text-xs font-medium ${active ? "text-white/80" : "text-store-text-muted"}`}>
                  {weekday}
                </span>
                <span className="mt-0.5 font-bold text-[15px]">{toPersian(day)}</span>
                <span className={`text-[11px] ${active ? "text-white/70" : "text-store-text-faint"}`}>
                  {month}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* time slot */}
      <section>
        <div className="mb-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SLOTS.map((s) => {
            const active = slot === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlot(s.id)}
                className={`relative flex flex-col items-center rounded-xl border py-3 text-sm transition-all ${
                  active
                    ? "border-store-primary bg-store-primary-soft text-store-primary-hover"
                    : "border-store-border bg-store-surface text-store-text hover:border-store-primary/50"
                }`}
              >
                {active && (
                  <span className="absolute top-1.5 left-1.5 grid size-4 place-items-center rounded-full bg-store-primary">
                    <Check className="size-2.5 text-white stroke-[3]" />
                  </span>
                )}
                <span className="font-bold">{toPersian(s.label)}</span>
                <span className={`text-[11px] ${active ? "text-store-primary-hover/70" : "text-store-text-faint"}`}>
                  {s.sub}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* shipping method */}
      <section>
        <div className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-store-text">
          <Package2 className="size-4 text-store-primary-hover" />
          روش ارسال
        </div>
        <div className="flex flex-col gap-2.5">
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`flex items-center gap-3.5 rounded-2xl border p-4 text-right transition-all ${
                  active
                    ? "border-store-primary bg-store-primary-soft/50 shadow-[0_0_0_3px] shadow-store-primary/10"
                    : "border-store-border bg-store-surface hover:border-store-primary/40"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                    active ? "bg-store-primary text-white" : "bg-store-surface-soft text-store-text-muted"
                  }`}
                >
                  <m.icon className="size-5" />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-store-text">{m.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.badgeClass}`}>
                      {m.badge}
                    </span>
                  </div>
                  <span className="text-xs text-store-text-faint">{m.desc}</span>
                </div>
                <div className="shrink-0 text-left">
                  <div className="font-bold text-store-text">
                    {toPersian(m.priceRial.toLocaleString("fa-IR", { useGrouping: false }).replace(/,/g, "٬"))}
                  </div>
                  <div className="text-[10px] text-store-text-faint">تومان</div>
                </div>
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
                    active ? "border-store-primary bg-store-primary" : "border-store-border"
                  }`}
                >
                  {active && <Check className="size-3 text-white stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* invoice */}
      <section className="flex items-center gap-3 rounded-xl border border-store-border bg-store-surface p-4">
        <Receipt className="size-5 shrink-0 text-store-text-faint" />
        <div className="flex-1">
          <div className="text-sm font-bold text-store-text">فاکتور همراه سفارش</div>
          <div className="text-xs text-store-text-faint">برگه فاکتور داخل بسته قرار می‌گیرد</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInvoice(true)}
            className={`store-btn text-sm ${invoice ? "store-btn-primary" : "store-btn-secondary"}`}
          >
            <Receipt className="size-3.5" /> بله، فاکتور
          </button>
          <button
            type="button"
            onClick={() => setInvoice(false)}
            className={`store-btn text-sm ${!invoice ? "store-btn-primary" : "store-btn-secondary"}`}
          >
            <FileX className="size-3.5" /> هدیه‌ست
          </button>
        </div>
      </section>

      {/* note */}
      <section>
        <button
          type="button"
          onClick={() => setNoteOpen(!noteOpen)}
          className="flex w-full items-center gap-2 rounded-xl border border-store-border bg-store-surface px-4 py-3 text-sm text-store-text-muted transition-colors hover:border-store-primary/40"
        >
          <span className="flex-1 text-right">توضیحات سفارش (اختیاری)</span>
          <ChevronDown className={`size-4 transition-transform duration-200 ${noteOpen ? "rotate-180" : ""}`} />
        </button>
        {noteOpen && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثلاً: زنگ نزنید — پیامک بدید / تحویل به نگهبانی / بسته‌بندی ویژه لازمه"
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-store-border bg-store-surface px-4 py-3 text-sm text-store-text outline-none placeholder:text-store-text-faint transition-colors focus:border-store-primary"
          />
        )}
      </section>

      {/* CTA */}
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="store-btn store-btn-secondary">
          ← برگشت
        </button>
        <button type="button" onClick={handleNext} className="store-btn store-btn-primary flex-1 justify-center py-3.5 text-base">
          تایید و ادامه به پرداخت ←
        </button>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
