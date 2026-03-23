"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, label, error, id, autoComplete, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name;

    return (
      <div className="flex w-full flex-col gap-[var(--spacing-xs)]">
        {label ? (
          <label htmlFor={inputId} className="text-label">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            className={cn(
              "w-full rounded-[var(--radius-md)] border-[1.5px] border-dark/15 bg-white py-3 pl-4 pr-12 text-[1rem] text-dark placeholder:text-dark/40 outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] ease-[var(--motion-ease)] focus:border-dark focus:ring-2 focus:ring-dark/10",
              error && "border-accent focus:ring-accent/20",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-[var(--radius-sm)] text-dark/55 outline-none transition-colors hover:bg-dark/5 hover:text-dark focus-visible:ring-2 focus-visible:ring-dark/15"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            tabIndex={0}
          >
            {visible ? <EyeOff className="size-5" strokeWidth={1.75} /> : <Eye className="size-5" strokeWidth={1.75} />}
          </button>
        </div>
        {error ? (
          <p className="text-[0.75rem] font-medium text-accent" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
