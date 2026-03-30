"use client";

import { Toaster } from "sonner";
import { LegalDocumentModals } from "@/components/legal/LegalDocumentModals";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { useLegalModalStore } from "@/store/legalModalStore";
import { AuthReadyProvider } from "./auth-ready-context";
import { QueryProvider } from "./query-provider";

function GlobalLegalModals() {
  const open = useLegalModalStore((s) => s.open);
  const close = useLegalModalStore((s) => s.close);
  return <LegalDocumentModals open={open} onClose={close} />;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const ready = useAuthBootstrap();

  return (
    <QueryProvider>
      <AuthReadyProvider ready={ready}>
        {children}
        <GlobalLegalModals />
        <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast:
              "rounded-[var(--radius-md)] bg-surface text-dark border-dark/10 shadow-[var(--shadow-card)]",
            title: "text-dark font-semibold",
            description: "text-dark/70",
          },
        }}
      />
      </AuthReadyProvider>
    </QueryProvider>
  );
}
