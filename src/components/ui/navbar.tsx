"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, PenLine, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
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
          "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/90",
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
        "whitespace-nowrap text-sm font-medium transition-colors",
        active ? "text-white" : "text-white/45 hover:text-white/80",
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

  const navLinks = (
    <>
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
    </>
  );

  return (
    <header className="sticky top-0 z-50 flex w-full justify-center px-4">
      <div className="relative w-full max-w-4xl">
        <nav
          className="flex min-h-14 items-center justify-between gap-3 rounded-b-[1.25rem] border-x border-b border-white/10 bg-[#0a0a0a]/95 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:min-h-[3.75rem] sm:gap-4 sm:rounded-b-[1.375rem] sm:px-4 sm:py-2.5"
          aria-label="Main navigation"
        >
          <BrandLogo
            className="shrink-0 pl-0.5"
            textClassName="text-[15px] text-white sm:text-base"
          />

          <div
            className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex lg:gap-7 xl:gap-8"
            aria-label="Main navigation links"
          >
            {navLinks}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 lg:hidden"
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
              <>
                <Link
                  href="/editor"
                  className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 sm:inline-flex"
                >
                  <PenLine className="size-4" strokeWidth={2.25} aria-hidden />
                  Write
                </Link>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-[0.6rem] font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 sm:size-9 sm:text-[0.65rem]"
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
                      className="absolute right-0 z-60 mt-3 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-1 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                        <p className="truncate pt-0.5 text-xs text-white/50">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
              </>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container sm:px-4"
              >
                <PenLine className="size-4 sm:hidden" strokeWidth={2.25} aria-hidden />
                <span className="hidden sm:inline">Get started</span>
                <span className="sm:hidden">Join</span>
              </Link>
            )}
          </div>
        </nav>

        {mobileMenuOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={closeMobileMenu}
            />
            <div
              id={mobileNavId}
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,calc(100dvh-6rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a]/98 p-2 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden"
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
      </div>
    </header>
  );
}
