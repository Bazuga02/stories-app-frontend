"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { ArrowRight, BookOpen, Mic, Sparkles, Star } from "lucide-react";
import {
  aesopExcerpt,
  aesopReadMinutes,
  aesopStoryId,
  fetchAesopStories,
  type AesopStory,
} from "@/services/aesop-stories.service";
import heroAnimation from "../../../public/hero-anim.json";

export function EditorialHome() {
  const [stories, setStories] = useState<AesopStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchAesopStories();
        if (!cancelled) {
          setStories(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setStories([]);
          setError("Could not load short stories.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const preview = stories.slice(0, 5);
  const first = preview[0];

  return (
    <>
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-6 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-14 md:pb-16">
        <div className="absolute top-5 left-5 text-primary opacity-40 animate-pulse sm:top-6 sm:left-7">
          <Star aria-hidden className="size-9 fill-primary sm:size-10" strokeWidth={0} />
        </div>
        <div className="absolute right-5 bottom-10 text-tertiary-container opacity-30 sm:right-8 sm:bottom-12">
          <Star aria-hidden className="size-12 fill-tertiary-container sm:size-14" strokeWidth={0} />
        </div>

        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="relative z-10">
            <span className="font-login-label mb-3 inline-block rounded-full bg-primary-fixed px-3 py-0.5 text-xs font-bold tracking-widest text-on-primary-fixed uppercase sm:mb-3.5 sm:px-3.5 sm:text-[0.8rem]">
              Editorial Choice
            </span>
            <h1 className="font-headline text-4xl leading-[0.92] font-black tracking-tighter text-on-surface sm:text-5xl md:text-6xl lg:text-7xl">
              IMPROVE <br /> YOUR <br />{" "}
              <span className="text-primary italic">IMAGINATION</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-on-surface-variant sm:mt-5 sm:text-lg">
              Dive into curated narratives that spark creativity. From surreal fables to modern
              chronicles, every story is a journey into the unexpected.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
              <Link
                href="/#short-stories"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-xl shadow-primary/15 transition-transform hover:scale-[1.02] sm:px-7 sm:py-3.5 sm:text-base"
              >
                <BookOpen className="size-4 shrink-0 sm:size-5" strokeWidth={2} />
                Start Reading
              </Link>
              <Link
                href="/#short-stories"
                className="rounded-full bg-surface-container-highest px-6 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high sm:px-7 sm:py-3.5 sm:text-base"
              >
                Explore Library
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="cloud-shape relative flex aspect-square w-full max-w-lg mx-auto lg:max-w-none items-center justify-center overflow-hidden bg-surface-container-lowest p-1.5 shadow-2xl shadow-on-surface/5 sm:p-3">
              <Lottie
                animationData={heroAnimation}
                loop
                className="h-full w-full max-h-[min(72vw,340px)] scale-100 sm:max-h-[min(56vw,420px)] lg:max-h-none [&>svg]:h-full [&>svg]:max-h-full [&>svg]:w-full [&>svg]:object-contain"
                aria-label="Animated illustration for the Stories hero"
              />
              <div className="pointer-events-none absolute top-2 right-2 rounded-full bg-primary p-2 text-on-primary sm:top-3 sm:right-3 sm:p-2.5">
                <Sparkles className="size-6 sm:size-7" strokeWidth={1.75} />
              </div>
            </div>
            <div className="absolute -bottom-3 -left-3 hidden rounded-editorial-xl bg-tertiary-fixed-dim p-4 shadow-xl md:block md:p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-on-tertiary-fixed text-on-tertiary">
                  <Mic className="size-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-tertiary-fixed">Text-to-speech available</p>
                  <p className="text-xs opacity-70">You can listen to your stories.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Short stories — text only */}
      <section
        id="short-stories"
        className="bg-surface-container-low px-6 py-16 sm:px-8 sm:py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-end gap-4 sm:mb-12 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-headline text-4xl font-black tracking-tighter text-on-surface sm:text-5xl">
                Short stories by{" "}
                <span className="text-primary">&ldquo;Aesop&apos;s Fables&rdquo;</span>
              </h2>
              <p className="mt-2 text-on-surface-variant">
                Classic short tales from the public collection.
              </p>
            </div>
            <Link
              href="/short-stories"
              className="group flex items-center gap-2 font-bold text-primary"
            >
              Read more stories
              <ArrowRight
                className="size-5 transition-transform group-hover:translate-x-2"
                strokeWidth={2}
              />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 animate-pulse md:grid-cols-2">
              <div className="h-64 rounded-editorial-xl bg-surface-container-high" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-48 rounded-editorial-xl bg-surface-container-high" />
                <div className="h-48 rounded-editorial-xl bg-surface-container-high" />
              </div>
            </div>
          ) : error ? (
            <p className="text-on-surface-variant">{error}</p>
          ) : preview.length === 0 ? (
            <p className="text-on-surface-variant">No short stories available right now.</p>
          ) : (
            <>
              <div className="flex flex-col gap-6">
                {first ? (
                  <div className="group overflow-hidden rounded-editorial-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:shadow-2xl">
                    <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
                          <span className="text-xs font-bold tracking-widest text-primary uppercase">
                            Fable
                          </span>
                          <span className="text-xs font-bold tracking-widest text-on-secondary-container uppercase">
                            • {aesopReadMinutes(first.story)} min read
                          </span>
                        </div>
                        <h3 className="font-headline mb-3 text-2xl leading-tight font-black transition-colors group-hover:text-primary sm:mb-4 sm:text-3xl md:text-4xl">
                          {first.title}
                        </h3>
                        <p className="line-clamp-3 text-on-surface-variant">
                          {aesopExcerpt(first.story, 260)}
                        </p>
                      </div>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 sm:mt-8">
                        <span className="text-sm font-bold text-on-surface-variant">
                          {first.author}
                        </span>
                        <Link
                          href={`/story/${aesopStoryId(first)}`}
                          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container"
                        >
                          Read story
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {preview.slice(1).map((s) => (
                    <div
                      key={aesopStoryId(s)}
                      className="group flex h-full flex-col overflow-hidden rounded-editorial-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:shadow-2xl"
                    >
                      <div className="flex grow flex-col justify-between p-6">
                        <div>
                          <span className="mb-2 block text-xs font-bold tracking-widest text-tertiary uppercase">
                            {aesopReadMinutes(s.story)} min
                          </span>
                          <h3 className="font-headline mb-2 text-lg font-black leading-snug transition-colors group-hover:text-primary">
                            {s.title}
                          </h3>
                          <p className="line-clamp-2 text-sm text-on-surface-variant">
                            {aesopExcerpt(s.story, 120)}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-xs font-bold opacity-70">{s.author}</span>
                          <Link
                            href={`/story/${aesopStoryId(s)}`}
                            className="rounded-full bg-secondary-container px-3 py-2 text-xs font-bold text-on-secondary-container transition-all hover:bg-primary hover:text-on-primary"
                          >
                            Read
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <Link
                  href="/short-stories"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-transparent px-8 py-3 font-headline text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary sm:text-base"
                >
                  Read more stories
                  <ArrowRight className="size-4" strokeWidth={2} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 text-center sm:px-8 sm:py-24 md:py-28">
        <div className="absolute top-1/2 left-0 h-40 w-40 -translate-y-1/2 rounded-full bg-primary-fixed opacity-20 blur-3xl sm:h-48 sm:w-48" />
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-tertiary-fixed opacity-20 blur-3xl sm:h-64 sm:w-64" />
        <h2 className="font-headline relative z-10 mb-6 text-4xl leading-[0.85] font-black tracking-tighter text-on-surface sm:mb-8 sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          WRITE YOUR <br />{" "}
          <span className="text-stroke-primary">OWN LEGACY</span>
        </h2>
        <p className="relative z-10 mx-auto mb-8 max-w-2xl text-lg text-on-surface-variant sm:mb-10 sm:text-xl">
          Every great imagination starts with a single word. Start your creative journey with Stories
          today and find your audience.
        </p>
        <div className="relative z-10 flex justify-center">
          <Link
            href="/editor"
            className="rounded-full bg-primary px-10 py-4 text-lg font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-105 sm:px-12 sm:py-5 sm:text-xl"
          >
            Start Writing
          </Link>
        </div>
      </section>
    </>
  );
}
