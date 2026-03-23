"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  PenLine,
  Shield,
  House,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/authStore";
import { Button } from "./button";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/dashboard", label: "Dashboard", auth: true, icon: LayoutDashboard },
  { href: "/editor", label: "Write", auth: true, icon: PenLine },
  { href: "/admin", label: "Admin", admin: true, icon: Shield },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const visible = links.filter((l) => {
    if ("admin" in l && l.admin) return user?.role === "ADMIN";
    if ("auth" in l && l.auth) return !!user;
    return true;
  });

  const linkClass = (href: string) => {
    const active = pathname === href;
    return cn(
      "inline-flex items-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] px-4 py-2 text-[0.8125rem] font-semibold no-underline transition-[background,color,box-shadow,transform] duration-[var(--motion-fast)] ease-[var(--motion-ease)]",
      active
        ? "bg-accent text-white shadow-[0_2px_12px_rgba(244,54,81,0.35)]"
        : "text-dark/75 hover:bg-dark/[0.07] hover:text-dark active:scale-[0.98]",
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-dark/10",
        "bg-[color-mix(in_srgb,var(--color-white)_88%,var(--color-surface))]",
        "shadow-[0_6px_28px_rgba(22,22,22,0.06)]",
        "supports-[backdrop-filter]:bg-white/75 supports-[backdrop-filter]:backdrop-blur-md",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-accent/90 to-transparent opacity-80"
        aria-hidden
      />

      <div className="container-design flex min-h-[68px] flex-col gap-2 py-2 md:flex-row md:items-center md:justify-between md:gap-[var(--spacing-lg)] md:py-0 md:pt-0">
        <div className="flex min-h-[52px] items-center justify-between gap-3 md:min-h-0">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-[var(--radius-pill)] py-1 pl-1 pr-1 no-underline transition-transform duration-[var(--motion-fast)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-accent text-white shadow-[var(--shadow-card)] ring-2 ring-white transition-[box-shadow,transform] group-hover:shadow-[var(--shadow-card-hover)]"
              aria-hidden
            >
              <BookOpen className="size-[1.15rem]" strokeWidth={2.25} />
            </span>
            <span className="font-hero text-[1.1rem] font-bold tracking-[0.03em] text-dark">
              STORIES
            </span>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            {user ? (
              <>
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/12 text-[0.65rem] font-bold text-accent ring-2 ring-accent/20"
                  title={user.name}
                >
                  {initials(user.name)}
                </span>
                <Button
                  variant="ghost"
                  className="!min-h-9 !px-3 !py-2 !text-[0.8rem]"
                  onClick={() => {
                    useAuthStore.getState().clearAuth();
                    window.location.href = "/";
                  }}
                >
                  Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="!min-h-9 !px-3 !py-2 !text-[0.8rem]">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="accent" className="!min-h-9 !px-4 !py-2 !text-[0.8rem]">
                    Join
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <nav
          className="hidden flex-1 items-center justify-center gap-1.5 md:flex md:px-4"
          aria-label="Main"
        >
          {visible.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                <Icon
                  className={cn("size-3.5 shrink-0", active ? "text-white" : "text-dark/50")}
                  strokeWidth={2.25}
                  aria-hidden
                />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <nav
          className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          aria-label="Main mobile"
        >
          {visible.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                <Icon
                  className={cn("size-3.5 shrink-0", active ? "text-white" : "text-dark/50")}
                  strokeWidth={2.25}
                  aria-hidden
                />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 border-l border-dark/10 pl-4 md:flex">
          {user ? (
            <>
              <span className="hidden max-w-[120px] truncate text-right text-[0.8125rem] font-semibold text-dark md:inline lg:max-w-[180px]">
                {user.name}
              </span>
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/12 text-[0.7rem] font-bold text-accent ring-2 ring-accent/15"
                title={user.name}
              >
                {initials(user.name)}
              </span>
              <Button
                variant="ghost"
                className="!border-[1.5px] !border-dark/12 !py-2 !text-[0.8125rem]"
                onClick={() => {
                  useAuthStore.getState().clearAuth();
                  window.location.href = "/";
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="!border-[1.5px] !border-dark/12 !py-2 !text-[0.8125rem]"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="accent" className="!px-6 !py-2 !text-[0.8125rem]">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
