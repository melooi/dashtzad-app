"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff,
  Gauge, Network, Voicemail, Megaphone, Zap, Headset,
  RefreshCw, Copy, CheckCircle2, XCircle, AlertTriangle,
  Play, Download, User, UserPlus, Clock, BarChart3,
  ChevronDown, Settings2, Loader2,
} from "lucide-react";
import { useVoip } from "@/components/admin/VoipProvider";
import {
  fetchCallsAction,
  fetchExtensionsAction,
  fetchDashboardAction,
  fetchVoicemailsAction,
  sendOtpAction,
  type HkCallRow,
  type HkReportsResponse,
  type HkExtension,
  type HkDashboardSummary,
  type HkVoicemail,
} from "@/app/admin/santral/actions";

// ── helpers ──────────────────────────────────────────────────────────

function today(): string { return new Date().toISOString().slice(0, 10); }
function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10);
}
function fmtDur(s: string | number): string {
  if (!s || s === "00:00") return "—";
  if (typeof s === "string") return s;
  const m = Math.floor(s / 60), ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
function durToSeconds(s: string): number {
  if (!s) return 0;
  const [m, sec] = s.split(":").map(Number);
  return (m || 0) * 60 + (sec || 0);
}
function normPhone(s: string): string {
  return s.replace(/^0098/, "").replace(/^98/, "").replace(/^0/, "").slice(-10);
}
function fmtPhone(s: string): string {
  const n = normPhone(s);
  return n.replace(/(\d{4})(\d{3})(\d+)/, "0$1 $2 $3");
}

const DIR_META: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  incoming: { label: "ورودی",  color: "text-emerald-600 dark:text-emerald-400", icon: PhoneIncoming },
  outgoing: { label: "خروجی", color: "text-blue-600 dark:text-blue-400",       icon: PhoneOutgoing },
  missed:   { label: "بی‌پاسخ", color: "text-red-500 dark:text-red-400",         icon: PhoneMissed },
};

function callDir(row: HkCallRow) {
  if (row.status !== "ANSWER") return DIR_META.missed;
  return DIR_META[row.type] ?? DIR_META.incoming;
}

// ── subview definitions ───────────────────────────────────────────────

const SUBVIEWS = [
  { k: "log",       label: "دفترچهٔ تماس",       Icon: Phone },
  { k: "dashboard", label: "داشبورد",             Icon: Gauge },
  { k: "ext",       label: "داخلی‌ها",            Icon: Network },
  { k: "vm",        label: "پیام‌گیر صوتی",       Icon: Voicemail },
  { k: "broadcast", label: "تماس انبوه",          Icon: Megaphone },
  { k: "events",    label: "وب‌هوک",               Icon: Zap },
] as const;
type ViewKey = (typeof SUBVIEWS)[number]["k"];

// ── date range options ────────────────────────────────────────────────

const RANGES = [
  { label: "امروز",         from: () => today(),    to: () => today() },
  { label: "دیروز",         from: () => daysAgo(1), to: () => daysAgo(1) },
  { label: "۷ روز گذشته",  from: () => daysAgo(7), to: () => today() },
  { label: "۳۰ روز گذشته", from: () => daysAgo(30), to: () => today() },
];

// ── stat card ─────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.FC<{ className?: string }>;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dz-a-primary-100 bg-white p-4 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <div className="text-xl font-extrabold leading-none text-dz-a-fg dark:text-dz-a-night-fg">{value}</div>
        <div className="mt-0.5 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{label}</div>
      </div>
    </div>
  );
}

// ── call log view ─────────────────────────────────────────────────────

function CallLogView({ apiConnected }: { apiConnected: boolean }) {
  const { startCall } = useVoip();
  const [rangeIdx, setRangeIdx] = useState(0);
  const [tab, setTab] = useState<"all" | "incoming" | "outgoing" | "missed">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<HkReportsResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback((rIdx: number, p: number) => {
    const range = RANGES[rIdx];
    startTransition(async () => {
      const res = await fetchCallsAction(range.from(), range.to(), p);
      setResult(res);
    });
  }, []);

  useEffect(() => { if (apiConnected) load(rangeIdx, page); }, [apiConnected, load, rangeIdx, page]);

  const rows = result?.data?.rows ?? [];
  const filtered = rows.filter(r => {
    const dir = callDir(r);
    if (tab === "incoming" && dir !== DIR_META.incoming) return false;
    if (tab === "outgoing" && dir !== DIR_META.outgoing) return false;
    if (tab === "missed"   && dir !== DIR_META.missed)   return false;
    if (search) {
      const q = search.toLowerCase();
      return r.cid_num.includes(q) || r.exten.includes(q);
    }
    return true;
  });

  const total    = rows.length;
  const missed   = rows.filter(r => r.status !== "ANSWER").length;
  const answered = rows.filter(r => r.status === "ANSWER");
  const avgDur   = answered.length ? Math.round(answered.reduce((s, r) => s + durToSeconds(r.duration), 0) / answered.length) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Phone}       value={total}       label="کل تماس"           color="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" />
        <StatCard icon={PhoneMissed} value={missed}      label="بی‌پاسخ"           color="bg-red-50 text-red-500 dark:bg-red-400/10 dark:text-red-400" />
        <StatCard icon={Clock}       value={fmtDur(avgDur)} label="میانگین مدت"   color="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400" />
        <StatCard icon={User}        value={rows.filter(r => !r.cid_num).length} label="شمارهٔ ناشناس" color="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400" />
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-dz-a-primary-100 bg-white text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          {(["all", "incoming", "outgoing", "missed"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 font-medium transition-colors first:rounded-s-xl last:rounded-e-xl ${
                tab === t
                  ? "bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500"
                  : "text-dz-a-fg-muted hover:text-dz-a-fg dark:text-dz-a-night-muted"
              }`}
            >
              {{ all: "همه", incoming: "ورودی", outgoing: "خروجی", missed: "بی‌پاسخ" }[t]}
            </button>
          ))}
        </div>

        <select
          value={rangeIdx}
          onChange={e => { setRangeIdx(+e.target.value); setPage(1); }}
          className="rounded-xl border border-dz-a-primary-100 bg-white px-3 py-1.5 text-sm font-medium text-dz-a-fg dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
        >
          {RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
        </select>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجوی شماره یا داخلی…"
          className="ms-auto rounded-xl border border-dz-a-primary-100 bg-white px-3 py-1.5 text-sm text-dz-a-fg placeholder:text-dz-a-fg-ghost dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
        />

        <button
          onClick={() => load(rangeIdx, page)}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-100 bg-white px-3 py-1.5 text-sm font-medium text-dz-a-fg-muted hover:text-dz-a-fg dark:border-dz-a-night-border dark:bg-dz-a-night-card"
        >
          <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
          بارگذاری مجدد
        </button>
      </div>

      {/* error */}
      {result && !result.ok && (
        <div className="flex items-center gap-2 rounded-xl bg-dz-a-error-tint px-4 py-3 text-sm text-red-700 dark:bg-dz-a-night-error-tint dark:text-red-400">
          <XCircle className="size-4 shrink-0" />
          {result.error}
        </div>
      )}

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        {isPending ? (
          <div className="flex items-center justify-center py-16 text-dz-a-fg-muted">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-dz-a-fg-muted dark:text-dz-a-night-muted">
            در این بازه تماسی ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dz-a-primary-100 text-xs text-dz-a-fg-muted dark:border-dz-a-night-border dark:text-dz-a-night-muted">
                  <th className="px-4 py-3 text-start font-medium">نوع</th>
                  <th className="px-4 py-3 text-start font-medium">شماره</th>
                  <th className="px-4 py-3 text-start font-medium">داخلی</th>
                  <th className="px-4 py-3 text-start font-medium">مدت</th>
                  <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                  <th className="px-4 py-3 text-start font-medium">زمان</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => {
                  const dir = callDir(row);
                  const DirIcon = dir.icon;
                  return (
                    <tr key={row.uniqueid} className="border-b border-dz-a-primary-50 last:border-0 hover:bg-dz-a-primary-50/30 dark:border-dz-a-night-border dark:hover:bg-white/2">
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 font-bold ${dir.color}`}>
                          <DirIcon className="size-3.5" />{dir.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-dz-a-fg dark:text-dz-a-night-fg" dir="ltr">
                        {fmtPhone(row.cid_num) || <span className="text-dz-a-fg-ghost">ناشناس</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted" dir="ltr">
                        {row.exten || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">
                        {fmtDur(row.duration)}
                      </td>
                      <td className="px-4 py-3">
                        {row.status === "ANSWER"
                          ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">پاسخ داده شد</span>
                          : <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-400/10 dark:text-red-400">بی‌پاسخ</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">
                        {row.eventtime}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {row.cid_num && (
                            <button
                              onClick={() => startCall(row.cid_num, "")}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-400/10"
                              title="تماس خروجی"
                            >
                              <Phone className="size-3" />
                            </button>
                          )}
                          {row.file && (
                            <a href={typeof row.file === "string" ? row.file : "#"}
                              target="_blank" rel="noopener"
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:text-dz-a-night-muted dark:hover:bg-white/5"
                              title="دانلود/پخش ضبط">
                              <Play className="size-3" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* pagination */}
      {result?.data && result.data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-dz-a-fg-muted dark:text-dz-a-night-muted">
          <span>صفحهٔ {page} از {result.data.pages} · کل: {result.data.total} تماس</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-dz-a-primary-100 px-3 py-1 disabled:opacity-40 dark:border-dz-a-night-border">قبلی</button>
            <button disabled={page >= result.data.pages} onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-dz-a-primary-100 px-3 py-1 disabled:opacity-40 dark:border-dz-a-night-border">بعدی</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── dashboard view ────────────────────────────────────────────────────

function DashboardView({ apiConnected }: { apiConnected: boolean }) {
  const [data, setData] = useState<{ summary?: HkDashboardSummary; hourly?: { hour: number; count: number }[]; activeChannels?: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    if (!apiConnected) return;
    startTransition(async () => {
      setErr(null);
      const r = await fetchDashboardAction(7);
      if (r.ok) {
        setData({ summary: r.summary, hourly: r.call_statistics?.hourly_chart ?? [], activeChannels: r.system_health?.active_channels });
      } else {
        setErr(r.error ?? "خطای ناشناخته");
      }
    });
  };

  useEffect(() => { load(); }, [apiConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const s = data?.summary;
  const hourly = data?.hourly ?? [];
  const maxH = Math.max(1, ...hourly.map(h => h.count));
  const inRate = s && s.incoming_calls > 0 ? Math.round((s.answered_calls / s.incoming_calls) * 100) : 0;

  if (isPending) {
    return <div className="flex items-center justify-center py-24 text-dz-a-fg-muted"><Loader2 className="size-7 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">داشبورد · ۷ روز گذشته</span>
        <button onClick={load} className="inline-flex items-center gap-1 rounded-lg border border-dz-a-primary-200 px-2.5 py-1 text-xs text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted">
          <RefreshCw className="size-3" /> بروزرسانی
        </button>
      </div>

      {err && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-400/10 dark:text-red-400">
          <XCircle className="size-4 shrink-0" />{err}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Phone}         value={s?.total_calls ?? "—"}     label="کل تماس"    color="bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300" />
        <StatCard icon={PhoneIncoming} value={s?.incoming_calls ?? "—"}  label="ورودی"      color="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" />
        <StatCard icon={PhoneOutgoing} value={s?.outgoing_calls ?? "—"}  label="خروجی"      color="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400" />
        <StatCard icon={PhoneMissed}   value={s?.missed_calls ?? "—"}    label="بی‌پاسخ"    color="bg-red-50 text-red-500 dark:bg-red-400/10 dark:text-red-400" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Headset}       value={s?.agents_online ?? "—"}   label="اپراتور آنلاین"  color="bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400" />
        <StatCard icon={Phone}         value={s?.agents_busy ?? "—"}     label="اپراتور مشغول"   color="bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400" />
        <StatCard icon={Voicemail}     value={s?.voicemails ?? "—"}      label="پیام صوتی"       color="bg-purple-50 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400" />
        <StatCard icon={PhoneIncoming} value={data?.activeChannels ?? "—"} label="کانال فعال"    color="bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* hourly chart */}
        <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <h3 className="mb-1 text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">نمودار ساعتی تماس‌ها</h3>
          <p className="mb-4 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">۷ روز گذشته</p>
          {hourly.length > 0 ? (
            <div className="flex h-24 items-end gap-1">
              {hourly.map((h) => (
                <div key={h.hour} className="group flex flex-1 flex-col items-center gap-1" title={`${h.hour}:00 — ${h.count} تماس`}>
                  <div
                    className={`w-full rounded-t transition-all ${h.count === maxH ? "bg-dz-a-primary-500" : "bg-dz-a-primary-100 dark:bg-dz-a-primary-400/20"}`}
                    style={{ height: `${Math.round((h.count / maxH) * 100)}%`, minHeight: "2px" }}
                  />
                  <span className="text-[9px] text-dz-a-fg-ghost">{h.hour}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-dz-a-fg-ghost">داده‌ای موجود نیست</p>
          )}
        </div>

        {/* KPI */}
        <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <h3 className="mb-4 text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">شاخص‌های کلیدی</h3>
          <dl className="flex flex-col gap-3 text-sm">
            {[
              { label: "نرخ پاسخ‌گویی ورودی", value: s ? `٪${inRate}` : "—" },
              { label: "تماس پاسخ‌داده‌شده", value: s?.answered_calls ?? "—" },
              { label: "پیام صوتی", value: s?.voicemails ?? "—" },
              { label: "ورودی IVR", value: s?.ivr_entries ?? "—" },
              { label: "صف‌های فعال", value: s?.queues ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between border-b border-dz-a-primary-50 pb-2 last:border-0 dark:border-dz-a-night-border">
                <dt className="text-dz-a-fg-muted dark:text-dz-a-night-muted">{label}</dt>
                <dd className="font-bold text-dz-a-fg dark:text-dz-a-night-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

// ── extensions view ───────────────────────────────────────────────────

function ExtensionsView() {
  const [exts, setExts] = useState<HkExtension[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => startTransition(async () => {
    setErr(null);
    const r = await fetchExtensionsAction();
    if (r.ok) setExts(r.extensions ?? []);
    else setErr(r.error ?? "خطا");
  });

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const online = exts?.filter(e => e.status === "OK").length ?? 0;
  const offline = exts?.filter(e => e.status !== "OK").length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">وضعیت داخلی‌ها</span>
          {exts && (
            <span className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600"><span className="size-2 rounded-full bg-emerald-500" /> آنلاین {online}</span>
              <span className="flex items-center gap-1 text-dz-a-fg-muted dark:text-dz-a-night-muted"><span className="size-2 rounded-full bg-gray-300 dark:bg-gray-600" /> آفلاین {offline}</span>
            </span>
          )}
        </div>
        <button onClick={load} className="inline-flex items-center gap-1 rounded-lg border border-dz-a-primary-200 px-2.5 py-1 text-xs text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted">
          {isPending ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />} بروزرسانی
        </button>
      </div>

      {err && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-400/10 dark:text-red-400">
          <XCircle className="size-4 shrink-0" />{err}
        </div>
      )}

      {!exts && !err && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-dz-a-primary-50 dark:bg-dz-a-night-border" />
          ))}
        </div>
      )}

      {exts && exts.length === 0 && (
        <div className="py-12 text-center text-sm text-dz-a-fg-muted dark:text-dz-a-night-muted">
          هیچ داخلی‌ای یافت نشد.
        </div>
      )}

      {exts && exts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exts.map((ext) => {
            const online = ext.status === "OK";
            return (
              <div key={ext.number} className="flex items-center gap-3 rounded-2xl border border-dz-a-primary-100 bg-white p-4 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${online ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400" : "bg-dz-a-primary-50 text-dz-a-primary-400 dark:bg-dz-a-night-border dark:text-dz-a-night-muted"}`}>
                  {ext.internalnumber}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 shrink-0 rounded-full ${online ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                    <span className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">داخلی {ext.internalnumber}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-dz-a-fg-muted dark:text-dz-a-night-muted">
                    {online ? ext.client_ip : "آفلاین"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── voicemail view ────────────────────────────────────────────────────

function VoicemailView() {
  const [items, setItems] = useState<HkVoicemail[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => startTransition(async () => {
    setErr(null);
    const r = await fetchVoicemailsAction(30);
    if (r.ok) setItems(r.items ?? []);
    else setErr(r.error ?? "خطا");
  });

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const unread = items?.filter(v => v.isread === "no_read").length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">پیام‌گیر صوتی · ۳۰ روز</span>
          {unread > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{unread} خوانده‌نشده</span>
          )}
        </div>
        <button onClick={load} className="inline-flex items-center gap-1 rounded-lg border border-dz-a-primary-200 px-2.5 py-1 text-xs text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted">
          {isPending ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />} بروزرسانی
        </button>
      </div>

      {err && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-400/10 dark:text-red-400">
          <XCircle className="size-4 shrink-0" />{err}
        </div>
      )}

      {!items && !err && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-dz-a-primary-50 dark:bg-dz-a-night-border" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Voicemail className="size-10 text-dz-a-fg-ghost dark:text-dz-a-night-muted" />
          <p className="text-sm text-dz-a-fg-muted dark:text-dz-a-night-muted">پیام صوتی در ۳۰ روز اخیر یافت نشد.</p>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((vm) => (
            <div key={vm.key} className={`flex items-center gap-4 rounded-2xl border p-4 ${vm.isread === "no_read" ? "border-dz-a-primary-200 bg-dz-a-primary-50/50 dark:border-dz-a-primary-400/30 dark:bg-dz-a-primary-400/5" : "border-dz-a-primary-100 bg-white dark:border-dz-a-night-border dark:bg-dz-a-night-card"}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${vm.isread === "no_read" ? "bg-dz-a-primary-100 text-dz-a-primary-600 dark:bg-dz-a-primary-400/20 dark:text-dz-a-primary-300" : "bg-dz-a-primary-50 text-dz-a-fg-muted dark:bg-dz-a-night-border dark:text-dz-a-night-muted"}`}>
                <Voicemail className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg" dir="ltr">{vm.callerIdname}</span>
                  {vm.isread === "no_read" && <span className="rounded-full bg-dz-a-primary-500 px-1.5 py-0.5 text-[9px] font-bold text-white">جدید</span>}
                </div>
                <p className="mt-0.5 text-[11px] text-dz-a-fg-muted dark:text-dz-a-night-muted">
                  صندوق {vm.voicEmailBox} · {vm.date} {vm.time}
                </p>
              </div>
              {vm.recordFile && (
                <a
                  href={`/api/admin/santral/voicemail-record?file=${encodeURIComponent(vm.recordFile)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-dz-a-primary-200 bg-white px-2.5 py-1 text-xs text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-primary-300"
                  title="دانلود پیام صوتی"
                >
                  <Download className="size-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── broadcast placeholder ─────────────────────────────────────────────

function BroadcastView() {
  return (
    <div className="rounded-2xl border border-dashed border-dz-a-primary-200 bg-dz-a-primary-50/40 p-8 text-center dark:border-dz-a-night-border dark:bg-white/2">
      <Megaphone className="mx-auto mb-3 size-10 text-dz-a-fg-ghost dark:text-dz-a-night-muted" />
      <p className="text-sm font-medium text-dz-a-fg-muted dark:text-dz-a-night-muted">تماس انبوه (پیش‌ضبط)</p>
      <p className="mx-auto mt-2 max-w-sm text-xs text-dz-a-fg-faint dark:text-dz-a-night-faint">
        برای مدیریت کمپین‌های تماس انبوه با پیام صوتی پیش‌ضبط‌شده، endpoint «Send/Get pre-recorded call» همکاران باید فعال باشد.
      </p>
    </div>
  );
}

// ── webhook events view ───────────────────────────────────────────────

const EVENT_META: Record<string, { label: string; desc: string; color: string; Icon: React.FC<{ className?: string }> }> = {
  Newstate:  { label: "Newstate",  desc: "تماس ورودی/خروجی و تغییر وضعیت کانال را لحظه‌ای می‌فرستد.", color: "text-blue-600 bg-blue-50 dark:bg-blue-400/10",    Icon: Zap },
  Hangup:    { label: "Hangup",    desc: "هنگام قطع‌شدن یک مسیر ارتباطی ارسال می‌شود.",                color: "text-red-500 bg-red-50 dark:bg-red-400/10",        Icon: PhoneOff },
  Cdr:       { label: "CDR",       desc: "پس از پایان تماس، رکورد کامل (مدت، نتیجه، زمان‌ها) را می‌فرستد.", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-400/10", Icon: BarChart3 },
  voiceMail: { label: "voiceMail", desc: "پس از ثبت پیام صوتی، مسیر دسترسی به فایل را می‌فرستد.",   color: "text-amber-600 bg-amber-50 dark:bg-amber-400/10",    Icon: Voicemail },
};

function EventsView({ pbxNumber }: { pbxNumber: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhooks/hamkaran`
    : "/api/webhooks/hamkaran";
  const cidUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/cid-lookup?number=[NUMBER]`
    : "/api/cid-lookup?number=[NUMBER]";

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        {/* config card */}
        <div className="flex flex-col gap-4 rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">پیکربندی وب‌هوک</h3>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> آماده
            </span>
          </div>
          <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">
            این آدرس را در پنل سانترال همکاران به‌عنوان آدرس وب‌هوک تنظیم کنید.
            سانترال رویدادها را با متد <code className="rounded bg-dz-a-primary-50 px-1 py-0.5 font-mono text-[10px] dark:bg-white/5">POST</code> و بدنهٔ <code className="rounded bg-dz-a-primary-50 px-1 py-0.5 font-mono text-[10px] dark:bg-white/5">JSON</code> می‌فرستد.
          </p>

          <div className="rounded-xl border border-dz-a-primary-100 bg-dz-a-primary-50/40 dark:border-dz-a-night-border dark:bg-white/3">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-400">POST</span>
              <code className="flex-1 overflow-hidden text-ellipsis font-mono text-xs text-dz-a-fg dark:text-dz-a-night-fg" dir="ltr">{webhookUrl}</code>
              <button onClick={() => copy(webhookUrl, "webhook")}
                className="shrink-0 rounded-lg p-1.5 text-dz-a-fg-muted hover:bg-dz-a-primary-100 dark:text-dz-a-night-muted dark:hover:bg-white/5">
                {copied === "webhook" ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* CID Lookup */}
          <div className="rounded-xl border border-dz-a-primary-100 bg-dz-a-primary-50/40 p-3 dark:border-dz-a-night-border dark:bg-white/3">
            <div className="mb-2 flex items-center gap-2">
              <User className="size-3.5 text-dz-a-primary-500" />
              <span className="text-xs font-bold text-dz-a-fg dark:text-dz-a-night-fg">استعلام نام تماس‌گیرنده (CID Lookup)</span>
            </div>
            <p className="mb-2 text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">
              سانترال پیش از زنگ، شماره را به این آدرس می‌فرستد و نام مشتری روی تلفن نمایش داده می‌شود.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-dz-a-primary-100 bg-white px-2 py-1.5 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
              <span className="shrink-0 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black text-blue-700 dark:bg-blue-400/20 dark:text-blue-400">GET</span>
              <code className="flex-1 overflow-hidden text-ellipsis font-mono text-[10px] text-dz-a-fg dark:text-dz-a-night-fg" dir="ltr">{cidUrl}</code>
              <button onClick={() => copy(cidUrl, "cid")}
                className="shrink-0 rounded-lg p-1 text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:text-dz-a-night-muted">
                {copied === "cid" ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-dz-a-fg-faint dark:text-dz-a-night-faint">
              شماره ممکن است با پیش‌شمارهٔ ۰۰۹۸، +۹۸ یا کد شهری برسد — پنل همه را به ۱۰ رقم نرمال می‌کند.
            </p>
          </div>

          {/* event types */}
          <div className="flex flex-col divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-border">
            {Object.entries(EVENT_META).map(([key, meta]) => {
              const MetaIcon = meta.Icon;
              return (
                <div key={key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                    <MetaIcon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-dz-a-fg dark:text-dz-a-night-fg" dir="ltr">{meta.label}</p>
                    <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">{meta.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* events feed placeholder */}
        <div className="flex flex-col rounded-2xl border border-dz-a-primary-100 bg-white shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <div className="flex items-center justify-between border-b border-dz-a-primary-100 px-5 py-3.5 dark:border-dz-a-night-border">
            <div>
              <h3 className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">جریان زندهٔ رویدادها</h3>
              <p className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted">آخرین رویدادهای دریافتی از سانترال</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <Zap className="mb-3 size-8 text-dz-a-fg-ghost dark:text-dz-a-night-muted" />
            <p className="text-sm font-medium text-dz-a-fg-muted dark:text-dz-a-night-muted">در انتظار رویداد</p>
            <p className="mt-1 max-w-xs text-xs text-dz-a-fg-faint dark:text-dz-a-night-faint">
              پس از تنظیم وب‌هوک در پنل همکاران، رویدادها اینجا به‌صورت زنده نمایش داده می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── OTP modal ─────────────────────────────────────────────────────────

function OtpModal({ onClose }: { onClose: () => void }) {
  const [dest, setDest] = useState("");
  const [otp, setOtp] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const send = () => {
    startTransition(async () => {
      const res = await sendOtpAction(dest, otp);
      setResult(res);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-dz-a-primary-100 bg-white p-6 shadow-xl dark:border-dz-a-night-border dark:bg-dz-a-night-card" onClick={e => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-bold text-dz-a-fg dark:text-dz-a-night-fg">ارسال OTP صوتی</h3>
        <p className="mb-4 text-sm text-dz-a-fg-muted dark:text-dz-a-night-muted">کد از طریق تماس صوتی سانترال همکاران ارسال می‌شود.</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-dz-a-fg-muted">شمارهٔ مقصد</label>
            <input value={dest} onChange={e => setDest(e.target.value.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632)))}
              placeholder="09123456789" dir="ltr"
              className="w-full rounded-xl border border-dz-a-primary-100 px-3 py-2 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-dz-a-fg-muted">کد OTP (۴ رقمی)</label>
            <input value={otp} onChange={e => setOtp(e.target.value.slice(0, 6))} dir="ltr"
              className="w-full rounded-xl border border-dz-a-primary-100 px-3 py-2 text-sm font-mono dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg" />
          </div>
          {result && (
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${result.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400"}`}>
              {result.ok ? <CheckCircle2 className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
              {result.message}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={send} disabled={!dest || isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-dz-a-primary-600 py-2 text-sm font-bold text-white hover:bg-dz-a-primary-700 disabled:opacity-50 dark:bg-dz-a-primary-500">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              ارسال تماس صوتی
            </button>
            <button onClick={onClose} className="rounded-xl border border-dz-a-primary-100 px-4 py-2 text-sm dark:border-dz-a-night-border dark:text-dz-a-night-fg">بستن</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── offline state ─────────────────────────────────────────────────────

function OfflineState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dz-a-primary-200 bg-white px-8 py-16 text-center shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-red-50 text-red-400 dark:bg-red-400/10">
        <PhoneOff className="size-9" />
      </span>
      <h3 className="text-lg font-bold text-dz-a-fg dark:text-dz-a-night-fg">سانترال همکاران متصل نیست</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-dz-a-fg-muted dark:text-dz-a-night-muted">
        برای نمایش تماس‌ها، داشبورد، داخلی‌ها و رویدادها، کلید API وب‌سرویس سانترال همکاران باید در تنظیمات پیکربندی شود.
      </p>
      <a href="/admin/settings"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-dz-a-primary-700 dark:bg-dz-a-primary-500">
        <Settings2 className="size-4" /> تنظیمات اتصال
      </a>
    </div>
  );
}

// ── main client component ─────────────────────────────────────────────

export function SantralClient({
  isConnected,
  pbxNumber,
}: {
  isConnected: boolean;
  pbxNumber: string;
}) {
  const [view, setView] = useState<ViewKey>("log");
  const [otpOpen, setOtpOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* connection bar */}
      <div className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 shadow-xs ${
        isConnected
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5"
          : "border-dz-a-primary-100 bg-white dark:border-dz-a-night-border dark:bg-dz-a-night-card"
      }`}>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          isConnected ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400" : "bg-red-50 text-red-400 dark:bg-red-400/10"
        }`}>
          <Headset className="size-5" />
        </span>
        <div>
          <div className="text-sm font-bold text-dz-a-fg dark:text-dz-a-night-fg">
            {isConnected ? "سانترال همکاران متصل است" : "سانترال همکاران متصل نیست"}
          </div>
          {pbxNumber && (
            <div className="text-xs text-dz-a-fg-muted dark:text-dz-a-night-muted" dir="ltr">
              {pbxNumber}
            </div>
          )}
        </div>
        <div className="ms-auto flex items-center gap-2">
          {isConnected && (
            <>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" /> آنلاین
              </span>
              <button onClick={() => setOtpOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-100 bg-white px-3 py-1.5 text-xs font-medium text-dz-a-fg-muted hover:text-dz-a-fg dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-muted">
                ارسال OTP صوتی
              </button>
            </>
          )}
          <a href="/admin/settings"
            className="flex items-center gap-1.5 rounded-xl border border-dz-a-primary-100 bg-white px-3 py-1.5 text-xs font-medium text-dz-a-fg-muted hover:text-dz-a-fg dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-muted">
            <Settings2 className="size-3" /> تنظیمات
          </a>
        </div>
      </div>

      {/* subview tabs */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-dz-a-primary-100 bg-white p-1.5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        {SUBVIEWS.map(({ k, label, Icon }) => (
          <button key={k} onClick={() => setView(k)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
              view === k
                ? "bg-dz-a-primary-600 text-white dark:bg-dz-a-primary-500"
                : "text-dz-a-fg-muted hover:bg-dz-a-primary-50 hover:text-dz-a-fg dark:text-dz-a-night-muted dark:hover:bg-white/5"
            }`}>
            <Icon className="size-3.5" />{label}
          </button>
        ))}
      </div>

      {/* content */}
      {!isConnected ? (
        view === "events"
          ? <EventsView pbxNumber={pbxNumber} />
          : <OfflineState />
      ) : (
        <>
          {view === "log"       && <CallLogView apiConnected={isConnected} />}
          {view === "dashboard" && <DashboardView apiConnected={isConnected} />}
          {view === "ext"       && <ExtensionsView />}
          {view === "vm"        && <VoicemailView />}
          {view === "broadcast" && <BroadcastView />}
          {view === "events"    && <EventsView pbxNumber={pbxNumber} />}
        </>
      )}

      {/* OTP modal */}
      {otpOpen && <OtpModal onClose={() => setOtpOpen(false)} />}
    </div>
  );
}
