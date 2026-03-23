"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AuthGuard } from "./AuthGuard";
import { useAuthReady } from "@/components/providers/auth-ready-context";
import { PageLoader } from "@/components/ui/loader";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthReady();

  useEffect(() => {
    if (!ready || !user) return;
    if (user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  if (!ready) return <PageLoader />;

  return (
    <AuthGuard>
      {user?.role === "ADMIN" ? children : <PageLoader />}
    </AuthGuard>
  );
}
