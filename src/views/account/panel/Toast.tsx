"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Check } from "lucide-react";

const ToastContext = createContext<(message: string) => void>(() => {});

/** Fire a short confirmation toast from any panel section. */
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[130] flex justify-center px-4"
      >
        <div
          className={`flex items-center gap-2 rounded-full bg-store-ink px-5 py-3 text-sm font-bold text-store-text-inverse shadow-store-popover transition-all duration-200 ${
            message ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <Check className="size-4 text-store-honey" aria-hidden />
          <span>{message}</span>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
