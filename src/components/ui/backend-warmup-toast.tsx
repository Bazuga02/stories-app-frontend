"use client";

import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

export const BACKEND_WARMUP_TOAST_ID = "backend-cold-start";

export function showBackendWarmupToast() {
  toast.custom(
    (t) => (
      <div
        className="pointer-events-auto flex w-[min(calc(100vw-2rem),28rem)] items-start gap-3 rounded-xl border border-primary/25 bg-surface-container-lowest p-4 shadow-[var(--shadow-floating)]"
        role="status"
        aria-live="polite"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-headline text-sm font-bold leading-snug text-on-surface">
            Backend is starting up
          </p>
          <p className="mt-1 font-login-body text-xs leading-relaxed text-on-secondary-container sm:text-sm">
            Render&apos;s free tier can take 1–2 minutes after idle. Hang tight —
            we&apos;re retrying automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(t)}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-high text-on-surface transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          aria-label="Dismiss notification"
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    ),
    {
      id: BACKEND_WARMUP_TOAST_ID,
      duration: 120_000,
      unstyled: true,
    },
  );
}
