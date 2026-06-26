"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/common/Button";
import { toPersianNumbers } from "@/lib/price";

export function CommentForm({ postId, withRating = false }: { postId: string; withRating?: boolean }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 2) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, text, ...(withRating && rating ? { rating } : {}) }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(data.message ?? "نظر شما ثبت شد.");
        setText("");
        setRating(0);
      } else {
        setStatus("error");
        setMessage(data.error ?? "خطا در ثبت نظر.");
      }
    } catch {
      setStatus("error");
      setMessage("خطا در ارتباط با سرور.");
    }
  };

  if (status === "done") {
    return (
      <p className="rounded-xl bg-dz-primary-50 p-4 text-sm text-dz-success">{message}</p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {withRating && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-store-text-muted">امتیاز شما به این دستور:</span>
          <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onMouseEnter={() => setHover(v)}
                onClick={() => setRating(v)}
                aria-label={`${toPersianNumbers(v)} ستاره`}
                className="-m-0.5 cursor-pointer p-1.5"
              >
                <Star className={`size-5 ${v <= (hover || rating) ? "fill-store-gold text-store-gold" : "text-store-border-strong"}`} />
              </button>
            ))}
          </div>
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="نظر خود را بنویسید…"
        className="w-full rounded-xl border border-dz-primary-200 bg-white p-4 text-sm outline-none focus:border-dz-primary-500"
      />
      {status === "error" && <span className="text-xs text-dz-error">{message}</span>}
      <Button type="submit" disabled={status === "sending"} className="self-start">
        {status === "sending" ? "در حال ارسال…" : "ثبت نظر"}
      </Button>
    </form>
  );
}
