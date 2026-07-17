import { Loader2 } from "lucide-react";

export function BackendWarmupNotice() {
  return (
    <div
      className="relative mb-8 overflow-hidden rounded-2xl bg-primary px-5 py-5 text-on-primary shadow-xl shadow-primary/20 sm:px-6 sm:py-6"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-8 size-36 rounded-full bg-primary-fixed/20 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-6 size-28 rounded-full bg-on-primary/10 blur-2xl"
      />

      <div className="relative flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-on-primary/15 ring-1 ring-on-primary/20">
          <Loader2
            className="size-5 animate-spin text-on-primary"
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-login-label mb-1.5 text-[0.7rem] font-bold tracking-[0.18em] text-primary-fixed uppercase">
            Almost there
          </p>
          <p className="font-headline text-lg font-black leading-tight tracking-tight sm:text-xl">
            Loading stories…
          </p>
          <p className="mt-2 max-w-xl font-login-body text-sm leading-relaxed text-on-primary/85 sm:text-[0.95rem]">
            Our API is waking up on Render&apos;s free tier — this can take
            1–2 minutes. Hang tight; we&apos;re retrying automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
