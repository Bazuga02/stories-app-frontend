"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-dark text-white rounded-[var(--radius-pill)] px-7 py-3 font-semibold text-[0.9rem] border-none shadow-none hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-[var(--motion-fast)] ease-[var(--motion-ease)] disabled:opacity-50 disabled:pointer-events-none",
  accent:
    "bg-accent text-white rounded-[var(--radius-pill)] px-[22px] py-2.5 font-semibold text-[0.9rem] border-none hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-[var(--motion-fast)] ease-[var(--motion-ease)] disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "bg-transparent text-dark border-[1.5px] border-dark rounded-[var(--radius-pill)] px-[22px] py-2.5 font-semibold hover:bg-dark/5 active:scale-[0.98] transition-[transform,background-color] duration-[var(--motion-fast)] ease-[var(--motion-ease)] disabled:opacity-50 disabled:pointer-events-none",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", isLoading, disabled, children, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          variants[variant],
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);
