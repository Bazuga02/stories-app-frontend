"use client";

import { useEffect } from "react";

/**
 * Full-screen auth UI: prevents the main document from scrolling (navbar + footer
 * still mount in the root layout, so without this their stacked height + an h-screen
 * spacer causes a body scrollbar). Inner content scrolls only when it exceeds the viewport.
 */
export function AuthFullscreenShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-100 flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden ${className ?? ""}`}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain">
        {children}
      </div>
    </div>
  );
}
