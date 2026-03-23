import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-[var(--motion-default)] ease-[var(--motion-ease)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardInner({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] bg-white p-8 shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}
