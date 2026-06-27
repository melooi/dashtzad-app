"use client";

import { useState } from "react";
import { MapPin, Plus, Check, Pencil } from "lucide-react";
import { InlineAddressForm } from "./InlineAddressForm";
import type { AddressDTO } from "@/lib/account/types";

const TITLE_ICONS: Record<string, string> = {
  خانه: "🏠", "محل کار": "💼", هدیه: "🎁", سوپرایز: "🎉", پارتنر: "💑", ناشناس: "🕵️",
};

export type AddressStepData = { addressId: string };

type Props = {
  addresses: AddressDTO[];
  defaultId?: string;
  onNext: (data: AddressStepData) => void;
};

export function AddressStep({ addresses: initialAddresses, defaultId, onNext }: Props) {
  const [addresses, setAddresses] = useState<AddressDTO[]>(initialAddresses);
  const [selected, setSelected] = useState<string>(
    defaultId ?? initialAddresses.find((a) => a.isDefault)?.id ?? initialAddresses[0]?.id ?? "",
  );
  const [showForm, setShowForm] = useState(initialAddresses.length === 0);

  const handleAddressSaved = (newAddr: AddressDTO) => {
    setAddresses((prev) => [...prev, newAddr]);
    setSelected(newAddr.id);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-xl font-bold text-store-text">آدرس ارسال</h2>
        <p className="mt-0.5 text-sm text-store-text-faint">نشانی گیرنده مرسوله</p>
      </div>

      {addresses.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {addresses.map((a) => {
            const ic = a.title ? (TITLE_ICONS[a.title] ?? null) : null;
            const active = selected === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelected(a.id)}
                className={`group relative w-full rounded-2xl border p-4 text-right transition-all duration-200 ${
                  active
                    ? "border-store-primary bg-store-primary-soft/50 shadow-[0_0_0_3px] shadow-store-primary/10"
                    : "border-store-border bg-store-surface hover:border-store-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all ${active ? "border-store-primary bg-store-primary" : "border-store-border group-hover:border-store-primary/50"}`}>
                    {active && <Check className="size-3 text-white stroke-[3]" />}
                  </span>
                  <div className="flex flex-1 items-center gap-1.5 font-bold text-store-text">
                    {ic ? <span className="text-base">{ic}</span> : <MapPin className="size-4 text-store-primary-hover" />}
                    {a.title || "آدرس"}
                    {a.isDefault && (
                      <span className="ms-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">★ پیش‌فرض</span>
                    )}
                  </div>
                  <span className="shrink-0 rounded-lg p-1.5 text-store-text-faint transition-colors group-hover:bg-store-surface-soft">
                    <Pencil className="size-3.5" />
                  </span>
                </div>
                <div className="mt-2.5 space-y-0.5 pr-8 text-sm">
                  <p className="font-medium text-store-text-muted">{a.receiverName} — {a.phone}</p>
                  <p className="leading-6 text-store-text-muted">
                    {a.province}، {a.city}، {a.line}
                    {a.plaque ? `، پلاک ${a.plaque}` : ""}
                    {a.unit ? `، واحد ${a.unit}` : ""}
                  </p>
                  <p className="text-xs text-store-text-faint">کد پستی: {a.postalCode}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* inline add address */}
      {showForm ? (
        <InlineAddressForm
          onSaved={handleAddressSaved}
          onCancel={addresses.length > 0 ? () => setShowForm(false) : undefined}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-store-border py-4 text-sm font-medium text-store-primary-hover transition-colors hover:border-store-primary hover:bg-store-primary-soft/30"
        >
          <Plus className="size-4" /> افزودن آدرس جدید
        </button>
      )}

      <button
        type="button"
        disabled={!selected || showForm}
        onClick={() => onNext({ addressId: selected })}
        className="store-btn store-btn-primary mt-1 w-full justify-center py-3.5 text-base disabled:opacity-50"
      >
        تایید آدرس و ادامه ←
      </button>
    </div>
  );
}
