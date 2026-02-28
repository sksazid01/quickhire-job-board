"use client";

import { useSyncExternalStore } from "react";
import { dismiss, getSnapshot, subscribe } from "@/lib/toast";

export function ToastProvider() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, () => []);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl px-5 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)] text-sm font-medium transition-all animate-in fade-in slide-in-from-bottom-3 ${
            t.variant === "success"
              ? "bg-emerald-600 text-white"
              : t.variant === "error"
              ? "bg-red-600 text-white"
              : "bg-[var(--color-foreground)] text-white"
          }`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="ml-2 shrink-0 opacity-70 transition hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
