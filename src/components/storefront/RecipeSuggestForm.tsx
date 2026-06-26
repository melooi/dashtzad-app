"use client";

// «کمک به بهتر شدن این دستور» (RECIPE-CP1) — a real suggestion form. Submits to
// /api/recipe/suggest which stores a RecipeSuggestion (PENDING) for editor
// review. No discount code (coupon system is locked / out of scope).
import { useState } from "react";
import { Sprout, X, Send, CheckCircle2, ShieldCheck } from "lucide-react";

type Status = "idle" | "sending" | "done" | "error";

export function RecipeSuggestForm({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const reset = () => {
    setName("");
    setPhone("");
    setText("");
    setStatus("idle");
    setMessage("");
  };

  const close = () => {
    setOpen(false);
    // let the closing animation finish before clearing
    setTimeout(reset, 200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || phone.trim().length < 5 || text.trim().length < 5) {
      setStatus("error");
      setMessage("لطفاً نام، شماره تماس و پیشنهادت را کامل وارد کن.");
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/recipe/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, name, phone, text }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(data.message ?? "پیشنهادت ثبت شد.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "خطا در ثبت پیشنهاد.");
      }
    } catch {
      setStatus("error");
      setMessage("خطا در ارتباط با سرور.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-store-border-strong bg-store-surface px-3.5 py-2.5 text-sm text-store-text outline-none transition-colors placeholder:text-store-text-faint focus:border-store-primary";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-store-primary-soft px-3.5 py-2 text-sm font-bold text-store-primary-hover transition-colors hover:bg-store-primary hover:text-store-text-inverse"
      >
        <Sprout className="size-4" /> کمک به بهتر شدن این دستور
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-5">
          <button type="button" aria-label="بستن" onClick={close} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
          <div role="dialog" aria-modal="true" aria-labelledby="suggest-title" className="relative z-10 w-full max-w-lg overflow-y-auto rounded-2xl bg-store-surface p-6 shadow-xl" style={{ maxHeight: "90vh" }}>
            <button type="button" onClick={close} aria-label="بستن" className="absolute end-3.5 top-3.5 grid size-9 place-items-center rounded-full bg-store-surface-warm text-store-text-muted transition-colors hover:bg-store-border hover:text-store-text">
              <X className="size-4" />
            </button>

            {status === "done" ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto size-12 text-store-primary" />
                <h3 className="mt-2 font-heading text-xl font-bold text-store-text">ممنون از مشارکتت!</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-store-text-muted">{message}</p>
                <button type="button" onClick={close} className="mt-5 w-full rounded-xl border border-store-border-strong px-4 py-2.5 text-sm font-bold text-store-text-muted transition-colors hover:bg-store-surface-warm">
                  بستن
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3.5">
                <div className="text-center">
                  <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full border border-store-gold bg-store-primary-soft text-store-primary-hover">
                    <Sprout className="size-6" />
                  </span>
                  <h3 id="suggest-title" className="font-heading text-lg font-bold text-store-text">با مشارکت شما، این دستور کامل‌تر می‌شود</h3>
                  <p className="mt-1.5 text-sm leading-7 text-store-text-muted">اگر فکر می‌کنی مراحل پخت را می‌شود بهتر و کامل‌تر نوشت، خوشحال می‌شویم کمک کنی! واضح و مرحله‌به‌مرحله بنویس.</p>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-store-text">نام شما</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} placeholder="مثلاً زهرا رحیمی" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-store-text">شماره تماس</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" inputMode="tel" maxLength={40} placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-store-text">پیشنهاد تو برای بهتر شدن دستور</span>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={5} maxLength={2000} placeholder="مرحله‌ها یا نکته‌هایی که فکر می‌کنی باید اضافه یا اصلاح شود را این‌جا بنویس…" className={`${inputClass} resize-y leading-7`} />
                </label>

                {status === "error" && <p className="text-xs text-store-clay-deep">{message}</p>}

                <button type="submit" disabled={status === "sending"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-store-primary px-4 py-3 text-sm font-bold text-store-text-inverse transition-colors hover:bg-store-primary-hover disabled:opacity-70">
                  <Send className="size-4" /> {status === "sending" ? "در حال ارسال…" : "ارسال پیشنهاد"}
                </button>
                <p className="flex items-start gap-1.5 text-xs leading-6 text-store-text-faint">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-store-primary" />
                  پیشنهادت پس از بررسی و تأیید سردبیر بررسی می‌شود.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
