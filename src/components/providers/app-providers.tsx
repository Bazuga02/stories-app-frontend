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
          closeButton
          offset={16}
          toastOptions={{
            classNames: {
              toast:
                "group !items-start rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-on-surface shadow-[var(--shadow-card)] !py-3.5 !px-4 !pr-10",
              title: "font-headline text-sm font-bold text-on-surface",
              description:
                "font-login-body text-sm leading-relaxed text-on-secondary-container",
              closeButton:
                "!left-auto !right-2 !top-3 !transform-none !size-7 !rounded-full !border !border-outline-variant/40 !bg-surface-container-high !text-on-surface transition-colors hover:!border-primary/30 hover:!bg-primary/10 hover:!text-primary",
              info: "!border-primary/25 !bg-primary/5",
              success: "!border-primary/20",
              error: "!border-error/30 !bg-error-container/20",
            },
          }}
        />
      </AuthReadyProvider>
    </QueryProvider>
  );
}
