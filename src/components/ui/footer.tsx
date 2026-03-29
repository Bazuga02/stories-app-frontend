"use client";

import Link from "next/link";
import { useLegalModalStore } from "@/store/legalModalStore";
import { cn } from "@/lib/cn";

const PORTFOLIO_URL = "https://abhishek02-portfolio.vercel.app/";

const linkClass =
  "font-login-label text-sm tracking-wide text-[#e7e7d8] uppercase opacity-60 transition-opacity duration-200 hover:text-[#f43651] hover:opacity-100";

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();
  const showPrivacy = useLegalModalStore((s) => s.showPrivacy);
  const showTerms = useLegalModalStore((s) => s.showTerms);

  return (
    <footer
      className={cn(
        "w-full bg-[#161616] px-6 py-10 dark:bg-black sm:px-8 sm:py-12",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row md:gap-6">
        <div className="font-headline text-xl font-black text-[#fafaeb] sm:text-2xl md:mb-0">Stories.</div>
        <nav
          className="flex flex-wrap justify-center gap-6 sm:gap-8"
          aria-label="Footer links"
        >
          <Link
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            LinkedIn
          </Link>
          <button type="button" className={linkClass} onClick={showPrivacy}>
            Privacy
          </button>
          <button type="button" className={linkClass} onClick={showTerms}>
            Terms
          </button>
        </nav>
        <div className="flex flex-col items-center gap-1 text-center md:items-end md:text-right">
          <p className="font-login-label text-sm tracking-wide text-[#e7e7d8] opacity-60">
            © {year} Stories Editorial. All rights reserved.
          </p>
          <p className="text-xs text-[#e7e7d8]/50">
            Made by{" "}
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#e7e7d8]/70 underline decoration-[#e7e7d8]/30 underline-offset-2 hover:text-[#f43651]"
            >
              Abhishek
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
