"use client";

import { useState } from "react";
import { Bell, CheckCircle2, X } from "lucide-react";

/**
 * OOS notify — bell button in the card footer + full-card overlay popup.
 *
 * Overlay is position:absolute inset:0 inside the store-card (which is
 * position:relative overflow:hidden), so it covers the entire card cleanly.
 * Matches design-export product-card.js / .dz-product-card__pop structure.
 */
export function NotifyButton({ slug, title, _forceOpen = false, _forceDone = false }: { slug: string; title: string; _forceOpen?: boolean; _forceDone?: boolean }) {
  const [open, setOpen] = useState(_forceOpen || _forceDone);
  const [done, setDone] = useState(_forceDone);
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async () => {
    const val = phone.trim();
    if (!val) return;
    setPending(true);
    try {
      await fetch("/api/storefront/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, phone: val }),
      });
    } catch {
      // best-effort
    }
    setPending(false);
    setDone(true);
  };

  const close = () => {
    setOpen(false);
    setDone(false);
    setPhone("");
  };

  return (
    <>
      {/* Bell button — lives in the card footer action slot */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        aria-label={`اطلاع موجودی ${title}`}
        className="store-card__notify"
      >
        <Bell className="size-4" aria-hidden />
      </button>

      {/* Full-card overlay — position:absolute inset:0 inside store-card */}
      {open && (
        <div
          className={`store-card__npop${done ? " store-card__npop--done" : ""}`}
          role="dialog"
          aria-label={`اطلاع موجودی ${title}`}
        >
          <button
            type="button"
            className="store-card__npop-x"
            aria-label="بستن"
            onClick={close}
          >
            <X className="size-3.5" aria-hidden />
          </button>

          <div className="store-card__npop-in">
            {done ? (
              <>
                <CheckCircle2 className="store-card__npop-icon" aria-hidden />
                <div className="store-card__npop-h">ثبت شد</div>
                <p>به‌محضِ موجود شدن به‌ت خبر می‌دهیم.</p>
              </>
            ) : (
              <>
                <Bell className="store-card__npop-icon" aria-hidden />
                <div className="store-card__npop-h">خبرم کن وقتی موجود شد</div>
                <p>شماره‌ات را بگذار تا به‌محضِ شارژِ موجودی پیامک کنیم.</p>
                <input
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="store-card__npop-input"
                  aria-label={`شماره برای اطلاع موجودی ${title}`}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
                <button
                  type="button"
                  className="store-card__npop-go"
                  onClick={submit}
                  disabled={pending}
                >
                  {pending ? "…" : "ثبت اطلاع‌رسانی"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
