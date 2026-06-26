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
  Building2,
  ArrowDown,
  Reply,
} from "lucide-react";
import { formatTimeFa, formatJalali } from "@/lib/date";
import { formatToman } from "@/lib/price";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { uploadChatFile } from "@/lib/chat/upload-client";
import {
  STATUS_LABEL,
  STATUS_BADGE_TONE,
  type AdminConversationDetail,
  type ConversationStatus,
  type CannedReply,
  type Department,
  type OperatorPresence,
  type ChatAttachment,
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

type Attach = NonNullable<ChatAttachment>;

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

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const readRef = useRef<string | null>(null);

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

  const lastOperatorId = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "OPERATOR" && !m.isInternalNote)?.id;

  const send = () => {
    const body = draft.trim();
    if ((!body && !attachment) || pending) return;
    setError(null);
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

  const insertCanned = (body: string) => {
    setMode("reply");
    setDraft((d) => (d.trim() ? `${d}\n${body}` : body));
    setCannedOpen(false);
    setTimeout(() => composerRef.current?.focus(), 30);
  };

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

  const isMine = conversation.assignedToId === currentUserId;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header — customer identity + status */}
      <div className="border-b border-dz-primary-100 bg-white px-4 py-3.5 dark:border-dz-night-border dark:bg-dz-night-card">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/chat"
            aria-label="بازگشت به فهرست"
            className="focus-ring mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl text-dz-primary-500 transition-colors hover:bg-dz-primary-50 lg:hidden dark:text-dz-night-muted dark:hover:bg-white/5"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-dz-primary-50 text-dz-primary-600 dark:bg-white/5 dark:text-dz-night-fg">
            <User className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">
                {conversation.displayName}
              </h2>
              <AdminStatusBadge tone={STATUS_BADGE_TONE[conversation.status]}>
                {STATUS_LABEL[conversation.status]}
              </AdminStatusBadge>
              <span className="rounded-full bg-dz-primary-50/70 px-2 py-0.5 text-[0.68rem] font-medium text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted">
                {conversation.isGuest ? "مهمان" : "کاربر"}
              </span>
              {conversation.departmentName && (
                <span className="rounded-full bg-dz-primary-50 px-2 py-0.5 text-[0.68rem] font-medium text-dz-primary-600 dark:bg-white/5 dark:text-dz-primary-300">
                  {conversation.departmentName}
                </span>
              )}
              {conversation.rating != null && (
                <span className="inline-flex items-center gap-0.5 text-[0.72rem] font-bold text-dz-warning dark:text-dz-warning-300">
                  <Star className="size-3.5 fill-current" aria-hidden />
                  {conversation.rating}/۵
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dz-primary-400 dark:text-dz-night-faint">
              {conversation.phone && (
                <a href={`tel:${conversation.phone}`} dir="ltr" className="inline-flex items-center gap-1 hover:text-dz-primary-600">
                  <Phone className="size-3.5" aria-hidden />
                  {conversation.phone}
                </a>
              )}
              <span>منبع: {conversation.source === "storefront" ? "فروشگاه" : conversation.source}</span>
              <span>{formatJalali(conversation.createdAt)}</span>
              {conversation.subject && <span>موضوع: {conversation.subject}</span>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={copyLink}
              title="کپی لینک گفت‌وگو"
              aria-label="کپی لینک گفت‌وگو"
              className="focus-ring grid size-9 place-items-center rounded-xl text-dz-primary-500 transition-colors hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"
            >
              {copied ? <Check className="size-4 text-dz-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setInfoOpen((v) => !v)}
              aria-expanded={infoOpen}
              className={`focus-ring grid size-9 place-items-center rounded-xl transition-colors ${infoOpen ? "bg-dz-primary-100 text-dz-primary-700 dark:bg-white/10 dark:text-dz-night-fg" : "text-dz-primary-500 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"}`}
              title="اطلاعات مشتری و سفارش‌ها"
              aria-label="اطلاعات مشتری و سفارش‌ها"
            >
              <ShoppingBag className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* customer / orders panel */}
        {infoOpen && (
          <div className="mt-3 rounded-xl border border-dz-primary-100 bg-dz-primary-50/40 p-3 dark:border-dz-night-border dark:bg-white/5">
            {conversation.rating != null && (
              <div className="mb-2 flex items-center gap-2 text-xs text-dz-primary-600 dark:text-dz-night-muted">
                <span className="inline-flex items-center gap-0.5 text-dz-warning dark:text-dz-warning-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-3.5 ${i < (conversation.rating ?? 0) ? "fill-current" : ""}`} aria-hidden />
                  ))}
                </span>
                {conversation.ratingComment && <span>«{conversation.ratingComment}»</span>}
              </div>
            )}
            <p className="mb-1.5 text-xs font-bold text-dz-primary-700 dark:text-dz-night-fg">سفارش‌های اخیر</p>
            {conversation.orders.length === 0 ? (
              <p className="text-xs text-dz-primary-400 dark:text-dz-night-faint">
                {conversation.isGuest ? "مشتری مهمان است — سفارشی ثبت نشده." : "سفارشی یافت نشد."}
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {conversation.orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs dark:bg-dz-night-card">
                    <span className="font-mono text-dz-primary-700 dark:text-dz-night-fg" dir="ltr">{o.code}</span>
                    <span className="text-dz-primary-500 dark:text-dz-night-muted">{ORDER_STATUS_LABEL[o.status] ?? o.status}</span>
                    <span className="store-toman font-bold text-dz-primary-700 dark:text-dz-night-fg">{formatToman(o.totalRial)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* controls: status + assignment + department */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {STATUS_ACTIONS.map((a) => {
            const isCurrent = conversation.status === a.status;
            return (
              <button
                key={a.status}
                type="button"
                onClick={() => setStatus(a.status)}
                disabled={pending || isCurrent}
                className={`focus-ring inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                  isCurrent
                    ? "border-dz-primary-300 bg-dz-primary-50 text-dz-primary-700 dark:border-dz-primary-500 dark:bg-dz-primary-400/15 dark:text-dz-primary-300"
                    : "border-dz-primary-200 text-dz-primary-600 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
                }`}
              >
                <a.icon className="size-3.5" aria-hidden />
                {a.label}
              </button>
            );
          })}
          {conversation.status === "RESOLVED" && (
            <button
              type="button"
              onClick={() => setStatus("OPEN")}
              disabled={pending}
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-warning/40 px-3 py-1.5 text-xs font-medium text-dz-warning hover:bg-dz-warning/10 dark:text-dz-warning-300"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              بازگشایی
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={assignMe}
            disabled={pending || isMine}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
              isMine
                ? "border-dz-primary-300 bg-dz-primary-50 text-dz-primary-700 dark:border-dz-primary-500 dark:bg-dz-primary-400/15 dark:text-dz-primary-300"
                : "border-dz-primary-200 text-dz-primary-600 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
            }`}
          >
            <UserCog className="size-3.5" aria-hidden />
            {isMine ? "به من واگذار شده" : "به من واگذار کن"}
          </button>
          <select
            value={conversation.assignedToId ?? ""}
            onChange={(e) => assign(e.target.value)}
            disabled={pending}
            aria-label="مسئول گفت‌وگو"
            className="rounded-xl border border-dz-primary-200 bg-white px-2.5 py-1.5 text-xs text-dz-primary-700 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
          >
            <option value="">بدون مسئول</option>
            {presence.map((o) => (
              <option key={o.id} value={o.id}>
                {o.online ? "🟢 " : ""}
                {o.name}
              </option>
            ))}
          </select>
          {departments.length > 0 && (
            <label className="inline-flex items-center gap-1.5 text-xs text-dz-primary-400 dark:text-dz-night-faint">
              <Building2 className="size-3.5" aria-hidden />
              <select
                value={conversation.departmentId ?? ""}
                onChange={(e) => assignDept(e.target.value)}
                disabled={pending}
                aria-label="دپارتمان"
                className="rounded-xl border border-dz-primary-200 bg-white px-2.5 py-1.5 text-xs text-dz-primary-700 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
              >
                <option value="">بدون دپارتمان</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-y-auto bg-dz-canvas px-4 py-4 dark:bg-dz-night">
        <ul className="mx-auto flex max-w-2xl flex-col gap-3">
          {conversation.messages.map((m, idx) => {
            const day = m.createdAt.slice(0, 10);
            const showDay = idx === 0 || day !== conversation.messages[idx - 1].createdAt.slice(0, 10);
            const dayPill = showDay ? (
              <li key={`day-${m.id}`} className="sticky top-1 z-10 mx-auto my-1 w-fit rounded-full bg-dz-primary-100/90 px-3 py-0.5 text-[0.66rem] font-medium text-dz-primary-600 backdrop-blur dark:bg-dz-night-elevated/90 dark:text-dz-night-muted">
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
                    <p className="whitespace-pre-wrap break-words text-[0.82rem] leading-7 text-dz-primary-700 dark:text-dz-night-fg">{m.body}</p>
                  </li>
                </div>
              );
            }

            if (m.role === "SYSTEM") {
              return (
                <div key={m.id} className="contents">
                  {dayPill}
                  <li className="mx-auto rounded-full bg-dz-primary-50 px-3 py-1 text-[0.72rem] text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted">{m.body}</li>
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
                    <span className="mb-0.5 px-1 text-[0.62rem] font-medium text-dz-primary-400 dark:text-dz-night-faint">{m.authorName}</span>
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
                    {formatTimeFa(m.createdAt)}
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

      {/* composer */}
      <div className="border-t border-dz-primary-100 bg-white px-3 py-3 dark:border-dz-night-border dark:bg-dz-night-card">
        {error && <p className="mb-2 px-1 text-xs text-dz-error dark:text-dz-error-300">{error}</p>}

        {/* toolbar */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <div className="inline-flex overflow-hidden rounded-lg border border-dz-primary-200 dark:border-dz-night-border">
            <button
              type="button"
              onClick={() => setMode("reply")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${mode === "reply" ? "bg-dz-primary-600 text-white" : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"}`}
            >
              <Reply className="size-3.5" aria-hidden />
              پاسخ
            </button>
            <button
              type="button"
              onClick={() => setMode("note")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors ${mode === "note" ? "bg-dz-warning text-white" : "text-dz-primary-600 hover:bg-dz-primary-50 dark:text-dz-night-muted dark:hover:bg-white/5"}`}
            >
              <StickyNote className="size-3.5" aria-hidden />
              یادداشت
            </button>
          </div>

          {cannedReplies.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setCannedOpen((v) => !v)}
                className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-primary-200 px-2.5 py-1 text-xs font-medium text-dz-primary-600 transition-colors hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
              >
                پیام آماده
                <ChevronDown className="size-3.5" aria-hidden />
              </button>
              {cannedOpen && (
                <div className="absolute bottom-full z-20 mb-1 max-h-64 w-72 overflow-y-auto rounded-xl border border-dz-primary-100 bg-white p-1 shadow-lg dark:border-dz-night-border dark:bg-dz-night-elevated">
                  {cannedReplies.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertCanned(c.body)}
                      className="block w-full rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-dz-primary-800 dark:text-dz-night-fg">{c.title}</span>
                        {c.shortcut && <span className="font-mono text-[0.62rem] text-dz-primary-400 dark:text-dz-night-faint">{c.shortcut}</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.7rem] text-dz-primary-400 dark:text-dz-night-muted">{c.body}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {aiEnabled && mode === "reply" && (
            <button
              type="button"
              onClick={runAi}
              disabled={aiPending}
              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-primary-300 bg-dz-primary-50 px-2.5 py-1 text-xs font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-100 disabled:opacity-60 dark:border-dz-primary-500/40 dark:bg-dz-primary-400/10 dark:text-dz-primary-300"
            >
              {aiPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Sparkles className="size-3.5" aria-hidden />}
              پیشنهاد هوش مصنوعی
            </button>
          )}

          {mode === "reply" && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="پیوست تصویر"
              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-primary-200 px-2.5 py-1 text-xs font-medium text-dz-primary-600 transition-colors hover:bg-dz-primary-50 disabled:opacity-60 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
            >
              {uploading ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Paperclip className="size-3.5" aria-hidden />}
              پیوست
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        {attachment && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-dz-primary-200 bg-dz-primary-50/50 px-2.5 py-1.5 text-xs dark:border-dz-night-border dark:bg-white/5">
            <Paperclip className="size-3.5 text-dz-primary-500 dark:text-dz-night-muted" aria-hidden />
            <span className="max-w-40 truncate text-dz-primary-700 dark:text-dz-night-fg">{attachment.name}</span>
            <button type="button" onClick={() => setAttachment(null)} aria-label="حذف پیوست" className="text-dz-error dark:text-dz-error-300">
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        )}

        <div className={`flex items-end gap-2 rounded-2xl border px-3 py-2 transition-colors ${mode === "note" ? "border-dz-warning/40 bg-dz-warning/5 dark:bg-dz-warning/10" : "border-dz-primary-200 bg-white focus-within:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated"}`}>
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={mode === "note" ? "یادداشت داخلی (فقط برای تیم)…" : "پاسخ خود را بنویسید…"}
            aria-label={mode === "note" ? "نوشتن یادداشت داخلی" : "نوشتن پاسخ"}
            className="max-h-32 min-h-[1.5rem] flex-1 resize-none border-0 bg-transparent text-[0.85rem] leading-7 text-dz-primary-800 outline-none placeholder:text-dz-primary-300 dark:text-dz-night-fg dark:placeholder:text-dz-night-faint"
          />
          <button
            type="button"
            onClick={send}
            disabled={pending || (!draft.trim() && !attachment)}
            aria-label={mode === "note" ? "ثبت یادداشت" : "ارسال پاسخ"}
            className={`focus-ring grid size-9 shrink-0 place-items-center rounded-xl text-white transition-colors disabled:opacity-50 ${mode === "note" ? "bg-dz-warning hover:bg-dz-warning/90" : "bg-dz-primary-600 hover:bg-dz-primary-700 disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800"}`}
          >
            {pending ? <Loader2 className="size-[1.15rem] animate-spin" aria-hidden /> : mode === "note" ? <StickyNote className="size-[1.15rem]" aria-hidden /> : <Send className="size-[1.15rem]" aria-hidden />}
          </button>
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
