"use client";

import { TriangleAlert, Check, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/use-hydrated";

export type ToastTone = "success" | "info" | "warn";

interface Toast {
  id: number;
  title: string;
  detail?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (input: { title: string; detail?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { icon: ReactNode; ring: string }> = {
  success: {
    icon: <Check size={14} strokeWidth={3} />,
    ring: "bg-positive text-white",
  },
  info: { icon: <Info size={14} strokeWidth={2.5} />, ring: "bg-accent text-white" },
  warn: {
    icon: <TriangleAlert size={14} strokeWidth={2.5} />,
    ring: "bg-warn text-white",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mounted = useHydrated();
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      detail,
      tone = "success",
    }: {
      title: string;
      detail?: string;
      tone?: ToastTone;
    }) => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((current) => [...current.slice(-2), { id, title, detail, tone }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            className={cn(
              "pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4",
              "sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end",
            )}
          >
            {toasts.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "animate-slide-in pointer-events-auto flex w-full max-w-sm items-start gap-3",
                  "rounded-xl border border-line bg-surface p-3 pr-2 shadow-lg",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                    TONE_STYLES[item.tone].ring,
                  )}
                >
                  {TONE_STYLES[item.tone].icon}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13px] font-semibold text-ink">
                    {item.title}
                  </p>
                  {item.detail && (
                    <p className="mt-0.5 text-[12px] leading-snug text-muted">
                      {item.detail}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Fermer la notification"
                  className="press grid size-6 shrink-0 place-items-center rounded-md text-faint hover:bg-subtle hover:text-ink"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé dans un <ToastProvider>.");
  }
  return context;
}
