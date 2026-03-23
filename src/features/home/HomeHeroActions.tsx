"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export function HomeHeroActions() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return (
      <div className="mt-[var(--spacing-xl)] flex flex-wrap gap-[var(--spacing-sm)]">
        <Link href="/editor">
          <Button variant="accent">Write a story</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="primary">Your stories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-[var(--spacing-xl)] flex flex-wrap gap-[var(--spacing-sm)]">
      <Link href="/register">
        <Button variant="accent">Start writing</Button>
      </Link>
      <Link href="/login">
        <Button variant="primary">Sign in</Button>
      </Link>
    </div>
  );
}
