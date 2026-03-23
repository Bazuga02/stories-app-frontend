"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, label, error, id, ...props }, ref) {
    const tid = id ?? props.name;
    return (
      <div className="flex w-full flex-col gap-[var(--spacing-xs)]">
        {label ? (
          <label htmlFor={tid} className="text-label">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={tid}
          className={cn(
            "min-h-[200px] w-full resize-y rounded-[var(--radius-md)] border-[1.5px] border-dark/15 bg-white px-4 py-3 text-[1rem] leading-relaxed text-dark placeholder:text-dark/40 outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] ease-[var(--motion-ease)] focus:border-dark focus:ring-2 focus:ring-dark/10",
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
