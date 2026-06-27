"use client";

import { useState, useEffect } from "react";
import { Receipt, ExternalLink, RotateCcw } from "lucide-react";
import {
  createInvoiceFromOrderAction,
  createReturnInvoiceAction,
  getInvoiceByOrderNumberAction,
  getOnlineInvoiceUrlAction,
} from "@/app/admin/hesabfa/actions";
import { toPersianNumbers } from "@/lib/price";

type InvoiceInfo = {
  invoiceNumber: number;
  invoiceId: number;
  sum: number;
  paid: number;
  status: number;
};

export function HesabfaInvoiceButton({
  orderId,
  orderNumber,
  isRefunded = false,
}: {
  orderId: string;
  orderNumber: string;
  isRefunded?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo | null>(null);
  const [onlineUrl, setOnlineUrl] = useState<string | null>(null);

  // Check if invoice already exists
  useEffect(() => {
    getInvoiceByOrderNumberAction(orderNumber).then((r) => {
      if (r.ok && r.invoiceNumber) {
        setInvoiceInfo({
          invoiceNumber: r.invoiceNumber,
          invoiceId: r.invoiceId!,
          sum: r.sum ?? 0,
          paid: r.paid ?? 0,
          status: r.status ?? 0,
        });
      }
    });
  }, [orderNumber]);

  async function handleCreate() {
    setLoading(true);
    setResult(null);
    const r = await createInvoiceFromOrderAction(orderId);
    setLoading(false);
    if (r.ok) {
      setResult({ ok: true, message: `فاکتور شماره ${toPersianNumbers(r.invoiceNumber ?? 0)} ثبت شد.` });
      getInvoiceByOrderNumberAction(orderNumber).then((r2) => {
        if (r2.ok && r2.invoiceNumber) {
          setInvoiceInfo({ invoiceNumber: r2.invoiceNumber, invoiceId: r2.invoiceId!, sum: r2.sum ?? 0, paid: r2.paid ?? 0, status: r2.status ?? 0 });
        }
      });
    } else {
      setResult({ ok: false, message: r.error ?? "خطای نامشخص" });
    }
  }

  async function handleReturn() {
    setLoading(true);
    setResult(null);
    const r = await createReturnInvoiceAction(orderId);
    setLoading(false);
    setResult({
      ok: r.ok,
      message: r.ok
        ? `فاکتور برگشت شماره ${toPersianNumbers(r.invoiceNumber ?? 0)} ثبت شد.`
        : (r.error ?? "خطای نامشخص"),
    });
  }

  async function handleOnlineLink() {
    if (!invoiceInfo) return;
    const r = await getOnlineInvoiceUrlAction(invoiceInfo.invoiceId);
    if (r.ok && r.url) setOnlineUrl(r.url);
    else setResult({ ok: false, message: r.error ?? "لینک دریافت نشد" });
  }

  return (
    <div className="flex flex-col gap-2">
      {invoiceInfo ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <p className="font-medium text-emerald-700 dark:text-emerald-400">
            فاکتور حسابفا: #{toPersianNumbers(invoiceInfo.invoiceNumber)}
          </p>
          <p className="mt-0.5 text-emerald-600 dark:text-emerald-500">
            پرداخت شده: {toPersianNumbers(Math.round(invoiceInfo.paid / 10).toLocaleString())} تومان
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleOnlineLink}
              className="flex items-center gap-1 rounded-lg border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:text-emerald-400"
            >
              <ExternalLink className="size-3" /> لینک آنلاین
            </button>
            {isRefunded && (
              <button
                onClick={handleReturn}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg border border-amber-300 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-500/30 dark:text-amber-400"
              >
                <RotateCcw className="size-3" /> ثبت برگشت
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={handleCreate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-primary-700 hover:bg-dz-a-primary-50 transition-colors disabled:opacity-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-dz-a-night-hover"
        >
          <Receipt className="size-3.5" />
          {loading ? "در حال ثبت..." : "ثبت فاکتور در حسابفا"}
        </button>
      )}
      {onlineUrl && (
        <a
          href={onlineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-sky-600 underline dark:text-sky-400"
        >
          {onlineUrl}
        </a>
      )}
      {result && (
        <p className={`text-xs ${result.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
