"use client";

import Link from "next/link";
import Lottie from "lottie-react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Mic,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import {
  aesopExcerpt,
  aesopReadMinutes,
  aesopStoryId,
} from "@/services/aesop-stories.service";
import { useAesopStories } from "@/hooks/useAesopStories";
import heroAnimation from "../../../public/hero-anim.json";

const BENTO_IMAGES = {
  featured:
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
  anthology:
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
};

export function EditorialHome() {
  const { data: stories = [], isLoading: loading, isError } = useAesopStories();
  const error = isError ? "Could not load short stories." : null;

  const preview = stories.slice(0, 5);
  const first = preview[0];
  const secondary = preview.slice(1, 3);

  return (
    <>
      {/* Hero — keep current composition */}
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
                href="/stories"
                className="rounded-full bg-surface-container-highest px-6 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high sm:px-7 sm:py-3.5 sm:text-base"
              >
                Explore Library
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="cloud-shape relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center overflow-hidden bg-surface-container-lowest p-1.5 shadow-2xl shadow-on-surface/5 sm:p-3 lg:max-w-none">
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

      {/* Bento — Aesop + CTAs */}
      <section
        id="short-stories"
        className="px-5 py-14 sm:px-8 sm:py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-headline text-3xl font-black tracking-tighter text-on-surface sm:text-4xl md:text-5xl">
                Short stories by{" "}
                <span className="text-primary">&ldquo;Aesop&apos;s Fables&rdquo;</span>
              </h2>
              <p className="mt-2 max-w-xl font-login-body text-on-secondary-container sm:text-lg">
                Classic tales in a modern layout — curated for quick reads and long curiosity.
              </p>
            </div>
            <Link
              href="/short-stories"
              className="group inline-flex items-center gap-2 font-login-label text-sm font-bold text-primary"
            >
              Browse all fables
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                strokeWidth={2.25}
              />
            </Link>
          </div>

          {loading ? (
            <div className="grid animate-pulse grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
              <div className="h-80 rounded-2xl bg-surface-container-high md:col-span-8" />
              <div className="h-80 rounded-2xl bg-primary/20 md:col-span-4" />
              <div className="h-64 rounded-2xl bg-surface-container-high md:col-span-4" />
              <div className="h-64 rounded-2xl bg-surface-container-high md:col-span-8" />
            </div>
          ) : error ? (
            <p className="font-login-body text-on-secondary-container">{error}</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
              {/* Featured long-read */}
              <div className="bento-card group overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm md:col-span-8">
                <div className="h-52 overflow-hidden sm:h-64">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={BENTO_IMAGES.featured}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  {first ? (
                    <>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="font-login-label text-xs font-bold tracking-widest text-primary uppercase">
                          Long read
                        </span>
                        <span className="text-xs font-bold text-secondary">
                          • {aesopReadMinutes(first.story)} min read
                        </span>
                      </div>
                      <h3 className="font-headline mb-3 text-2xl font-black tracking-tight text-on-surface transition-colors group-hover:text-primary sm:text-3xl">
                        {first.title}
                      </h3>
                      <p className="mb-6 line-clamp-3 max-w-2xl font-login-body text-on-secondary-container">
                        {aesopExcerpt(first.story, 220)}
                      </p>
                      <Link
                        href={`/story/${aesopStoryId(first)}`}
                        className="inline-flex items-center gap-1.5 font-login-label text-sm font-bold text-primary"
                      >
                        Read story
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </>
                  ) : (
                    <p className="font-login-body text-on-secondary-container">
                      No short stories available right now.
                    </p>
                  )}
                </div>
              </div>

              {/* Fables CTA */}
              <div className="bento-card relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-6 text-on-primary shadow-xl shadow-primary/20 sm:p-8 md:col-span-4">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-10 -right-8 size-36 rounded-full bg-on-primary/10 blur-2xl"
                />
                <div className="relative z-10">
                  <BookOpen
                    className="mb-5 size-14 text-on-primary/30 sm:size-16"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <h3 className="font-headline mb-2 text-2xl font-black tracking-tight">
                    View all fables
                  </h3>
                  <p className="font-login-body text-sm leading-relaxed text-on-primary/85 sm:text-base">
                    Browse the full Aesop collection — short morals, sharp turns, and timeless
                    voice in one shelf.
                  </p>
                </div>
                <Link
                  href="/short-stories"
                  className="relative z-10 mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-lowest py-3 font-login-label text-sm font-bold text-primary transition-colors hover:bg-primary-fixed"
                >
                  Browse fables
                  <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
                </Link>
              </div>

              {/* Community / verified */}
              <div className="bento-card flex flex-col rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:p-8 md:col-span-4">
                <BadgeCheck className="mb-4 size-9 text-primary" strokeWidth={1.75} aria-hidden />
                <h3 className="font-headline mb-2 text-xl font-black tracking-tight text-on-surface sm:text-2xl">
                  Voices from the feed
                </h3>
                <p className="mb-8 font-login-body text-sm leading-relaxed text-on-secondary-container sm:text-base">
                  Discover community stories, leave comments, and save the pieces that stay with you.
                </p>
                <div className="mt-auto flex items-center">
                  <div className="flex -space-x-3">
                    {["AB", "SK", "JM"].map((initials) => (
                      <div
                        key={initials}
                        className="flex size-10 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-surface-container-highest font-login-label text-[0.65rem] font-bold text-on-surface"
                      >
                        {initials}
                      </div>
                    ))}
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary font-login-label text-[0.65rem] font-bold text-on-primary">
                      +
                    </div>
                  </div>
                  <Link
                    href="/stories"
                    className="ml-auto font-login-label text-sm font-bold text-primary"
                  >
                    Explore
                  </Link>
                </div>
              </div>

              {/* Anthology / fables CTA */}
              <div className="bento-card overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm md:col-span-8 md:flex">
                <div className="flex flex-col justify-center p-6 sm:p-8 md:w-1/2">
                  <h3 className="font-headline mb-2 text-xl font-black tracking-tight text-on-surface sm:text-2xl">
                    Fable anthology
                  </h3>
                  <p className="mb-6 font-login-body text-sm leading-relaxed text-on-secondary-container sm:text-base">
                    A curated shelf of Aesop&apos;s classics — short morals, sharp turns, and timeless
                    voice.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {secondary.map((s) => (
                      <Link
                        key={aesopStoryId(s)}
                        href={`/story/${aesopStoryId(s)}`}
                        className="rounded-full bg-surface-container-high px-3 py-1.5 font-login-label text-xs font-bold text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
                      >
                        {s.title.length > 28 ? `${s.title.slice(0, 28)}…` : s.title}
                      </Link>
                    ))}
                    <Link
                      href="/short-stories"
                      className="inline-flex items-center gap-1 rounded-full bg-on-surface px-3 py-1.5 font-login-label text-xs font-bold text-editorial-surface transition-colors hover:bg-primary"
                    >
                      Open shelf
                      <Send className="size-3" strokeWidth={2.25} aria-hidden />
                    </Link>
                  </div>
                </div>
                <div className="h-48 overflow-hidden md:h-auto md:w-1/2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={BENTO_IMAGES.anthology}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 sm:py-20 md:py-24">
        <div className="absolute top-1/2 left-0 h-40 w-40 -translate-y-1/2 rounded-full bg-primary-fixed opacity-20 blur-3xl sm:h-48 sm:w-48" />
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-tertiary-fixed opacity-20 blur-3xl sm:h-64 sm:w-64" />
        <h2 className="font-headline relative z-10 mb-5 text-4xl leading-[0.9] font-black tracking-tighter text-on-surface sm:mb-6 sm:text-5xl md:text-6xl">
          WRITE YOUR <br />
          <span className="text-stroke-primary">OWN LEGACY</span>
        </h2>
        <p className="relative z-10 mx-auto mb-8 max-w-xl font-login-body text-base text-on-secondary-container sm:mb-10 sm:text-lg">
          Every great imagination starts with a single word. Start your creative journey and find
          your audience.
        </p>
        <div className="relative z-10 flex justify-center">
          <Link
            href="/editor"
            className="rounded-full bg-primary px-10 py-4 text-base font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-105 sm:px-12 sm:py-5 sm:text-lg"
          >
            Start writing
          </Link>
        </div>
      </section>
    </>
  );
}
