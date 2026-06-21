"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuthReady } from "@/components/providers/auth-ready-context";
import { PageLoader } from "@/components/ui/loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const ready = useAuthReady();

  useEffect(() => {
    if (!ready) return;
    if (!accessToken || !user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [ready, accessToken, user, router]);

  if (!ready) return <PageLoader />;
  if (!accessToken || !user) return <PageLoader />;

  return <>{children}</>;
}
