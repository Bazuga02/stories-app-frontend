import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-dark/10",
        className,
      )}
      {...props}
    />
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] bg-surface p-6 shadow-[var(--shadow-card)]">
      <Skeleton className="mb-3 h-6 w-3/4 max-w-md" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-2 h-4 w-5/6" />
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
