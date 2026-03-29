"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, PenLine, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/authStore";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function signOut() {
  useAuthStore.getState().clearAuth();
  window.location.href = "/";
}

const navLink =
  "font-headline text-base font-bold transition-colors duration-300 md:text-lg";

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const exploreActive = pathname === "/";
  const allStoriesActive = pathname === "/stories";

  useEffect(() => {
    if (!profileOpen) return;
    const onDocDown = (e: MouseEvent) => {
      const el = profileMenuRef.current;
      if (el && !el.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-editorial-surface transition-colors duration-300 dark:bg-[#161616]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-headline text-2xl font-black tracking-tighter text-primary dark:text-[#f43651] sm:text-3xl"
          >
            Stories
          </Link>

          <div className="hidden items-center gap-6 md:flex md:gap-8">
            <Link
              href="/"
              className={cn(
                navLink,
                exploreActive
                  ? "border-b-2 border-primary pb-1 text-primary dark:text-[#f43651]"
                  : "text-on-surface opacity-80 hover:text-primary dark:text-[#e7e7d8]",
              )}
            >
              Explore
            </Link>
            <Link
              href="/stories"
              className={cn(
                navLink,
                allStoriesActive
                  ? "border-b-2 border-primary pb-1 text-primary dark:text-[#f43651]"
                  : "text-on-surface opacity-80 hover:text-primary dark:text-[#e7e7d8]",
              )}
            >
              All stories
            </Link>
            <Link
              href="/#short-stories"
              className={cn(
                navLink,
                "text-on-surface opacity-80 hover:text-primary dark:text-[#e7e7d8]",
              )}
            >
              Short stories
            </Link>
            {user && (
              <>
                <Link
                  href="/editor"
                  className={cn(
                    navLink,
                    pathname === "/editor"
                      ? "border-b-2 border-primary pb-1 text-primary"
                      : "text-on-surface opacity-80 hover:text-primary dark:text-[#e7e7d8]",
                  )}
                >
                  Write
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    navLink,
                    pathname === "/dashboard"
                      ? "border-b-2 border-primary pb-1 text-primary"
                      : "text-on-surface opacity-80 hover:text-primary dark:text-[#e7e7d8]",
                  )}
                >
                  Dashboard
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={cn(
                      navLink,
                      pathname === "/admin"
                        ? "border-b-2 border-primary pb-1 text-primary"
                        : "text-on-surface opacity-80 hover:text-primary dark:text-[#e7e7d8]",
                    )}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary/15 text-[0.65rem] font-bold text-primary ring-2 ring-primary/20 transition-colors hover:bg-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-10 sm:text-[0.7rem]"
                  title={user.name}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label={`Account menu for ${user.name}`}
                  onClick={() => setProfileOpen((o) => !o)}
                >
                  {initials(user.name)}
                </button>
                {profileOpen ? (
                  <div
                    className="absolute right-0 z-60 mt-2 w-56 rounded-xl border border-outline-variant/20 bg-editorial-surface py-2 editorial-shadow dark:border-white/10 dark:bg-[#1e1e1e]"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="border-b border-outline-variant/15 px-3 pb-2 dark:border-white/10">
                      <p className="truncate font-headline text-sm font-bold text-on-surface dark:text-[#e7e7d8]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-on-surface/70 dark:text-[#e7e7d8]/65">
                        {user.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-bold text-on-surface transition-colors hover:bg-primary/10 hover:text-primary dark:text-[#e7e7d8]"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                    >
                      <LogOut className="size-4 shrink-0 opacity-80" aria-hidden />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/register"
                className="scale-95 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 transition-transform active:scale-90 sm:px-8 sm:py-3"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-outline-variant/20 pt-3 md:hidden">
          <Link
            href="/"
            className={cn(
              "text-sm font-bold",
              exploreActive ? "text-primary" : "text-on-surface/80",
            )}
          >
            Explore
          </Link>
          <Link
            href="/stories"
            className={cn(
              "text-sm font-bold",
              allStoriesActive ? "text-primary" : "text-on-surface/80",
            )}
          >
            All stories
          </Link>
          <Link href="/#short-stories" className="text-sm font-bold text-on-surface/80">
            Short stories
          </Link>
          {user && (
            <>
              <Link href="/editor" className="inline-flex items-center gap-1 text-sm font-bold text-on-surface/80">
                <PenLine className="size-3.5" />
                Write
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sm font-bold text-on-surface/80"
              >
                <LayoutDashboard className="size-3.5" />
                Dash
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-bold text-on-surface/80">
                  <Shield className="size-3.5" />
                  Admin
                </Link>
              )}
            </>
          )}
          {!user && (
            <Link href="/login" className="ml-auto text-sm font-bold text-primary">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
