"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Droplets,
  Home,
  Rabbit,
  UtensilsCrossed,
} from "lucide-react";
import {
  aesopExcerpt,
  aesopReadMinutes,
  aesopStoryId,
  fetchAesopStories,
  type AesopStory,
} from "@/services/aesop-stories.service";
import { PageLoader } from "@/components/ui/loader";
import { cn } from "@/lib/cn";

const INDEX_ICONS = [UtensilsCrossed, Rabbit, Droplets, Home] as const;

const LIST_PAGE_SIZE = 8;

function moralOneLiner(moral?: string) {
  if (!moral?.trim()) return "";
  const t = moral.replace(/\s+/g, " ").trim();
  return t.length > 80 ? `${t.slice(0, 78)}…` : t;
}

export default function ShortStoriesPage() {
  const [stories, setStories] = useState<AesopStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listPage, setListPage] = useState(1);

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
          setError("Could not load stories.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = stories[0];
  const secondary = stories[1];
  const tileA = stories[2];
  const tileB = stories[3];
  const listStories = stories.slice(4);

  const quoteSource = useMemo(() => {
    const withMoral = stories.find((s) => s.moral?.trim());
    if (withMoral?.moral) {
      const m = withMoral.moral.replace(/\s+/g, " ").trim();
      return {
        quote: m.length > 180 ? `"${m.slice(0, 177)}…"` : `"${m}"`,
        cite: withMoral.title,
      };
    }
    if (featured) {
      return {
        quote: `"${aesopExcerpt(featured.story, 140)}"`,
        cite: featured.title,
      };
    }
    return {
      quote: `"No act of kindness, no matter how small, is ever wasted."`,
      cite: "The Lion and the Mouse",
    };
  }, [stories, featured]);

  const listTotalPages = Math.max(1, Math.ceil(listStories.length / LIST_PAGE_SIZE));
  const listSlice = listStories.slice((listPage - 1) * LIST_PAGE_SIZE, listPage * LIST_PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <PageLoader />
      </div>
    );
  }

  return (
    <main className="font-login-body flex flex-1 flex-col bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary">
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 pt-14 pb-24 md:px-12 md:pt-16 md:pb-28">
        <Link
          href="/#short-stories"
          className="font-login-label mb-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
          Back to home
        </Link>

        {error ? (
          <p className="text-on-surface-variant">{error}</p>
        ) : stories.length === 0 ? (
          <p className="text-on-surface-variant">No fables available right now.</p>
        ) : (
          <>
            {/* Editorial hero */}
            <section className="mb-16 flex flex-col items-baseline gap-6 border-b border-outline-variant/20 pb-12 md:mb-24 md:flex-row">
              <div className="flex-1">
                <span className="font-login-label mb-4 block text-xs uppercase tracking-[0.3em] text-primary">
                  Classical anthology
                </span>
                <h1 className="font-headline text-5xl leading-[0.95] font-medium tracking-tighter text-primary italic md:text-7xl lg:text-8xl">
                  Aesop&apos;s <br />
                  Fables
                </h1>
              </div>
              <div className="max-w-md">
                <p className="text-lg font-light leading-relaxed text-on-surface-variant italic md:text-xl">
                  A timeless collection of moral tales where the animal kingdom mirrors the
                  complexities of human nature, curated for the modern observer.
                </p>
              </div>
            </section>

            {/* Bento grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
              {featured ? (
                <Link
                  href={`/story/${aesopStoryId(featured)}`}
                  className="group flex cursor-pointer flex-col justify-between rounded-xl bg-surface-container-lowest p-8 transition-colors duration-500 hover:bg-surface-container-low md:col-span-8 md:p-12"
                >
                  <div className="mb-12 flex items-start justify-between md:mb-20">
                    <div>
                      <span className="font-login-label mb-2 block text-[10px] tracking-widest text-on-surface/40 uppercase">
                        Featured fable
                      </span>
                      <h2 className="font-headline text-3xl text-on-surface italic transition-colors group-hover:text-primary md:text-5xl">
                        {featured.title}
                      </h2>
                    </div>
                    <UtensilsCrossed
                      className="size-9 shrink-0 text-primary md:size-11"
                      strokeWidth={1.25}
                      aria-hidden
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <p className="font-login-label max-w-xs text-xs leading-loose tracking-wide text-on-surface/60">
                      {aesopExcerpt(featured.story, 120)}
                    </p>
                    <span className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 font-login-label text-xs font-bold tracking-widest text-on-primary uppercase transition-colors group-hover:bg-primary-container">
                      Read fable
                    </span>
                  </div>
                </Link>
              ) : null}

              {secondary ? (
                <Link
                  href={`/story/${aesopStoryId(secondary)}`}
                  className="flex flex-col items-center justify-center rounded-xl border-l border-primary/10 bg-surface-container-low p-8 text-center transition-colors hover:bg-surface-container-high/80 md:col-span-4"
                >
                  <Rabbit
                    className="mb-6 size-12 text-primary md:size-14"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <h3 className="font-headline mb-4 text-2xl text-on-surface italic md:text-3xl">
                    {secondary.title}
                  </h3>
                  <p className="font-login-label mb-8 text-[10px] tracking-widest text-on-surface/40 uppercase">
                    {aesopReadMinutes(secondary.story)} min read
                  </p>
                  <p className="text-sm leading-relaxed text-on-surface-variant italic">
                    {aesopExcerpt(secondary.story, 160)}
                  </p>
                </Link>
              ) : null}

              {tileA ? (
                <Link
                  href={`/story/${aesopStoryId(tileA)}`}
                  className="rounded-xl border-t-2 border-primary bg-surface-container-lowest p-6 transition-transform hover:-translate-y-1 md:col-span-3"
                >
                  <Droplets className="mb-4 size-8 text-primary" strokeWidth={1.25} aria-hidden />
                  <h4 className="font-headline mb-2 text-xl text-on-surface italic">{tileA.title}</h4>
                  <p className="font-login-label mb-4 text-xs tracking-widest text-on-surface/50 italic uppercase">
                    {moralOneLiner(tileA.moral) || `${aesopReadMinutes(tileA.story)} min read`}
                  </p>
                  <div className="mb-4 h-px w-8 bg-primary/25" />
                </Link>
              ) : (
                <div className="hidden md:col-span-3" aria-hidden />
              )}

              <div className="flex items-center justify-center border-y border-outline-variant/15 py-8 md:col-span-6 md:border-y-0 md:py-0">
                <div className="text-center">
                  <span className="font-login-label mb-2 block text-[9px] tracking-[0.35em] text-primary/60 uppercase">
                    Wisdom of the ages
                  </span>
                  <blockquote className="font-headline px-4 text-xl text-on-surface italic md:px-8 md:text-2xl">
                    {quoteSource.quote}
                  </blockquote>
                  <cite className="font-login-label mt-4 block text-[10px] tracking-widest text-on-surface/30 uppercase not-italic">
                    — {quoteSource.cite}
                  </cite>
                </div>
              </div>

              {tileB ? (
                <Link
                  href={`/story/${aesopStoryId(tileB)}`}
                  className="rounded-xl bg-surface-container-lowest p-6 transition-transform duration-300 hover:-translate-y-1 md:col-span-3"
                >
                  <Home className="mb-4 size-8 text-primary" strokeWidth={1.25} aria-hidden />
                  <h4 className="font-headline mb-2 text-xl text-on-surface italic">{tileB.title}</h4>
                  <p className="font-login-label text-[10px] tracking-widest text-on-surface/50 uppercase">
                    {tileB.author}
                  </p>
                </Link>
              ) : (
                <div className="hidden md:col-span-3" aria-hidden />
              )}

              {/* Library index */}
              {listStories.length > 0 ? (
                <div className="mt-6 md:col-span-12 md:mt-8">
                  <h3 className="font-login-label mb-10 text-center text-xs tracking-[0.5em] text-on-surface/40 uppercase">
                    Library index
                  </h3>
                  <div>
                    {listSlice.map((s, i) => {
                      const globalIdx = (listPage - 1) * LIST_PAGE_SIZE + i + 5;
                      const Icon = INDEX_ICONS[globalIdx % INDEX_ICONS.length];
                      return (
                        <Link
                          key={aesopStoryId(s)}
                          href={`/story/${aesopStoryId(s)}`}
                          className={cn(
                            "group flex cursor-pointer items-center justify-between border-b border-outline-variant/10 py-6 transition-colors",
                            i % 2 === 1 &&
                              "rounded-lg bg-surface-container-low/40 px-4 -mx-4 sm:mx-0",
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-4 sm:gap-8">
                            <span className="font-login-label w-6 shrink-0 text-xs text-primary/30 sm:w-8">
                              {String(globalIdx).padStart(2, "0")}
                            </span>
                            <h5 className="font-headline truncate text-lg text-on-surface italic transition-transform duration-500 group-hover:translate-x-2 sm:text-2xl">
                              {s.title}
                            </h5>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 opacity-100 sm:gap-6 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                            <span className="font-login-label hidden max-w-28 truncate text-[10px] tracking-widest text-on-surface/40 uppercase sm:block">
                              {moralOneLiner(s.moral) || "Fable"}
                            </span>
                            <Icon className="size-5 text-primary" strokeWidth={1.5} aria-hidden />
                            <ArrowRight className="size-4 text-primary" strokeWidth={2} aria-hidden />
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {listTotalPages > 1 ? (
                    <div className="mt-16 flex flex-col items-center">
                      <div className="mb-8 flex flex-wrap justify-center gap-2">
                        {Array.from({ length: listTotalPages }, (_, p) => p + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setListPage(p)}
                            className={cn(
                              "font-login-label flex size-10 items-center justify-center rounded-full text-xs transition-colors",
                              p === listPage
                                ? "bg-primary text-on-primary"
                                : "text-on-surface/60 hover:bg-surface-container-high",
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <p className="font-login-label text-[9px] tracking-widest text-on-surface/30 uppercase">
                        Aesop&apos;s Fables — public collection
                      </p>
                    </div>
                  ) : (
                    <p className="font-login-label mt-12 text-center text-[9px] tracking-widest text-on-surface/30 uppercase">
                      Aesop&apos;s Fables — public collection
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
