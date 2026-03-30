"use client";

/**
 * Auth UI fills the viewport below the sticky navbar (navbar stays visible for nav /
 * hamburger). Inner content scrolls when it exceeds the panel height.
 */
export function AuthFullscreenShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-x-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden sm:top-16 sm:h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4rem)] ${className ?? ""}`}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain">
        {children}
      </div>
    </div>
  );
}
