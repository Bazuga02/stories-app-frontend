"use client";

import { Toaster } from "sonner";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { AuthReadyProvider } from "./auth-ready-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const ready = useAuthBootstrap();

  return (
    <AuthReadyProvider ready={ready}>
      {children}
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
  );
}
