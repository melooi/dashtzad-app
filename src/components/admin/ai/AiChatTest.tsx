"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, SendHorizonal, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TriageData = { intent: string; priority: string };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  triage?: TriageData;
  error?: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTimeFa(date: Date): string {
  return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

function PriorityPill({ triage }: { triage: TriageData }) {
  const priorityColors: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    LOW: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };
  const cls = priorityColors[triage.priority] ?? "bg-dz-a-primary-100 text-dz-a-primary-700 dark:bg-dz-a-primary-900/30 dark:text-dz-a-primary-300";
  return (
    <div className="mt-1.5 flex gap-1.5">
      <span className="rounded-full bg-dz-a-primary-100 px-2.5 py-0.5 text-[11px] font-medium text-dz-a-primary-700 dark:bg-dz-a-primary-900/30 dark:text-dz-a-primary-300">
        {triage.intent}
      </span>
      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
        {triage.priority}
      </span>
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-dz-a-primary-100 text-dz-a-primary-600 dark:bg-dz-a-primary-900/40 dark:text-dz-a-primary-300">
      <Bot className="size-4" />
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 pb-0.5">
      <span
        className="size-1.5 animate-bounce rounded-full bg-dz-a-primary-400"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="size-1.5 animate-bounce rounded-full bg-dz-a-primary-400"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="size-1.5 animate-bounce rounded-full bg-dz-a-primary-400"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AiChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Init: create session on mount ─────────────────────────────────────────
  const initSession = useCallback(async () => {
    setSessionError(null);
    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      setSessionReady(true);
    } catch (err) {
      setSessionError("خطا در برقراری ارتباط با سرور. لطفاً صفحه را رفرش کنید.");
      console.error("[AiChatTest] session init error:", err);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // ── Auto-scroll to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming || !sessionReady) return;

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: text.trim(),
      };

      const botMsgId = uid();
      const botMsg: Message = {
        id: botMsgId,
        role: "assistant",
        content: "",
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInput("");
      setStreaming(true);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        const res = await fetch("/api/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), conversationId }),
          credentials: "include",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "خطای ناشناخته" }));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? { ...m, content: errData.error ?? "خطا در دریافت پاسخ", streaming: false, error: true }
                : m
            )
          );
          setStreaming(false);
          return;
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            if (!chunk.trim()) continue;

            const dataLine = chunk.split("\n").find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            let data: Record<string, unknown>;
            try {
              data = JSON.parse(dataLine.slice(6));
            } catch {
              continue;
            }

            const eventLine = chunk.split("\n").find((l) => l.startsWith("event: "));
            const eventType = eventLine?.slice(7).trim() ?? "delta";

            if (eventType === "meta") {
              if (typeof data.conversationId === "string") {
                setConversationId(data.conversationId);
              }
            } else if (eventType === "delta") {
              const text = typeof data.text === "string" ? data.text : "";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, content: m.content + text } : m
                )
              );
            } else if (eventType === "triage") {
              const triage = data as unknown as TriageData;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, triage } : m
                )
              );
            } else if (eventType === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, streaming: false } : m
                )
              );
              setStreaming(false);
            } else if (eventType === "error") {
              const errText = typeof data.message === "string" ? data.message : "خطایی رخ داد";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId
                    ? { ...m, content: errText, streaming: false, error: true }
                    : m
                )
              );
              setStreaming(false);
            }
          }
        }

        // Finalize in case "done" event was missed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId && m.streaming ? { ...m, streaming: false } : m
          )
        );
        setStreaming(false);
      } catch (err) {
        console.error("[AiChatTest] stream error:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? { ...m, content: "خطا در برقراری ارتباط با سرور.", streaming: false, error: true }
              : m
          )
        );
        setStreaming(false);
      }
    },
    [streaming, sessionReady, conversationId]
  );

  // ── Handle key down ────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // ── Reset conversation ─────────────────────────────────────────────────────
  const resetConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setStreaming(false);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-dz-a-primary-100 bg-white px-5 py-3.5 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated">
        <div className="flex size-9 items-center justify-center rounded-xl bg-dz-a-primary-100 text-dz-a-primary-600 dark:bg-dz-a-primary-900/40 dark:text-dz-a-primary-300">
          <Bot className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            دستیار دشت‌زاد
          </span>
          <span className="flex items-center gap-1.5 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            آنلاین
          </span>
        </div>
        <button
          type="button"
          onClick={resetConversation}
          disabled={streaming}
          className="ms-auto flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-primary-600 transition-colors hover:bg-dz-a-primary-50 disabled:pointer-events-none disabled:opacity-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted dark:hover:bg-white/5"
        >
          <RotateCcw className="size-3.5" />
          مکالمه جدید
        </button>
      </div>

      {/* Session error banner */}
      {sessionError && (
        <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {sessionError}
        </div>
      )}

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 && !sessionError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-dz-a-primary-100 text-dz-a-primary-400 dark:bg-dz-a-primary-900/30 dark:text-dz-a-primary-300">
              <Bot className="size-8" />
            </div>
            <p className="text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
              {sessionReady
                ? "یک پیام ارسال کن تا مکالمه شروع شود."
                : "در حال اتصال..."}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const now = new Date();

          if (isUser) {
            return (
              <div key={msg.id} className="flex flex-col items-end gap-1">
                <div className="rounded-2xl rounded-ee-sm bg-dz-a-primary-600 px-4 py-2.5 text-sm text-white max-w-[80%] ms-auto whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
                <span className="text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">
                  {formatTimeFa(now)}
                </span>
              </div>
            );
          }

          // Assistant message
          return (
            <div key={msg.id} className="flex flex-col gap-1">
              <div className="flex items-start gap-2.5">
                <BotAvatar />
                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-2xl rounded-es-sm border px-4 py-2.5 text-sm max-w-[80%] whitespace-pre-wrap break-words ${
                      msg.error
                        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
                        : "border-dz-a-primary-100 bg-white text-dz-a-primary-800 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
                    }`}
                  >
                    {msg.content ? (
                      <>
                        {msg.content}
                        {msg.streaming && (
                          <span className="ms-0.5 inline-block animate-pulse text-dz-a-primary-400">
                            ▋
                          </span>
                        )}
                      </>
                    ) : msg.streaming ? (
                      <TypingDots />
                    ) : null}
                  </div>
                  {msg.triage && <PriorityPill triage={msg.triage} />}
                </div>
              </div>
              {!msg.streaming && (
                <span className="ms-10 text-[10px] text-dz-a-primary-400 dark:text-dz-a-night-faint">
                  {formatTimeFa(now)}
                </span>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-dz-a-primary-100 bg-white px-4 py-3 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated">
        <div className="flex items-end gap-2.5 rounded-2xl border border-dz-a-primary-200 bg-dz-a-primary-50/40 px-3 py-2.5 transition-colors focus-within:border-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-white/3 dark:focus-within:border-dz-a-primary-500">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={streaming || !sessionReady}
            placeholder="پیامی بنویسید..."
            dir="rtl"
            className="flex-1 resize-none bg-transparent text-sm text-dz-a-primary-800 placeholder:text-dz-a-primary-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-faint"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming || !sessionReady}
            className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-600 text-white shadow-xs transition-all hover:bg-dz-a-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="ارسال پیام"
          >
            <SendHorizonal className="size-4 -scale-x-100" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-dz-a-primary-300 dark:text-dz-a-night-faint">
          Enter برای ارسال · Shift+Enter برای خط جدید
        </p>
      </div>
    </div>
  );
}
