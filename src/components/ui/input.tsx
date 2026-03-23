"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, label, error, id, ...props }, ref) {
    const inputId = id ?? props.name;
    return (
      <div className="flex w-full flex-col gap-[var(--spacing-xs)]">
        {label ? (
          <label htmlFor={inputId} className="text-label">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-[var(--radius-md)] border-[1.5px] border-dark/15 bg-white px-4 py-3 text-[1rem] text-dark placeholder:text-dark/40 outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] ease-[var(--motion-ease)] focus:border-dark focus:ring-2 focus:ring-dark/10",
            error && "border-accent focus:ring-accent/20",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-[0.75rem] font-medium text-accent" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
