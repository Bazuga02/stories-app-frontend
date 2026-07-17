import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialHome } from "@/features/home/EditorialHome";
import { HomeFeed } from "@/features/feed/HomeFeed";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <EditorialHome />
      <section className="border-t border-outline-variant/20 bg-editorial-surface px-5 py-14 sm:px-8 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 md:mb-12 md:flex-row md:items-end">
            <div>
              <h2 className="font-headline text-3xl font-black tracking-tighter text-on-surface sm:text-4xl md:text-5xl">
                Latest <span className="text-primary">stories</span>
              </h2>
              <p className="mt-2 max-w-lg font-login-body text-on-secondary-container sm:text-lg">
                Fresh voices from the community—hand-picked from the public feed.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 self-start sm:flex-row sm:items-center sm:gap-6 md:self-auto">
              <Link
                href="/stories"
                className="flex items-center gap-2 border-b-2 border-primary pb-1 font-login-label text-sm font-bold text-primary"
              >
                View all stories
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/#short-stories"
                className="flex items-center gap-2 border-b-2 border-transparent pb-1 font-login-label text-sm font-bold text-on-surface opacity-80 transition-colors hover:border-primary hover:text-primary"
              >
                Aesop fables
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
          <HomeFeed compact />
        </div>
      </section>
    </div>
  );
}
