"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, Send, ChevronRight, Headset } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { PanelEmpty, PanelError, PanelLoading, SkeletonList, TonePill } from "../ui";

import { CONVERSATION_STATUS } from "../labels";
import { jsonGet, jsonSend } from "../fetcher";
import {
  ACCOUNT_QUERY_KEYS,
  type ConversationListItemDTO,
  type ConversationThreadDTO,
} from "@/lib/account/types";
import { toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";

function Thread({ id, onBack }: { id: string; onBack: () => void }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const q = useQuery({
    queryKey: [...ACCOUNT_QUERY_KEYS.messages, id],
    queryFn: () => jsonGet<ConversationThreadDTO>(`/api/account/messages/${id}`),
  });
  const reply = useMutation({
    mutationFn: (body: string) =>
      jsonSend<ConversationThreadDTO>(`/api/account/messages/${id}`, "POST", { body }),
    onSuccess: (data) => {
      qc.setQueryData([...ACCOUNT_QUERY_KEYS.messages, id], data);
      qc.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.messages });
      qc.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.overview });
      setDraft("");
    },
  });

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (body) reply.mutate(body);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-store-border bg-store-surface shadow-store-xs">
      <div className="flex items-center gap-2 border-b border-store-border px-4 py-3">
        <button type="button" onClick={onBack} className="store-focus rounded-lg p-1 text-store-text-muted lg:hidden">
          <ChevronRight className="size-5" />
        </button>
        <span className="font-bold text-store-text">{q.data?.subject || "گفتگو با پشتیبانی"}</span>
        {q.data && (
          <span className="ms-auto">
            <TonePill tone={CONVERSATION_STATUS[q.data.status].tone}>
              {CONVERSATION_STATUS[q.data.status].label}
            </TonePill>
          </span>
        )}
      </div>

      <div className="flex max-h-[28rem] min-h-[16rem] flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {q.isLoading ? (
          <PanelLoading />
        ) : q.isError ? (
          <PanelError onRetry={() => q.refetch()} />
        ) : (
          q.data!.messages.map((m) => {
            const mine = m.role === "VISITOR";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-7 ${
                    mine
                      ? "bg-store-primary-soft text-store-text"
                      : m.role === "SYSTEM"
                        ? "bg-store-surface-soft text-store-text-faint"
                        : "bg-store-surface-soft text-store-text"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <div className="mt-1 text-[10px] text-store-text-faint">
                    {formatJalali(m.createdAtISO)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-store-border p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="پیامت را بنویس…"
          className="w-full rounded-xl border border-store-border bg-store-surface px-3.5 py-2.5 text-sm text-store-text outline-none focus:border-store-primary"
        />
        <button
          type="submit"
          disabled={reply.isPending || !draft.trim()}
          className="store-btn store-btn-primary shrink-0"
          aria-label="ارسال"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function MessagesSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.messages,
    queryFn: () => jsonGet<{ conversations: ConversationListItemDTO[] }>("/api/account/messages"),
  });
  const list = q.data?.conversations ?? [];

  return (
    <div>
      <SectionHead title="پیام‌ها" sub="گفتگوهای پشتیبانی تو" />
      {q.isLoading ? (
        <SkeletonList rows={4} />
      ) : q.isError ? (
        <PanelError onRetry={() => q.refetch()} />
      ) : list.length === 0 ? (
        <PanelEmpty
          icon={<MessageSquareText className="size-7" />}
          title="هنوز گفتگویی نداری"
          desc="برای پیگیری سفارش یا پرسش، از دکمهٔ گفتگوی پشتیبانی در فروشگاه استفاده کن."
          action={
            <Link href="/" className="store-btn store-btn-primary">
              <Headset className="size-4" /> شروع گفتگو با پشتیبانی
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          {/* list — hidden on mobile when a thread is open */}
          <ul className={`flex-col gap-2 ${openId ? "hidden lg:flex" : "flex"}`}>
            {list.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(c.id)}
                  className={`store-focus w-full rounded-2xl border bg-store-surface p-3.5 text-right shadow-store-xs transition-colors hover:border-store-primary ${
                    openId === c.id ? "border-store-primary" : "border-store-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold text-store-text">
                      {c.subject || "گفتگو با پشتیبانی"}
                    </span>
                    {c.unread > 0 && (
                      <span className="ms-auto grid size-5 shrink-0 place-items-center rounded-full bg-store-primary text-[10px] font-bold text-white">
                        {toPersianNumbers(c.unread)}
                      </span>
                    )}
                  </div>
                  {c.lastMessagePreview && (
                    <p className="mt-1 truncate text-sm text-store-text-faint">
                      {c.lastMessagePreview}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <TonePill tone={CONVERSATION_STATUS[c.status].tone}>
                      {CONVERSATION_STATUS[c.status].label}
                    </TonePill>
                    <span className="text-xs text-store-text-faint">
                      {formatJalali(c.lastMessageAtISO)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* thread */}
          <div className={openId ? "block" : "hidden lg:block"}>
            {openId ? (
              <Thread id={openId} onBack={() => setOpenId(null)} />
            ) : (
              <div className="hidden h-full items-center justify-center rounded-2xl border border-dashed border-store-border text-sm text-store-text-faint lg:flex">
                یک گفتگو را برای مشاهده انتخاب کن
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
