"use client";

// Recipe star rating (RECIPE-CP1) — MODERATED. Anyone can rate (no login wall),
// but a new/changed rating is saved PENDING and does NOT change the public
// average until an admin approves it. Low ratings (<4) open a feedback form.
// The displayed aggregate (average + count) comes from APPROVED ratings only.
import { useEffect, useState } from "react";
import { Star, Users, X, Send } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";
import { RATING_FEEDBACK_REASONS, LOW_RATING_THRESHOLD } from "@/lib/blog/recipe";

function faAverage(avg: number): string {
  return toPersianNumbers(avg.toFixed(1)).replace(".", "٫");
}

function getGuestKey(): string {
  try {
    let k = localStorage.getItem("dz_gk");
    if (!k) {
      k = (crypto.randomUUID?.() ?? String(Math.random())) + "-" + Date.now().toString(36);
      localStorage.setItem("dz_gk", k);
    }
    return k;
  } catch {
    return "anon-" + Date.now().toString(36);
  }
}

export function RecipeRating({
  postId,
  average,
  count,
  userValue: initialUserValue,
  userPending: initialUserPending,
}: {
  postId: string;
  average: number;
  count: number;
  userValue: number | null;
  userPending: boolean;
}) {
  const [userValue, setUserValue] = useState<number | null>(initialUserValue);
  const [pending, setPending] = useState<boolean>(initialUserPending);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [justRated, setJustRated] = useState<null | "high" | "low">(null);

  // feedback modal (low ratings)
  const [showFeedback, setShowFeedback] = useState(false);
  const [lowValue, setLowValue] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fbErr, setFbErr] = useState("");
  const [fbBusy, setFbBusy] = useState(false);

  // Remember an anonymous rating across reloads (logged-in value comes from server).
  useEffect(() => {
    if (initialUserValue != null) return;
    const stored = Number(localStorage.getItem(`dz_rt_${postId}`));
    if (stored >= 1 && stored <= 5) {
      queueMicrotask(() => { setUserValue(stored); setPending(true); });
    }
  }, [postId, initialUserValue]);

  const display = hover || userValue || 0;

  const postRate = async (value: number, extra?: Record<string, unknown>) => {
    const res = await fetch("/api/recipe/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, value, guestKey: getGuestKey(), ...extra }),
    });
    return res.ok ? res.json() : null;
  };

  const clickStar = async (value: number) => {
    if (busy) return;
    setBusy(true);
    setUserValue(value);
    try {
      localStorage.setItem(`dz_rt_${postId}`, String(value));
    } catch {
      /* ignore */
    }
    try {
      const data = await postRate(value);
      if (data) setPending(true);
      if (value < LOW_RATING_THRESHOLD) {
        setLowValue(value);
        setShowFeedback(true);
        setJustRated(null);
      } else {
        setJustRated("high");
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const toggleReason = (k: string) => setReasons((r) => (r.includes(k) ? r.filter((x) => x !== k) : [...r, k]));

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length < 5) {
      setFbErr("برای ثبت بازخورد، شماره تماس را وارد کن.");
      return;
    }
    setFbBusy(true);
    setFbErr("");
    try {
      await postRate(lowValue, {
        guestName: name.trim() || undefined,
        guestPhone: phone.trim(),
        feedbackText: feedbackText.trim() || undefined,
        feedbackReasons: reasons,
      });
      setShowFeedback(false);
      setJustRated("low");
    } catch {
      setFbErr("خطا در ارسال بازخورد.");
    } finally {
      setFbBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {count > 0 && (
        <div className="flex min-w-[3.5rem] flex-col items-center justify-center rounded-xl border border-store-primary/30 bg-store-primary-soft px-2.5 py-1.5 leading-none">
          <span className="font-heading text-2xl font-extrabold text-store-primary-hover tabular-nums">{faAverage(average)}</span>
          <span className="mt-0.5 text-[10px] font-semibold text-store-primary">از ۵</span>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              disabled={busy}
              onMouseEnter={() => setHover(v)}
              onClick={() => clickStar(v)}
              aria-label={`${toPersianNumbers(v)} ستاره`}
              className="-m-0.5 cursor-pointer p-1.5 disabled:cursor-wait"
            >
              <Star className={`size-5 ${v <= display ? "fill-store-gold text-store-gold" : "text-store-border-strong"}`} />
            </button>
          ))}
        </div>

        {justRated === "high" ? (
          <span className="text-xs text-store-primary">امتیازت ثبت شد و پس از بررسی نمایش داده می‌شود.</span>
        ) : justRated === "low" ? (
          <span className="text-xs text-store-primary">ممنون! بازخوردت ثبت شد و پس از بررسی بررسی می‌شود.</span>
        ) : userValue != null ? (
          <span className="text-xs text-store-text-faint">
            امتیاز شما: {toPersianNumbers(userValue)} از ۵{pending ? " (در انتظار بررسی)" : ""}
          </span>
        ) : count > 0 ? (
          <span className="flex items-center gap-1 text-xs text-store-text-faint tabular-nums">
            <Users className="size-3.5" /> {toPersianNumbers(count)} نفر امتیاز داده‌اند
          </span>
        ) : (
          <span className="text-xs text-store-text-faint">اولین نفری باش که امتیاز می‌دهد.</span>
        )}
      </div>

      {/* low-rating feedback modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-5">
          <button type="button" aria-label="بستن" onClick={() => setShowFeedback(false)} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-lg overflow-y-auto rounded-2xl bg-store-surface p-6 text-store-text shadow-xl" style={{ maxHeight: "90vh" }}>
            <button type="button" onClick={() => setShowFeedback(false)} aria-label="بستن" className="absolute end-3.5 top-3.5 grid size-9 place-items-center rounded-full bg-store-surface-warm text-store-text-muted hover:bg-store-border">
              <X className="size-4" />
            </button>
            <h3 className="font-heading text-lg font-bold">کمک می‌کنی این دستور بهتر شود؟</h3>
            <p className="mt-1.5 text-sm leading-7 text-store-text-muted">امتیازت ثبت شد، اما برای اینکه دقیق‌تر اصلاحش کنیم بگو مشکل کجا بود.</p>

            <form onSubmit={submitFeedback} className="mt-4 flex flex-col gap-3.5">
              <div>
                <p className="mb-2 text-sm font-bold">«کجای این دستور به نظرت درست نبود؟»</p>
                <div className="flex flex-wrap gap-2">
                  {RATING_FEEDBACK_REASONS.map((r) => {
                    const on = reasons.includes(r.key);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => toggleReason(r.key)}
                        aria-pressed={on}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          on ? "border-store-primary bg-store-primary text-store-text-inverse" : "border-store-border-strong bg-store-surface text-store-text-muted hover:border-store-primary"
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="توضیح بیشتر (اختیاری)…"
                className="w-full resize-y rounded-xl border border-store-border-strong bg-store-surface px-3.5 py-2.5 text-sm leading-7 outline-none placeholder:text-store-text-faint focus:border-store-primary"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="نام (اختیاری)" className="w-full rounded-xl border border-store-border-strong bg-store-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-store-text-faint focus:border-store-primary" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" maxLength={40} placeholder="شماره تماس" className="w-full rounded-xl border border-store-border-strong bg-store-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-store-text-faint focus:border-store-primary" />
              </div>
              {fbErr && <p className="text-xs text-store-clay-deep">{fbErr}</p>}
              <button type="submit" disabled={fbBusy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-store-primary px-4 py-3 text-sm font-bold text-store-text-inverse hover:bg-store-primary-hover disabled:opacity-70">
                <Send className="size-4" /> {fbBusy ? "در حال ارسال…" : "ارسال بازخورد"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
