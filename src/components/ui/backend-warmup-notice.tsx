import { Loader2 } from "lucide-react";

export function BackendWarmupNotice() {
  return (
    <div
      className="mb-8 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4"
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="mt-0.5 size-5 shrink-0 animate-spin text-primary"
        aria-hidden
      />
      <div>
        <p className="font-headline text-sm font-bold text-on-surface">
          Loading stories…
        </p>
        <p className="mt-1 font-login-body text-sm text-on-secondary-container">
          Stories may take 1–2 minutes to load while our API wakes up on
          Render&apos;s free tier. Please wait — we&apos;re retrying
          automatically.
        </p>
      </div>
    </div>
  );
}
