"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; message: string };

export type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** Floating feedback. Safe to call outside the provider (no-op) so partially
 * migrated screens don't crash. */
export function useAdminToast(): ToastApi {
  const ctx = useContext(ToastContext);
  return ctx ?? NOOP;
}

const NOOP: ToastApi = { success: () => {}, error: () => {}, info: () => {} };

const TONE: Record<ToastType, { icon: typeof CheckCircle2; cls: string }> = {
  success: {
    icon: CheckCircle2,
    cls: "border-dz-a-success/30 bg-dz-a-success/10 text-dz-a-success dark:text-dz-a-success-300",
  },
  error: {
    icon: AlertCircle,
    cls: "border-dz-a-error/30 bg-dz-a-error/10 text-dz-a-error dark:text-dz-a-error-300",
  },
  info: {
    icon: Info,
    cls: "border-dz-a-primary-200 bg-dz-a-primary-50 text-dz-a-primary-700 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg",
  },
};

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { icon: Icon, cls } = TONE[toast.type];
  return (
    <div
      role="status"
      className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur dark:bg-dz-a-night-elevated ${cls}`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 leading-5">{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="بستن" className="shrink-0 opacity-70 transition-opacity hover:opacity-100">
        <X className="size-4" />
      </button>
    </div>
  );
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = (idRef.current += 1);
      setToasts((t) => [...t, { id, type, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), 4000));
    },
    [dismiss],
  );

  // Clear any pending timers on unmount.
  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((tm) => clearTimeout(tm));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex flex-col items-center gap-2 p-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastRow key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
