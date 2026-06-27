"use client";

import { Check } from "lucide-react";

export type StepDef = { id: number; label: string };

export const CHECKOUT_STEPS: StepDef[] = [
  { id: 1, label: "ورود" },
  { id: 2, label: "پروفایل" },
  { id: 3, label: "آدرس" },
  { id: 4, label: "ارسال" },
  { id: 5, label: "پرداخت" },
];

export function CheckoutStepper({ current }: { current: number }) {
  return (
    <div className="relative flex items-center justify-between px-1">
      {CHECKOUT_STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;

        return (
          <div key={s.id} className="relative flex flex-1 flex-col items-center">
            {/* connector line (not for last) */}
            {i < CHECKOUT_STEPS.length - 1 && (
              <div
                className={`absolute top-5 right-1/2 h-px w-full -translate-y-px transition-colors duration-500 ${
                  done ? "bg-store-primary" : "bg-store-border"
                }`}
              />
            )}

            {/* circle */}
            <div
              className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                done
                  ? "border-store-primary bg-store-primary text-white"
                  : active
                    ? "border-store-primary bg-store-primary text-white shadow-[0_0_0_4px] shadow-store-primary/20"
                    : "border-store-border bg-store-surface text-store-text-faint"
              }`}
            >
              {done ? (
                <Check className="size-4 stroke-[2.5]" />
              ) : (
                <span>{s.id}</span>
              )}
            </div>

            {/* label */}
            <span
              className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                active
                  ? "text-store-primary"
                  : done
                    ? "text-store-text-muted"
                    : "text-store-text-faint"
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
