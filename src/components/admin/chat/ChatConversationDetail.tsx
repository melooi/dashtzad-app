"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Send,
  Loader2,
  User,
  Phone,
  CheckCircle2,
  Clock,
  MessageCircle,
  RotateCcw,
  UserCog,
  StickyNote,
  Sparkles,
  Paperclip,
  X,
  Copy,
  Check,
  ChevronDown,
  Star,
  ShoppingBag,
  ArrowDown,
  Reply,
  Bookmark,
  FileText,
} from "lucide-react";
import { formatTimeFa, formatJalali } from "@/lib/date";
import { formatToman } from "@/lib/price";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { uploadChatFile } from "@/lib/chat/upload-client";
import {
  STATUS_LABEL,
  STATUS_BADGE_TONE,
  TIER_LABEL,
  TIER_CLS,
  getCustomerTier,
  type AdminConversationDetail,
  type ConversationStatus,
  type CannedReply,
  type Department,
  type OperatorPresence,
  type ChatAttachment,
  type AiConvInsight,
} from "@/lib/chat/types";
import {
  replyAction,
  noteAction,
  changeStatusAction,
  assignAction,
  assignToMeAction,
  assignDepartmentAction,
  markReadAction,
  suggestReplyAction,
  getAiInsightAction,
} from "@/app/admin/chat/actions";

const REFRESH_MS = 10000;

const STATUS_ACTIONS: { status: ConversationStatus; label: string; icon: typeof Clock }[] = [
  { status: "OPEN", label: "باز", icon: MessageCircle },
  { status: "PENDING", label: "در انتظار", icon: Clock },
  { status: "RESOLVED", label: "حل‌شده", icon: CheckCircle2 },
];

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌شده",
  CANCELLED: "لغوشده",
  REFUNDED: "مرجوعی",
};

const SENTIMENT_LABEL: Record<string, string> = {
  angry: "عصبانی",
  upset: "ناراضی",
  neutral: "خنثی",
  happy: "راضی",
};

const SENTIMENT_CLS: Record<string, string> = {
  angry: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  upset: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  neutral: "bg-dz-primary-50 text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted",
  happy: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
};

type Attach = NonNullable<ChatAttachment>;

function waitTimerCls(waitTime: string): string {
  const [m] = waitTime.split(":");
  const mins = parseInt(m ?? "0", 10);
  if (mins >= 30) return "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400";
  if (mins >= 15) return "border-dz-warning/30 bg-dz-warning/10 text-dz-warning dark:text-dz-warning-300";
  return "border-green-200 bg-green-50 text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400";
}

export function ChatConversationDetail({
  conversation,
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
  const [attachment, setAttachment] = useState<Attach | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiPending, setAiPending] = useState(false);
  const [cannedOpen, setCannedOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // new state
  const [insight, setInsight] = useState<AiConvInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightExpanded, setInsightExpanded] = useState(false);
  const [suggestExpanded, setSuggestExpanded] = useState(false);
  const [waitTime, setWaitTime] = useState<string | null>(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [qaOpen, setQaOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [assignMenuOpen, setAssignMenuOpen] = useState(false);

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const readRef = useRef<string | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const assignMenuRef = useRef<HTMLDivElement>(null);
  const qaRef = useRef<HTMLDivElement>(null);
  const cannedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (readRef.current === conversation.id) return;
    readRef.current = conversation.id;
    markReadAction(conversation.id).then(() => router.refresh());
  }, [conversation.id, router]);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length]);

  // reset insight state when conversation changes
  useEffect(() => {
    setInsight(null);
    setInsightLoading(false);
    setInsightExpanded(false);
    setSuggestExpanded(false);
    setWaitTime(null);
  }, [conversation.id]);

  // live wait timer — counts time since last visitor message
  useEffect(() => {
    const msgs = conversation.messages;
    const lastMsg = msgs.at(-1);
    if (!lastMsg || lastMsg.role !== "VISITOR" || lastMsg.isInternalNote || conversation.status === "RESOLVED") {
      setWaitTime(null);
      return;
    }
    const t0 = new Date(lastMsg.createdAt).getTime();
    const tick = () => {
      const sec = Math.max(0, Math.floor((Date.now() - t0) / 1000));
      const m = Math.floor(sec / 60).toString().padStart(2, "0");
      const s = (sec % 60).toString().padStart(2, "0");
      setWaitTime(`${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [conversation.messages, conversation.status]);

  // close menus on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) setStatusMenuOpen(false);
      if (assignMenuRef.current && !assignMenuRef.current.contains(e.target as Node)) setAssignMenuOpen(false);
      if (qaRef.current && !qaRef.current.contains(e.target as Node)) setQaOpen(false);
      if (cannedRef.current && !cannedRef.current.contains(e.target as Node)) setCannedOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const lastOperatorId = [...conversation.messages].reverse().find((m) => m.role === "OPERATOR" && !m.isInternalNote)?.id;
  const isMine = conversation.assignedToId === currentUserId;
  const isResolved = conversation.status === "RESOLVED";

  const send = () => {
    const body = draft.trim();
    if ((!body && !attachment) || pending) return;
    setError(null);
    setSlashOpen(false);
    startTransition(async () => {
      const res =
        mode === "note"
          ? await noteAction(conversation.id, body)
          : await replyAction(conversation.id, body, attachment ?? undefined);
      if (res.ok) {
        setDraft("");
        setAttachment(null);
        router.refresh();
        setTimeout(() => composerRef.current?.focus(), 30);
      } else {
        setError(res.error);
      }
    });
  };

  const setStatus = (status: ConversationStatus) =>
    startTransition(async () => {
      await changeStatusAction(conversation.id, status);
      router.refresh();
    });

  const assign = (userId: string) =>
    startTransition(async () => {
      await assignAction(conversation.id, userId || null);
      router.refresh();
    });

  const assignDept = (departmentId: string) =>
    startTransition(async () => {
      await assignDepartmentAction(conversation.id, departmentId || null);
      router.refresh();
    });

  const assignMe = () =>
    startTransition(async () => {
      await assignToMeAction(conversation.id);
      router.refresh();
    });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const res = await uploadChatFile(file);
    setUploading(false);
    if (res.ok) setAttachment(res.attachment);
    else setError(res.error);
    if (fileRef.current) fileRef.current.value = "";
  };

  const runAi = () => {
    setAiPending(true);
    setError(null);
    suggestReplyAction(conversation.id).then((res) => {
      setAiPending(false);
      if (res.ok) {
        setMode("reply");
        setDraft(res.draft);
        setTimeout(() => composerRef.current?.focus(), 30);
      } else {
        setError(res.error);
      }
    });
  };

  const loadInsight = () => {
    if (insight || insightLoading) return;
    setInsightLoading(true);
    getAiInsightAction(conversation.id).then((res) => {
      setInsightLoading(false);
      if (res.ok) {
        const { ok: _ok, ...data } = res;
        setInsight(data);
        setInsightExpanded(true);
        setSuggestExpanded(true);
      }
    });
  };

  const insertCanned = (body: string) => {
    setMode("reply");
    setDraft((d) => (d.trim() ? `${d}\n${body}` : body));
    setCannedOpen(false);
    setSlashOpen(false);
    setTimeout(() => composerRef.current?.focus(), 30);
  };

  const insertSuggestion = (body: string) => {
    setMode("reply");
    setDraft(body);
    setSuggestExpanded(false);
    setTimeout(() => composerRef.current?.focus(), 30);
  };

  const handleDraftChange = (val: string) => {
    setDraft(val);
    const slash = /^\/(\w*)$/.exec(val);
    if (slash && cannedReplies.length > 0) {
      setSlashQuery((slash[1] ?? "").toLowerCase());
      setSlashOpen(true);
    } else {
      setSlashOpen(false);
    }
    // typing indicator
    if (val.trim() && mode === "reply") {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500);
    } else {
      setIsTyping(false);
    }
  };

  const slashFiltered = slashOpen
    ? cannedReplies
        .filter(
          (c) =>
            c.shortcut.toLowerCase().includes(slashQuery) ||
            c.title.toLowerCase().includes(slashQuery) ||
            c.body.toLowerCase().includes(slashQuery),
        )
        .slice(0, 8)
    : [];

  const copyLink = () => {
    try {
      navigator.clipboard.writeText(`${window.location.origin}/admin/chat/${conversation.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight > 240);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ===== HEADER ===== */}
      <div className="flex-shrink-0 border-b border-dz-primary-100 bg-white dark:border-dz-night-border dark:bg-dz-night-card">
        <div className="flex items-center gap-2 px-3 py-3">
          <Link
            href="/admin/chat"
            aria-label="بازگشت به فهرست"
            className="focus-ring grid size-8 shrink-0 place-items-center rounded-xl text-dz-primary-500 transition-colors hover:bg-dz-primary-50 lg:hidden dark:text-dz-night-muted dark:hover:bg-white/5"
          >
            <ArrowRight className="size-4" aria-hidden />
          </Link>

          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-dz-primary-50 text-dz-primary-600 dark:bg-white/5 dark:text-dz-night-fg">
            <User className="size-5" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="font-heading text-sm font-bold text-dz-primary-800 dark:text-dz-night-fg">
                {conversation.displayName}
              </h2>

              {/* status dropdown */}
              <div className="relative" ref={statusMenuRef}>
                <button
                  type="button"
                  onClick={() => setStatusMenuOpen((v) => !v)}
                  disabled={pending}
                  className="focus-ring inline-flex items-center gap-0.5 rounded-full border border-transparent py-0.5 pe-1 ps-0.5 text-xs transition-colors hover:border-dz-primary-100 hover:bg-dz-primary-50 dark:hover:bg-white/5"
                >
                  <AdminStatusBadge tone={STATUS_BADGE_TONE[conversation.status]}>
                    {STATUS_LABEL[conversation.status]}
                  </AdminStatusBadge>
                  <ChevronDown
                    className={`size-3 text-dz-primary-400 transition-transform ${statusMenuOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {statusMenuOpen && (
                  <div className="absolute start-0 top-full z-30 mt-1 w-36 overflow-hidden rounded-xl border border-dz-primary-100 bg-white p-1 shadow-lg dark:border-dz-night-border dark:bg-dz-night-elevated">
                    {STATUS_ACTIONS.map((a) => (
                      <button
                        key={a.status}
                        type="button"
                        onClick={() => {
                          setStatus(a.status);
                          setStatusMenuOpen(false);
                        }}
                        disabled={pending || conversation.status === a.status}
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                          conversation.status === a.status
                            ? "bg-dz-primary-50 text-dz-primary-700 dark:bg-white/5 dark:text-dz-night-fg"
                            : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                        }`}
                      >
                        <a.icon className="size-3.5" aria-hidden />
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!conversation.isGuest && (() => {
                const tier = getCustomerTier(conversation.orders.length);
                return (
                  <span className={`rounded-full px-2 py-0.5 text-[0.58rem] font-bold ${TIER_CLS[tier]}`}>
                    {TIER_LABEL[tier]}
                  </span>
                );
              })()}
              {conversation.departmentName && (
                <span className="rounded-full bg-dz-primary-50 px-2 py-0.5 text-[0.62rem] font-medium text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted">
                  {conversation.departmentName}
                </span>
              )}
              {conversation.rating != null && (
                <span className="inline-flex items-center gap-0.5 text-[0.68rem] font-bold text-dz-warning dark:text-dz-warning-300">
                  <Star className="size-3 fill-current" aria-hidden />
                  {conversation.rating}/۵
                </span>
              )}
              {waitTime && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-bold tabular-nums ${waitTimerCls(waitTime)}`}
                >
                  <Clock className="size-3" aria-hidden />
                  {waitTime}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.7rem] text-dz-primary-400 dark:text-dz-night-faint">
              {conversation.phone && (
                <a
                  href={`tel:${conversation.phone}`}
                  dir="ltr"
                  className="inline-flex items-center gap-1 hover:text-dz-primary-600"
                >
                  <Phone className="size-3" aria-hidden />
                  {conversation.phone}
                </a>
              )}
              <span>{conversation.source === "storefront" ? "فروشگاه" : conversation.source}</span>
              <span suppressHydrationWarning>{formatJalali(conversation.createdAt)}</span>
            </div>
          </div>

          {/* tools */}
          <div className="flex shrink-0 items-center gap-0.5">
            {/* assign dropdown */}
            <div className="relative" ref={assignMenuRef}>
              <button
                type="button"
                onClick={() => setAssignMenuOpen((v) => !v)}
                title="اختصاص و دپارتمان"
                aria-label="اختصاص و دپارتمان"
                className={`focus-ring grid size-8 place-items-center rounded-xl transition-colors ${
                  assignMenuOpen
                    ? "bg-dz-primary-100 text-dz-primary-700 dark:bg-white/10 dark:text-dz-night-fg"
                    : "text-dz-primary-500 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                }`}
              >
                <UserCog className="size-3.5" aria-hidden />
              </button>
              {assignMenuOpen && (
                <div className="absolute end-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-dz-primary-100 bg-white p-1.5 shadow-xl dark:border-dz-night-border dark:bg-dz-night-elevated">
                  <p className="px-2.5 pb-1 pt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-dz-primary-400 dark:text-dz-night-faint">
                    اپراتور
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      assignMe();
                      setAssignMenuOpen(false);
                    }}
                    disabled={pending || isMine}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      isMine
                        ? "bg-dz-primary-50 text-dz-primary-700 dark:bg-white/5 dark:text-dz-night-fg"
                        : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                    }`}
                  >
                    {isMine ? "به من واگذار شده" : "به من واگذار کن"}
                  </button>
                  {presence.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        assign(op.id);
                        setAssignMenuOpen(false);
                      }}
                      disabled={pending || conversation.assignedToId === op.id}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                        conversation.assignedToId === op.id
                          ? "bg-dz-primary-50 font-bold text-dz-primary-700 dark:bg-white/5 dark:text-dz-night-fg"
                          : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`size-2 rounded-full ${op.online ? "bg-green-500" : "bg-dz-primary-200 dark:bg-white/20"}`}
                      />
                      {op.name}
                    </button>
                  ))}
                  {departments.length > 0 && (
                    <>
                      <div className="my-1.5 border-t border-dz-primary-100 dark:border-dz-night-line" />
                      <p className="px-2.5 pb-1 pt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-dz-primary-400 dark:text-dz-night-faint">
                        دپارتمان
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          assignDept("");
                          setAssignMenuOpen(false);
                        }}
                        disabled={pending}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                      >
                        بدون دپارتمان
                      </button>
                      {departments.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            assignDept(d.id);
                            setAssignMenuOpen(false);
                          }}
                          disabled={pending || conversation.departmentId === d.id}
                          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                            conversation.departmentId === d.id
                              ? "bg-dz-primary-50 font-bold text-dz-primary-700 dark:bg-white/5 dark:text-dz-night-fg"
                              : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                          }`}
                        >
                          {d.color && (
                            <span className="size-2 rounded-full" style={{ background: d.color }} />
                          )}
                          {d.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* orders toggle */}
            <button
              type="button"
              onClick={() => setInfoOpen((v) => !v)}
              aria-expanded={infoOpen}
              title="سفارش‌ها"
              aria-label="سفارش‌ها"
              className={`focus-ring grid size-8 place-items-center rounded-xl transition-colors ${
                infoOpen
                  ? "bg-dz-primary-100 text-dz-primary-700 dark:bg-white/10 dark:text-dz-night-fg"
                  : "text-dz-primary-500 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
              }`}
            >
              <ShoppingBag className="size-3.5" aria-hidden />
            </button>

            {/* copy link */}
            <button
              type="button"
              onClick={copyLink}
              title="کپی لینک"
              aria-label="کپی لینک"
              className="focus-ring grid size-8 place-items-center rounded-xl text-dz-primary-500 transition-colors hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
            >
              {copied ? (
                <Check className="size-3.5 text-dz-success" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
            </button>

            {/* resolve / reopen */}
            <button
              type="button"
              onClick={() => setStatus(isResolved ? "OPEN" : "RESOLVED")}
              disabled={pending}
              title={isResolved ? "بازگشایی گفت‌وگو" : "حل و بستن گفت‌وگو"}
              aria-label={isResolved ? "بازگشایی گفت‌وگو" : "حل و بستن گفت‌وگو"}
              className={`focus-ring grid size-8 place-items-center rounded-xl transition-colors disabled:opacity-50 ${
                isResolved
                  ? "text-dz-warning hover:bg-dz-warning/10 dark:text-dz-warning-300"
                  : "text-dz-success hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10"
              }`}
            >
              {isResolved ? <RotateCcw className="size-3.5" aria-hidden /> : <CheckCircle2 className="size-3.5" aria-hidden />}
            </button>
          </div>
        </div>

        {/* collapsible orders panel */}
        {infoOpen && (
          <div className="border-t border-dz-primary-100 px-4 pb-3 pt-2.5 dark:border-dz-night-line">
            {conversation.rating != null && (
              <div className="mb-2 flex items-center gap-2 text-xs text-dz-primary-600 dark:text-dz-night-muted">
                <span className="inline-flex items-center gap-0.5 text-dz-warning dark:text-dz-warning-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < (conversation.rating ?? 0) ? "fill-current" : "opacity-30"}`}
                      aria-hidden
                    />
                  ))}
                </span>
                {conversation.ratingComment && <span>«{conversation.ratingComment}»</span>}
              </div>
            )}
            <p className="mb-1.5 text-xs font-bold text-dz-primary-700 dark:text-dz-night-fg">سفارش‌های اخیر</p>
            {conversation.orders.length === 0 ? (
              <p className="text-xs text-dz-primary-400 dark:text-dz-night-faint">
                {conversation.isGuest ? "مشتری مهمان — سفارشی ثبت نشده." : "سفارشی یافت نشد."}
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {conversation.orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-dz-primary-100 bg-dz-canvas px-3 py-2 text-xs dark:border-dz-night-border dark:bg-dz-night"
                  >
                    <Link
                      href={`/admin/collections/orders/${o.id}`}
                      className="font-mono font-bold text-dz-primary-700 hover:text-dz-primary-900 dark:text-dz-night-fg"
                      dir="ltr"
                    >
                      {o.code}
                    </Link>
                    <span className="text-dz-primary-500 dark:text-dz-night-muted">
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span className="font-bold text-dz-primary-700 dark:text-dz-night-fg">
                      {formatToman(o.totalRial)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ===== MESSAGES ===== */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="relative min-h-0 flex-1 overflow-y-auto bg-dz-canvas bg-[radial-gradient(circle_at_1px_1px,theme(colors.dz-primary.100/50%)_1px,transparent_0)] bg-[length:20px_20px] px-3 py-3 dark:bg-dz-night dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)]"
      >
        {/* AI insight banner */}
        {aiEnabled && (
          <div className="sticky top-0 z-10 mb-3">
            <div className="overflow-hidden rounded-xl border border-dz-primary-100/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-dz-night-border dark:bg-dz-night-card/90">
              <button
                type="button"
                onClick={() => {
                  if (!insight && !insightLoading) loadInsight();
                  else setInsightExpanded((v) => !v);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-start transition-colors hover:bg-dz-primary-50/50 dark:hover:bg-white/[0.03]"
              >
                <Sparkles className="size-3.5 shrink-0 text-dz-primary-500 dark:text-dz-night-muted" aria-hidden />
                {insightLoading ? (
                  <span className="flex items-center gap-1.5 text-xs text-dz-primary-400 dark:text-dz-night-faint">
                    <Loader2 className="size-3 animate-spin" aria-hidden />
                    در حال تحلیل گفت‌وگو…
                  </span>
                ) : insight ? (
                  <span className="flex flex-1 items-center gap-2 text-xs">
                    <span className="font-bold text-dz-primary-700 dark:text-dz-night-fg">{insight.topic}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${SENTIMENT_CLS[insight.sentiment] ?? SENTIMENT_CLS.neutral}`}
                    >
                      {SENTIMENT_LABEL[insight.sentiment] ?? insight.sentiment}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-dz-primary-500 dark:text-dz-night-muted">
                    خلاصهٔ دستیار — کلیک کنید
                  </span>
                )}
                {insight && (
                  <ChevronDown
                    className={`size-3.5 shrink-0 text-dz-primary-400 transition-transform dark:text-dz-night-faint ${insightExpanded ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                )}
              </button>
              {insight && insightExpanded && (
                <div className="border-t border-dz-primary-50 px-3 pb-3 pt-2 dark:border-dz-night-line">
                  <p className="text-xs leading-6 text-dz-primary-700 dark:text-dz-night-fg">{insight.summary}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <ul className="mx-auto flex max-w-2xl flex-col gap-3">
          {conversation.messages.map((m, idx) => {
            const day = m.createdAt.slice(0, 10);
            const showDay = idx === 0 || day !== conversation.messages[idx - 1]!.createdAt.slice(0, 10);
            const dayPill = showDay ? (
              <li
                key={`day-${m.id}`}
                className="sticky top-12 z-10 mx-auto my-1 w-fit rounded-full bg-dz-primary-100/90 px-3 py-0.5 text-[0.66rem] font-medium text-dz-primary-600 backdrop-blur dark:bg-dz-night-elevated/90 dark:text-dz-night-muted"
              >
                <span suppressHydrationWarning>{formatJalali(m.createdAt)}</span>
              </li>
            ) : null;

            if (m.isInternalNote) {
              return (
                <div key={m.id} className="contents">
                  {dayPill}
                  <li className="mx-auto w-full max-w-[90%] rounded-xl border border-dz-warning/30 bg-dz-warning/5 px-3 py-2 dark:bg-dz-warning/10">
                    <p className="mb-1 flex items-center gap-1.5 text-[0.66rem] font-bold text-dz-warning dark:text-dz-warning-300">
                      <StickyNote className="size-3.5" aria-hidden />
                      یادداشت داخلی {m.authorName ? `· ${m.authorName}` : ""}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-[0.82rem] leading-7 text-dz-primary-700 dark:text-dz-night-fg">
                      {m.body}
                    </p>
                  </li>
                </div>
              );
            }

            if (m.role === "SYSTEM") {
              return (
                <div key={m.id} className="contents">
                  {dayPill}
                  <li className="mx-auto rounded-full bg-dz-primary-50 px-3 py-1 text-[0.72rem] text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted">
                    {m.body}
                  </li>
                </div>
              );
            }

            const mine = m.role === "OPERATOR";
            const isLastOperator = m.id === lastOperatorId;
            return (
              <div key={m.id} className="contents">
                {dayPill}
                <li className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  {mine && m.authorName && (
                    <span className="mb-0.5 px-1 text-[0.62rem] font-medium text-dz-primary-400 dark:text-dz-night-faint">
                      {m.authorName}
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-[0.85rem] leading-7 ${
                      mine
                        ? "rounded-2xl rounded-ee-md bg-dz-primary-600 text-white"
                        : "rounded-2xl rounded-ss-md border border-dz-primary-100 bg-white text-dz-primary-800 dark:border-dz-night-border dark:bg-dz-night-card dark:text-dz-night-fg"
                    }`}
                  >
                    {m.attachment && <AttachmentView attachment={m.attachment} mine={mine} />}
                    {m.body && <span>{m.body}</span>}
                  </div>
                  <span className="mt-1 flex items-center gap-1 px-1 text-[0.62rem] text-dz-primary-300 dark:text-dz-night-faint">
                    <span suppressHydrationWarning>{formatTimeFa(m.createdAt)}</span>
                    {mine && isLastOperator && (
                      <span title={conversation.seenByVisitor ? "خوانده شد" : "ارسال شد"}>
                        {conversation.seenByVisitor ? (
                          <CheckCircle2 className="size-3 text-dz-success" aria-hidden />
                        ) : (
                          <Check className="size-3" aria-hidden />
                        )}
                      </span>
                    )}
                  </span>
                </li>
              </div>
            );
          })}
          {/* typing indicator — shows while operator composes a reply */}
          {isTyping && mode === "reply" && (
            <li className="flex items-end justify-end">
              <div className="rounded-2xl rounded-ee-md bg-dz-primary-600 px-4 py-3">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-white/80" />
                </span>
              </div>
            </li>
          )}
          <div ref={listEndRef} />
        </ul>

        {showJump && (
          <button
            type="button"
            onClick={() => listEndRef.current?.scrollIntoView({ behavior: "smooth" })}
            aria-label="رفتن به آخرین پیام"
            className="focus-ring sticky bottom-2 ms-auto me-1 grid size-9 place-items-center rounded-full border border-dz-primary-200 bg-white text-dz-primary-600 shadow-md transition-colors hover:bg-dz-primary-50 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
          >
            <ArrowDown className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {/* ===== COMPOSER ===== */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2">
        <div
          className={`overflow-hidden rounded-2xl border shadow-sm backdrop-blur-sm transition-colors ${
            mode === "note"
              ? "border-dz-warning/30 bg-dz-warning/5 dark:border-dz-warning/20 dark:bg-dz-warning/10"
              : "border-dz-primary-200/70 bg-white/90 dark:border-dz-night-border dark:bg-dz-night-card/90"
          }`}
        >
          {/* AI suggestions row */}
          {insight && insight.suggestions.length > 0 && (
            <div className="border-b border-dz-primary-50 px-3 pb-2 pt-2.5 dark:border-dz-night-line">
              <button
                type="button"
                onClick={() => setSuggestExpanded((v) => !v)}
                className="flex w-full items-center gap-1.5 text-xs"
              >
                <Sparkles className="size-3.5 shrink-0 text-dz-primary-500 dark:text-dz-night-muted" aria-hidden />
                <span className="font-bold text-dz-primary-600 dark:text-dz-night-muted">پیشنهاد دستیار</span>
                <span className="rounded-full bg-dz-primary-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-dz-primary-600 dark:bg-white/10 dark:text-dz-night-muted">
                  {insight.suggestions.length}
                </span>
                <div className="flex-1" />
                {waitTime && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-bold tabular-nums ${waitTimerCls(waitTime)}`}
                  >
                    <Clock className="size-3" aria-hidden />
                    بی‌پاسخ {waitTime}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    runAi();
                  }}
                  disabled={aiPending}
                  className="inline-flex items-center gap-1 rounded-full border border-dz-primary-200 px-2 py-0.5 text-[0.62rem] font-bold text-dz-primary-600 transition-colors hover:bg-dz-primary-50 disabled:opacity-50 dark:border-dz-night-border dark:text-dz-night-muted"
                >
                  {aiPending ? (
                    <Loader2 className="size-3 animate-spin" aria-hidden />
                  ) : (
                    <Sparkles className="size-3" aria-hidden />
                  )}
                  پیش‌نویس کامل
                </button>
                <ChevronDown
                  className={`size-3.5 text-dz-primary-400 transition-transform dark:text-dz-night-faint ${suggestExpanded ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {suggestExpanded && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {insight.suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertSuggestion(s)}
                      className="rounded-xl border border-dz-primary-100 bg-dz-canvas px-3 py-1.5 text-start text-xs font-medium leading-relaxed text-dz-primary-700 transition-colors hover:border-dz-primary-300 hover:bg-dz-primary-50 dark:border-dz-night-border dark:bg-dz-night dark:text-dz-night-fg dark:hover:bg-white/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="px-3 pt-2 text-xs text-dz-error dark:text-dz-error-300">{error}</p>}

          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 px-3 pb-1.5 pt-2.5">
            {/* mode toggle */}
            <div className="inline-flex overflow-hidden rounded-lg border border-dz-primary-200 dark:border-dz-night-border">
              <button
                type="button"
                onClick={() => setMode("reply")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${
                  mode === "reply"
                    ? "bg-dz-primary-600 text-white"
                    : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                }`}
              >
                <Reply className="size-3.5" aria-hidden />
                پاسخ
              </button>
              <button
                type="button"
                onClick={() => setMode("note")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${
                  mode === "note"
                    ? "bg-dz-warning text-white"
                    : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
                }`}
              >
                <StickyNote className="size-3.5" aria-hidden />
                یادداشت
              </button>
            </div>

            {/* canned replies */}
            {cannedReplies.length > 0 && (
              <div className="relative" ref={cannedRef}>
                <button
                  type="button"
                  onClick={() => setCannedOpen((v) => !v)}
                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-primary-200 px-2.5 py-1 text-xs font-medium text-dz-primary-600 transition-colors hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
                >
                  <Bookmark className="size-3.5" aria-hidden />
                  پیام آماده
                  <ChevronDown className="size-3.5" aria-hidden />
                </button>
                {cannedOpen && (
                  <div className="absolute bottom-full z-20 mb-1 max-h-72 w-80 overflow-y-auto rounded-xl border border-dz-primary-100 bg-white p-1.5 shadow-xl dark:border-dz-night-border dark:bg-dz-night-elevated">
                    <p className="px-2 pb-1.5 pt-1 text-[0.65rem] font-bold uppercase tracking-wide text-dz-primary-400 dark:text-dz-night-faint">
                      یا در کادر پاسخ / بنویسید
                    </p>
                    {cannedReplies.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => insertCanned(c.body)}
                        className="block w-full rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-dz-primary-800 dark:text-dz-night-fg">{c.title}</span>
                          {c.shortcut && (
                            <span className="font-mono text-[0.62rem] text-dz-primary-400 dark:text-dz-night-faint">
                              {c.shortcut}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.7rem] text-dz-primary-400 dark:text-dz-night-muted">
                          {c.body}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI insight load + full draft */}
            {aiEnabled && (
              <>
                {!insight && (
                  <button
                    type="button"
                    onClick={loadInsight}
                    disabled={insightLoading}
                    className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-primary-300 bg-dz-primary-50 px-2.5 py-1 text-xs font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-100 disabled:opacity-60 dark:border-dz-primary-500/40 dark:bg-dz-primary-400/10 dark:text-dz-primary-300"
                  >
                    {insightLoading ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Sparkles className="size-3.5" aria-hidden />
                    )}
                    {insightLoading ? "در حال تحلیل…" : "پیشنهاد دستیار"}
                  </button>
                )}
                {mode === "reply" && (
                  <button
                    type="button"
                    onClick={runAi}
                    disabled={aiPending}
                    className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-primary-200 px-2.5 py-1 text-xs font-medium text-dz-primary-600 transition-colors hover:bg-dz-primary-50 disabled:opacity-60 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
                  >
                    {aiPending ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Sparkles className="size-3.5" aria-hidden />
                    )}
                    پیش‌نویس هوش مصنوعی
                  </button>
                )}
              </>
            )}

            {/* wait timer (standalone, no insight) */}
            {waitTime && !insight && (
              <span
                className={`ms-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-bold tabular-nums ${waitTimerCls(waitTime)}`}
              >
                <Clock className="size-3" aria-hidden />
                بی‌پاسخ {waitTime}
              </span>
            )}
          </div>

          {/* slash canned suggestions */}
          {slashOpen && slashFiltered.length > 0 && (
            <div className="mx-3 mb-2 overflow-hidden rounded-xl border border-dz-primary-100 bg-white shadow-lg dark:border-dz-night-border dark:bg-dz-night-elevated">
              <p className="px-3 py-1.5 text-[0.65rem] font-bold text-dz-primary-400 dark:text-dz-night-faint">
                پیام‌های آماده
              </p>
              {slashFiltered.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertCanned(c.body)}
                  className="flex w-full items-center gap-3 border-t border-dz-primary-50 px-3 py-2 text-start transition-colors first:border-0 hover:bg-dz-primary-50 dark:border-dz-night-line dark:hover:bg-white/5"
                >
                  <span className="font-mono text-[0.66rem] font-bold text-dz-primary-400 dark:text-dz-night-faint">
                    {c.shortcut}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-dz-primary-700 dark:text-dz-night-fg">{c.title}</span>
                    <span className="block truncate text-[0.7rem] text-dz-primary-400 dark:text-dz-night-muted">{c.body}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* attachment preview */}
          {attachment && (
            <div className="mx-3 mb-2 inline-flex items-center gap-2 rounded-lg border border-dz-primary-200 bg-dz-primary-50/50 px-2.5 py-1.5 text-xs dark:border-dz-night-border dark:bg-white/5">
              <Paperclip className="size-3.5 text-dz-primary-500 dark:text-dz-night-muted" aria-hidden />
              <span className="max-w-40 truncate text-dz-primary-700 dark:text-dz-night-fg">{attachment.name}</span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                aria-label="حذف پیوست"
                className="text-dz-error dark:text-dz-error-300"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          )}

          {/* composer row */}
          <div className="flex items-end gap-2 px-3 pb-3">
            <textarea
              ref={composerRef}
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" && (e.ctrlKey || e.metaKey)) || (e.key === "Enter" && !e.shiftKey)) {
                  e.preventDefault();
                  send();
                }
                if (e.key === "Escape" && slashOpen) {
                  setSlashOpen(false);
                }
              }}
              rows={1}
              placeholder={
                mode === "note"
                  ? "یادداشت داخلی (فقط برای تیم)…"
                  : isResolved
                    ? "برای ادامه، گفت‌وگو را بازگشایی کنید…"
                    : "پاسخ بنویسید… (یا / برای پیام آماده)"
              }
              disabled={isResolved && mode === "reply"}
              aria-label={mode === "note" ? "نوشتن یادداشت داخلی" : "نوشتن پاسخ"}
              className="max-h-32 min-h-[1.5rem] flex-1 resize-none border-0 bg-transparent text-[0.85rem] leading-7 text-dz-primary-800 outline-none placeholder:text-dz-primary-300 disabled:opacity-50 dark:text-dz-night-fg dark:placeholder:text-dz-night-faint"
            />

            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />

            {/* quick actions popup */}
            <div className="relative" ref={qaRef}>
              <button
                type="button"
                onClick={() => setQaOpen((v) => !v)}
                aria-label="پیوست و اقدام سریع"
                className={`focus-ring grid size-8 place-items-center rounded-xl transition-all ${
                  qaOpen
                    ? "rotate-45 bg-dz-primary-100 text-dz-primary-700 dark:bg-white/10 dark:text-dz-night-fg"
                    : "text-dz-primary-400 hover:bg-dz-primary-50 hover:text-dz-primary-600 dark:text-dz-night-faint dark:hover:bg-white/5 dark:hover:text-dz-night-muted"
                }`}
              >
                <Paperclip className="size-4" aria-hidden />
              </button>
              {qaOpen && (
                <div className="absolute bottom-full end-0 z-20 mb-2 w-52 overflow-hidden rounded-xl border border-dz-primary-100 bg-white p-1.5 shadow-xl dark:border-dz-night-border dark:bg-dz-night-elevated">
                  <p className="px-2.5 pb-1.5 pt-1 text-[0.65rem] font-bold uppercase tracking-wide text-dz-primary-400 dark:text-dz-night-faint">
                    اقدام سریع
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      fileRef.current?.click();
                      setQaOpen(false);
                    }}
                    disabled={uploading}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-50 disabled:opacity-50 dark:text-dz-night-fg dark:hover:bg-white/5"
                  >
                    <span className="grid size-7 place-items-center rounded-lg bg-dz-primary-50 text-dz-primary-600 dark:bg-white/10">
                      {uploading ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Paperclip className="size-3.5" aria-hidden />
                      )}
                    </span>
                    پیوست فایل / تصویر
                  </button>
                  <div className="my-1 border-t border-dz-primary-50 dark:border-dz-night-line" />
                  <Link
                    href="/admin/collections/orders"
                    onClick={() => setQaOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-50 dark:text-dz-night-fg dark:hover:bg-white/5"
                  >
                    <span className="grid size-7 place-items-center rounded-lg bg-green-50 text-green-600 dark:bg-green-500/10">
                      <ShoppingBag className="size-3.5" aria-hidden />
                    </span>
                    مشاهده سفارش‌ها
                  </Link>
                  <Link
                    href="/admin/collections/orders/create"
                    onClick={() => setQaOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-50 dark:text-dz-night-fg dark:hover:bg-white/5"
                  >
                    <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                      <FileText className="size-3.5" aria-hidden />
                    </span>
                    ثبت سفارش جدید
                  </Link>
                  <Link
                    href="/admin/chat/canned-replies"
                    onClick={() => setQaOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-50 dark:text-dz-night-fg dark:hover:bg-white/5"
                  >
                    <span className="grid size-7 place-items-center rounded-lg bg-dz-primary-50 text-dz-primary-600 dark:bg-white/10">
                      <Bookmark className="size-3.5" aria-hidden />
                    </span>
                    ویرایش پیام‌های آماده
                  </Link>
                </div>
              )}
            </div>

            {/* send */}
            <button
              type="button"
              onClick={send}
              disabled={pending || (!draft.trim() && !attachment) || (isResolved && mode === "reply")}
              aria-label={mode === "note" ? "ثبت یادداشت" : "ارسال پاسخ"}
              className={`focus-ring grid size-9 shrink-0 place-items-center rounded-xl text-white transition-colors disabled:opacity-50 ${
                mode === "note"
                  ? "bg-dz-warning hover:bg-dz-warning/90 disabled:bg-dz-warning/50"
                  : "bg-dz-primary-600 hover:bg-dz-primary-700 disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800"
              }`}
            >
              {pending ? (
                <Loader2 className="size-[1.1rem] animate-spin" aria-hidden />
              ) : mode === "note" ? (
                <StickyNote className="size-[1.1rem]" aria-hidden />
              ) : (
                <Send className="size-[1.1rem]" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttachmentView({ attachment, mine }: { attachment: Attach; mine: boolean }) {
  const isImage = attachment.mime.startsWith("image/");
  if (isImage) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="mb-1.5 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={attachment.url} alt={attachment.name} className="max-h-52 w-auto rounded-lg" />
      </a>
    );
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mb-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${mine ? "bg-white/15" : "bg-dz-primary-50 dark:bg-white/5"}`}
    >
      <Paperclip className="size-3.5" aria-hidden />
      {attachment.name}
    </a>
  );
}
