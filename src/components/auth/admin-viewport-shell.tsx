"use client";

import { useEffect } from "react";

/** Full-viewport admin shell above site chrome; locks body scroll while mounted. */
export function AdminViewportShell({ children }: { children: React.ReactNode }) {
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
    <div className="fixed inset-0 z-60 flex h-dvh max-h-dvh flex-col overflow-hidden bg-editorial-surface font-login-body text-on-surface">
      {children}
    </div>
  );
}
