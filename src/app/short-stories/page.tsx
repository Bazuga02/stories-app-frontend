"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  aesopExcerpt,
  aesopReadMinutes,
  aesopStoryId,
  fetchAesopStories,
  type AesopStory,
} from "@/services/aesop-stories.service";
import { PageLoader } from "@/components/ui/loader";

export default function ShortStoriesPage() {
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <PageLoader />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl flex-1 px-6 py-12 pb-24 font-login-body sm:px-8">
      <Link
        href="/#short-stories"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to home
      </Link>
      <h1 className="font-headline mb-2 text-4xl font-black tracking-tighter text-on-background sm:text-5xl">
        Short stories by <span className="text-primary">&ldquo;Aesop&apos;s Fables&rdquo;</span>
      </h1>
      <p className="mb-10 text-on-secondary-container">
        Open any title to read the full fable.
      </p>

      {error ? (
        <p className="text-on-secondary-container">{error}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {stories.map((s) => (
            <li key={aesopStoryId(s)} className="min-w-0">
              <Link
                href={`/story/${aesopStoryId(s)}`}
                className="group block rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5 transition-all hover:border-primary/25 hover:shadow-md sm:p-6"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-secondary-container">
                    <span>{aesopReadMinutes(s.story)} min read</span>
                    <span className="opacity-50">·</span>
                    <span>{s.author}</span>
                  </div>
                  <h2 className="font-headline text-lg font-black text-on-background transition-colors group-hover:text-primary sm:text-xl">
                    {s.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-on-secondary-container">
                    {aesopExcerpt(s.story, 200)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
