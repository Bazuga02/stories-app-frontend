"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { StoryMarkdown } from "@/components/editor/StoryMarkdown";
import {
  aesopExcerpt,
  aesopReadMinutes,
  aesopStoryId,
  type AesopStory,
} from "@/services/aesop-stories.service";
import { titleWithAccent } from "./story-page-utils";

type AesopStoryViewProps = {
  aesopStory: AesopStory;
  relatedAesop: AesopStory[];
};

export function AesopStoryView({ aesopStory, relatedAesop }: AesopStoryViewProps) {
  const aesopRead = aesopReadMinutes(aesopStory.story);
  const aesopAuthor = aesopStory.author.trim() || "Aesop's Fables";

  return (
    <main className="mx-auto max-w-4xl flex-1 px-5 pt-12 pb-24 font-login-body text-on-surface sm:px-6 md:px-0">
      {/* Centered fable header — no cover image */}
      <section className="mb-12 text-center sm:mb-14">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-primary-fixed px-3 py-1 font-login-label text-xs font-bold tracking-wider text-on-primary-fixed-variant uppercase">
            Aesop&apos;s Fables
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-secondary">
            <Clock className="size-4" strokeWidth={2} aria-hidden />
            {aesopRead} min read
          </span>
        </div>
        <h1 className="font-headline text-4xl leading-[1.05] font-black tracking-tighter text-on-surface sm:text-5xl md:text-6xl lg:text-7xl">
          {titleWithAccent(aesopStory.title || "Untitled")}
        </h1>
      </section>

      <section className="mb-12 flex flex-col items-center justify-center border-b border-surface-variant pb-8 sm:mb-14">
        <div className="flex items-center gap-4">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/10">
            <Image
              src="/aesop.png"
              alt={`Portrait for ${aesopAuthor}`}
              width={48}
              height={48}
              className="size-full object-cover object-center"
              sizes="48px"
              priority
            />
          </div>
          <div className="text-left">
            <h2 className="font-headline text-base font-bold leading-tight text-on-surface">
              {aesopAuthor}
            </h2>
            <p className="text-sm text-secondary">Short story</p>
          </div>
        </div>
      </section>

      <article className="mb-12 min-w-0 sm:mb-14">
        <StoryMarkdown source={aesopStory.story} variant="editorial" />

        {aesopStory.moral ? (
          <aside
            className="premium-border story-card-shadow mt-10 rounded-r-2xl bg-surface-container-low p-6 italic sm:mt-12 sm:p-8"
            aria-labelledby="story-moral-label"
          >
            <span
              id="story-moral-label"
              className="mb-2 block font-login-label text-xs font-bold tracking-widest text-primary uppercase"
            >
              Moral
            </span>
            <p className="font-headline text-base leading-snug text-on-surface not-italic sm:text-lg">
              {aesopStory.moral}
            </p>
          </aside>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-2 sm:mt-12">
          <span className="rounded-full bg-surface-variant px-4 py-1.5 font-login-label text-sm font-bold text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary">
            #Fable
          </span>
          <span className="rounded-full bg-surface-variant px-4 py-1.5 font-login-label text-sm font-bold text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary">
            #ShortStory
          </span>
        </div>
      </article>

      <section className="mt-16 border-t border-outline-variant pt-12 sm:mt-20 sm:pt-14">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 md:flex-row md:items-end">
          <div>
            <h2 className="font-headline text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
              More <span className="text-primary">fables</span>
            </h2>
            <p className="mt-2 font-login-body text-secondary">
              Continue reading—covers are not used for this collection.
            </p>
          </div>
          <Link
            href="/short-stories"
            className="group inline-flex items-center gap-1.5 font-login-label text-sm font-bold text-primary transition-all hover:gap-3"
          >
            All short stories
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {relatedAesop.length === 0 ? (
            <p className="text-secondary md:col-span-2">
              <Link
                href="/short-stories"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Browse all fables
              </Link>
              .
            </p>
          ) : (
            relatedAesop.map((s) => (
              <Link
                key={aesopStoryId(s)}
                href={`/story/${aesopStoryId(s)}`}
                className="story-card-shadow group rounded-2xl border border-surface-container-high bg-editorial-surface p-6 transition-transform hover:-translate-y-1 sm:p-7"
              >
                <h3 className="font-headline mb-3 text-xl font-bold text-on-surface transition-colors group-hover:text-primary">
                  {s.title}
                </h3>
                <p className="mb-4 line-clamp-3 font-login-body text-sm leading-relaxed text-secondary">
                  {aesopExcerpt(s.story, 160)}
                </p>
                <p className="font-login-label text-xs font-bold tracking-widest text-primary uppercase">
                  Aesop&apos;s Fables
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
