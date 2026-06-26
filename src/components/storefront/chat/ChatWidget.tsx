"use client";

// CHAT-CP1/CP2 — storefront chat surface. One component renders BOTH the desktop
// floating launcher and the open panel (mobile bottom sheet / desktop docked
// panel). Real, persisted, non-realtime: server actions + polling. Store-* only.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Minus,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Headset,
  ChevronDown,
  Paperclip,
  ArrowDown,
  Star,
  Check,
  CheckCheck,
} from "lucide-react";
import { resolveNavIcon } from "@/lib/storefront/nav-icons";
import { toPersianNumbers } from "@/lib/price";
import { formatTimeFa, formatJalali } from "@/lib/date";
import { playChime } from "@/lib/chat/sound";
import { uploadChatFile } from "@/lib/chat/upload-client";
import { useChatOpen, openChat, closeChat, setChatUnread } from "./chat-store";
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getStoredGuest,
  setStoredGuest,
} from "./chat-local";
import {
  startConversationAction,
  sendVisitorMessageAction,
  fetchConversationAction,
  rateConversationAction,
} from "@/lib/chat/public-actions";
import type { ChatPublicConfig, ConversationView, ChatAttachment } from "@/lib/chat/types";

const POLL_OPEN_MS = 5000;
const POLL_BG_MS = 30000;

const QUICK_STARTERS: Record<string, string> = {
  "پیگیری سفارش": "سلام، می‌خواهم وضعیت سفارشم را پیگیری کنم.",
  "سوال درباره محصول": "سلام، درباره‌ی یک محصول سوال دارم.",
  "راهنمای خرید": "سلام، برای انتخاب و خرید به راهنمایی نیاز دارم.",
  "صحبت با پشتیبانی": "سلام، می‌خواهم با تیم پشتیبانی صحبت کنم.",
};

type Attach = NonNullable<ChatAttachment>;

function Avatar({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-12" : "size-9";
  const icon = size === "lg" ? "size-6" : "size-[1.15rem]";
  return (
    <span className="relative inline-flex shrink-0">
      <span className={`${box} grid place-items-center rounded-2xl bg-linear-to-br from-store-primary to-store-primary-deep text-white shadow-store-sm`}>
        <Headset className={icon} aria-hidden />
      </span>
    </span>
  );
}

function OnlineDot({ online }: { online: boolean }) {
  return <span className={`inline-block size-2 rounded-full ${online ? "bg-store-success" : "bg-store-disabled"}`} aria-hidden />;
}

export function ChatWidget({ config }: { config: ChatPublicConfig }) {
  const open = useChatOpen();
  const [conversation, setConversation] = useState<ConversationView | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingSubject, setPendingSubject] = useState<string | null>(null);
  const [guest, setGuest] = useState({ name: "", phone: "" });
  const [seenCount, setSeenCount] = useState(0);
  const [attachment, setAttachment] = useState<Attach | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [proactiveShown, setProactiveShown] = useState(false);
  const [proactiveDismissed, setProactiveDismissed] = useState(false);

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const opCountRef = useRef(0);

  const messages = useMemo(() => conversation?.messages ?? [], [conversation]);
  const resolved = conversation?.status === "RESOLVED";
  const unread = open ? 0 : messages.slice(seenCount).filter((m) => m.role !== "VISITOR").length;
  const lastVisitorId = [...messages].reverse().find((m) => m.role === "VISITOR")?.id;

  useEffect(() => {
    setChatUnread(unread);
  }, [unread]);

  // ---- initial load: reattach + login status ----
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuest(getStoredGuest());
    const token = getStoredToken();
    if (token) {
      setLoading(true);
      fetchConversationAction(token)
        .then((res) => {
          if (res.ok) setConversation(res.conversation);
          else clearStoredToken();
        })
        .finally(() => setLoading(false));
    }
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setIsLoggedIn(Boolean(d?.user)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // ---- polling ----
  useEffect(() => {
    const token = conversation?.token;
    if (!token) return;
    let active = true;
    const tick = async () => {
      const res = await fetchConversationAction(token);
      if (active && res.ok) setConversation(res.conversation);
    };
    if (open) tick();
    const id = setInterval(tick, open ? POLL_OPEN_MS : POLL_BG_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [open, conversation?.token]);

  // ---- chime on new operator message ----
  useEffect(() => {
    const opCount = messages.filter((m) => m.role !== "VISITOR").length;
    if (config.soundEnabled && opCountRef.current !== 0 && opCount > opCountRef.current) playChime();
    opCountRef.current = opCount;
  }, [messages, config.soundEnabled]);

  // ---- proactive nudge (desktop) ----
  useEffect(() => {
    if (!config.proactiveEnabled || conversation || proactiveDismissed || open) return;
    const id = setTimeout(() => setProactiveShown(true), Math.max(3, config.proactiveDelaySeconds) * 1000);
    return () => clearTimeout(id);
  }, [config.proactiveEnabled, config.proactiveDelaySeconds, conversation, proactiveDismissed, open]);

  // ---- mark seen + autoscroll while open ----
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeenCount(messages.length);
      setProactiveShown(false);
      const t = setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      return () => clearTimeout(t);
    }
  }, [open, messages.length]);

  // ---- Esc + scroll-lock (mobile) + focus ----
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKey);
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const prev = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    const t = setTimeout(() => composerRef.current?.focus(), 80);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

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

  const submit = async (text: string) => {
    const body = text.trim();
    if ((!body && !attachment) || sending) return;
    const token = conversation?.token ?? getStoredToken();
    if (!token && isLoggedIn === false && config.preChatMode === "required") {
      if (!guest.name.trim() || !guest.phone.trim()) {
        setError("لطفاً نام و شماره‌ی تماس را وارد کنید.");
        return;
      }
    }
    setSending(true);
    setError(null);
    const res = token
      ? await sendVisitorMessageAction({ token, body, attachment: attachment ?? undefined })
      : await startConversationAction({
          firstMessage: body,
          subject: pendingSubject,
          guestName: guest.name,
          guestPhone: guest.phone,
          attachment: attachment ?? undefined,
        });
    if (res.ok) {
      if (!isLoggedIn) setStoredGuest(guest);
      setConversation(res.conversation);
      setStoredToken(res.conversation.token);
      setDraft("");
      setAttachment(null);
      setPendingSubject(null);
    } else {
      setError(res.error);
    }
    setSending(false);
    setTimeout(() => composerRef.current?.focus(), 30);
  };

  const onQuickAction = (label: string) => {
    setPendingSubject(label);
    setDraft(QUICK_STARTERS[label] ?? `${label}`);
    setError(null);
    setTimeout(() => composerRef.current?.focus(), 30);
  };

  const submitRating = (stars: number, comment: string) => {
    const token = conversation?.token;
    if (!token) return;
    rateConversationAction({ token, rating: stars, comment }).then((res) => {
      if (res.ok) setConversation(res.conversation);
    });
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight > 220);
  };

  const onComposerKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(draft);
    }
  };

  const headerName = messages.some((m) => m.role === "OPERATOR") ? config.operatorName : config.botName;

  return (
    <>
      {/* ===== proactive nudge (desktop) ===== */}
      {proactiveShown && !open && (
        <div className="fixed bottom-24 start-6 z-50 hidden max-w-72 items-start gap-2 rounded-2xl border border-store-border bg-store-surface p-3 shadow-store-card md:flex">
          <Avatar />
          <div className="min-w-0">
            <p className="text-[0.82rem] leading-6 text-store-text">{config.proactiveMessage}</p>
            <button
              type="button"
              onClick={() => {
                setProactiveDismissed(true);
                openChat();
              }}
              className="focus-ring mt-1.5 inline-flex items-center gap-1 rounded-store-pill bg-store-primary px-3 py-1 text-[0.72rem] font-bold text-white hover:bg-store-primary-hover"
            >
              شروع گفت‌وگو
            </button>
          </div>
          <button type="button" onClick={() => setProactiveDismissed(true)} aria-label="بستن" className="focus-ring -mt-1 -me-1 shrink-0 rounded-lg p-1 text-store-text-faint hover:text-store-text">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {/* ===== desktop floating launcher ===== */}
      {config.showDesktopLauncher && (
        <button
          type="button"
          onClick={openChat}
          aria-label={config.desktopCtaLabel}
          aria-expanded={open}
          className={`focus-ring group fixed bottom-6 start-6 z-50 hidden items-center gap-3 rounded-store-pill bg-store-primary py-2 ps-2 pe-5 text-white shadow-store-card transition-all duration-300 hover:bg-store-primary-hover hover:shadow-store-card-hover active:scale-[0.98] ${open ? "md:pointer-events-none md:translate-y-3 md:opacity-0" : "md:inline-flex"}`}
        >
          <span className="relative grid size-10 place-items-center rounded-store-pill bg-white/15">
            <MessageCircle className="size-5" aria-hidden />
            {unread > 0 && (
              <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-store-primary bg-store-clay text-[0.62rem] font-bold">
                {toPersianNumbers(unread)}
              </span>
            )}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[0.95rem] font-bold">{config.desktopCtaLabel}</span>
            <span className="flex items-center gap-1.5 text-[0.7rem] font-medium text-white/80">
              <OnlineDot online={config.operatorsOnline} />
              {config.operatorsOnline ? "آنلاین" : "آفلاین"}
            </span>
          </span>
        </button>
      )}

      {/* ===== mobile backdrop ===== */}
      <div
        aria-hidden
        onClick={closeChat}
        className={`fixed inset-0 z-[65] bg-store-ink/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* ===== panel ===== */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label="گفت‌وگو با پشتیبانی دشت‌زاد"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-[70] flex h-[88vh] flex-col overflow-hidden rounded-t-3xl border border-store-border bg-store-surface shadow-store-popover transition-all duration-300 ease-out md:inset-x-auto md:bottom-6 md:start-6 md:h-[min(80vh,40rem)] md:w-[24rem] md:rounded-3xl ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0 md:translate-y-3"
        }`}
      >
        {/* header */}
        <header className="flex items-center gap-3 border-b border-store-border bg-linear-to-b from-store-primary-tint to-store-surface px-4 py-3.5">
          <Avatar />
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-[0.95rem] font-bold text-store-text">{headerName}</p>
            <p className="flex items-center gap-1.5 text-[0.72rem] text-store-text-muted">
              <OnlineDot online={config.operatorsOnline} />
              {config.operatorsOnline ? config.responseTimeLabel : config.workingHoursLabel}
            </p>
          </div>
          <button type="button" onClick={closeChat} aria-label="کوچک کردن گفت‌وگو" className="focus-ring grid size-9 place-items-center rounded-xl text-store-text-faint transition-colors hover:bg-store-surface-soft hover:text-store-text">
            <Minus className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={closeChat} aria-label="بستن گفت‌وگو" className="focus-ring grid size-9 place-items-center rounded-xl text-store-text-faint transition-colors hover:bg-store-surface-soft hover:text-store-text">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        {/* body */}
        <div ref={scrollRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto px-4 py-4">
          {!config.operatorsOnline && (
            <div className="mb-4 flex gap-3 rounded-2xl border border-store-border-soft bg-store-cream/60 p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-store-amber-soft text-store-gold-deep">
                <Headset className="size-[1.15rem]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[0.85rem] font-bold text-store-text">{config.offlineTitle}</p>
                <p className="mt-0.5 text-[0.78rem] leading-6 text-store-text-muted">{config.offlineBody}</p>
                {config.workingHoursLabel && <p className="mt-1 text-[0.72rem] font-medium text-store-text-faint">{config.workingHoursLabel}</p>}
              </div>
            </div>
          )}

          {loading ? (
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <ChatWelcome
              config={config}
              isGuest={isLoggedIn === false}
              guest={guest}
              onGuestChange={setGuest}
              onQuickAction={onQuickAction}
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((m, idx) => {
                const day = m.createdAt.slice(0, 10);
                const showDay = idx === 0 || day !== messages[idx - 1].createdAt.slice(0, 10);
                const dayPill = showDay ? (
                  <li key={`day-${m.id}`} className="sticky top-0 z-10 mx-auto my-1 w-fit rounded-store-pill bg-store-surface-soft/90 px-3 py-0.5 text-[0.66rem] font-medium text-store-text-muted backdrop-blur">
                    <span suppressHydrationWarning>{formatJalali(m.createdAt)}</span>
                  </li>
                ) : null;

                if (m.role === "SYSTEM") {
                  return (
                    <div key={m.id} className="contents">
                      {dayPill}
                      <li className="mx-auto rounded-store-pill bg-store-amber-soft px-3 py-1 text-[0.72rem] font-medium text-store-gold-deep">{m.body}</li>
                    </div>
                  );
                }
                const mine = m.role === "VISITOR";
                const isLastVisitor = m.id === lastVisitorId;
                return (
                  <div key={m.id} className="contents">
                    {dayPill}
                    <li className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[85%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-[0.86rem] leading-7 ${mine ? "rounded-2xl rounded-ee-md bg-store-primary text-white" : "rounded-2xl rounded-ss-md border border-store-border bg-store-surface-soft text-store-text"}`}>
                        {m.attachment && <AttachmentView attachment={m.attachment} mine={mine} />}
                        {m.body && <span>{m.body}</span>}
                      </div>
                      <span className="mt-1 flex items-center gap-1 px-1 text-[0.62rem] text-store-text-faint">
                        {formatTimeFa(m.createdAt)}
                        {mine && isLastVisitor && (
                          <span title={conversation?.seenByOperator ? "خوانده شد" : "ارسال شد"}>
                            {conversation?.seenByOperator ? <CheckCheck className="size-3 text-store-primary" aria-hidden /> : <Check className="size-3" aria-hidden />}
                          </span>
                        )}
                      </span>
                    </li>
                  </div>
                );
              })}

              {resolved && conversation?.rating == null && <RatingCard onSubmit={submitRating} />}
              {resolved && conversation?.rating != null && (
                <li className="my-1 flex items-center justify-center gap-1.5 text-[0.74rem] font-medium text-store-success">
                  <CheckCircle2 className="size-4" aria-hidden />
                  ممنون از امتیازتان ({toPersianNumbers(conversation.rating)}/۵)
                </li>
              )}
              <div ref={listEndRef} />
            </ul>
          )}

          {showJump && (
            <button
              type="button"
              onClick={() => listEndRef.current?.scrollIntoView({ behavior: "smooth" })}
              aria-label="رفتن به آخرین پیام"
              className="focus-ring sticky bottom-2 ms-auto me-1 grid size-9 place-items-center rounded-full border border-store-border bg-store-surface text-store-primary shadow-store-sm transition-colors hover:bg-store-surface-soft"
            >
              <ArrowDown className="size-4" aria-hidden />
            </button>
          )}
        </div>

        {/* error */}
        {error && (
          <div className="mx-4 mb-1 flex items-center justify-between gap-2 rounded-xl border border-store-sale/30 bg-store-sale/5 px-3 py-2 text-[0.78rem] text-store-sale">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {error}
            </span>
            <button type="button" onClick={() => submit(draft)} className="focus-ring inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bold hover:bg-store-sale/10">
              <RotateCcw className="size-3.5" aria-hidden />
              تلاش دوباره
            </button>
          </div>
        )}

        {/* composer */}
        <div className="border-t border-store-border bg-store-surface px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {attachment && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-store-border bg-store-surface-warm px-2.5 py-1.5 text-xs">
              <Paperclip className="size-3.5 text-store-text-faint" aria-hidden />
              <span className="max-w-40 truncate text-store-text">{attachment.name}</span>
              <button type="button" onClick={() => setAttachment(null)} aria-label="حذف پیوست" className="text-store-sale">
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-store-border-strong bg-store-surface-warm px-2.5 py-2 transition-colors focus-within:border-store-primary">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="پیوست تصویر"
              className="focus-ring grid size-8 shrink-0 place-items-center rounded-xl text-store-text-faint transition-colors hover:bg-store-surface-soft hover:text-store-primary disabled:opacity-50"
            >
              {uploading ? <Loader2 className="size-[1.1rem] animate-spin" aria-hidden /> : <Paperclip className="size-[1.1rem]" aria-hidden />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <textarea
              ref={composerRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onComposerKey}
              rows={1}
              placeholder={config.composerPlaceholder}
              aria-label="نوشتن پیام"
              className="max-h-28 min-h-[1.5rem] flex-1 resize-none border-0 bg-transparent text-[0.86rem] leading-7 text-store-text outline-none placeholder:text-store-text-faint"
            />
            <button
              type="button"
              onClick={() => submit(draft)}
              disabled={sending || (!draft.trim() && !attachment)}
              aria-label="ارسال پیام"
              className="focus-ring grid size-9 shrink-0 place-items-center rounded-xl bg-store-primary text-white transition-colors hover:bg-store-primary-hover disabled:bg-store-disabled"
            >
              {sending ? <Loader2 className="size-[1.15rem] animate-spin" aria-hidden /> : <Send className="size-[1.15rem]" aria-hidden />}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function AttachmentView({ attachment, mine }: { attachment: Attach; mine: boolean }) {
  if (attachment.mime.startsWith("image/")) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="mb-1.5 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={attachment.url} alt={attachment.name} className="max-h-52 w-auto rounded-lg" />
      </a>
    );
  }
  return (
    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className={`mb-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${mine ? "bg-white/15" : "bg-store-surface"}`}>
      <Paperclip className="size-3.5" aria-hidden />
      {attachment.name}
    </a>
  );
}

function RatingCard({ onSubmit }: { onSubmit: (stars: number, comment: string) => void }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <li className="my-1 flex flex-col items-center gap-2 rounded-2xl border border-store-border bg-store-surface-warm p-4 text-center">
      <p className="text-[0.82rem] font-bold text-store-text">گفت‌وگو چطور بود؟</p>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} ستاره`} onMouseEnter={() => setHover(n)} onClick={() => setStars(n)} className="focus-ring rounded p-0.5">
            <Star className={`size-6 ${n <= (hover || stars) ? "fill-store-gold text-store-gold" : "text-store-border-strong"}`} aria-hidden />
          </button>
        ))}
      </div>
      {stars > 0 && (
        <>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="نظرتان (اختیاری)"
            className="w-full rounded-xl border border-store-border bg-store-surface px-3 py-2 text-[0.8rem] text-store-text outline-none placeholder:text-store-text-faint focus:border-store-primary"
          />
          <button type="button" onClick={() => onSubmit(stars, comment)} className="focus-ring inline-flex items-center gap-1.5 rounded-store-pill bg-store-primary px-4 py-1.5 text-[0.78rem] font-bold text-white hover:bg-store-primary-hover">
            ثبت امتیاز
          </button>
        </>
      )}
    </li>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3" aria-hidden>
      <div className="h-12 w-3/5 self-start rounded-2xl rounded-ss-md bg-store-surface-soft" />
      <div className="h-10 w-2/5 self-end rounded-2xl rounded-ee-md bg-store-primary-soft" />
      <div className="h-16 w-3/4 self-start rounded-2xl rounded-ss-md bg-store-surface-soft" />
      <div className="h-9 w-1/3 self-end rounded-2xl rounded-ee-md bg-store-primary-soft" />
    </div>
  );
}

function ChatWelcome({
  config,
  isGuest,
  guest,
  onGuestChange,
  onQuickAction,
}: {
  config: ChatPublicConfig;
  isGuest: boolean;
  guest: { name: string; phone: string };
  onGuestChange: (g: { name: string; phone: string }) => void;
  onQuickAction: (label: string) => void;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const showGuestFields = isGuest && config.preChatMode !== "off";
  const required = config.preChatMode === "required";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <Avatar size="lg" />
        <div>
          <h2 className="font-heading text-base font-bold text-store-text">{config.welcomeTitle}</h2>
          <p className="mx-auto mt-1.5 max-w-xs text-[0.82rem] leading-7 text-store-text-muted">{config.welcomeBody}</p>
        </div>
        {config.operatorsOnline && config.responseTimeLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-store-pill bg-store-primary-soft px-3 py-1 text-[0.72rem] font-medium text-store-primary-hover">
            <OnlineDot online />
            {config.responseTimeLabel}
          </span>
        )}
      </div>

      {config.quickActions.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {config.quickActions.map((q, i) => {
            const Icon = resolveNavIcon(q.icon, q.label, "");
            return (
              <button
                key={`${q.label}-${i}`}
                type="button"
                onClick={() => onQuickAction(q.label)}
                className="focus-ring group flex items-center gap-2 rounded-2xl border border-store-border bg-store-surface px-3 py-2.5 text-start text-[0.8rem] font-semibold text-store-text transition-colors hover:border-store-primary hover:bg-store-primary-tint"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-store-primary-soft text-store-primary-hover transition-colors group-hover:bg-store-primary group-hover:text-white">
                  <Icon className="size-[1.05rem]" aria-hidden />
                </span>
                <span className="leading-5">{q.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {config.faq.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[0.74rem] font-bold text-store-text-muted">سوال‌های پرتکرار</p>
          <div className="overflow-hidden rounded-2xl border border-store-border">
            {config.faq.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-store-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="focus-ring flex w-full items-center justify-between gap-2 bg-store-surface px-3 py-2.5 text-start text-[0.8rem] font-semibold text-store-text transition-colors hover:bg-store-surface-soft"
                  >
                    {f.question}
                    <ChevronDown className={`size-4 shrink-0 text-store-text-faint transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {isOpen && <p className="bg-store-surface-warm px-3 pb-3 pt-1 text-[0.78rem] leading-7 text-store-text-muted">{f.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showGuestFields && (
        <div className="flex flex-col gap-2 rounded-2xl border border-store-border-soft bg-store-surface-warm p-3">
          <p className="text-[0.74rem] font-medium text-store-text-muted">
            اطلاعات تماس{" "}
            <span className="text-store-text-faint">{required ? "(الزامی)" : "(اختیاری — برای پیگیری بهتر)"}</span>
          </p>
          <input
            value={guest.name}
            onChange={(e) => onGuestChange({ ...guest, name: e.target.value })}
            placeholder="نام شما"
            aria-label="نام شما"
            className="w-full rounded-xl border border-store-border bg-store-surface px-3 py-2 text-[0.82rem] text-store-text outline-none placeholder:text-store-text-faint focus:border-store-primary"
          />
          <input
            value={guest.phone}
            onChange={(e) => onGuestChange({ ...guest, phone: e.target.value })}
            inputMode="tel"
            dir="ltr"
            placeholder="۰۹۱۲…"
            aria-label="شماره تماس"
            className="w-full rounded-xl border border-store-border bg-store-surface px-3 py-2 text-start text-[0.82rem] text-store-text outline-none placeholder:text-store-text-faint focus:border-store-primary"
          />
        </div>
      )}

      {config.fallbackLinks.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-store-border pt-3">
          <p className="text-[0.72rem] font-medium text-store-text-faint">یا از این راه‌ها در تماس باشید:</p>
          <div className="flex flex-wrap gap-2">
            {config.fallbackLinks.map((l, i) => {
              const Icon = resolveNavIcon(l.icon, l.label, l.href);
              return (
                <a
                  key={`${l.href}-${i}`}
                  href={l.href}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-store-pill border border-store-border bg-store-surface px-3 py-1.5 text-[0.76rem] font-semibold text-store-text-muted transition-colors hover:border-store-primary hover:text-store-primary"
                >
                  <Icon className="size-4" aria-hidden />
                  {l.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
