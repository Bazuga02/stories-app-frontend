import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";

const PORTFOLIO_URL = "https://abhishek02-portfolio.vercel.app/";

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Join" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative mt-auto border-t border-dark/10",
        "bg-[color-mix(in_srgb,var(--color-white)_78%,var(--color-background))]",
        "shadow-[0_-10px_40px_rgba(22,22,22,0.06)]",
        "supports-[backdrop-filter]:bg-[color-mix(in_srgb,white_72%,var(--color-background))]/88 supports-[backdrop-filter]:backdrop-blur-md",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent/90 to-transparent opacity-80"
        aria-hidden
      />

      <div className="container-design py-[var(--spacing-lg)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          {/* Brand */}
          <div className="flex max-w-md flex-col gap-1.5">
            <Link
              href="/"
              className="group flex w-fit shrink-0 items-center gap-2.5 rounded-[var(--radius-pill)] py-1 pl-1 pr-1 no-underline transition-transform duration-[var(--motion-fast)] hover:scale-[1.02] active:scale-[0.98]"
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
            <p className="text-[0.8125rem] leading-snug text-dark/55">
              Long reads, drafts, and ideas worth finishing.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10 lg:items-center lg:gap-12">
            {/* Explore */}
            <div className="flex min-w-[9rem] flex-col gap-1.5">
              <p className=" text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-dark/38">
                Explore
              </p>
              <nav
                className="flex flex-col gap-0"
                aria-label="Footer navigation"
              >
                {exploreLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="-mx-2 w-fit rounded-[var(--radius-md)] px-2 py-1.5 text-[0.8125rem] font-semibold text-dark/68 no-underline transition-[background,color] duration-[var(--motion-fast)] hover:bg-dark/[0.06] hover:text-dark"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 sm:justify-center">
              <p className=" text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-dark/38">
                New here?
              </p>
              <Link
                href="/register"
                className="group inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] bg-accent px-4 py-2 text-[0.8125rem] font-semibold text-white no-underline shadow-[0_3px_16px_rgba(244,54,81,0.22)] transition-[transform,filter,box-shadow] duration-[var(--motion-fast)] hover:brightness-105 hover:shadow-[0_4px_18px_rgba(244,54,81,0.3)] active:scale-[0.98]"
              >
                Get started
                <ArrowRight
                  className="size-3.5 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-dark/[0.08] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-5 sm:gap-y-1">
          <div className="flex flex-col items-center gap-0.5 sm:items-start sm:gap-0">
            <p className="text-center text-[0.75rem] text-dark/42 sm:text-left">
              © {year} Stories. All rights reserved.
            </p>
            <p className="text-center text-[0.7rem] text-dark/38 sm:text-left">
              Made by{" "}
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-dark/55 underline decoration-dark/25 underline-offset-[3px] transition-colors duration-[var(--motion-fast)] hover:text-accent hover:decoration-accent/50"
              >
                Abhishek
              </a>
            </p>
          </div>
          <p className="text-center text-[0.7rem] text-dark/32 sm:text-right">
            Built for readers who still like paragraphs.
          </p>
        </div>
      </div>
    </footer>
  );
}
