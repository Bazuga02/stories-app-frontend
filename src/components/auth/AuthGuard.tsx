"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useAuthReady } from "@/components/providers/auth-ready-context";
import { PageLoader } from "@/components/ui/loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthReady();

  useEffect(() => {
    if (!ready) return;
    if (!getStoredToken() || !user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [ready, user, router]);

  if (!ready) return <PageLoader />;
  if (!getStoredToken() || !user) return <PageLoader />;

  return <>{children}</>;
}
