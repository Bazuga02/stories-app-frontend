"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/dashboard", label: "My stories", icon: LayoutDashboard },
  { href: "/editor", label: "New story", icon: PenLine },
] as const;

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)]",
        "border border-dark/10 bg-[color-mix(in_srgb,var(--color-white)_90%,var(--color-surface))]",
        "shadow-[var(--shadow-card-hover)]",
        "supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-sm",
        "md:w-[15.5rem]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-90"
        aria-hidden
      />

      <div className="p-[var(--spacing-md)] pb-[var(--spacing-lg)] pt-[calc(var(--spacing-md)+2px)]">
        <div className="mb-[var(--spacing-lg)] flex items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent/12 text-accent ring-2 ring-accent/15"
            aria-hidden
          >
            <Sparkles className="size-[1.05rem]" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent">
              Workspace
            </p>
            <p className="font-display text-[0.95rem] font-black uppercase tracking-wide text-dark">
              Your desk
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Workspace">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-[0.875rem] font-semibold no-underline transition-[background,color,box-shadow,transform] duration-[var(--motion-fast)] ease-[var(--motion-ease)]",
                  active
                    ? "bg-accent text-white shadow-[0_4px_16px_rgba(244,54,81,0.32)]"
                    : "text-dark/80 hover:bg-dark/[0.06] hover:text-dark active:scale-[0.99]",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-dark/[0.06] text-dark/55 group-hover:bg-dark/10 group-hover:text-dark",
                  )}
                >
                  <Icon className="size-[1.05rem]" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="leading-tight">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-[var(--spacing-lg)] border-t border-dashed border-dark/15 pt-[var(--spacing-md)]">
          <div
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.8125rem] font-medium text-dark/40"
            aria-disabled
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-dark/[0.04]">
              <Settings className="size-[1.05rem] opacity-50" strokeWidth={2} aria-hidden />
            </span>
            <span>Settings — soon</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
