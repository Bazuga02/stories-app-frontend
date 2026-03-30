"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
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

/** Editorial nav link — matches footer rhythm (uppercase, letterspaced). */
function NavTextLink({
  href,
  active,
  mobile,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "font-login-label block w-full border-b border-outline-variant/20 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors last:border-b-0 dark:border-white/10",
          active
            ? "text-primary dark:text-[#f43651]"
            : "text-on-surface/70 hover:text-on-surface dark:text-[#e7e7d8]/65 dark:hover:text-[#e7e7d8]",
        )}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "font-login-label relative whitespace-nowrap py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors sm:text-xs sm:tracking-[0.16em]",
        active
          ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-primary dark:text-[#f43651] dark:after:bg-[#f43651]"
          : "text-on-surface/48 hover:text-on-surface dark:text-[#e7e7d8]/45 dark:hover:text-[#e7e7d8]",
      )}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavId = "main-mobile-nav";

  const exploreActive = pathname === "/";
  const allStoriesActive = pathname === "/stories";
  const fablesActive = pathname === "/short-stories";

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-outline-variant/30 bg-editorial-surface dark:border-white/8 dark:bg-[#161616]">
      <div className="relative z-60 mx-auto grid min-h-14 w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 bg-editorial-surface px-4 py-2 dark:bg-[#161616] sm:min-h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-headline text-lg font-black tracking-tighter text-primary dark:text-[#f43651] sm:text-xl md:text-2xl"
        >
          Stories
        </Link>

        <div
          className="-mx-1 hidden min-w-0 items-center justify-start gap-4 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 md:flex md:justify-center md:overflow-visible lg:gap-7 [&::-webkit-scrollbar]:hidden"
          aria-label="Main navigation"
        >
          <NavTextLink href="/" active={exploreActive}>
            Explore
          </NavTextLink>
          <NavTextLink href="/stories" active={allStoriesActive}>
            All stories
          </NavTextLink>
          <NavTextLink href="/short-stories" active={fablesActive}>
            Fables
          </NavTextLink>
          {user ? (
            <>
              <NavTextLink href="/editor" active={pathname === "/editor"}>
                Write
              </NavTextLink>
              <NavTextLink href="/dashboard" active={pathname === "/dashboard"}>
                Dashboard
              </NavTextLink>
              {user.role === "ADMIN" ? (
                <NavTextLink href="/admin" active={pathname === "/admin"}>
                  Admin
                </NavTextLink>
              ) : null}
            </>
          ) : (
            <NavTextLink href="/login" active={pathname === "/login"}>
              Log in
            </NavTextLink>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-4">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg border border-outline-variant/35 text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/8 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-white/12 dark:text-[#e7e7d8] dark:hover:text-[#f43651] md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileNavId}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" strokeWidth={2.25} aria-hidden />
            ) : (
              <Menu className="size-5" strokeWidth={2.25} aria-hidden />
            )}
          </button>
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-outline-variant/35 bg-surface-container-low text-[0.6rem] font-bold text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/8 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-white/12 dark:bg-white/5 dark:text-[#e7e7d8] dark:hover:text-[#f43651] sm:size-9 sm:text-[0.65rem]"
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
                  className="absolute right-0 z-60 mt-2 w-[min(17rem,calc(100vw-2rem))] rounded-lg border border-outline-variant/20 bg-editorial-surface p-1 editorial-shadow dark:border-white/10 dark:bg-[#1e1e1e]"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="border-b border-outline-variant/15 px-4 py-3 dark:border-white/10">
                    <p className="truncate font-headline text-sm font-bold text-on-surface dark:text-[#e7e7d8]">
                      {user.name}
                    </p>
                    <p className="truncate pt-0.5 text-xs text-on-surface/70 dark:text-[#e7e7d8]/65">
                      {user.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-md px-4 py-3 text-left text-sm font-bold text-on-surface transition-colors hover:bg-primary/10 hover:text-primary dark:text-[#e7e7d8]"
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
              className="font-login-label rounded-full border border-primary bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-on-primary shadow-sm transition-[color,background-color,box-shadow] hover:bg-primary-container hover:shadow-md dark:border-[#f43651] dark:bg-[#f43651] dark:hover:bg-[#d62f47] sm:px-4 sm:text-[11px] sm:tracking-[0.14em]"
            >
              Get started
            </Link>
          )}
        </div>
      </div>

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] md:hidden"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={closeMobileMenu}
          />
          <div
            id={mobileNavId}
            className="absolute left-0 right-0 top-full z-50 max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto border-b border-outline-variant/25 bg-editorial-surface px-4 py-2 editorial-shadow dark:border-white/10 dark:bg-[#1a1a1a] md:hidden"
            role="navigation"
            aria-label="Main navigation"
          >
            <NavTextLink href="/" active={exploreActive} mobile onNavigate={closeMobileMenu}>
              Explore
            </NavTextLink>
            <NavTextLink href="/stories" active={allStoriesActive} mobile onNavigate={closeMobileMenu}>
              All stories
            </NavTextLink>
            <NavTextLink href="/short-stories" active={fablesActive} mobile onNavigate={closeMobileMenu}>
              Fables
            </NavTextLink>
            {user ? (
              <>
                <NavTextLink href="/editor" active={pathname === "/editor"} mobile onNavigate={closeMobileMenu}>
                  Write
                </NavTextLink>
                <NavTextLink
                  href="/dashboard"
                  active={pathname === "/dashboard"}
                  mobile
                  onNavigate={closeMobileMenu}
                >
                  Dashboard
                </NavTextLink>
                {user.role === "ADMIN" ? (
                  <NavTextLink href="/admin" active={pathname === "/admin"} mobile onNavigate={closeMobileMenu}>
                    Admin
                  </NavTextLink>
                ) : null}
              </>
            ) : (
              <NavTextLink href="/login" active={pathname === "/login"} mobile onNavigate={closeMobileMenu}>
                Log in
              </NavTextLink>
            )}
          </div>
        </>
      ) : null}
    </nav>
  );
}
