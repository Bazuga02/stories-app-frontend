"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, PenLine, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/cn";
import { logout } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useEditorChromeStore } from "@/store/editorChromeStore";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function signOut() {
  void logout().finally(() => {
    window.location.href = "/";
  });
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
          "font-login-label block rounded-xl px-3.5 py-3 text-sm font-bold tracking-wide transition-colors",
          active
            ? "bg-primary text-on-primary shadow-md shadow-primary/25"
            : "text-[#e7e7d8]/70 hover:bg-white/5 hover:text-[#fafaeb]",
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
        "font-login-label group relative whitespace-nowrap text-sm font-bold tracking-wide transition-colors",
        active ? "text-[#fafaeb]" : "text-[#e7e7d8]/55 hover:text-[#fafaeb]",
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-200",
          active
            ? "w-full opacity-100"
            : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-60",
        )}
      />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const editorActive = useEditorChromeStore((s) => s.active);
  const editorSaving = useEditorChromeStore((s) => s.saving);
  const editorPublishing = useEditorChromeStore((s) => s.publishing);
  const saveDraft = useEditorChromeStore((s) => s.saveDraft);
  const publish = useEditorChromeStore((s) => s.publish);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavId = "main-mobile-nav";

  const exploreActive = pathname === "/";
  const allStoriesActive = pathname === "/stories";
  const fablesActive = pathname === "/short-stories";
  const onEditor = pathname === "/editor" || pathname.startsWith("/editor/");
  const showEditorActions = onEditor && editorActive;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-white/10 bg-[#161616]/95 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "border-white/5 bg-[#161616]",
      )}
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex min-h-14 items-center justify-between gap-3 py-2.5 sm:min-h-16 sm:gap-4 sm:py-3"
          aria-label="Main navigation"
        >
          <BrandLogo
            className="shrink-0"
            textClassName="font-headline text-lg font-black tracking-tighter text-[#fafaeb] transition-colors hover:text-primary sm:text-xl"
          />

          <div
            className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex xl:gap-8"
            aria-label="Main navigation links"
          >
            {navLinks}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full text-[#e7e7d8]/70 transition-colors hover:bg-white/10 hover:text-[#fafaeb] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
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
                {showEditorActions ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="hidden rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-wider text-[#e7e7d8]/80 uppercase sm:inline-block">
                      Draft
                    </span>
                    <button
                      type="button"
                      disabled={editorSaving || editorPublishing}
                      className="font-login-label hidden text-sm font-bold text-[#e7e7d8]/80 transition-colors hover:text-[#fafaeb] disabled:opacity-50 sm:inline-flex"
                      onClick={() => saveDraft?.()}
                    >
                      {editorSaving ? "Saving…" : "Save draft"}
                    </button>
                    <button
                      type="button"
                      disabled={editorSaving || editorPublishing}
                      className="inline-flex items-center rounded-full bg-primary px-3.5 py-2 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container hover:scale-[1.02] disabled:opacity-60 sm:px-4 sm:py-2.5"
                      onClick={() => publish?.()}
                    >
                      {editorPublishing ? "Publishing…" : "Publish"}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/editor"
                    className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container hover:scale-[1.02] sm:inline-flex"
                  >
                    <PenLine className="size-4" strokeWidth={2.25} aria-hidden />
                    Write
                  </Link>
                )}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-on-primary shadow-md shadow-primary/25 ring-2 ring-white/10 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:size-10 sm:text-[0.7rem]"
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
                      className="absolute right-0 z-60 mt-3 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c] p-1 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="font-headline truncate text-sm font-bold text-[#fafaeb]">
                          {user.name}
                        </p>
                        <p className="truncate pt-0.5 font-login-body text-xs text-[#e7e7d8]/55">
                          {user.email}
                        </p>
                      </div>
                      {showEditorActions ? (
                        <button
                          type="button"
                          role="menuitem"
                          disabled={editorSaving || editorPublishing}
                          className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-bold text-[#e7e7d8]/80 transition-colors hover:bg-white/5 hover:text-[#fafaeb] disabled:opacity-50 sm:hidden"
                          onClick={() => {
                            setProfileOpen(false);
                            saveDraft?.();
                          }}
                        >
                          {editorSaving ? "Saving…" : "Save draft"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-bold text-[#e7e7d8]/80 transition-colors hover:bg-primary/15 hover:text-primary"
                        onClick={() => {
                          setProfileOpen(false);
                          signOut();
                        }}
                      >
                        <LogOut className="size-4 shrink-0" aria-hidden />
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container hover:scale-[1.02] sm:px-5"
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
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={closeMobileMenu}
            />
            <div
              id={mobileNavId}
              className="absolute left-4 right-4 top-[calc(100%+0.35rem)] z-50 max-h-[min(70vh,calc(100dvh-6rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#161616] p-2 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:left-6 sm:right-6 lg:hidden"
              role="navigation"
              aria-label="Main navigation"
            >
              <NavTextLink href="/" active={exploreActive} mobile onNavigate={closeMobileMenu}>
                Explore
              </NavTextLink>
              <NavTextLink
                href="/stories"
                active={allStoriesActive}
                mobile
                onNavigate={closeMobileMenu}
              >
                All stories
              </NavTextLink>
              <NavTextLink
                href="/short-stories"
                active={fablesActive}
                mobile
                onNavigate={closeMobileMenu}
              >
                Fables
              </NavTextLink>
              {user ? (
                <>
                  <NavTextLink
                    href="/editor"
                    active={pathname === "/editor" || pathname.startsWith("/editor/")}
                    mobile
                    onNavigate={closeMobileMenu}
                  >
                    Write
                  </NavTextLink>
                  {showEditorActions ? (
                    <>
                      <button
                        type="button"
                        disabled={editorSaving || editorPublishing}
                        className="font-login-label block w-full rounded-xl px-3.5 py-3 text-left text-sm font-bold tracking-wide text-[#e7e7d8]/70 transition-colors hover:bg-white/5 hover:text-[#fafaeb] disabled:opacity-50"
                        onClick={() => {
                          closeMobileMenu();
                          saveDraft?.();
                        }}
                      >
                        {editorSaving ? "Saving…" : "Save draft"}
                      </button>
                      <button
                        type="button"
                        disabled={editorSaving || editorPublishing}
                        className="font-login-label mt-1 block w-full rounded-xl bg-primary px-3.5 py-3 text-left text-sm font-bold tracking-wide text-on-primary shadow-md shadow-primary/25 transition-colors disabled:opacity-60"
                        onClick={() => {
                          closeMobileMenu();
                          publish?.();
                        }}
                      >
                        {editorPublishing ? "Publishing…" : "Publish"}
                      </button>
                    </>
                  ) : null}
                  <NavTextLink
                    href="/dashboard"
                    active={pathname === "/dashboard"}
                    mobile
                    onNavigate={closeMobileMenu}
                  >
                    Dashboard
                  </NavTextLink>
                  {user.role === "ADMIN" ? (
                    <NavTextLink
                      href="/admin"
                      active={pathname === "/admin"}
                      mobile
                      onNavigate={closeMobileMenu}
                    >
                      Admin
                    </NavTextLink>
                  ) : null}
                </>
              ) : (
                <NavTextLink
                  href="/login"
                  active={pathname === "/login"}
                  mobile
                  onNavigate={closeMobileMenu}
                >
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
