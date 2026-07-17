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
          gap={12}
          toastOptions={{
            classNames: {
              toast:
                "stories-toast group !items-start !w-[min(calc(100vw-2rem),24rem)] rounded-2xl !py-4 !px-4 !pr-11",
              title:
                "stories-toast-title font-headline text-sm font-bold leading-snug",
              description:
                "stories-toast-description font-login-body mt-0.5 text-sm leading-relaxed",
              closeButton:
                "stories-toast-close !left-auto !right-2.5 !top-3 !transform-none !size-7 !rounded-full !border transition-colors",
            },
          }}
        />
      </AuthReadyProvider>
    </QueryProvider>
  );
}
