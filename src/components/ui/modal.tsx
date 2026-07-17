"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  /** Editorial story-style panel (cream surface, Epilogue title). Default keeps white card. */
  variant?: "default" | "editorial";
  /** Tighter padding and title for small tool panels (e.g. listen player). */
  compact?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  variant = "default",
  compact = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-110 flex items-center justify-center p-[var(--spacing-md)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 backdrop-blur-sm",
          variant === "editorial"
            ? "bg-on-background/45"
            : "bg-dark/40 backdrop-blur-[2px]",
        )}
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full",
          compact ? "max-w-sm" : "max-w-lg",
          variant === "editorial"
            ? cn(
                "border border-outline-variant/15 bg-surface-container-low font-login-body text-on-background editorial-shadow",
                compact
                  ? "rounded-2xl p-4 sm:p-5"
                  : "rounded-[2rem] p-6 sm:p-8",
              )
            : "rounded-[var(--radius-lg)] bg-white p-[var(--spacing-lg)] shadow-[var(--shadow-floating)]",
          className,
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-3",
            compact ? "mb-3" : variant === "editorial" ? "mb-6" : "mb-[var(--spacing-md)]",
          )}
        >
          <h2
            id="modal-title"
            className={cn(
              variant === "editorial"
                ? cn(
                    "font-headline font-black tracking-tighter text-on-background",
                    compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl",
                  )
                : "text-section-heading text-[1.25rem]",
            )}
          >
            {title}
          </h2>
          {variant === "editorial" ? (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full text-on-secondary-container transition-colors hover:bg-surface-container-high hover:text-on-background",
                compact ? "p-1.5" : "p-2",
              )}
              aria-label="Close"
            >
              <X className={compact ? "size-4" : "size-5"} strokeWidth={2} />
            </button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="!min-h-0 !px-3 !py-2"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-5" />
            </Button>
          )}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
