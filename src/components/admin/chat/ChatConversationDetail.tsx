"use client";

import {
  useEffect, useRef, useState, useTransition, useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Send, StickyNote, Paperclip, Bot, ChevronDown,
  Star, ShoppingBag, Check, CheckCircle2, Copy, X, RefreshCw,
  PackageSearch, FileText, RotateCcw, ShoppingCart, Tag, MessageCircle,
  Zap, AlertTriangle, Smile, Building2,
} from "lucide-react";
import { ChatTime } from "./ChatTime";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { CustomerProfilePanel } from "@/components/admin/chat/CustomerProfilePanel";
import {
  replyAction, noteAction, changeStatusAction,
  assignAction, assignToMeAction, assignDepartmentAction,
  markReadAction, suggestReplyAction, analyzeAction,
  executeNextActionAction, uploadChatFile,
} from "@/app/admin/chat/actions";
import type {
  AdminConversationDetail, Department, OperatorPresence,
  CannedReply, AiNextAction, ConversationSentiment, ConversationAiPriority,
} from "@/lib/chat/types";
import {
  STATUS_BADGE_TONE, STATUS_LABEL,
  SENTIMENT_LABEL, SENTIMENT_EMOJI,
  PRIORITY_LABEL, CUSTOMER_TIER_LABEL,
} from "@/lib/chat/types";
import type { ConversationStatus } from "@/generated/prisma/enums";

// ---- next-action icon map ----

const NA_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  PackageSearch, FileText, RotateCcw, ShoppingCart, Tag, MessageCircle,
};

// ---- order status labels ----

const ORDER_STATUS: Record<string, string> = {
  PENDING: "در انتظار", PAID: "پرداخت‌شده", PROCESSING: "پردازش",
  SHIPPED: "ارسال‌شد", DELIVERED: "تحویل‌داده‌شد",
  CANCELLED: "لغو‌شده", REFUNDED: "مسترد‌شده",
};

// ---- typing indicator ----

function TypingIndicator() {
  return (
    <div className="chat-typing-indicator">
      <div className="chat-typing-dots">
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
      </div>
      <span>مشتری دارد تایپ می‌کند…</span>
    </div>
  );
}

// ---- sentiment + priority chips ----

function SentimentBadge({ s }: { s: ConversationSentiment | null }) {
  if (!s) return null;
  return (
    <span className={`chat-sentiment-chip ${s.toLowerCase()}`}>
      {SENTIMENT_EMOJI[s]} {SENTIMENT_LABEL[s]}
    </span>
  );
}

function PriorityBadge({ p }: { p: ConversationAiPriority | null }) {
  if (!p) return null;
  const dot = p === "HIGH" ? "🔴" : p === "MEDIUM" ? "🟡" : "🟢";
  const cls = p === "HIGH" ? "angry" : p === "MEDIUM" ? "upset" : "neutral";
  return <span className={`chat-sentiment-chip ${cls}`}>{dot} {PRIORITY_LABEL[p]}</span>;
}

// ---- AI summary banner ----

function AiBanner({
  cv, aiEnabled, onAnalyze, analyzing,
}: {
  cv: AdminConversationDetail;
  aiEnabled: boolean;
  onAnalyze: () => void;
  analyzing: boolean;
}) {
  const [open, setOpen] = useState(true);
  const hasData = !!(cv.sentiment || cv.aiSummary || cv.topicLabel);
  if (!aiEnabled) return null;

  return (
    <div className={`chat-ai-banner${open ? " open" : ""}`}>
      <button className="chat-ai-banner-header" onClick={() => setOpen((v) => !v)}>
        <Bot size={14} className="shrink-0" style={{ color: "var(--color-dz-a-primary-600)" }} />
        <div className="chat-ai-banner-chips">
          {!hasData && <span className="text-xs opacity-60">تحلیل AI هنوز اجرا نشده</span>}
          {cv.topicLabel && <span className="chat-topic-label">{cv.topicLabel}</span>}
          <SentimentBadge s={cv.sentiment} />
          <PriorityBadge p={cv.aiPriority} />
        </div>
        <ChevronDown size={13} className={`chat-ai-banner-toggle${open ? " open" : ""}`} />
      </button>

      {open && (
        <div className="chat-ai-banner-body">
          {cv.aiSummary && (
            <p className="chat-ai-summary-text">{cv.aiSummary}</p>
          )}
          {!cv.aiSummary && (
            <p className="text-xs opacity-60">
              برای مشاهده خلاصه، احساس مشتری و اقدام پیشنهادی، تحلیل را اجرا کنید.
            </p>
          )}
          {cv.aiNextAction && (
            <NextActionBtn cvId={cv.id} action={cv.aiNextAction} />
          )}
          <button className="chat-ai-analyze-btn" onClick={onAnalyze} disabled={analyzing}>
            {analyzing
              ? <><RefreshCw size={12} className="animate-spin" /> در حال تحلیل…</>
              : <><Zap size={12} /> {hasData ? "تحلیل مجدد" : "تحلیل مکالمه"}</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

// ---- next-action button ----

function NextActionBtn({ cvId, action }: { cvId: string; action: AiNextAction }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const Icon = NA_ICONS[action.icon] ?? MessageCircle;

  return (
    <button className="chat-next-action" disabled={pending}
      onClick={() => start(async () => { await executeNextActionAction(cvId, action.template); router.refresh(); })}>
      <Icon size={14} />
      <div className="flex flex-col items-start gap-0">
        <span>{action.label}</span>
        <span className="chat-next-action-detail">{action.detail}</span>
      </div>
    </button>
  );
}

// ---- quick-actions popover ----

const QA_LIST = [
  { icon: PackageSearch, label: "ارسال کد رهگیری", template: "کد رهگیری سفارش شما: [کد]. می‌توانید از سایت پست رهگیری کنید." },
  { icon: ShoppingCart, label: "ثبت سفارش جدید", template: "برای ثبت سفارش جدید، شماره محصول مورد نظر را اعلام فرمایید." },
  { icon: FileText, label: "صدور فاکتور رسمی", template: "برای فاکتور رسمی، نام شرکت و شناسه ملی را ارسال فرمایید." },
  { icon: RotateCcw, label: "ثبت مرجوعی", template: "برای مرجوعی، شماره سفارش و دلیل را اعلام کنید. ظرف ۲۴ ساعت پیگیری می‌شود." },
  { icon: Tag, label: "قیمت عمده", template: "لیست قیمت عمده دشت‌زاد را ارسال می‌کنیم. لطفاً ایمیل یا واتساپ خود را بفرستید." },
];

function QuickActions({ onInsert, onClose }: { onInsert: (t: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={ref} className="chat-quick-actions-popover">
      {QA_LIST.map((qa) => {
        const Icon = qa.icon;
        return (
          <button key={qa.label} className="chat-quick-action-item"
            onClick={() => { onInsert(qa.template); onClose(); }}>
            <Icon size={13} className="icon" />
            {qa.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- attachment preview ----

function AttView({ att }: { att: NonNullable<AdminConversationDetail["messages"][number]["attachment"]> }) {
  if (att.mime.startsWith("image/")) {
    return (
      <a href={att.url} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <img src={att.url} alt={att.name} className="max-h-44 rounded-lg object-cover" />
      </a>
    );
  }
  return (
    <a href={att.url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs underline mt-1 opacity-80">
      <Paperclip size={11} />{att.name}
    </a>
  );
}

// ---- main ----

export function ChatConversationDetail({
  conversation: cv,
  presence,
  departments,
  cannedReplies,
  aiEnabled,
  currentUserId,
}: {
  conversation: AdminConversationDetail;
  presence: OperatorPresence[];
  departments: Department[];
  cannedReplies: CannedReply[];
  aiEnabled: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [att, setAtt] = useState<{ url: string; name: string; mime: string; size: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiPending, setAiPending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [cannedOpen, setCannedOpen] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [, start] = useTransition();

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const readDone = useRef(false);

  // mark read once + poll
  useEffect(() => {
    if (!readDone.current) {
      readDone.current = true;
      markReadAction(cv.id).then(() => router.refresh());
    }
  }, [cv.id, router]);
  useEffect(() => { readDone.current = false; }, [cv.id]);
  useEffect(() => { const id = setInterval(() => router.refresh(), 10_000); return () => clearInterval(id); }, [router]);

  // scroll to bottom on new messages
  useEffect(() => { listEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [cv.messages.length]);

  const send = useCallback(() => {
    const body = draft.trim();
    if (!body && !att) return;
    setErr(null);
    start(async () => {
      try {
        if (mode === "reply") await replyAction(cv.id, body, att);
        else await noteAction(cv.id, body);
        setDraft(""); setAtt(null);
        router.refresh();
      } catch (e) { setErr(String(e)); }
    });
  }, [draft, att, mode, cv.id, router]);

  const setStatus = useCallback((s: ConversationStatus) => {
    start(async () => { await changeStatusAction(cv.id, s); router.refresh(); });
  }, [cv.id, router]);

  const assign = useCallback((userId: string | null) => {
    start(async () => { await assignAction(cv.id, userId); router.refresh(); });
  }, [cv.id, router]);

  const assignDept = useCallback((deptId: string | null) => {
    start(async () => { await assignDepartmentAction(cv.id, deptId); router.refresh(); });
  }, [cv.id, router]);

  const runAiSuggest = useCallback(async () => {
    setAiPending(true); setErr(null);
    const res = await suggestReplyAction(cv.id);
    setAiPending(false);
    if (res.ok) { setDraft(res.draft); composerRef.current?.focus(); }
    else setErr(res.error);
  }, [cv.id]);

  const runAnalyze = useCallback(async () => {
    setAnalyzing(true); setErr(null);
    const res = await analyzeAction(cv.id);
    setAnalyzing(false);
    if (!res.ok) setErr(res.error);
    else router.refresh();
  }, [cv.id, router]);

  const onFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await uploadChatFile(fd);
    setUploading(false);
    if (res?.url) setAtt({ url: res.url, name: file.name, mime: file.type, size: file.size });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const msgs = cv.messages;

  return (
    <div className="flex h-full overflow-hidden">
      {/* main thread */}
      <div className={`flex flex-col overflow-hidden transition-all duration-200 ${profileOpen ? "flex-1" : "flex-1"}`}
        style={{ minWidth: 0 }}>
      {/* wrapper trick: inner content always flex-col, profile sits beside it */}

      {/* ── HEADER ── */}
      <div className="flex flex-col border-b border-(--color-dz-a-border) bg-dz-a-canvas">
        {/* top row */}
        <div className="flex items-center gap-2 px-4 py-3">
          <a href="/admin/chat"
            className="lg:hidden p-1.5 rounded text-(--color-dz-a-text-muted) hover:bg-dz-a-cream transition-colors">
            <ArrowRight size={16} />
          </a>

          {/* avatar — click to open customer profile */}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            title="پروفایل مشتری"
            className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white ring-2 ring-transparent transition-all hover:ring-dz-a-primary-400"
            style={{ background: "var(--color-dz-a-primary-600)" }}>
            {cv.displayName.charAt(0)}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-(--color-dz-a-text) truncate">{cv.displayName}</span>
              <AdminStatusBadge tone={STATUS_BADGE_TONE[cv.status]}>{STATUS_LABEL[cv.status]}</AdminStatusBadge>
              {cv.isGuest && (
                <span className="text-[0.65rem] bg-dz-a-cream border border-(--color-dz-a-border) px-1.5 py-0.5 rounded text-(--color-dz-a-text-muted)">
                  مهمان
                </span>
              )}
              {cv.customerTier && cv.customerTier !== "NEW_CUSTOMER" && (
                <span className={`chat-tier-chip ${cv.customerTier.toLowerCase()}`}>
                  {CUSTOMER_TIER_LABEL[cv.customerTier]}
                </span>
              )}
            </div>
            {cv.phone && (
              <a href={`tel:${cv.phone}`}
                className="text-xs text-(--color-dz-a-text-muted) hover:text-dz-a-primary-600 transition-colors">
                {cv.phone}
              </a>
            )}
          </div>

          {/* header actions */}
          <button onClick={() => { navigator.clipboard.writeText(`${location.origin}/admin/chat/${cv.id}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            title="کپی لینک"
            className="p-1.5 rounded text-(--color-dz-a-text-muted) hover:bg-dz-a-cream transition-colors">
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
          <button onClick={() => setInfoOpen((v) => !v)} title="سفارشات مشتری"
            className={`p-1.5 rounded transition-colors ${infoOpen ? "text-white" : "text-(--color-dz-a-text-muted) hover:bg-dz-a-cream"}`}
            style={infoOpen ? { background: "var(--color-dz-a-primary-600)" } : {}}>
            <ShoppingBag size={14} />
          </button>
        </div>

        {/* status / assign row */}
        <div className="flex items-center gap-1.5 px-4 pb-3 flex-wrap">
          {cv.status !== "RESOLVED" ? (
            <>
              {cv.status !== "OPEN" && (
                <button onClick={() => setStatus("OPEN")}
                  className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-700">
                  باز کردن
                </button>
              )}
              {cv.status !== "PENDING" && (
                <button onClick={() => setStatus("PENDING")}
                  className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-700">
                  در انتظار
                </button>
              )}
              <button onClick={() => setStatus("RESOLVED")}
                className="text-xs px-2.5 py-1 rounded-md bg-dz-a-cream text-(--color-dz-a-text-muted) border border-(--color-dz-a-border) hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                حل شد ✓
              </button>
            </>
          ) : (
            <button onClick={() => setStatus("OPEN")}
              className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
              بازگشایی
            </button>
          )}

          <div className="flex-1" />

          {cv.assignedToId !== currentUserId && (
            <button onClick={() => start(async () => { await assignToMeAction(cv.id); router.refresh(); })}
              className="text-xs px-2.5 py-1 rounded-md border border-(--color-dz-a-border) text-(--color-dz-a-text-muted) hover:bg-dz-a-cream transition-colors">
              تخصیص به من
            </button>
          )}

          <select className="text-xs border border-(--color-dz-a-border) bg-dz-a-canvas text-(--color-dz-a-text) rounded-md px-2 py-1 outline-none"
            value={cv.assignedToId ?? ""} onChange={(e) => assign(e.target.value || null)}>
            <option value="">بدون اپراتور</option>
            {presence.map((op) => (
              <option key={op.id} value={op.id}>{op.online ? "🟢 " : "⚪ "}{op.name}</option>
            ))}
          </select>

          {departments.length > 0 && (
            <select className="text-xs border border-(--color-dz-a-border) bg-dz-a-canvas text-(--color-dz-a-text) rounded-md px-2 py-1 outline-none"
              value={cv.departmentId ?? ""} onChange={(e) => assignDept(e.target.value || null)}>
              <option value="">بدون دپارتمان</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </div>

        {/* info/orders panel */}
        {infoOpen && (
          <div className="border-t border-(--color-dz-a-border) px-4 py-3 bg-dz-a-cream">
            {cv.rating !== null && (
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < (cv.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                ))}
                {cv.ratingComment && <span className="text-xs text-(--color-dz-a-text-muted) mr-1">{cv.ratingComment}</span>}
              </div>
            )}
            {cv.orders.length > 0 ? (
              <ul className="space-y-1.5">
                {cv.orders.map((o) => (
                  <li key={o.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-(--color-dz-a-text-muted)">{o.code}</span>
                    <span className="text-(--color-dz-a-text)">{ORDER_STATUS[o.status] ?? o.status}</span>
                    <span className="mr-auto text-(--color-dz-a-text-muted)">{o.totalRial.toLocaleString("fa-IR")} ت</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-(--color-dz-a-text-muted)">سفارشی ثبت نشده</p>
            )}
          </div>
        )}
      </div>

      {/* ── AI BANNER ── */}
      <AiBanner cv={cv} aiEnabled={aiEnabled} onAnalyze={runAnalyze} analyzing={analyzing} />

      {/* ── MESSAGE LIST ── */}
      <div ref={scrollRef} onScroll={() => {
        const el = scrollRef.current;
        if (el) setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight > 240);
      }} className="cv-msg-list">

        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const next = msgs[i + 1];
          const showDay = !prev || new Date(m.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
          // grouping: same role, same sender, within 5 minutes
          const GROUP_MS = 5 * 60 * 1000;
          const sameAsPrev = !showDay && prev && !prev.isInternalNote && prev.role === m.role && prev.role === m.role &&
            (new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime()) < GROUP_MS;
          const sameAsNext = next && !next.isInternalNote && next.role === m.role && next.role === m.role &&
            (new Date(next.createdAt).getTime() - new Date(m.createdAt).getTime()) < GROUP_MS;
          // position within group: first / mid / last / single
          const pos = sameAsPrev ? (sameAsNext ? "mid" : "last") : (sameAsNext ? "first" : "single");

          return (
            <div key={m.id} className={`cv-msg-entry${sameAsPrev ? " grouped" : ""}`}>
              {showDay && (
                <div className="cv-day-sep">
                  <span className="cv-day-label">
                    {new Date(m.createdAt).toLocaleDateString("fa-IR", { month: "long", day: "numeric" })}
                  </span>
                </div>
              )}

              {m.isInternalNote ? (
                <div className="cv-note-row">
                  <div className="cv-note-bubble">
                    <div className="cv-note-header">
                      <StickyNote size={11} />
                      یادداشت داخلی
                      {m.authorName && <span className="cv-note-author">— {m.authorName}</span>}
                      <span className="cv-note-time"><ChatTime iso={m.createdAt} /></span>
                    </div>
                    <p className="cv-note-body">{m.body}</p>
                    {m.attachment && <AttView att={m.attachment} />}
                  </div>
                </div>
              ) : m.role === "SYSTEM" ? (
                <div className="cv-system-msg">
                  <span>{m.body}</span>
                </div>
              ) : m.role === "VISITOR" ? (
                <div className={`cv-bubble-row visitor pos-${pos}`}>
                  <div className="cv-bubble visitor">
                    <p className="cv-bubble-text">{m.body}</p>
                    {m.attachment && <AttView att={m.attachment} />}
                    {(!sameAsNext || m.attachment) && (
                      <span className="cv-bubble-time"><ChatTime iso={m.createdAt} /></span>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`cv-bubble-row operator pos-${pos}`}>
                  <div className="cv-bubble operator">
                    {!sameAsPrev && m.authorName && (
                      <span className="cv-bubble-author">{m.authorName}</span>
                    )}
                    <p className="cv-bubble-text">{m.body}</p>
                    {m.attachment && <AttView att={m.attachment} />}
                    {(!sameAsNext || m.attachment) && (
                      <div className="cv-bubble-footer">
                        <span className="cv-bubble-time"><ChatTime iso={m.createdAt} /></span>
                        {i === msgs.length - 1 && (
                          cv.seenByVisitor ? (
                            <CheckCircle2 size={11} className="opacity-80" />
                          ) : (
                            <Check size={11} className="opacity-60" />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {cv.visitorTypingAt && <TypingIndicator />}
        <div ref={listEndRef} />

        {showJump && (
          <button
            onClick={() => listEndRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="sticky bottom-2 float-left ml-2 w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: "var(--color-dz-a-primary-600)" }}>
            <ChevronDown size={15} />
          </button>
        )}
      </div>

      {/* ── COMPOSER ── */}
      <div className="cv-composer">
        {err && (
          <div className="cv-composer-error">
            <AlertTriangle size={13} />
            {err}
            <button onClick={() => setErr(null)} className="mr-auto"><X size={12} /></button>
          </div>
        )}

        {/* canned replies dropdown */}
        {cannedOpen && cannedReplies.length > 0 && (
          <div className="cv-canned-list">
            {cannedReplies.map((cr, idx) => (
              <button key={idx}
                onClick={() => { setDraft(cr.body); setCannedOpen(false); composerRef.current?.focus(); }}
                className="cv-canned-item">
                <span className="cv-canned-title">{cr.title}</span>
                <span className="cv-canned-preview">{cr.body}</span>
              </button>
            ))}
          </div>
        )}

        {/* attachment preview */}
        {att && (
          <div className="cv-att-preview">
            <Paperclip size={12} />
            <span className="flex-1 truncate">{att.name}</span>
            <button onClick={() => setAtt(null)}><X size={12} /></button>
          </div>
        )}

        {/* textarea + mode indicator */}
        <div className={`cv-composer-field${mode === "note" ? " note-mode" : ""}`}>
          {mode === "note" && (
            <div className="cv-composer-note-label">
              <StickyNote size={11} /> یادداشت داخلی
            </div>
          )}
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={mode === "reply" ? "پاسخ بنویسید… (Enter ارسال)" : "یادداشت برای تیم…"}
            rows={3} dir="rtl"
            className="cv-composer-textarea"
          />
        </div>

        {/* action bar */}
        <div className="cv-composer-bar">
          {/* left tools */}
          <div className="cv-composer-tools">
            {/* mode toggle — pill segmented control */}
            <div className="cv-mode-toggle">
              <button onClick={() => setMode("reply")} className={`cv-mode-btn${mode === "reply" ? " active" : ""}`}>
                <Send size={11} /> پاسخ
              </button>
              <button onClick={() => setMode("note")} className={`cv-mode-btn note${mode === "note" ? " active" : ""}`}>
                <StickyNote size={11} /> یادداشت
              </button>
            </div>

            <div className="cv-tools-sep" />

            {/* canned */}
            <button onClick={() => setCannedOpen((v) => !v)} title="پیام‌های آماده"
              className={`cv-tool-btn${cannedOpen ? " active" : ""}`}>
              <Smile size={15} />
            </button>

            {/* quick actions */}
            <div className="relative">
              <button onClick={() => setQaOpen((v) => !v)} title="اقدامات سریع"
                className={`cv-tool-btn${qaOpen ? " active" : ""}`}>
                <Building2 size={15} />
              </button>
              {qaOpen && (
                <QuickActions
                  onInsert={(t) => { setDraft(t); composerRef.current?.focus(); }}
                  onClose={() => setQaOpen(false)}
                />
              )}
            </div>

            {/* file upload */}
            <button onClick={() => fileRef.current?.click()} title="پیوست" disabled={uploading}
              className="cv-tool-btn disabled:opacity-40">
              {uploading ? <RefreshCw size={15} className="animate-spin" /> : <Paperclip size={15} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onFile} />

            {/* AI suggest */}
            {aiEnabled && mode === "reply" && (
              <button onClick={runAiSuggest} disabled={aiPending} title="پیشنهاد AI" className="cv-tool-btn disabled:opacity-40">
                {aiPending ? <RefreshCw size={15} className="animate-spin" /> : <Bot size={15} />}
              </button>
            )}
          </div>

          {/* send */}
          <button onClick={send} disabled={!draft.trim() && !att} className="cv-send-btn">
            {mode === "reply" ? <><Send size={13} /> ارسال</> : <><StickyNote size={13} /> ثبت</>}
          </button>
        </div>
      </div>
      </div>{/* end main thread wrapper */}

      {/* customer profile panel — slides in from the end (right in RTL) */}
      {profileOpen && (
        <div
          className="shrink-0 border-s border-(--color-dz-a-border)"
          style={{ width: "22rem", overflow: "hidden" }}>
          <CustomerProfilePanel cv={cv} onClose={() => setProfileOpen(false)} />
        </div>
      )}
    </div>
  );
}
