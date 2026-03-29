"use client";

import { useEffect } from "react";

/** Full-viewport editor above site chrome (navbar/footer). */
export function EditorViewportShell({ children }: { children: React.ReactNode }) {
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
    <div className="fixed inset-0 z-[65] flex h-dvh max-h-dvh flex-col overflow-hidden bg-editorial-surface font-login-body text-on-surface">
      {children}
    </div>
  );
}
