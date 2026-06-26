"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import {
  ADMIN_ACCENTS,
  DEFAULT_ACCENT,
  loadAccent,
  saveAccent,
  type AdminAccent,
} from "@/lib/admin/accent";

export function AdminAccentPicker() {
  const [current, setCurrent] = useState<AdminAccent>(DEFAULT_ACCENT);

  useEffect(() => {
    setCurrent(loadAccent());
  }, []);

  function pick(accent: AdminAccent) {
    saveAccent(accent);
    setCurrent(accent);
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {ADMIN_ACCENTS.map((a) => {
        const active = current === a.id;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => pick(a.id)}
            aria-label={a.label}
            aria-pressed={active}
            title={a.label}
            className="group flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ "--ring-color": a.swatch } as React.CSSProperties}
          >
            {/* gradient strip */}
            <span
              className="relative w-full h-8 rounded-lg overflow-hidden shadow-sm transition-all"
              style={{
                background: `linear-gradient(135deg, ${a.mid} 0%, ${a.swatch} 60%)`,
                outline: active
                  ? `2px solid ${a.swatch}`
                  : "2px solid transparent",
                outlineOffset: "2px",
                boxShadow: active
                  ? `0 0 0 4px ${a.swatch}22`
                  : "0 1px 3px rgba(0,0,0,0.10)",
              }}
            >
              {active && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="size-4 text-white drop-shadow" strokeWidth={3} />
                </span>
              )}
              {/* canvas preview dot */}
              <span
                className="absolute bottom-1 end-1 size-2 rounded-full border border-white/50"
                style={{ background: a.canvas }}
              />
            </span>
            {/* label */}
            <span
              className="text-[11px] font-medium leading-none transition-colors"
              style={{ color: active ? a.swatch : undefined }}
            >
              {a.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
