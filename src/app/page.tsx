import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialHome } from "@/features/home/EditorialHome";
import { HomeFeed } from "@/features/feed/HomeFeed";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <EditorialHome />
      <section className="border-t border-outline-variant/20 bg-editorial-surface px-6 py-14 sm:px-8 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-12 md:mb-14 md:flex-row md:items-end">
            <div>
              <h2 className="font-headline text-4xl font-black tracking-tighter text-on-surface sm:text-5xl">
                Latest <span className="text-primary">stories</span>
              </h2>
              <p className="mt-2 max-w-lg font-login-body text-on-secondary-container sm:text-lg">
                Fresh voices from the community—hand-picked from the public feed.
              </p>
            </div>
            <Link
              href="/#short-stories"
              className="flex shrink-0 items-center gap-2 self-start border-b-2 border-primary pb-1 font-headline text-sm font-bold text-primary sm:text-base md:self-auto"
            >
              Aesop fables
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <HomeFeed />
        </div>
      </section>
    </div>
  );
}
