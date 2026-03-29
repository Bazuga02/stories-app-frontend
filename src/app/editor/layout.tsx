import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EditorViewportShell } from "@/components/auth/editor-viewport-shell";

export const metadata: Metadata = {
  title: "Write — Stories",
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <>
        <div className="h-dvh shrink-0" aria-hidden />
        <EditorViewportShell>{children}</EditorViewportShell>
      </>
    </AuthGuard>
  );
}
