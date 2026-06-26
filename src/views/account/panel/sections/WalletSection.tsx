"use client";

import { useQuery } from "@tanstack/react-query";
import { Wallet, ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { Money } from "../Money";
import { PanelEmpty, PanelError, PanelLoading } from "../ui";
import { CREDIT_TYPE } from "../labels";
import { jsonGet } from "../fetcher";
import { ACCOUNT_QUERY_KEYS, type CreditSummary } from "@/lib/account/types";
import { formatJalali } from "@/lib/date";

export function WalletSection() {
  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.credit,
    queryFn: () => jsonGet<CreditSummary>("/api/account/credit"),
  });

  return (
    <div>
      <SectionHead title="اعتبار دشت‌زاد" sub="اعتبار هدیه، بازگشت وجه و جبران خسارت" />

      {q.isLoading ? (
        <PanelLoading />
      ) : q.isError ? (
        <PanelError onRetry={() => q.refetch()} />
      ) : (
        <div className="flex flex-col gap-5">
          {/* balance card */}
          <div className="rounded-2xl border border-store-border bg-linear-to-bl from-store-primary-soft to-store-surface p-5 md:p-6">
            <div className="flex items-center gap-2 text-sm text-store-text-muted">
              <Wallet className="size-4 text-store-primary" /> موجودی اعتبار
            </div>
            <div className="mt-2 font-heading text-3xl font-bold text-store-text">
              <Money rial={q.data?.balanceRial ?? 0} strong big />
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs leading-6 text-store-text-faint">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              اعتبار دشت‌زاد یک کیف پول بانکی نیست و قابل برداشت نقدی نیست؛ به‌زودی هنگام تسویه‌حساب قابل
              استفاده خواهد بود.
            </p>
          </div>

          {/* ledger */}
          {(q.data?.entries.length ?? 0) === 0 ? (
            <PanelEmpty
              icon={<Wallet className="size-7" />}
              title="هنوز اعتباری نداری"
              desc="اعتبار هدیه، بازگشت وجه سفارش‌ها و جبران خسارت در این بخش نمایش داده می‌شود."
            />
          ) : (
            <div className="rounded-2xl border border-store-border bg-store-surface shadow-store-xs">
              <div className="border-b border-store-border px-5 py-3 font-bold text-store-text">
                گردش اعتبار
              </div>
              <ul className="divide-y divide-store-border">
                {q.data!.entries.map((t) => {
                  const inn = t.direction === "IN";
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl ${inn ? "bg-store-primary-soft text-store-primary-hover" : "bg-store-clay-soft text-store-clay-deep"}`}
                      >
                        {inn ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-store-text">{CREDIT_TYPE[t.type]}</div>
                        <div className="text-xs text-store-text-faint">
                          {formatJalali(t.createdAtISO)}
                          {t.reason ? ` · ${t.reason}` : ""}
                        </div>
                      </div>
                      <div
                        className={`ms-auto font-bold ${inn ? "text-store-primary-hover" : "text-store-clay-deep"}`}
                      >
                        {inn ? "+ " : "− "}
                        <Money rial={t.amountRial} strong />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
