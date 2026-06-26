"use client";

// Recipe like toggle (RECIPE-CP1) — backed by the real PostLike model. NO login
// required (anonymous toggles are tracked by a server cookie + remembered locally).
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

export function RecipeLikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  // Reflect an anonymous like across reloads (logged-in state comes from the server).
  useEffect(() => {
    if (initialLiked) return;
    if (localStorage.getItem(`dz_lk_${postId}`) === "1") queueMicrotask(() => setLiked(true));
  }, [postId, initialLiked]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/recipe/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setCount(data.count ?? 0);
        try {
          if (data.liked) localStorage.setItem(`dz_lk_${postId}`, "1");
          else localStorage.removeItem(`dz_lk_${postId}`);
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold tabular-nums transition-colors disabled:opacity-70 ${
        liked
          ? "border-store-clay bg-store-clay-soft text-store-clay-deep"
          : "border-store-border-strong bg-store-surface text-store-text-muted hover:border-store-clay hover:text-store-clay"
      }`}
    >
      <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
      {count > 0 && <span>{toPersianNumbers(count)}</span>}
      <span className="font-semibold text-store-text-faint">پسند</span>
    </button>
  );
}
