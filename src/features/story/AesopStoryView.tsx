"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StoryMarkdown } from "@/components/editor/StoryMarkdown";
import {
  aesopExcerpt,
  aesopReadMinutes,
  aesopStoryId,
  type AesopStory,
} from "@/services/aesop-stories.service";
import { titleWithAccent, userInitial } from "./story-page-utils";

type AesopStoryViewProps = {
  aesopStory: AesopStory;
  relatedAesop: AesopStory[];
};

export function AesopStoryView({ aesopStory, relatedAesop }: AesopStoryViewProps) {
  const aesopRead = aesopReadMinutes(aesopStory.story);
  const aesopAuthor = aesopStory.author.trim() || "Unknown";

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 pt-12 pb-24 font-login-body text-on-background">
      <section className="relative mb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/15 px-4 py-1 font-headline text-xs font-bold tracking-widest text-primary uppercase">
              Aesop&apos;s Fables
            </span>
            <span className="text-sm font-medium text-on-secondary-container">{aesopRead} min read</span>
          </div>
          <h1 className="font-headline text-5xl leading-[0.9] font-black tracking-tighter text-on-background md:text-7xl">
            {titleWithAccent(aesopStory.title || "Untitled")}
          </h1>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary/15 font-headline text-xl font-bold text-primary"
              aria-hidden
            >
              {userInitial(aesopAuthor)}
            </div>
            <div>
              <p className="text-lg font-bold text-on-background">{aesopAuthor}</p>
              <p className="text-sm text-on-secondary-container">Short story</p>
            </div>
          </div>
        </div>
      </section>

      <article className="min-w-0">
        <StoryMarkdown source={aesopStory.story} variant="editorial" />
        {aesopStory.moral ? (
          <blockquote className="mt-12 rounded-2xl border-l-4 border-primary bg-surface-container-low p-6 text-on-surface-variant">
            <p className="font-headline mb-2 text-xs font-bold uppercase tracking-widest text-primary not-italic">
              Moral
            </p>
            <p className="leading-relaxed">{aesopStory.moral}</p>
          </blockquote>
        ) : null}
        <div className="mt-12 flex flex-wrap gap-3 border-t border-outline-variant/10 pt-8">
          <span className="rounded-full bg-surface-container-highest px-4 py-2 text-sm font-bold">
            #Fable
          </span>
          <span className="rounded-full bg-surface-container-highest px-4 py-2 text-sm font-bold">
            #ShortStory
          </span>
        </div>
      </article>

      <section className="mt-24 border-t border-outline-variant/10 pt-16">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h4 className="font-headline text-4xl font-black text-on-background">
              More <span className="text-primary">fables</span>
            </h4>
            <p className="mt-2 text-on-secondary-container">
              Continue reading—covers are not used for this collection.
            </p>
          </div>
          <Link
            href="/short-stories"
            className="flex shrink-0 items-center gap-2 self-start border-b-2 border-primary pb-1 font-bold text-primary sm:self-auto"
          >
            All short stories <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {relatedAesop.length === 0 ? (
            <p className="text-on-secondary-container md:col-span-2">
              <Link href="/short-stories" className="font-semibold text-primary underline-offset-2 hover:underline">
                Browse all fables
              </Link>
              .
            </p>
          ) : (
            relatedAesop.map((s) => (
              <Link
                key={aesopStoryId(s)}
                href={`/story/${aesopStoryId(s)}`}
                className="group rounded-xl border border-outline-variant/15 bg-surface-container-low p-6 editorial-shadow transition-all hover:-translate-y-1 hover:border-primary/30"
              >
                <h5 className="mb-2 font-headline text-xl font-bold transition-colors group-hover:text-primary">
                  {s.title}
                </h5>
                <p className="line-clamp-3 text-sm text-on-secondary-container">{aesopExcerpt(s.story, 160)}</p>
                <p className="mt-4 text-xs font-bold text-on-secondary-container opacity-70">{s.author}</p>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
