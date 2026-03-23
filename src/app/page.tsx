import { HomeFeed } from "@/features/feed/HomeFeed";
import { HomeHeroActions } from "@/features/home/HomeHeroActions";
import { HomeHeroLottie } from "@/features/home/HomeHeroLottie";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <section className="border-b border-dark/5 bg-background py-[var(--spacing-2xl)]">
        <div className="container-design">
          <div className="grid items-center gap-[var(--spacing-2xl)] lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.95fr)] lg:gap-[var(--spacing-xl)]">
            <div>
              <p className="text-label mb-[var(--spacing-sm)] uppercase tracking-wider text-dark/50">
                For readers & writers
              </p>
              <h1 className="text-hero-heading max-w-3xl">
                Ideas worth sharing
              </h1>
              <p className="mt-[var(--spacing-lg)] max-w-md text-[1rem] leading-relaxed text-dark/80">
                A calm place to publish long-form stories, follow authors you
                love, and discuss in the margins.
              </p>
              <HomeHeroActions />
            </div>
            <HomeHeroLottie className="flex justify-center lg:justify-end" />
          </div>
        </div>
      </section>
      <section className="flex-1">
        <div className="container-design">
          <h2 className="text-section-heading mb-[var(--spacing-lg)] pt-[var(--spacing-xl)]">
            Latest stories
          </h2>
        </div>
        <div className="container-design">
          <HomeFeed />
        </div>
      </section>
    </main>
  );
}
