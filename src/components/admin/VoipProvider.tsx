"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  PauseCircle,
  Grid3X3,
  User,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { callOriginateAction } from "@/app/admin/santral/actions";

// ── Types ────────────────────────────────────────────────────────────────

interface OutState {
  num: string;
  name: string;
  phase: "dialing" | "ringing" | "connected" | "ended";
  secs: number;
  muted: boolean;
  held: boolean;
  padOpen: boolean;
}

interface IncState {
  num: string;
  name: string;
  phase: "ringing" | "live";
  secs: number;
  note: string;
  tags: string[];
}

interface VoipCtx {
  out: OutState | null;
  inc: IncState | null;
  startCall: (num: string, name?: string) => void;
  endCall: () => void;
  muteToggle: () => void;
  holdToggle: () => void;
  togglePad: () => void;
}

const Ctx = createContext<VoipCtx | null>(null);

export function useVoip(): VoipCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVoip outside VoipProvider");
  return ctx;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function fmtSecs(s: number): string {
  const m = Math.floor(s / 60),
    ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const AVA_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-400/20 dark:text-violet-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-400/20 dark:text-pink-300",
];
function avaColor(name: string): string {
  return AVA_COLORS[(name.charCodeAt(0) || 0) % AVA_COLORS.length];
}

const TAGS = [
  "پیگیری سفارش",
  "شکایت کیفیت",
  "خرید عمده",
  "فاکتور رسمی",
  "سوال ارسال",
  "مرجوعی",
  "مشتری مهم",
];

// ── Wave Bars ─────────────────────────────────────────────────────────────

function WaveBars({ active }: { active: boolean }) {
  return (
    <span className="inline-flex h-5 items-center gap-[3px]">
      {([0, 0.15, 0.3, 0.45, 0.6] as const).map((delay, i) => (
        <span
          key={i}
          className={`w-[3.5px] rounded-full ${active ? "bg-dz-a-primary-500 dark:bg-dz-a-primary-400" : "bg-dz-a-fg-ghost dark:bg-dz-a-night-faint"}`}
          style={
            active
              ? {
                  animationName: "voipWave",
                  animationDuration: "1s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${delay}s`,
                  height: "4px",
                }
              : { height: "4px" }
          }
        />
      ))}
    </span>
  );
}

// ── Outgoing Panel ────────────────────────────────────────────────────────

const PHASE_TEXT: Record<OutState["phase"], string> = {
  dialing: "در حال شماره‌گیری…",
  ringing: "در حال زنگ خوردن…",
  connected: "تماس برقرار است",
  ended: "تماس پایان یافت",
};

const KEYPAD = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "*", "۰", "#"];

function OutPanel({
  call,
  onEnd,
  onMute,
  onHold,
  onPad,
}: {
  call: OutState;
  onEnd: () => void;
  onMute: () => void;
  onHold: () => void;
  onPad: () => void;
}) {
  const connected = call.phase === "connected";

  return (
    <div
      className="voip-slide-in overflow-hidden rounded-2xl border border-dz-a-primary-200 bg-white shadow-2xl dark:border-dz-a-night-border dark:bg-dz-a-night-card"
      style={{ boxShadow: "0 2.4rem 5rem -1rem rgba(0,0,0,.32)" }}
    >
      {/* head */}
      <div className="flex items-center gap-4 px-7 pb-5 pt-6">
        <span
          className={`flex size-[4.4rem] shrink-0 items-center justify-center rounded-full text-2xl font-bold ${
            call.name
              ? avaColor(call.name)
              : "bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-400"
          }`}
        >
          {call.name ? (
            getInitials(call.name)
          ) : (
            <User className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-bold text-dz-a-fg dark:text-dz-a-night-fg">
            {call.name || "تماس خروجی"}
          </div>
          <div
            className="mt-0.5 font-mono text-sm text-dz-a-fg-ghost dark:text-dz-a-night-faint"
            dir="ltr"
          >
            {call.num}
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-dz-a-primary-50 px-3 py-1.5 text-xs font-bold text-dz-a-primary-700 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300">
          <ShieldCheck className="size-3.5" /> ویپ
        </span>
      </div>

      {/* status */}
      <div className="flex items-center gap-3 border-y border-dz-a-primary-100 bg-gray-50/70 px-7 py-4 dark:border-dz-a-night-border dark:bg-white/2">
        <WaveBars active={call.phase !== "ended"} />
        <span className="flex-1 text-sm font-semibold text-dz-a-fg-muted dark:text-dz-a-night-muted">
          {call.held ? "در انتظار (Hold)" : PHASE_TEXT[call.phase]}
        </span>
        {connected && (
          <span className="font-mono text-sm font-extrabold tracking-wide text-dz-a-primary-600 dark:text-dz-a-primary-400">
            {fmtSecs(call.secs)}
          </span>
        )}
      </div>

      {/* keypad */}
      {connected && call.padOpen && (
        <div className="grid grid-cols-3 gap-2.5 px-7 py-5">
          {KEYPAD.map((k) => (
            <button
              key={k}
              className="rounded-xl border border-dz-a-primary-100 bg-gray-50 py-4 text-xl font-bold text-dz-a-fg transition-all hover:bg-dz-a-primary-50 active:scale-95 dark:border-dz-a-night-border dark:bg-white/3 dark:text-dz-a-night-fg"
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {/* controls */}
      <div className="flex items-center justify-center gap-4 px-7 pb-7 pt-5">
        <CtrlBtn
          active={call.muted}
          disabled={!connected}
          onClick={onMute}
          title="بی‌صدا"
        >
          {call.muted ? (
            <MicOff className="size-5" />
          ) : (
            <Mic className="size-5" />
          )}
        </CtrlBtn>
        <CtrlBtn
          active={call.held}
          disabled={!connected}
          onClick={onHold}
          title="نگه‌داشتن"
        >
          <PauseCircle className="size-5" />
        </CtrlBtn>
        <CtrlBtn disabled={!connected} onClick={onPad} title="صفحه‌کلید">
          <Grid3X3 className="size-5" />
        </CtrlBtn>
        <button
          onClick={onEnd}
          title="پایان تماس"
          className="grid size-[6rem] place-items-center rounded-full bg-red-600 text-white transition-all hover:brightness-90"
        >
          <PhoneOff className="size-5" />
        </button>
      </div>
    </div>
  );
}

function CtrlBtn({
  children,
  active = false,
  disabled = false,
  onClick,
  title,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`grid size-[4.8rem] place-items-center rounded-full border transition-colors disabled:opacity-40 ${
        active
          ? "border-dz-a-primary-500 bg-dz-a-primary-500 text-white"
          : "border-dz-a-primary-100 bg-gray-50 text-dz-a-fg-muted hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-white/3 dark:text-dz-a-night-muted"
      }`}
    >
      {children}
    </button>
  );
}

// ── Incoming Panel ────────────────────────────────────────────────────────

function IncPanel({
  call,
  onAnswer,
  onDecline,
  onHangup,
  onNote,
  onTag,
}: {
  call: IncState;
  onAnswer: () => void;
  onDecline: () => void;
  onHangup: () => void;
  onNote: (n: string) => void;
  onTag: (t: string) => void;
}) {
  const ringing = call.phase === "ringing";
  const known = !!call.name;

  return (
    <div
      className={`voip-slide-in flex flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl dark:bg-dz-a-night-card ${
        ringing
          ? "border-emerald-300 dark:border-emerald-600/30"
          : "border-dz-a-primary-200 dark:border-dz-a-night-border"
      }`}
      style={{ boxShadow: "0 2.8rem 6rem -1rem rgba(0,0,0,.36)" }}
    >
      {/* top bar */}
      <div
        className={`flex items-center gap-4 px-7 py-5 ${
          ringing
            ? "bg-emerald-50 dark:bg-emerald-400/5"
            : "bg-dz-a-primary-50/40 dark:bg-white/3"
        }`}
      >
        <span
          className={`grid size-[4rem] shrink-0 place-items-center rounded-full text-xl ${
            ringing
              ? "cid-pulse-ring bg-emerald-500 text-white"
              : "bg-dz-a-primary-500 text-white"
          }`}
        >
          <Phone className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-dz-a-fg dark:text-dz-a-night-fg">
            {ringing ? "تماس ورودی" : "در حال مکالمه"}
          </div>
          <div className="text-xs text-dz-a-fg-ghost dark:text-dz-a-night-faint">
            سانترال همکاران
          </div>
        </div>
        {ringing ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <ShieldCheck className="size-3" /> ویپ
          </span>
        ) : (
          <span className="font-mono text-base font-extrabold text-dz-a-primary-600 dark:text-dz-a-primary-400">
            {fmtSecs(call.secs)}
          </span>
        )}
      </div>

      {/* caller info */}
      <div className="flex items-start gap-5 px-7 py-6">
        <span
          className={`flex size-[5.4rem] shrink-0 items-center justify-center rounded-full text-3xl font-bold ${
            known
              ? avaColor(call.name)
              : "border-2 border-dashed border-dz-a-primary-200 bg-gray-50 text-dz-a-fg-ghost dark:border-dz-a-night-border dark:bg-white/3"
          }`}
        >
          {known ? (
            getInitials(call.name)
          ) : (
            <User className="size-6" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold text-dz-a-fg dark:text-dz-a-night-fg">
            {known ? call.name : "شمارهٔ ناشناس"}
          </div>
          <div
            className="mt-1 font-mono text-sm text-dz-a-fg-ghost dark:text-dz-a-night-faint"
            dir="ltr"
          >
            {call.num}
          </div>
          {!known && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <TriangleAlert className="size-3.5" /> این شماره در مشتریان ثبت نشده
            </div>
          )}
        </div>
      </div>

      {/* note + tags */}
      <div className="px-7 pb-5">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-dz-a-fg-ghost dark:text-dz-a-night-faint">
          یادداشت تماس
        </div>
        <textarea
          value={call.note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="موضوع تماس را بنویسید…"
          rows={2}
          className="w-full resize-none rounded-xl border border-dz-a-primary-100 bg-gray-50/60 px-3 py-2.5 text-sm text-dz-a-fg placeholder:text-dz-a-fg-ghost focus:border-dz-a-primary-400 focus:outline-none dark:border-dz-a-night-border dark:bg-white/3 dark:text-dz-a-night-fg"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => onTag(t)}
              className={`rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${
                call.tags.includes(t)
                  ? "border-transparent bg-dz-a-primary-100 text-dz-a-primary-700 dark:bg-dz-a-primary-400/20 dark:text-dz-a-primary-300"
                  : "border-dz-a-primary-100 text-dz-a-fg-muted hover:border-dz-a-primary-300 dark:border-dz-a-night-border dark:text-dz-a-night-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* actions */}
      <div className="flex gap-3 border-t border-dz-a-primary-100 bg-gray-50/50 px-7 py-5 dark:border-dz-a-night-border dark:bg-white/2">
        {ringing ? (
          <>
            <button
              onClick={onDecline}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 py-4 text-sm font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white dark:border-red-500/30 dark:text-red-400"
            >
              <PhoneOff className="size-4" /> رد تماس
            </button>
            <button
              onClick={onAnswer}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-sm font-bold text-white transition-all hover:brightness-90"
            >
              <Phone className="size-4" /> پاسخ
            </button>
          </>
        ) : (
          <button
            onClick={onHangup}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold text-white transition-all hover:brightness-90"
          >
            <PhoneOff className="size-4" /> پایان و ثبت تماس
          </button>
        )}
      </div>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────

export function VoipProvider({ children }: { children: ReactNode }) {
  const [out, setOut] = useState<OutState | null>(null);
  const [inc, setInc] = useState<IncState | null>(null);
  const outTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const incTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const outTids = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seenKeys = useRef<Set<string>>(new Set());

  // ── Incoming call polling (webhook events) ────────────────────────────

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/webhooks/hamkaran");
        if (!res.ok) return;
        const { events } = (await res.json()) as {
          events: Array<Record<string, unknown>>;
        };
        for (const ev of events) {
          // Key: uniq|event_name|channel_state_desc — unique per state transition
          const key =
            String(ev.uniq ?? "") +
            "|" + String(ev.event_name ?? "") +
            "|" + String(ev.channel_state_desc ?? "");
          if (!String(ev.uniq ?? "") || seenKeys.current.has(key)) continue;
          seenKeys.current.add(key);

          if (
            ev.event_name === "Newstate" &&
            ev.type === "incoming_call" &&
            (ev.channel_state_desc === "Ringing" ||
              ev.channel_state === "5")
          ) {
            const num = String(ev.source ?? ev.CallerIDNum ?? "");
            if (!num) continue;
            let name = "";
            try {
              const r = await fetch(
                `/api/cid-lookup?number=${encodeURIComponent(num)}`
              );
              const txt = await r.text();
              if (txt && txt !== "unknown") name = txt;
            } catch {}
            setInc((prev) =>
              prev
                ? prev
                : { num, name, phase: "ringing", secs: 0, note: "", tags: [] }
            );
          }

          if (ev.event_name === "Hangup") {
            const hangupNum = String(ev.CallerIDNum ?? "");
            setInc((prev) => {
              if (!prev || prev.phase === "live") return prev;
              if (
                !hangupNum ||
                prev.num.endsWith(hangupNum.slice(-8))
              )
                return null;
              return prev;
            });
          }
        }
      } catch {}
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, []);

  // ── Outgoing call ─────────────────────────────────────────────────────

  const clearOut = useCallback(() => {
    if (outTimer.current) {
      clearInterval(outTimer.current);
      outTimer.current = null;
    }
    outTids.current.forEach((t) => clearTimeout(t));
    outTids.current = [];
  }, []);

  const endCall = useCallback(() => {
    clearOut();
    setOut((p) => (p ? { ...p, phase: "ended" } : null));
    const t = setTimeout(() => setOut(null), 900);
    outTids.current.push(t);
  }, [clearOut]);

  const startCall = useCallback(
    (num: string, name = "") => {
      if (inc) return; // incoming call takes priority
      clearOut();
      setOut({
        num,
        name,
        phase: "dialing",
        secs: 0,
        muted: false,
        held: false,
        padOpen: false,
      });

      callOriginateAction(num).catch(() => {});

      const t1 = setTimeout(
        () => setOut((p) => (p ? { ...p, phase: "ringing" } : null)),
        1300
      );
      const t2 = setTimeout(() => {
        setOut((p) => {
          if (!p) return null;
          outTimer.current = setInterval(() => {
            setOut((s) => (s ? { ...s, secs: s.secs + 1 } : null));
          }, 1000);
          return { ...p, phase: "connected" };
        });
      }, 3000);
      outTids.current.push(t1, t2);
    },
    [inc, clearOut]
  );

  const muteToggle = useCallback(
    () => setOut((p) => (p ? { ...p, muted: !p.muted } : null)),
    []
  );
  const holdToggle = useCallback(
    () => setOut((p) => (p ? { ...p, held: !p.held } : null)),
    []
  );
  const togglePad = useCallback(
    () => setOut((p) => (p ? { ...p, padOpen: !p.padOpen } : null)),
    []
  );

  // ── Incoming actions ──────────────────────────────────────────────────

  const answerIncoming = useCallback(() => {
    incTimer.current = setInterval(
      () => setInc((p) => (p ? { ...p, secs: p.secs + 1 } : null)),
      1000
    );
    setInc((p) => (p ? { ...p, phase: "live" } : null));
  }, []);

  const declineIncoming = useCallback(() => {
    if (incTimer.current) {
      clearInterval(incTimer.current);
      incTimer.current = null;
    }
    setInc(null);
  }, []);

  const hangupIncoming = useCallback(() => {
    if (incTimer.current) {
      clearInterval(incTimer.current);
      incTimer.current = null;
    }
    setInc(null);
  }, []);

  const updateNote = useCallback(
    (note: string) => setInc((p) => (p ? { ...p, note } : null)),
    []
  );
  const toggleTag = useCallback((tag: string) => {
    setInc((p) => {
      if (!p) return null;
      const tags = p.tags.includes(tag)
        ? p.tags.filter((t) => t !== tag)
        : [...p.tags, tag];
      return { ...p, tags };
    });
  }, []);

  return (
    <Ctx.Provider
      value={{ out, inc, startCall, endCall, muteToggle, holdToggle, togglePad }}
    >
      <style>{`
        @keyframes voipWave{0%,100%{height:4px}50%{height:18px}}
        @keyframes cidPulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.5)}50%{box-shadow:0 0 0 10px transparent}}
        @keyframes voipIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
        .voip-slide-in{animation:voipIn .26s cubic-bezier(.22,.61,.36,1) both}
        .cid-pulse-ring{animation:cidPulse 1.1s ease-in-out infinite}
      `}</style>

      {children}

      {/* Outgoing call panel — bottom-left */}
      {out && (
        <div
          style={{
            position: "fixed",
            bottom: "2.4rem",
            left: "2.4rem",
            zIndex: 1200,
            width: "33rem",
            maxWidth: "calc(100vw - 4rem)",
          }}
        >
          <OutPanel
            call={out}
            onEnd={endCall}
            onMute={muteToggle}
            onHold={holdToggle}
            onPad={togglePad}
          />
        </div>
      )}

      {/* Incoming call panel — top-right */}
      {inc && (
        <div
          style={{
            position: "fixed",
            top: "5rem",
            right: "2.4rem",
            zIndex: 1300,
            width: "36rem",
            maxWidth: "calc(100vw - 4rem)",
          }}
        >
          <IncPanel
            call={inc}
            onAnswer={answerIncoming}
            onDecline={declineIncoming}
            onHangup={hangupIncoming}
            onNote={updateNote}
            onTag={toggleTag}
          />
        </div>
      )}
    </Ctx.Provider>
  );
}
