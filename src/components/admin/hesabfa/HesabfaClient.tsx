"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import {
  Receipt, Users, Package, FileText, Settings2, RefreshCw, XCircle,
  CheckCircle2, Loader2, ChevronLeft, ChevronRight, Building2, TrendingUp,
  ShoppingCart, DollarSign, AlertCircle, LayoutDashboard, Landmark,
  AlertTriangle, BarChart3, ArrowDownRight, ArrowUpRight, Warehouse,
  ArrowLeftRight, Search, ExternalLink, Send, CreditCard, Hash,
  MapPin, Briefcase, User2, CalendarDays, Info, Package2, ChevronDown,
  ChevronUp, BadgeCheck, BadgeAlert, Banknote, PieChart,
} from "lucide-react";
import {
  fetchContactsAction, fetchInvoicesAction, fetchItemsAction,
  fetchDocumentsAction, fetchBanksAction, fetchHesabfaOverviewAction,
  fetchReceiptsAction, fetchBankTransfersAction, fetchWarehouseReceiptsAction,
  fetchProfitAndLossAction, fetchDebtorsCreditorsAction, fetchInventoryReportAction,
  fetchBankReportAction, fetchBalanceSheetAction, fetchTrialBalanceAction,
  fetchBusinessInfoAction, fetchFiscalYearAction,
  fetchSalesmenAction, fetchProjectsAction, fetchWarehousesAction, fetchCashesAction,
  getInvoiceDetailAction, changeInvoiceSentStatusAction, getContactLinkAction,
  fetchItemQuantitiesAction, savePaymentForInvoiceAction, getOnlineInvoiceUrlAction,
  saveReceiptAction,
  testHesabfaAction, syncAllProductPricesAndStocksAction, exportAllProductsAction,
  exportAllCustomersAction, pushAllPricesToHesabfaAction,
  inquiryCreditAction, inquiryCardAction, inquiryIbanAction,
  inquiryCardToIbanAction, inquiryPostalCodeAction, inquiryNationalIdAction,
  type HfContact, type HfInvoice, type HfInvoiceDetail, type HfItem,
  type HfDocument, type HfBank, type HfReceipt, type HfBankTransfer,
  type HfWarehouseReceipt, type HfDebtorCreditor, type HfInventoryItem,
  type HfProfitLoss, type HfBusinessInfo, type HfFiscalYear,
  type HfSalesman, type HfProject, type HfWarehouse, type HfCash,
  type HfItemQuantity, type HfOverview, type HfListResult,
  type HfBalanceSheetItem,
} from "@/app/admin/hesabfa/actions";

// ── Tab definitions ───────────────────────────────────────────────────

const TABS = [
  { k: "overview",   label: "خلاصه",         Icon: LayoutDashboard },
  { k: "invoices",   label: "فاکتورها",       Icon: Receipt },
  { k: "receipts",   label: "دریافت/پرداخت",  Icon: Banknote },
  { k: "contacts",   label: "مخاطبین",        Icon: Users },
  { k: "items",      label: "اقلام",          Icon: Package },
  { k: "warehouse",  label: "انبار",          Icon: Warehouse },
  { k: "transfers",  label: "انتقال بانکی",   Icon: ArrowLeftRight },
  { k: "reports",    label: "گزارشات",        Icon: PieChart },
  { k: "docs",       label: "اسناد",          Icon: FileText },
  { k: "inquiry",    label: "استعلام",        Icon: Search },
  { k: "info",       label: "اطلاعات",        Icon: Info },
  { k: "sync",       label: "همسان‌سازی",     Icon: ShoppingCart },
] as const;
type TabKey = (typeof TABS)[number]["k"];

// ── Helpers ───────────────────────────────────────────────────────────

const fa = (n: number) => new Intl.NumberFormat("fa-IR").format(n);
const toman = (v: number) => fa(Math.round(v / 10)) + " ت";
const rial  = (v: number) => fa(v) + " ر";
const pct   = (a: number, b: number) => b ? fa(Math.round((a/b)*100)) + "٪" : "۰٪";

function today() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
function yearStart() {
  const d = new Date();
  return `${d.getFullYear()}-01-01`;
}

// ── Shared UI ─────────────────────────────────────────────────────────

function Card({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card ${className}`}>
      {children}
    </div>
  );
}

function CardHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-dz-a-primary-50 px-5 py-3.5 dark:border-dz-a-night-border">
      <div>
        <p className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">{title}</p>
        {sub && <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Kpi({ icon: Icon, value, sub, label, color, trend }: {
  icon: React.FC<{className?:string}>; value: string; sub?: string; label: string; color: string; trend?: "up"|"down"|null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dz-a-primary-100 bg-white p-4 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon className="size-5"/></span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold leading-none text-dz-a-fg dark:text-dz-a-night-fg">{value}</span>
          {sub && <span className="text-[11px] text-dz-a-fg-muted dark:text-dz-a-night-muted">{sub}</span>}
          {trend==="down" && <ArrowDownRight className="size-3.5 text-red-500"/>}
          {trend==="up"   && <ArrowUpRight  className="size-3.5 text-emerald-500"/>}
        </div>
        <p className="mt-0.5 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{label}</p>
      </div>
    </div>
  );
}

function Spin() { return <div className="flex items-center justify-center py-16"><Loader2 className="size-6 animate-spin text-dz-a-fg-muted"/></div>; }
function Empty({ msg }: { msg: string }) { return <p className="py-14 text-center text-sm text-dz-a-fg-muted dark:text-dz-a-night-muted">{msg}</p>; }
function Err({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-400">
      <XCircle className="size-4 shrink-0"/>{msg}
    </div>
  );
}

function Pager({ page, pages, total, prev, next }: { page:number; pages:number; total:number; prev():void; next():void }) {
  if (pages<=1) return null;
  return (
    <div className="flex items-center justify-between text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">
      <span>صفحهٔ {fa(page+1)} از {fa(pages)} · کل: {fa(total)}</span>
      <div className="flex gap-2">
        <button disabled={page<=0} onClick={prev} className="flex items-center gap-1 rounded-lg border border-dz-a-primary-100 px-3 py-1 disabled:opacity-40 dark:border-dz-a-night-border"><ChevronRight className="size-3.5"/>قبلی</button>
        <button disabled={page>=pages-1} onClick={next} className="flex items-center gap-1 rounded-lg border border-dz-a-primary-100 px-3 py-1 disabled:opacity-40 dark:border-dz-a-night-border">بعدی<ChevronLeft className="size-3.5"/></button>
      </div>
    </div>
  );
}

function ReloadBtn({ onClick, busy, label="بارگذاری" }: { onClick():void; busy:boolean; label?: string }) {
  return (
    <button onClick={onClick} disabled={busy} className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-100 bg-white px-3 py-1.5 text-xs font-medium text-dz-a-fg-muted hover:text-dz-a-fg disabled:opacity-50 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <RefreshCw className={`size-3.5 ${busy?"animate-spin":""}`}/>{label}
    </button>
  );
}

function DateRange({ start, end, onStart, onEnd }: { start:string; end:string; onStart(v:string):void; onEnd(v:string):void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-dz-a-fg-muted dark:text-dz-a-night-muted">از:</span>
      <input type="date" value={start} onChange={e=>onStart(e.target.value)} className="rounded-xl border border-dz-a-primary-100 px-2 py-1 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg" dir="ltr"/>
      <span className="text-dz-a-fg-muted dark:text-dz-a-night-muted">تا:</span>
      <input type="date" value={end} onChange={e=>onEnd(e.target.value)} className="rounded-xl border border-dz-a-primary-100 px-2 py-1 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg" dir="ltr"/>
    </div>
  );
}

function StatusBadge({ rest, status }: { rest:number; status:number }) {
  if (status===0) return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">پیش‌نویس</span>;
  if (rest>0)    return <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-400/10 dark:text-red-400">{toman(rest)} مانده</span>;
  return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">تسویه</span>;
}

function StockPill({ stock }: { stock:number }) {
  if (stock<=0)  return <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-400/10 dark:text-red-400">ناموجود</span>;
  if (stock<5)   return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">{fa(stock)} ⚠</span>;
  return <span className="font-bold text-emerald-600 dark:text-emerald-400">{fa(stock)}</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-start text-xs font-semibold text-dz-a-fg-muted dark:text-dz-a-night-muted">{children}</th>;
}
function Td({ children, mono, dir: d }: { children: React.ReactNode; mono?:boolean; dir?:"ltr"|"rtl" }) {
  return <td className={`px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg ${mono?"font-mono":""}`} dir={d}>{children}</td>;
}

// ── Overview ──────────────────────────────────────────────────────────

function OverviewView() {
  const [data, setData] = useState<HfOverview|null>(null);
  const [biz, setBiz] = useState<HfBusinessInfo|null>(null);
  const [fy, setFy] = useState<HfFiscalYear|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [busy, start] = useTransition();

  const load = useCallback(() => {
    start(async () => {
      setErr(null);
      const [r, rb, rfy] = await Promise.all([
        fetchHesabfaOverviewAction(),
        fetchBusinessInfoAction(),
        fetchFiscalYearAction(),
      ]);
      if (r.ok && r.data) setData(r.data); else setErr(r.error ?? "خطا");
      if (rb.ok && rb.data) setBiz(rb.data);
      if (rfy.ok && rfy.data) setFy(rfy.data);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">داشبورد حسابفا</span>
        <ReloadBtn onClick={load} busy={busy}/>
      </div>

      {biz && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dz-a-primary-100 bg-linear-to-l from-dz-a-primary-50 to-white p-4 shadow-xs dark:border-dz-a-night-border dark:from-dz-a-night-card dark:to-dz-a-night-card">
          <div>
            <p className="text-lg font-extrabold text-dz-a-fg dark:text-dz-a-night-fg">{biz.Name}</p>
            {biz.LegalName && <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{biz.LegalName}</p>}
          </div>
          <div className="ms-auto flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5"><BadgeCheck className="size-3.5 text-emerald-500"/><span className="text-dz-a-fg-muted dark:text-dz-a-night-muted">اشتراک:</span><span className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">{biz.Subscription}</span></div>
            <div className="flex items-center gap-1.5"><DollarSign className="size-3.5 text-sky-500"/><span className="text-dz-a-fg-muted dark:text-dz-a-night-muted">اعتبار:</span><span className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">{fa(biz.Credit)}</span></div>
            {fy && <div className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-purple-500"/><span className="text-dz-a-fg-muted dark:text-dz-a-night-muted">سال مالی:</span><span className="font-bold text-dz-a-fg dark:text-dz-a-night-fg" dir="ltr">{fy.StartDate?.split("T")[0]} — {fy.EndDate?.split("T")[0]}</span></div>}
          </div>
        </div>
      )}

      {err && <Err msg={err}/>}
      {busy && !data ? <Spin/> : data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi icon={Receipt}       value={fa(data.invoiceTotalCount)}    label="کل فاکتورها"      color="bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300"/>
            <Kpi icon={DollarSign}    value={toman(data.invoiceTotalSum)}   label="جمع (۲۰ اخیر)"    color="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"/>
            <Kpi icon={AlertCircle}   value={toman(data.invoiceTotalRest)}  label={`مانده — ${fa(data.unpaidCount)} فاکتور`} color="bg-red-50 text-red-500 dark:bg-red-400/10 dark:text-red-400" trend={data.invoiceTotalRest>0?"down":null}/>
            <Kpi icon={BarChart3}     value={pct(data.invoiceTotalPaid,data.invoiceTotalSum)} label="نرخ وصول" color="bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400" trend={data.invoiceTotalPaid>data.invoiceTotalRest?"up":"down"}/>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi icon={Users}         value={fa(data.contactCount)}         label="مخاطبین"          color="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"/>
            <Kpi icon={Package}       value={fa(data.itemCount)}            label="اقلام"            color="bg-purple-50 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400"/>
            <Kpi icon={AlertTriangle} value={fa(data.outOfStockCount)}      label="ناموجود"          color="bg-red-50 text-red-500 dark:bg-red-400/10 dark:text-red-400" trend={data.outOfStockCount>0?"down":null}/>
            <Kpi icon={AlertTriangle} value={fa(data.lowStockCount)}        label="کم‌موجودی (زیر ۵)" color="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"/>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHead title="۸ فاکتور اخیر"/>
              <table className="w-full">
                <thead><tr className="bg-dz-a-primary-50/50 dark:bg-dz-a-night-sidebar"><Th>شماره</Th><Th>مخاطب</Th><Th>مبلغ</Th><Th>وضعیت</Th></tr></thead>
                <tbody>
                  {data.recentInvoices.map(inv=>(
                    <tr key={inv.Id} className="border-t border-dz-a-primary-50 hover:bg-dz-a-primary-50/30 dark:border-dz-a-night-border dark:hover:bg-white/2">
                      <Td mono dir="ltr">#{fa(inv.Number)}</Td>
                      <td className="max-w-32 truncate px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg">{inv.ContactName||inv.ContactCode||"—"}</td>
                      <Td mono>{toman(inv.Sum)}</Td>
                      <td className="px-4 py-3"><StatusBadge rest={inv.Rest} status={inv.Status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card>
              <CardHead title="اقلام کم/ناموجود"/>
              {data.lowStockItems.length===0 ? <Empty msg="همه اقلام موجود هستند ✓"/> : (
                <table className="w-full">
                  <thead><tr className="bg-dz-a-primary-50/50 dark:bg-dz-a-night-sidebar"><Th>کد</Th><Th>نام</Th><Th>موجودی</Th></tr></thead>
                  <tbody>
                    {data.lowStockItems.map(i=>(
                      <tr key={i.Id} className="border-t border-dz-a-primary-50 dark:border-dz-a-night-border">
                        <Td mono dir="ltr">{i.Code||"—"}</Td>
                        <td className="max-w-40 truncate px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg">{i.Name}</td>
                        <td className="px-4 py-3"><StockPill stock={i.Stock??0}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>

          {data.banks.length>0 && (
            <Card>
              <CardHead title="حساب‌های بانکی"/>
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.banks.map(b=>(
                  <div key={b.Id} className="flex items-center gap-3 rounded-xl border border-dz-a-primary-100 p-3 dark:border-dz-a-night-border">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"><Landmark className="size-4"/></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">{b.Name}</p>
                      <p className="font-mono text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted" dir="ltr">{b.AccountNumber||b.Code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ── Invoices ──────────────────────────────────────────────────────────

const INV_TYPES = [{v:0,l:"همه"},{v:1,l:"فروش"},{v:2,l:"خرید"},{v:3,l:"مرجوعی فروش"},{v:4,l:"مرجوعی خرید"}];

function InvoiceDetailPanel({ invoice, onClose }: { invoice: HfInvoice; onClose(): void }) {
  const [detail, setDetail] = useState<HfInvoiceDetail|null>(null);
  const [loading, setLoading] = useState(true);
  const [payAmt, setPayAmt] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [banks, setBanks] = useState<HfBank[]>([]);
  const [msg, setMsg] = useState<{ok:boolean;text:string}|null>(null);
  const [paying, startPay] = useTransition();
  const [toggling, startToggle] = useTransition();
  const [onlineUrl, setOnlineUrl] = useState<string|null>(null);

  useEffect(() => {
    fetchBanksAction().then(r=>{ if(r.ok && r.data) setBanks(r.data); });
    getInvoiceDetailAction(invoice.Number, invoice.InvoiceType).then(r=>{
      if(r.ok && r.data) setDetail(r.data);
      setLoading(false);
    });
  }, [invoice.Number, invoice.InvoiceType]);

  const recordPayment = () => {
    const amount = parseFloat(payAmt);
    if(!bankCode || !amount) return;
    startPay(async () => {
      const r = await savePaymentForInvoiceAction(invoice.Number, bankCode, amount);
      setMsg(r.ok ? {ok:true,text:"دریافت ثبت شد."} : {ok:false,text:r.error??"خطا"});
      if(r.ok) setPayAmt("");
    });
  };

  const toggleSent = () => {
    startToggle(async () => {
      const newVal = !(detail?.Sent ?? invoice.Status===1);
      const r = await changeInvoiceSentStatusAction(invoice.Number, invoice.InvoiceType, newVal);
      if(r.ok && detail) setDetail({...detail, Sent: newVal});
    });
  };

  const getOnlineLink = async () => {
    const r = await getOnlineInvoiceUrlAction(invoice.Id);
    if(r.ok && r.url) setOnlineUrl(r.url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl dark:bg-dz-a-night-card" onClick={e=>e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-dz-a-primary-100 bg-white px-5 py-4 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <div>
            <p className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">فاکتور #{fa(invoice.Number)}</p>
            <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{invoice.ContactName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleSent} disabled={toggling} title={detail?.Sent?"ارسال‌شده":"ارسال‌نشده"}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${detail?.Sent?"border-emerald-300 bg-emerald-50 text-emerald-700":"border-dz-a-primary-200 text-dz-a-fg-muted"} dark:border-dz-a-night-border dark:text-dz-a-night-fg`}>
              <Send className="size-3"/> {toggling?"...":detail?.Sent?"ارسال‌شده":"علامت ارسال"}
            </button>
            <button onClick={getOnlineLink} className="rounded-xl border border-dz-a-primary-200 p-1.5 text-dz-a-fg-muted hover:text-dz-a-fg dark:border-dz-a-night-border dark:text-dz-a-night-muted" title="لینک آنلاین">
              <ExternalLink className="size-3.5"/>
            </button>
            <button onClick={onClose} className="rounded-xl p-1.5 text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:hover:bg-white/5"><XCircle className="size-5"/></button>
          </div>
        </div>

        {onlineUrl && (
          <div className="border-b border-dz-a-primary-50 px-5 py-3 dark:border-dz-a-night-border">
            <a href={onlineUrl} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-sky-600 underline dark:text-sky-400">{onlineUrl}</a>
          </div>
        )}

        {/* summary */}
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          {[
            {l:"جمع کل",      v:toman(invoice.Sum)},
            {l:"پرداخت‌شده",  v:toman(invoice.Paid)},
            {l:"مانده",       v:toman(invoice.Rest)},
            {l:"وضعیت",       v:<StatusBadge rest={invoice.Rest} status={invoice.Status}/>},
            {l:"تاریخ",       v:invoice.Date?.split("T")[0]},
            {l:"مرجع",        v:(invoice as unknown as {Reference?:string}).Reference||"—"},
          ].map(({l,v})=>(
            <div key={l} className="rounded-xl bg-dz-a-primary-50/50 p-3 dark:bg-white/3">
              <p className="text-[11px] text-dz-a-fg-muted dark:text-dz-a-night-muted">{l}</p>
              <p className="mt-0.5 text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">{v}</p>
            </div>
          ))}
        </div>

        {/* items */}
        {loading ? <Spin/> : detail?.InvoiceItems?.length ? (
          <div className="border-t border-dz-a-primary-50 px-5 py-3 dark:border-dz-a-night-border">
            <p className="mb-3 text-xs font-bold text-dz-a-fg dark:text-dz-a-night-fg">اقلام فاکتور</p>
            <div className="overflow-x-auto rounded-xl border border-dz-a-primary-100 dark:border-dz-a-night-border">
              <table className="w-full text-xs">
                <thead><tr className="bg-dz-a-primary-50/50 dark:bg-dz-a-night-sidebar"><Th>شرح</Th><Th>تعداد</Th><Th>قیمت واحد</Th><Th>جمع</Th></tr></thead>
                <tbody>
                  {detail.InvoiceItems.map((item,i)=>(
                    <tr key={i} className="border-t border-dz-a-primary-50 dark:border-dz-a-night-border">
                      <td className="px-3 py-2 text-dz-a-fg dark:text-dz-a-night-fg">{item.Description||item.ItemName}</td>
                      <Td>{fa(item.Quantity)}</Td>
                      <Td mono>{toman(item.UnitPrice)}</Td>
                      <Td mono>{toman(item.Total||(item.UnitPrice*item.Quantity))}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* record payment */}
        {invoice.Rest > 0 && (
          <div className="border-t border-dz-a-primary-50 px-5 py-4 dark:border-dz-a-night-border">
            <p className="mb-3 text-xs font-bold text-dz-a-fg dark:text-dz-a-night-fg">ثبت دریافت</p>
            <div className="flex flex-col gap-2">
              <select value={bankCode} onChange={e=>setBankCode(e.target.value)} className="w-full rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg">
                <option value="">انتخاب بانک...</option>
                {banks.map(b=><option key={b.Code} value={b.Code}>{b.Name} — {b.AccountNumber}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder="مبلغ (ریال)" dir="ltr" className="flex-1 rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"/>
                <button onClick={recordPayment} disabled={paying||!bankCode||!payAmt} className="flex items-center gap-1.5 rounded-xl bg-dz-a-primary-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-dz-a-primary-500">
                  {paying?<Loader2 className="size-3.5 animate-spin"/>:<BadgeCheck className="size-3.5"/>} ثبت
                </button>
              </div>
              {msg && <p className={`text-xs ${msg.ok?"text-emerald-600 dark:text-emerald-400":"text-red-500 dark:text-red-400"}`}>{msg.text}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoicesView() {
  const [type, setType] = useState(0);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ok:boolean;data?:HfListResult<HfInvoice>;error?:string}|null>(null);
  const [busy, start] = useTransition();
  const [selected, setSelected] = useState<HfInvoice|null>(null);
  const PS=20;

  const load = useCallback((t=type,p=page) => {
    start(async() => { setResult(await fetchInvoicesAction(t, p*PS, PS)); });
  },[type,page]);

  useEffect(()=>{ load(); },[type,page]);

  const rows = result?.data?.List??[];
  const total = result?.data?.TotalCount??0;
  const pages = Math.ceil(total/PS);
  const unpaid = rows.filter(r=>r.Rest>0).length;

  return (
    <div className="flex flex-col gap-5">
      {selected && <InvoiceDetailPanel invoice={selected} onClose={()=>setSelected(null)}/>}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-dz-a-primary-100 bg-white text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          {INV_TYPES.map(t=>(
            <button key={t.v} onClick={()=>{ setType(t.v); setPage(0); }}
              className={`px-3 py-1.5 font-medium transition-colors first:rounded-s-xl last:rounded-e-xl ${type===t.v?"bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500":"text-dz-a-fg-muted hover:text-dz-a-fg dark:text-dz-a-night-muted"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <ReloadBtn onClick={()=>load()} busy={busy}/>
      </div>

      {rows.length>0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi icon={Receipt}      value={fa(total)}                       label="کل فاکتور"     color="bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300"/>
          <Kpi icon={DollarSign}   value={toman(rows.reduce((s,r)=>s+(r.Sum??0),0))}  label="جمع صفحه" color="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"/>
          <Kpi icon={CheckCircle2} value={toman(rows.reduce((s,r)=>s+(r.Paid??0),0))} label="وصول‌شده" color="bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400"/>
          <Kpi icon={BadgeAlert}   value={fa(unpaid)}                      label="بدهکار"        color="bg-red-50 text-red-500 dark:bg-red-400/10 dark:text-red-400"/>
        </div>
      )}

      {result && !result.ok && <Err msg={result.error!}/>}

      <Card>
        {busy ? <Spin/> : rows.length===0 ? <Empty msg="فاکتوری یافت نشد."/> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-dz-a-night-sidebar">
                <Th>شماره</Th><Th>مرجع</Th><Th>تاریخ</Th><Th>مخاطب</Th><Th>جمع کل</Th><Th>پرداخت</Th><Th>وضعیت</Th><Th>{" "}</Th>
              </tr></thead>
              <tbody>
                {rows.map(inv=>(
                  <tr key={inv.Id} className="border-b border-dz-a-primary-50 last:border-0 hover:bg-dz-a-primary-50/30 dark:border-dz-a-night-border dark:hover:bg-white/2">
                    <Td mono dir="ltr">#{fa(inv.Number)}</Td>
                    <Td mono dir="ltr">{(inv as unknown as {Reference?:string}).Reference||"—"}</Td>
                    <Td>{inv.Date?.split("T")[0]}</Td>
                    <td className="max-w-40 truncate px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg">{inv.ContactName||inv.ContactCode||"—"}</td>
                    <Td mono>{toman(inv.Sum)}</Td>
                    <Td mono>{toman(inv.Paid)}</Td>
                    <td className="px-4 py-3"><StatusBadge rest={inv.Rest} status={inv.Status}/></td>
                    <td className="px-4 py-3">
                      <button onClick={()=>setSelected(inv)} className="rounded-lg border border-dz-a-primary-200 px-2 py-1 text-[11px] text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:hover:bg-white/5">
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pager page={page} pages={pages} total={total} prev={()=>setPage(p=>p-1)} next={()=>setPage(p=>p+1)}/>
    </div>
  );
}

// ── Receipts / Payments ───────────────────────────────────────────────

function NewReceiptForm({ onDone }: { onDone(): void }) {
  const [banks, setBanks] = useState<HfBank[]>([]);
  const [rtype, setRtype] = useState<1|2>(1);
  const [bankCode, setBankCode] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(today());
  const [contactCode, setContactCode] = useState("");
  const [msg, setMsg] = useState<{ok:boolean;text:string}|null>(null);
  const [saving, startSave] = useTransition();

  useEffect(()=>{ fetchBanksAction().then(r=>{ if(r.ok&&r.data) setBanks(r.data); }); },[]);

  const save = () => {
    const amt = parseFloat(amount);
    if(!bankCode || !amt) return;
    startSave(async()=>{
      const r = await saveReceiptAction({ type: rtype, bankCode, amount: amt, date, description: desc, contactCode: contactCode||undefined });
      setMsg(r.ok ? {ok:true,text:`رسید شماره ${r.number??""} ثبت شد`} : {ok:false,text:r.error??"خطا"});
      if(r.ok) { setAmount(""); setDesc(""); setContactCode(""); onDone(); }
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dz-a-primary-100 bg-dz-a-primary-50/30 p-4 dark:border-dz-a-night-border dark:bg-white/2">
      <p className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">ثبت رسید جدید</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex rounded-xl border border-dz-a-primary-200 bg-white text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card sm:col-span-2">
          {([{v:1,l:"دریافت"},{v:2,l:"پرداخت"}] as const).map(t=>(
            <button key={t.v} onClick={()=>setRtype(t.v)}
              className={`flex-1 py-2 font-medium first:rounded-s-xl last:rounded-e-xl ${rtype===t.v?"bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500":"text-dz-a-fg-muted dark:text-dz-a-night-muted"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <select value={bankCode} onChange={e=>setBankCode(e.target.value)} className="rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg sm:col-span-2">
          <option value="">انتخاب حساب بانکی...</option>
          {banks.map(b=><option key={b.Code} value={b.Code}>{b.Name} — {b.AccountNumber}</option>)}
        </select>
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="مبلغ (ریال)" dir="ltr" className="rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"/>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg" dir="ltr"/>
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="توضیح (اختیاری)" className="rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"/>
        <input value={contactCode} onChange={e=>setContactCode(e.target.value)} placeholder="کد مخاطب (اختیاری)" dir="ltr" className="rounded-xl border border-dz-a-primary-200 px-3 py-2 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"/>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving||!bankCode||!amount}
          className="flex items-center gap-1.5 rounded-xl bg-dz-a-primary-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-dz-a-primary-500">
          {saving?<Loader2 className="size-3.5 animate-spin"/>:<BadgeCheck className="size-3.5"/>} ثبت رسید
        </button>
        {msg && <p className={`text-xs ${msg.ok?"text-emerald-600 dark:text-emerald-400":"text-red-500 dark:text-red-400"}`}>{msg.text}</p>}
      </div>
    </div>
  );
}

function ReceiptsView() {
  const [rtype, setRtype] = useState<1|2>(1);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ok:boolean;data?:HfListResult<HfReceipt>;error?:string}|null>(null);
  const [busy, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const PS=20;

  const load = useCallback((t=rtype,p=page) => {
    start(async()=>{ setResult(await fetchReceiptsAction(t,p*PS,PS)); });
  },[rtype,page]);

  useEffect(()=>{ load(); },[rtype,page]);

  const rows = result?.data?.List??[];
  const total = result?.data?.TotalCount??0;
  const pages = Math.ceil(total/PS);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-dz-a-primary-100 bg-white text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          {([{v:1,l:"دریافت‌ها"},{v:2,l:"پرداخت‌ها"}] as const).map(t=>(
            <button key={t.v} onClick={()=>{ setRtype(t.v); setPage(0); }}
              className={`px-3 py-1.5 font-medium first:rounded-s-xl last:rounded-e-xl ${rtype===t.v?"bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500":"text-dz-a-fg-muted dark:text-dz-a-night-muted"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <button onClick={()=>setShowForm(f=>!f)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${showForm?"border-dz-a-primary-400 bg-dz-a-primary-50 text-dz-a-primary-700 dark:border-dz-a-primary-500/50 dark:bg-dz-a-primary-500/10":"border-dz-a-primary-100 text-dz-a-fg-muted dark:border-dz-a-night-border dark:text-dz-a-night-muted"}`}>
          <BadgeCheck className="size-3.5"/> ثبت رسید جدید
        </button>
        <ReloadBtn onClick={()=>load()} busy={busy}/>
      </div>

      {showForm && <NewReceiptForm onDone={()=>{ setShowForm(false); load(); }}/>}

      {result && !result.ok && <Err msg={result.error!}/>}

      <Card>
        {busy ? <Spin/> : rows.length===0 ? <Empty msg={rtype===1?"دریافتی یافت نشد.":"پرداختی یافت نشد."}/> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-dz-a-night-sidebar">
                <Th>شماره</Th><Th>تاریخ</Th><Th>توضیح</Th><Th>مبلغ</Th><Th>مخاطب</Th>
              </tr></thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.Id} className="border-b border-dz-a-primary-50 last:border-0 hover:bg-dz-a-primary-50/30 dark:border-dz-a-night-border dark:hover:bg-white/2">
                    <Td mono dir="ltr">#{r.Number}</Td>
                    <Td>{r.DateTime?.split("T")[0]}</Td>
                    <td className="max-w-48 truncate px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg">{r.Description||"—"}</td>
                    <Td mono>{toman(r.Amount)}</Td>
                    <td className="px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg">{r.Items?.[0]?.Contact?.Name||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pager page={page} pages={pages} total={total} prev={()=>setPage(p=>p-1)} next={()=>setPage(p=>p+1)}/>
    </div>
  );
}

// ── Contacts ──────────────────────────────────────────────────────────

function ContactsView() {
  const [page,setPage] = useState(0);
  const [result,setResult] = useState<{ok:boolean;data?:HfListResult<HfContact>;error?:string}|null>(null);
  const [busy,start] = useTransition();
  const [linkMap,setLinkMap] = useState<Record<string,string>>({});
  const PS=20;

  const load = useCallback((p=page)=>{ start(async()=>{ setResult(await fetchContactsAction(p*PS,PS)); }); },[page]);
  useEffect(()=>{ load(); },[page]);

  const rows=result?.data?.List??[];
  const total=result?.data?.TotalCount??0;
  const pages=Math.ceil(total/PS);

  const getLink = async (code:string) => {
    const r = await getContactLinkAction(code);
    if(r.ok && r.url) setLinkMap(m=>({...m,[code]:r.url!}));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Kpi icon={Users} value={fa(total)} label="کل مخاطبین" color="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"/>
        <ReloadBtn onClick={()=>load()} busy={busy}/>
      </div>
      {result&&!result.ok&&<Err msg={result.error!}/>}
      <Card>
        {busy?<Spin/>:rows.length===0?<Empty msg="مخاطبی یافت نشد."/>:(
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-dz-a-night-sidebar">
                <Th>کد</Th><Th>نام</Th><Th>نوع</Th><Th>موبایل</Th><Th>شهر</Th><Th>ایمیل</Th><Th>وضعیت</Th><Th>{" "}</Th>
              </tr></thead>
              <tbody>
                {rows.map(c=>(
                  <tr key={c.Id} className="border-b border-dz-a-primary-50 last:border-0 hover:bg-dz-a-primary-50/30 dark:border-dz-a-night-border dark:hover:bg-white/2">
                    <Td mono dir="ltr">{c.Code||"—"}</Td>
                    <td className="px-4 py-3 text-xs font-medium text-dz-a-fg dark:text-dz-a-night-fg">
                      <div className="flex items-center gap-2">
                        {c.ContactType===2?<Building2 className="size-3.5 shrink-0 text-dz-a-fg-ghost"/>:<User2 className="size-3.5 shrink-0 text-dz-a-fg-ghost"/>}
                        {c.Name}
                      </div>
                    </td>
                    <Td>{c.ContactType===1?"حقیقی":"حقوقی"}</Td>
                    <Td mono dir="ltr">{c.Mobile||c.Phone||"—"}</Td>
                    <Td>{c.City||"—"}</Td>
                    <Td dir="ltr">{c.Email||"—"}</Td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${c.Active?"bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400":"bg-gray-100 text-gray-500 dark:bg-white/5"}`}>
                        {c.Active?"فعال":"غیرفعال"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {linkMap[c.Code] ? (
                        <a href={linkMap[c.Code]} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 underline dark:text-sky-400">کارت</a>
                      ) : (
                        <button onClick={()=>getLink(c.Code)} className="rounded-lg border border-dz-a-primary-200 px-2 py-1 text-[11px] text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:hover:bg-white/5">
                          کارت حساب
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pager page={page} pages={pages} total={total} prev={()=>setPage(p=>p-1)} next={()=>setPage(p=>p+1)}/>
    </div>
  );
}

// ── Items ─────────────────────────────────────────────────────────────

function ItemsView() {
  const [page,setPage] = useState(0);
  const [result,setResult] = useState<{ok:boolean;data?:HfListResult<HfItem>;error?:string}|null>(null);
  const [qtys,setQtys] = useState<HfItemQuantity[]>([]);
  const [filterLow,setFilterLow] = useState(false);
  const [busy,start] = useTransition();
  const PS=20;

  const load = useCallback((p=page)=>{
    start(async()=>{
      const [r,rq] = await Promise.all([fetchItemsAction(p*PS,PS), fetchItemQuantitiesAction()]);
      setResult(r);
      if(rq.ok && rq.data) setQtys(rq.data);
    });
  },[page]);
  useEffect(()=>{ load(); },[page]);

  const allRows=result?.data?.List??[];
  const rows=filterLow?allRows.filter(i=>(i.Stock??0)<=5):allRows;
  const total=result?.data?.TotalCount??0;
  const pages=Math.ceil(total/PS);

  // warehouse quantities per item
  const qtyMap = new Map<string,HfItemQuantity[]>();
  for(const q of qtys){
    if(!qtyMap.has(q.Code)) qtyMap.set(q.Code,[]);
    qtyMap.get(q.Code)!.push(q);
  }

  const [expandedCode,setExpandedCode] = useState<string|null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Kpi icon={Package} value={fa(total)} label="کل اقلام" color="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"/>
        <div className="ms-auto flex items-center gap-2">
          <button onClick={()=>setFilterLow(f=>!f)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${filterLow?"border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-400":"border-dz-a-primary-100 text-dz-a-fg-muted dark:border-dz-a-night-border"}`}>
            {filterLow?"✓ ":""} فقط کم‌موجود
          </button>
          <ReloadBtn onClick={()=>load()} busy={busy}/>
        </div>
      </div>
      {result&&!result.ok&&<Err msg={result.error!}/>}
      <Card>
        {busy?<Spin/>:rows.length===0?<Empty msg="قلمی یافت نشد."/>:(
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-dz-a-night-sidebar">
                <Th>کد کالا</Th><Th>نام</Th><Th>واحد</Th><Th>موجودی</Th><Th>قیمت فروش</Th><Th>قیمت خرید</Th><Th>انبار</Th>
              </tr></thead>
              <tbody>
                {rows.map(item=>(
                  <React.Fragment key={item.Id}>
                    <tr className={`border-b border-dz-a-primary-50 hover:bg-dz-a-primary-50/30 dark:border-dz-a-night-border dark:hover:bg-white/2 ${(item.Stock??0)<=0?"bg-red-50/20 dark:bg-red-400/5":""}`}>
                      <Td mono dir="ltr">{item.Code||"—"}</Td>
                      <td className="px-4 py-3 text-xs font-medium text-dz-a-fg dark:text-dz-a-night-fg">{item.Name}</td>
                      <Td>{item.Unit||"—"}</Td>
                      <td className="px-4 py-3"><StockPill stock={item.Stock??0}/></td>
                      <Td mono>{item.SellPrice?toman(item.SellPrice):"—"}</Td>
                      <Td mono>{item.BuyPrice?toman(item.BuyPrice):"—"}</Td>
                      <td className="px-4 py-3">
                        {(qtyMap.get(item.Code)??[]).length>0 && (
                          <button onClick={()=>setExpandedCode(expandedCode===item.Code?null:item.Code)}
                            className="flex items-center gap-1 text-[11px] text-dz-a-fg-muted hover:text-dz-a-fg dark:text-dz-a-night-muted">
                            <Warehouse className="size-3"/>
                            {expandedCode===item.Code?<ChevronUp className="size-3"/>:<ChevronDown className="size-3"/>}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedCode===item.Code && (
                      <tr className="bg-dz-a-primary-50/30 dark:bg-white/2">
                        <td colSpan={7} className="px-8 py-2">
                          <div className="flex flex-wrap gap-2">
                            {(qtyMap.get(item.Code)??[]).map((q,i)=>(
                              <span key={i} className="rounded-lg border border-dz-a-primary-200 px-2.5 py-1 text-[11px] dark:border-dz-a-night-border">
                                <span className="text-dz-a-fg-muted dark:text-dz-a-night-muted">{q.WarehouseCode}: </span>
                                <span className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">{fa(q.Quantity)}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pager page={page} pages={pages} total={total} prev={()=>setPage(p=>p-1)} next={()=>setPage(p=>p+1)}/>
    </div>
  );
}

// ── Warehouse Receipts ────────────────────────────────────────────────

function WarehouseView() {
  const [wtype,setWtype] = useState<1|2>(1);
  const [page,setPage] = useState(0);
  const [result,setResult] = useState<{ok:boolean;data?:HfListResult<HfWarehouseReceipt>;error?:string}|null>(null);
  const [busy,start] = useTransition();
  const PS=20;

  const load = useCallback((t=wtype,p=page)=>{
    start(async()=>{ setResult(await fetchWarehouseReceiptsAction(t,p*PS,PS)); });
  },[wtype,page]);
  useEffect(()=>{ load(); },[wtype,page]);

  const rows=result?.data?.List??[];
  const total=result?.data?.TotalCount??0;
  const pages=Math.ceil(total/PS);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="flex rounded-xl border border-dz-a-primary-100 bg-white text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          {([{v:1,l:"رسید ورود"},{v:2,l:"حوالهٔ خروج"}] as const).map(t=>(
            <button key={t.v} onClick={()=>{ setWtype(t.v); setPage(0); }}
              className={`px-3 py-1.5 font-medium first:rounded-s-xl last:rounded-e-xl ${wtype===t.v?"bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500":"text-dz-a-fg-muted dark:text-dz-a-night-muted"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <ReloadBtn onClick={()=>load()} busy={busy}/>
      </div>
      {result&&!result.ok&&<Err msg={result.error!}/>}
      <Card>
        {busy?<Spin/>:rows.length===0?<Empty msg="رسیدی یافت نشد."/>:(
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-dz-a-night-sidebar">
                <Th>شماره</Th><Th>تاریخ</Th><Th>انبار</Th><Th>یادداشت</Th><Th>اقلام</Th>
              </tr></thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.Id} className="border-b border-dz-a-primary-50 last:border-0 hover:bg-dz-a-primary-50/30 dark:border-dz-a-night-border dark:hover:bg-white/2">
                    <Td mono dir="ltr">#{r.Number}</Td>
                    <Td>{r.Date?.split("T")[0]}</Td>
                    <Td>{r.WarehouseCode||"—"}</Td>
                    <td className="max-w-48 truncate px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg">{r.Notes||"—"}</td>
                    <td className="px-4 py-3 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{r.Items?.length??0} قلم</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pager page={page} pages={pages} total={total} prev={()=>setPage(p=>p-1)} next={()=>setPage(p=>p+1)}/>
    </div>
  );
}

// ── Bank Transfers ────────────────────────────────────────────────────

function TransfersView() {
  const [page,setPage] = useState(0);
  const [result,setResult] = useState<{ok:boolean;data?:HfListResult<HfBankTransfer>;error?:string}|null>(null);
  const [busy,start] = useTransition();
  const PS=20;

  const load = useCallback((p=page)=>{ start(async()=>{ setResult(await fetchBankTransfersAction(p*PS,PS)); }); },[page]);
  useEffect(()=>{ load(); },[page]);

  const rows=result?.data?.List??[];
  const total=result?.data?.TotalCount??0;
  const pages=Math.ceil(total/PS);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end"><ReloadBtn onClick={()=>load()} busy={busy}/></div>
      {result&&!result.ok&&<Err msg={result.error!}/>}
      <Card>
        {busy?<Spin/>:rows.length===0?<Empty msg="انتقالی یافت نشد."/>:(
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-dz-a-night-sidebar">
                <Th>شماره</Th><Th>تاریخ</Th><Th>از</Th><Th>به</Th><Th>مبلغ مبدأ</Th><Th>مبلغ مقصد</Th><Th>توضیح</Th>
              </tr></thead>
              <tbody>
                {rows.map(t=>(
                  <tr key={t.Id} className="border-b border-dz-a-primary-50 last:border-0 hover:bg-dz-a-primary-50/30 dark:border-dz-a-night-border dark:hover:bg-white/2">
                    <Td mono dir="ltr">#{t.Number}</Td>
                    <Td>{t.Date?.split("T")[0]}</Td>
                    <Td>{t.FromBank||t.FromCash||"—"}</Td>
                    <Td>{t.ToBank||t.ToCash||"—"}</Td>
                    <Td mono>{toman(t.FromAmount)}</Td>
                    <Td mono>{toman(t.ToAmount)}</Td>
                    <td className="max-w-48 truncate px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg">{t.Description||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pager page={page} pages={pages} total={total} prev={()=>setPage(p=>p-1)} next={()=>setPage(p=>p+1)}/>
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────

type ReportKey = "pl"|"dc"|"inv"|"bank"|"bs"|"tb";

function AccountsTable({ data, title }: { data: HfBalanceSheetItem[]; title: string }) {
  const total = data.reduce((s,a)=>({ Debit: s.Debit+(a.Debit??0), Credit: s.Credit+(a.Credit??0), Balance: s.Balance+(a.Balance??0) }), { Debit:0, Credit:0, Balance:0 });
  return (
    <Card>
      <CardHead title={title} sub={`${fa(data.length)} حساب`}/>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="bg-dz-a-primary-50/50 dark:bg-dz-a-night-sidebar">
            <Th>کد حساب</Th><Th>نام حساب</Th><Th>بدهکار</Th><Th>بستانکار</Th><Th>مانده</Th>
          </tr></thead>
          <tbody>
            {data.map((a,i)=>(
              <tr key={i} className="border-t border-dz-a-primary-50 dark:border-dz-a-night-border">
                <Td mono dir="ltr">{a.Account?.Code||"—"}</Td>
                <Td>{a.Account?.Name||"—"}</Td>
                <Td mono>{toman(a.Debit)}</Td>
                <Td mono>{toman(a.Credit)}</Td>
                <td className={`px-4 py-3 text-xs font-bold ${a.Balance>=0?"text-dz-a-fg dark:text-dz-a-night-fg":"text-red-600 dark:text-red-400"}`}>{toman(a.Balance)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-dz-a-primary-200 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-white/3">
              <td colSpan={2} className="px-4 py-3 text-xs font-extrabold text-dz-a-fg dark:text-dz-a-night-fg">جمع کل</td>
              <td className="px-4 py-3 text-xs font-extrabold text-dz-a-fg dark:text-dz-a-night-fg font-mono">{toman(total.Debit)}</td>
              <td className="px-4 py-3 text-xs font-extrabold text-dz-a-fg dark:text-dz-a-night-fg font-mono">{toman(total.Credit)}</td>
              <td className={`px-4 py-3 text-xs font-extrabold font-mono ${total.Balance>=0?"text-emerald-600 dark:text-emerald-400":"text-red-600 dark:text-red-400"}`}>{toman(total.Balance)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReportsView() {
  const [tab,setTab] = useState<ReportKey>("pl");
  const [startDate,setStartDate] = useState(yearStart());
  const [endDate,setEndDate] = useState(today());
  const [bankCode,setBankCode] = useState("");
  const [banks,setBanks] = useState<HfBank[]>([]);

  const [pl,setPl] = useState<HfProfitLoss|null>(null);
  const [dc,setDc] = useState<HfDebtorCreditor[]|null>(null);
  const [inv,setInv] = useState<HfInventoryItem[]|null>(null);
  const [bankData,setBankData] = useState<Array<{Code:string;Name:string;Opening:number;Increase:number;Decrease:number;Amount:number}>|null>(null);
  const [bs,setBs] = useState<HfBalanceSheetItem[]|null>(null);
  const [tb,setTb] = useState<HfBalanceSheetItem[]|null>(null);
  const [err,setErr] = useState<string|null>(null);
  const [busy,startT] = useTransition();

  useEffect(()=>{ fetchBanksAction().then(r=>{ if(r.ok&&r.data) setBanks(r.data); }); },[]);

  const load = () => {
    startT(async()=>{
      setErr(null);
      if(tab==="pl") {
        const r = await fetchProfitAndLossAction(startDate,endDate);
        if(r.ok&&r.data) setPl(r.data); else setErr(r.error??"خطا");
      } else if(tab==="dc") {
        const r = await fetchDebtorsCreditorsAction(startDate,endDate);
        if(r.ok&&r.data) setDc(r.data); else setErr(r.error??"خطا");
      } else if(tab==="inv") {
        const r = await fetchInventoryReportAction(startDate,endDate);
        if(r.ok&&r.data) setInv(r.data); else setErr(r.error??"خطا");
      } else if(tab==="bank") {
        const r = await fetchBankReportAction(startDate,endDate,bankCode);
        if(r.ok&&r.data) setBankData(r.data); else setErr(r.error??"خطا");
      } else if(tab==="bs") {
        const r = await fetchBalanceSheetAction(startDate,endDate);
        if(r.ok&&r.data) setBs(r.data); else setErr(r.error??"خطا");
      } else if(tab==="tb") {
        const r = await fetchTrialBalanceAction(startDate,endDate);
        if(r.ok&&r.data) setTb(r.data); else setErr(r.error??"خطا");
      }
    });
  };

  const REPORT_TABS = [
    {k:"pl", l:"سود و زیان",        icon:TrendingUp},
    {k:"dc", l:"بدهکار/بستانکار",   icon:Users},
    {k:"inv",l:"گزارش انبار",       icon:Package2},
    {k:"bank",l:"گردش بانک",        icon:Landmark},
    {k:"bs", l:"ترازنامه",           icon:PieChart},
    {k:"tb", l:"تراز آزمایشی",      icon:BarChart3},
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <div className="flex min-w-max gap-1 p-1">
          {REPORT_TABS.map(({k,l,icon:Icon})=>(
            <button key={k} onClick={()=>setTab(k as ReportKey)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${tab===k?"bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500":"text-dz-a-fg-muted hover:text-dz-a-fg dark:text-dz-a-night-muted"}`}>
              <Icon className="size-3.5"/>{l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DateRange start={startDate} end={endDate} onStart={setStartDate} onEnd={setEndDate}/>
        {tab==="bank" && (
          <select value={bankCode} onChange={e=>setBankCode(e.target.value)} className="rounded-xl border border-dz-a-primary-100 px-3 py-1.5 text-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg">
            <option value="">همه بانک‌ها</option>
            {banks.map(b=><option key={b.Code} value={b.Code}>{b.Name}</option>)}
          </select>
        )}
        <ReloadBtn onClick={load} busy={busy} label="دریافت گزارش"/>
      </div>

      {err && <Err msg={err}/>}

      {tab==="pl" && pl && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-emerald-50! dark:bg-emerald-400/10!">
            <div className="p-5 text-center">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">سود/زیان خالص</p>
              <p className={`mt-1 text-2xl font-extrabold ${pl.ProfitOrLoss>=0?"text-emerald-700 dark:text-emerald-400":"text-red-600 dark:text-red-400"}`}>{toman(pl.ProfitOrLoss)}</p>
            </div>
          </Card>
          <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
            <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">موجودی اول دوره</p>
            <p className="mt-1 text-xl font-extrabold text-dz-a-fg dark:text-dz-a-night-fg">{toman(pl.BeginningInventory)}</p>
          </div>
          <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
            <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">موجودی پایان دوره</p>
            <p className="mt-1 text-xl font-extrabold text-dz-a-fg dark:text-dz-a-night-fg">{toman(pl.EndingInventory)}</p>
          </div>
          {pl.Accounts?.length>0 && (
            <Card className="sm:col-span-3">
              <CardHead title="حساب‌های سود و زیان"/>
              <table className="w-full">
                <thead><tr className="bg-dz-a-primary-50/50 dark:bg-dz-a-night-sidebar"><Th>حساب</Th><Th>بدهکار</Th><Th>بستانکار</Th><Th>مانده</Th></tr></thead>
                <tbody>
                  {pl.Accounts.map((a,i)=>(
                    <tr key={i} className="border-t border-dz-a-primary-50 dark:border-dz-a-night-border">
                      <Td>{a.Account?.Name}</Td>
                      <Td mono>{toman(a.Debit)}</Td>
                      <Td mono>{toman(a.Credit)}</Td>
                      <Td mono>{toman(a.Balance)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {tab==="dc" && dc && (
        <Card>
          <CardHead title="بدهکاران و بستانکاران" sub={`${fa(dc.length)} مخاطب`}/>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-dz-a-primary-50/50 dark:bg-dz-a-night-sidebar"><Th>کد</Th><Th>نام</Th><Th>بدهکار</Th><Th>بستانکار</Th><Th>مانده</Th></tr></thead>
              <tbody>
                {dc.map((c,i)=>{
                  const bal=c.Debit-c.Credit;
                  return (
                    <tr key={i} className="border-t border-dz-a-primary-50 dark:border-dz-a-night-border">
                      <Td mono dir="ltr">{c.Code}</Td>
                      <Td>{c.Name}</Td>
                      <Td mono>{toman(c.Debit)}</Td>
                      <Td mono>{toman(c.Credit)}</Td>
                      <td className={`px-4 py-3 text-xs font-bold ${bal>0?"text-red-600 dark:text-red-400":"text-emerald-600 dark:text-emerald-400"}`}>{toman(Math.abs(bal))} {bal>0?"بدهکار":"بستانکار"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab==="inv" && inv && (
        <Card>
          <CardHead title="گزارش انبار" sub={`${fa(inv.length)} قلم`}/>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-dz-a-primary-50/50 dark:bg-dz-a-night-sidebar"><Th>کد</Th><Th>نام</Th><Th>واحد</Th><Th>اول دوره</Th><Th>ورود</Th><Th>خروج</Th><Th>موجودی</Th><Th>ارزش</Th></tr></thead>
              <tbody>
                {inv.map((item,i)=>(
                  <tr key={i} className="border-t border-dz-a-primary-50 dark:border-dz-a-night-border">
                    <Td mono dir="ltr">{item.Code}</Td>
                    <Td>{item.Name}</Td>
                    <Td>{item.MainUnit}</Td>
                    <Td mono>{fa(item.Opening)}</Td>
                    <Td mono>{fa(item.Increase)}</Td>
                    <Td mono>{fa(item.Decrease)}</Td>
                    <td className={`px-4 py-3 text-xs font-bold ${item.Quantity>0?"text-emerald-600 dark:text-emerald-400":"text-red-600 dark:text-red-400"}`}>{fa(item.Quantity)}</td>
                    <Td mono>{toman(item.Amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab==="bank" && bankData && (
        <div className="grid gap-4">
          {bankData.map((b,i)=>(
            <Card key={i}>
              <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
                <div><p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">حساب</p><p className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">{b.Name||b.Code}</p></div>
                <div><p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">مانده اول</p><p className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">{toman(b.Opening)}</p></div>
                <div><p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">واریز</p><p className="font-bold text-emerald-600 dark:text-emerald-400">{toman(b.Increase)}</p></div>
                <div><p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">برداشت</p><p className="font-bold text-red-600 dark:text-red-400">{toman(b.Decrease)}</p></div>
              </div>
              <div className="border-t border-dz-a-primary-50 px-5 py-3 dark:border-dz-a-night-border">
                <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">مانده پایان دوره</p>
                <p className="text-xl font-extrabold text-dz-a-fg dark:text-dz-a-night-fg">{toman(b.Amount)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab==="bs" && bs && <AccountsTable data={bs} title="ترازنامه"/>}
      {tab==="tb" && tb && <AccountsTable data={tb} title="تراز آزمایشی"/>}
    </div>
  );
}

// ── Documents ─────────────────────────────────────────────────────────

const DOC_TYPES: Record<number,string> = {1:"دستی",2:"دریافت",3:"پرداخت",4:"افتتاحیه",5:"اختتامیه"};

function DocsView() {
  const [page,setPage] = useState(0);
  const [data,setData] = useState<HfListResult<HfDocument>|null>(null);
  const [err,setErr] = useState<string|null>(null);
  const [busy,start] = useTransition();
  const PS=20;

  const load = useCallback((p=page)=>{
    start(async()=>{
      setErr(null);
      const r=await fetchDocumentsAction(p*PS,PS);
      if(r.ok&&r.data) setData(r.data); else setErr(r.error??"خطا");
    });
  },[page]);
  useEffect(()=>{ load(); },[page]);

  const rows=data?.List??[];
  const total=data?.TotalCount??0;
  const pages=Math.ceil(total/PS);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">اسناد حسابداری {data&&<span className="text-xs font-normal text-dz-a-fg-muted">({fa(data.TotalCount)})</span>}</span>
        <ReloadBtn onClick={()=>load()} busy={busy}/>
      </div>
      {err&&<Err msg={err}/>}
      <Card>
        {busy&&!data?<Spin/>:(
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dz-a-primary-100 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-dz-a-night-sidebar">
                <Th>شماره</Th><Th>تاریخ</Th><Th>نوع</Th><Th>توضیح</Th><Th>مبلغ</Th>
              </tr></thead>
              <tbody>
                {!data&&!err&&Array.from({length:6}).map((_,i)=>(
                  <tr key={i} className="border-t border-dz-a-primary-50 dark:border-dz-a-night-border">
                    {Array.from({length:5}).map((__,j)=>(
                      <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-dz-a-primary-100 dark:bg-dz-a-night-border" style={{width:`${50+j*10}%`}}/></td>
                    ))}
                  </tr>
                ))}
                {rows.map(doc=>(
                  <tr key={doc.Id} className="border-t border-dz-a-primary-50 hover:bg-dz-a-primary-50/40 dark:border-dz-a-night-border dark:hover:bg-white/2">
                    <Td mono dir="ltr">#{fa(doc.Number)}</Td>
                    <Td dir="ltr">{doc.Date?.split("T")[0]}</Td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-dz-a-primary-100 px-2 py-0.5 text-xs text-dz-a-primary-700 dark:bg-dz-a-primary-400/15 dark:text-dz-a-primary-300">
                        {DOC_TYPES[doc.Type]??`نوع ${doc.Type}`}
                      </span>
                    </td>
                    <td className="max-w-64 truncate px-4 py-3 text-xs text-dz-a-fg dark:text-dz-a-night-fg">{doc.Description||"—"}</td>
                    <Td mono>{rial(doc.Sum)}</Td>
                  </tr>
                ))}
                {rows.length===0&&data&&<tr><td colSpan={5}><Empty msg="سندی یافت نشد."/></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pager page={page} pages={pages} total={total} prev={()=>setPage(p=>p-1)} next={()=>setPage(p=>p+1)}/>
    </div>
  );
}

// ── Inquiry ───────────────────────────────────────────────────────────

type IqKey = "card"|"iban"|"card2iban"|"postal"|"nid"|"credit";

function InquiryView() {
  const [tab,setTab] = useState<IqKey>("card");
  const [input1,setInput1] = useState("");
  const [input2,setInput2] = useState("");
  const [result,setResult] = useState<React.ReactNode|null>(null);
  const [err,setErr] = useState<string|null>(null);
  const [busy,start] = useTransition();

  const IQ_TABS = [
    {k:"card",l:"شماره کارت",icon:CreditCard},
    {k:"iban",l:"شبا",icon:Hash},
    {k:"card2iban",l:"کارت→شبا",icon:ArrowLeftRight},
    {k:"postal",l:"کد پستی",icon:MapPin},
    {k:"nid",l:"کد ملی",icon:User2},
    {k:"credit",l:"اعتبار",icon:BadgeCheck},
  ] as const;

  const run = () => {
    setErr(null); setResult(null);
    start(async()=>{
      if(tab==="card") {
        const r = await inquiryCardAction(input1);
        if(r.ok) setResult(<p className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">{r.name}</p>);
        else setErr(r.error??"خطا");
      } else if(tab==="iban") {
        const r = await inquiryIbanAction(input1);
        if(r.ok&&r.data) setResult(
          <div className="space-y-1 text-sm">
            <p><span className="text-dz-a-fg-muted">نام:</span> <strong>{r.data.Name}</strong></p>
            <p><span className="text-dz-a-fg-muted">بانک:</span> <strong>{r.data.BankName}</strong></p>
            <p><span className="text-dz-a-fg-muted">قابل انتقال:</span> <strong>{r.data.IsTransferable?"بله":"خیر"}</strong></p>
          </div>
        ); else setErr(r.error??"خطا");
      } else if(tab==="card2iban") {
        const r = await inquiryCardToIbanAction(input1);
        if(r.ok&&r.data) setResult(
          <div className="space-y-1 text-sm">
            <p><span className="text-dz-a-fg-muted">نام:</span> <strong>{r.data.Name}</strong></p>
            <p><span className="text-dz-a-fg-muted">بانک:</span> <strong>{r.data.BankName}</strong></p>
            <p><span className="text-dz-a-fg-muted">شبا:</span> <strong dir="ltr" className="font-mono">{r.data.IBAN}</strong></p>
          </div>
        ); else setErr(r.error??"خطا");
      } else if(tab==="postal") {
        const r = await inquiryPostalCodeAction(input1);
        if(r.ok&&r.data) setResult(
          <div className="space-y-1 text-sm">
            <p><span className="text-dz-a-fg-muted">استان:</span> <strong>{r.data.Province}</strong></p>
            <p><span className="text-dz-a-fg-muted">شهر:</span> <strong>{r.data.Town}</strong></p>
            <p><span className="text-dz-a-fg-muted">محله:</span> <strong>{r.data.District}</strong></p>
            <p><span className="text-dz-a-fg-muted">خیابان:</span> <strong>{r.data.Street}</strong></p>
            {r.data.description&&<p className="text-dz-a-fg-muted">{r.data.description}</p>}
          </div>
        ); else setErr(r.error??"خطا");
      } else if(tab==="nid") {
        const r = await inquiryNationalIdAction(input1, input2);
        if(r.ok&&r.data) setResult(
          <div className="space-y-1 text-sm">
            <p><span className="text-dz-a-fg-muted">تطابق:</span> <strong className={r.data.Matched?"text-emerald-600":"text-red-600"}>{r.data.Matched?"بله":"خیر"}</strong></p>
            {r.data.Matched&&<>
              <p><span className="text-dz-a-fg-muted">نام:</span> <strong>{r.data.FirstName} {r.data.LastName}</strong></p>
              <p><span className="text-dz-a-fg-muted">وضعیت:</span> <strong>{r.data.IsDead?"فوت‌شده":"زنده"}</strong></p>
            </>}
          </div>
        ); else setErr(r.error??"خطا");
      } else if(tab==="credit") {
        const r = await inquiryCreditAction();
        if(r.ok) setResult(<p className="text-2xl font-extrabold text-dz-a-fg dark:text-dz-a-night-fg">{fa(r.credit??0)} <span className="text-sm font-normal text-dz-a-fg-muted">توکن باقیمانده</span></p>);
        else setErr(r.error??"خطا");
      }
    });
  };

  const PLACEHOLDERS: Record<IqKey,{p1:string;p2?:string}> = {
    card:     {p1:"شماره کارت (۱۶ رقم)"},
    iban:     {p1:"IR..."},
    card2iban:{p1:"شماره کارت"},
    postal:   {p1:"کد پستی ۱۰ رقمی"},
    nid:      {p1:"کد ملی", p2:"تاریخ تولد (YYYY-MM-DD)"},
    credit:   {p1:""},
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1 rounded-2xl border border-dz-a-primary-100 bg-white p-1 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        {IQ_TABS.map(({k,l,icon:Icon})=>(
          <button key={k} onClick={()=>{ setTab(k as IqKey); setResult(null); setErr(null); setInput1(""); setInput2(""); }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${tab===k?"bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500":"text-dz-a-fg-muted hover:text-dz-a-fg dark:text-dz-a-night-muted"}`}>
            <Icon className="size-3.5"/>{l}
          </button>
        ))}
      </div>

      <Card>
        <div className="p-5">
          <p className="mb-3 text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">
            {{card:"استعلام نام صاحب کارت",iban:"استعلام شبا",card2iban:"تبدیل کارت به شبا",postal:"استعلام کد پستی",nid:"استعلام کد ملی",credit:"اعتبار استعلام"}[tab]}
          </p>
          <div className="flex flex-col gap-2">
            {tab!=="credit" && (
              <input value={input1} onChange={e=>setInput1(e.target.value)} placeholder={PLACEHOLDERS[tab].p1} dir="ltr"
                className="rounded-xl border border-dz-a-primary-200 px-4 py-2.5 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
                onKeyDown={e=>e.key==="Enter"&&run()}/>
            )}
            {PLACEHOLDERS[tab].p2 && (
              <input value={input2} onChange={e=>setInput2(e.target.value)} placeholder={PLACEHOLDERS[tab].p2} dir="ltr"
                className="rounded-xl border border-dz-a-primary-200 px-4 py-2.5 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"/>
            )}
            <button onClick={run} disabled={busy||(tab!=="credit"&&!input1.trim())}
              className="flex items-center justify-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-dz-a-primary-500">
              {busy?<Loader2 className="size-4 animate-spin"/>:<Search className="size-4"/>} استعلام
            </button>
          </div>

          {err && <div className="mt-4"><Err msg={err}/></div>}
          {result && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              {result}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Info (Business / Settings) ────────────────────────────────────────

function InfoView() {
  const [biz,setBiz]   = useState<HfBusinessInfo|null>(null);
  const [fy,setFy]     = useState<HfFiscalYear|null>(null);
  const [sm,setSm]     = useState<HfSalesman[]>([]);
  const [proj,setProj] = useState<HfProject[]>([]);
  const [wh,setWh]     = useState<HfWarehouse[]>([]);
  const [cash,setCash] = useState<HfCash[]>([]);
  const [banks,setBanks]= useState<HfBank[]>([]);
  const [credit,setCredit]=useState<number|null>(null);
  const [busy,start]   = useTransition();

  const load = useCallback(()=>{
    start(async()=>{
      const [rb,rfy,rsm,rp,rw,rc,rkb,riq] = await Promise.all([
        fetchBusinessInfoAction(), fetchFiscalYearAction(), fetchSalesmenAction(),
        fetchProjectsAction(), fetchWarehousesAction(), fetchCashesAction(),
        fetchBanksAction(), inquiryCreditAction(),
      ]);
      if(rb.ok&&rb.data)  setBiz(rb.data);
      if(rfy.ok&&rfy.data) setFy(rfy.data);
      if(rsm.ok&&rsm.data) setSm(rsm.data);
      if(rp.ok&&rp.data)  setProj(rp.data);
      if(rw.ok&&rw.data)  setWh(rw.data);
      if(rc.ok&&rc.data)  setCash(rc.data);
      if(rkb.ok&&rkb.data) setBanks(rkb.data);
      if(riq.ok) setCredit(riq.credit??null);
    });
  },[]);
  useEffect(()=>{ load(); },[load]);

  const InfoRow = ({label,value,ltr}:{label:string;value:string|number|React.ReactNode;ltr?:boolean}) => (
    <div className="flex items-center justify-between border-t border-dz-a-primary-50 px-5 py-3 dark:border-dz-a-night-border">
      <span className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{label}</span>
      <span className={`text-xs font-bold text-dz-a-fg dark:text-dz-a-night-fg ${ltr?"font-mono":""}`} dir={ltr?"ltr":"rtl"}>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end"><ReloadBtn onClick={load} busy={busy}/></div>

      <div className="grid gap-5 lg:grid-cols-2">
        {biz && (
          <Card>
            <CardHead title="اطلاعات کسب‌وکار"/>
            <InfoRow label="نام"          value={biz.Name}/>
            <InfoRow label="نام حقوقی"    value={biz.LegalName||"—"}/>
            <InfoRow label="واحد پول"     value={biz.Currency}/>
            <InfoRow label="تقویم"        value={biz.Calendar}/>
            <InfoRow label="اشتراک"       value={biz.Subscription}/>
            <InfoRow label="انقضا"        value={biz.ExpireDate?.split("T")[0]||"—"} ltr/>
            <InfoRow label="اعتبار API"   value={credit!==null?fa(credit):"..."} ltr/>
          </Card>
        )}

        {fy && (
          <Card>
            <CardHead title="سال مالی جاری"/>
            <InfoRow label="نام"          value={fy.Name}/>
            <InfoRow label="شروع"         value={fy.StartDate?.split("T")[0]||"—"} ltr/>
            <InfoRow label="پایان"        value={fy.EndDate?.split("T")[0]||"—"}   ltr/>
          </Card>
        )}

        {banks.length>0 && (
          <Card className="lg:col-span-2">
            <CardHead title="حساب‌های بانکی"/>
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {banks.map(b=>(
                <div key={b.Id} className="rounded-xl border border-dz-a-primary-100 p-3 dark:border-dz-a-night-border">
                  <div className="flex items-center gap-2">
                    <Landmark className="size-4 text-blue-500"/>
                    <span className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">{b.Name}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted" dir="ltr">{b.AccountNumber}</p>
                  {b.Branch&&<p className="text-xs text-dz-a-fg-ghost">شعبه: {b.Branch}</p>}
                  {b.Currency&&<p className="text-xs text-dz-a-fg-ghost">ارز: {b.Currency}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {wh.length>0 && (
          <Card>
            <CardHead title="انبارها"/>
            <div className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-border">
              {wh.map(w=>(
                <div key={w.Id} className="flex items-center gap-3 px-5 py-3">
                  <Warehouse className="size-4 text-amber-500"/>
                  <span className="text-sm text-dz-a-fg dark:text-dz-a-night-fg">{w.Name}</span>
                  <span className="ms-auto font-mono text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{w.Code}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {cash.length>0 && (
          <Card>
            <CardHead title="صندوق‌ها"/>
            <div className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-border">
              {cash.map(c=>(
                <div key={c.Id} className="flex items-center gap-3 px-5 py-3">
                  <Banknote className="size-4 text-emerald-500"/>
                  <span className="text-sm text-dz-a-fg dark:text-dz-a-night-fg">{c.Name}</span>
                  <span className="ms-auto font-mono text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{c.Code}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {sm.length>0 && (
          <Card>
            <CardHead title="فروشندگان"/>
            <div className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-border">
              {sm.map(s=>(
                <div key={s.Id} className="flex items-center gap-3 px-5 py-3">
                  <User2 className="size-4 text-purple-500"/>
                  <span className="text-sm text-dz-a-fg dark:text-dz-a-night-fg">{s.Name}</span>
                  <span className="ms-auto font-mono text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{s.Code}</span>
                  <span className={`text-[11px] ${s.Active?"text-emerald-600":"text-gray-400"}`}>{s.Active?"فعال":"غیرفعال"}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {proj.length>0 && (
          <Card>
            <CardHead title="پروژه‌ها"/>
            <div className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-border">
              {proj.map(p=>(
                <div key={p.Id} className="flex items-center gap-3 px-5 py-3">
                  <Briefcase className="size-4 text-sky-500"/>
                  <span className="text-sm text-dz-a-fg dark:text-dz-a-night-fg">{p.Title}</span>
                  <span className={`ms-auto text-[11px] ${p.Active?"text-emerald-600":"text-gray-400"}`}>{p.Active?"فعال":"غیرفعال"}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Banks standalone ──────────────────────────────────────────────────
// (reused inside InfoView; here just alias for standalone tab if needed)

// ── Product Sync ──────────────────────────────────────────────────────

function SyncView() {
  type Row = {result:string|null;ok:boolean};
  const [rows,setRows] = useState<Record<string,Row>>({});
  const [busyKey,setBusyKey] = useState<string|null>(null);

  const setR=(k:string,ok:boolean,result:string)=>setRows(p=>({...p,[k]:{result,ok}}));

  const run=async(k:string,fn:()=>Promise<void>)=>{
    setBusyKey(k);
    await fn().catch(e=>setR(k,false,e.message??"خطا"));
    setBusyKey(null);
  };

  const actions=[
    {k:"sync",     l:"حسابفا→دشت‌زاد: موجودی و قیمت", desc:"از حسابفا دریافت و در سایت اعمال می‌کند",          icon:RefreshCw,
      fn:async()=>{ const r=await syncAllProductPricesAndStocksAction(); if(!r.ok){setR("sync",false,r.error??"خطا");return;} setR("sync",true,`${r.matched} تطبیق — موجودی: ${r.stockUpdated}، قیمت: ${r.priceUpdated}`); }},
    {k:"push",     l:"دشت‌زاد→حسابفا: ارسال قیمت‌ها",  desc:"قیمت‌های سایت را به حسابفا ارسال می‌کند",          icon:TrendingUp,
      fn:async()=>{ const r=await pushAllPricesToHesabfaAction(); if(!r.ok){setR("push",false,r.error??"خطا");return;} setR("push",true,`${r.pushed} قیمت ارسال شد${r.failed>0?`، ${r.failed} ناموفق`:""}`); }},
    {k:"exp-prod", l:"خروجی همه محصولات",               desc:"محصولات فعال را در حسابفا ثبت می‌کند",               icon:Package,
      fn:async()=>{ const r=await exportAllProductsAction(); if(!r.ok){setR("exp-prod",false,r.error??"خطا");return;} setR("exp-prod",true,`${r.exported} محصول ثبت شد${r.failed>0?`، ${r.failed} ناموفق`:""}`); }},
    {k:"exp-cust", l:"خروجی مشتریان",                   desc:"کاربران را به‌عنوان مخاطب در حسابفا ثبت می‌کند",    icon:Users,
      fn:async()=>{ const r=await exportAllCustomersAction(); if(!r.ok){setR("exp-cust",false,r.error??"خطا");return;} setR("exp-cust",true,`${r.exported} مشتری ثبت شد${r.skipped>0?`، ${r.skipped} رد شد`:""}`); }},
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHead title="همسان‌سازی" sub="کد قلم حسابفا = hesabfaCode در صفحه هر محصول"/>
        <div className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-line">
          {actions.map(a=>(
            <div key={a.k} className="flex items-start gap-4 px-5 py-4">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-white/5 dark:text-dz-a-night-muted">
                <a.icon className="size-4"/>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-dz-a-fg dark:text-dz-a-night-fg">{a.l}</p>
                <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{a.desc}</p>
                {rows[a.k]?.result && (
                  <p className={`mt-1 text-xs ${rows[a.k].ok?"text-emerald-600 dark:text-emerald-400":"text-red-500 dark:text-red-400"}`}>{rows[a.k].result}</p>
                )}
              </div>
              <button onClick={()=>run(a.k,a.fn)} disabled={busyKey===a.k}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-fg hover:bg-dz-a-primary-50 disabled:opacity-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5">
                {busyKey===a.k?<Loader2 className="size-3.5 animate-spin"/>:<a.icon className="size-3.5"/>}
                {busyKey===a.k?"در حال اجرا...":"اجرا"}
              </button>
            </div>
          ))}
        </div>
      </Card>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400">
        <p className="font-bold mb-1">راهنما</p>
        <ol className="list-decimal space-y-1 pr-4">
          <li>اقلام موجود در حسابفا: صفحه محصول → «لینک به کد حسابفا» → وارد کردن کد (مثلاً ۱۱۰۰۰۱)</li>
          <li>محصولات جدید: «خروجی همه محصولات» — با کد = ID دشت‌زاد ساخته می‌شوند</li>
          <li>موجودی تغییر کرد؟ «حسابفا→دشت‌زاد» را بزنید</li>
          <li>قیمت تغییر کرد؟ «دشت‌زاد→حسابفا» یا «حسابفا→دشت‌زاد» را بزنید</li>
        </ol>
      </div>
    </div>
  );
}

// ── Offline ───────────────────────────────────────────────────────────

function Offline() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dz-a-primary-200 bg-white px-8 py-16 text-center shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-sky-50 text-sky-400 dark:bg-sky-400/10"><Receipt className="size-9"/></span>
      <h3 className="text-lg font-bold text-dz-a-fg dark:text-dz-a-night-fg">حسابفا متصل نیست</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-dz-a-fg-muted dark:text-dz-a-night-muted">API Key و Login Token را در تنظیمات پیکربندی کنید.</p>
      <a href="/admin/settings" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-dz-a-primary-700">
        <Settings2 className="size-4"/>تنظیمات
      </a>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────

export function HesabfaClient({ isConnected }: { isConnected: boolean }) {
  const [tab,setTab] = useState<TabKey>("overview");
  const [testRes,setTestRes] = useState<{ok:boolean;message:string}|null>(null);
  const [testing,startTest] = useTransition();

  const runTest=()=>{
    startTest(async()=>{
      const r=await testHesabfaAction();
      setTestRes(r);
      setTimeout(()=>setTestRes(null),4000);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* connection bar */}
      <div className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 shadow-xs ${isConnected?"border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5":"border-dz-a-primary-100 bg-white dark:border-dz-a-night-border dark:bg-dz-a-night-card"}`}>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isConnected?"bg-emerald-100 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400":"bg-sky-50 text-sky-400 dark:bg-sky-400/10"}`}>
          <Receipt className="size-5"/>
        </span>
        <div>
          <p className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">{isConnected?"حسابفا متصل است":"حسابفا متصل نیست"}</p>
          <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted" dir="ltr">api.hesabfa.com/v1</p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {isConnected && <>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500"/>آنلاین
            </span>
            <button onClick={runTest} disabled={testing}
              className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-100 bg-white px-3 py-1.5 text-xs font-medium text-dz-a-fg-muted hover:text-dz-a-fg dark:border-dz-a-night-border dark:bg-dz-a-night-card">
              {testing?<Loader2 className="size-3.5 animate-spin"/>:<RefreshCw className="size-3.5"/>}تست
            </button>
          </>}
          <a href="/admin/settings" className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-100 bg-white px-3 py-1.5 text-xs font-medium text-dz-a-fg-muted hover:text-dz-a-fg dark:border-dz-a-night-border dark:bg-dz-a-night-card">
            <Settings2 className="size-3"/>تنظیمات
          </a>
        </div>
      </div>

      {testRes && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${testRes.ok?"bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400":"bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-400"}`}>
          {testRes.ok?<CheckCircle2 className="size-4 shrink-0"/>:<XCircle className="size-4 shrink-0"/>}{testRes.message}
        </div>
      )}

      {/* tabs — scrollable on mobile */}
      <div className="overflow-x-auto rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <div className="flex min-w-max gap-1 p-1.5">
          {TABS.map(({k,label,Icon})=>(
            <button key={k} onClick={()=>setTab(k)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${tab===k?"bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500":"text-dz-a-fg-muted hover:bg-dz-a-primary-50 hover:text-dz-a-fg dark:text-dz-a-night-muted dark:hover:bg-white/5"}`}>
              <Icon className="size-3.5"/>{label}
            </button>
          ))}
        </div>
      </div>

      {!isConnected ? <Offline/> : (
        <>
          {tab==="overview"  && <OverviewView/>}
          {tab==="invoices"  && <InvoicesView/>}
          {tab==="receipts"  && <ReceiptsView/>}
          {tab==="contacts"  && <ContactsView/>}
          {tab==="items"     && <ItemsView/>}
          {tab==="warehouse" && <WarehouseView/>}
          {tab==="transfers" && <TransfersView/>}
          {tab==="reports"   && <ReportsView/>}
          {tab==="docs"      && <DocsView/>}
          {tab==="inquiry"   && <InquiryView/>}
          {tab==="info"      && <InfoView/>}
          {tab==="sync"      && <SyncView/>}
        </>
      )}
    </div>
  );
}
