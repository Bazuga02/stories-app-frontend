"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Clock,
  Heart,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  listPublishedStories,
  listTrendingStories,
} from "@/services/stories.service";
import { getApiErrorMessage } from "@/services/api";
import type { Story } from "@/types";
import { excerptFromContent } from "@/utils/excerpt";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import {
  bookmarkStory,
  unbookmarkStory,
} from "@/services/bookmarks.service";
import { cn } from "@/lib/cn";
import { STORY_COVER_PLACEHOLDER } from "@/lib/picsum";

const FULL_PAGE_SIZE = 10;
const COMPACT_PAGE_SIZE = 4;

export type HomeFeedProps = {
  /** First 4 stories only; no infinite scroll */
  compact?: boolean;
  /** Full list only; ignored when `compact` */
  sort?: "latest" | "likes";
};

function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function authorInitial(name: string) {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

function EditorialFeedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-low editorial-shadow">
      <Skeleton className="h-64 w-full rounded-none bg-on-surface/8" />
      <div className="space-y-3 p-8">
        <Skeleton className="h-7 w-4/5 bg-on-surface/8" />
        <Skeleton className="h-4 w-full bg-on-surface/8" />
        <Skeleton className="h-4 w-2/3 bg-on-surface/8" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="size-8 rounded-full bg-on-surface/8" />
          <Skeleton className="h-4 w-24 bg-on-surface/8" />
        </div>
      </div>
    </div>
  );
}

export function HomeFeed({ compact = false, sort = "latest" }: HomeFeedProps) {
  const [items, setItems] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const toggleBookmarkLocal = useBookmarkStore((s) => s.toggle);
  const bookmarkIds = useBookmarkStore((s) => s.ids);

  const fetchPage = useCallback(
    async (p: number) => {
      if (compact) {
        return listPublishedStories({ page: p, pageSize: COMPACT_PAGE_SIZE });
      }
      if (sort === "likes") {
        return listTrendingStories({ page: p, pageSize: FULL_PAGE_SIZE });
      }
      return listPublishedStories({ page: p, pageSize: FULL_PAGE_SIZE });
    },
    [compact, sort],
  );

  const load = useCallback(
    async (p: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await fetchPage(p);
        const pageSizeUsed = compact ? COMPACT_PAGE_SIZE : FULL_PAGE_SIZE;
        setItems((prev) => {
          const chunk = res.items;
          const merged = append ? [...prev, ...chunk] : chunk;
          const seen = new Set<string>();
          return merged.filter((s) =>
            seen.has(s.id) ? false : (seen.add(s.id), true),
          );
        });
        const tp =
          res.totalPages ??
          Math.max(1, Math.ceil(res.total / (res.pageSize || pageSizeUsed)));
        setTotalPages(tp);
        setPage(res.page);
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Could not load stories"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [compact, fetchPage],
  );

  useEffect(() => {
    void load(1, false);
  }, [load]);

  useEffect(() => {
    if (compact) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]?.isIntersecting;
        if (!hit || loading || loadingMore) return;
        if (page >= totalPages) return;
        void load(page + 1, true);
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [compact, load, loading, loadingMore, page, totalPages]);

  const syncBookmarkApi = async (e: React.MouseEvent, story: Story) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.message("Sign in to save stories");
      return;
    }
    const on = bookmarkIds.includes(story.id);
    try {
      if (on) {
        await unbookmarkStory(story.id);
        toggleBookmarkLocal(story.id);
        toast.success("Removed from bookmarks");
      } else {
        await bookmarkStory(story.id);
        toggleBookmarkLocal(story.id);
        toast.success("Saved to bookmarks");
      }
    } catch {
      toggleBookmarkLocal(story.id);
      toast.message("Bookmark saved locally (API unavailable)");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <EditorialFeedCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-low p-10 text-center editorial-shadow">
        <p className="font-headline text-lg font-bold text-on-surface">
          No published stories yet
        </p>
        <p className="mt-2 font-login-body text-sm text-on-secondary-container">
          Be the first to share something with the community.
        </p>
        <Link
          href="/editor"
          className="mt-6 inline-flex font-headline text-sm font-bold text-primary underline-offset-2 hover:underline"
        >
          Write a story
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        {items.map((story) => {
          const href = `/story/${story.id}`;
          const excerpt =
            story.excerpt?.trim() ||
            excerptFromContent(story.content ?? "") ||
            "Open to read more.";
          const authorName = story.author?.name ?? "Unknown author";
          const saved = bookmarkIds.includes(story.id);
          const readMin = estimateReadMinutes(story.content ?? "");
          const img = story.bgimg?.trim() || STORY_COVER_PLACEHOLDER;

          return (
            <div
              key={story.id}
              className="group overflow-hidden rounded-xl bg-surface-container-low editorial-shadow transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-64">
                <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    src={img}
                  />
                </Link>
                <div className="pointer-events-none absolute top-4 left-4 rounded-full bg-editorial-surface/90 px-3 py-1 font-headline text-xs font-bold text-on-background backdrop-blur">
                  Stories
                </div>
                <button
                  type="button"
                  onClick={(e) => void syncBookmarkApi(e, story)}
                  className={cn(
                    "absolute top-4 right-4 z-10 rounded-full p-2 shadow-sm backdrop-blur transition-all",
                    saved
                      ? "bg-primary text-on-primary"
                      : "bg-editorial-surface/90 text-primary hover:bg-primary hover:text-on-primary",
                  )}
                  aria-label={saved ? "Remove bookmark" : "Bookmark"}
                  aria-pressed={saved}
                >
                  <Bookmark
                    className="size-5"
                    strokeWidth={2}
                    fill={saved ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <div className="p-8">
                <Link href={href} className="block no-underline">
                  <h3 className="font-headline mb-3 text-2xl font-bold leading-tight text-on-surface transition-colors group-hover:text-primary">
                    {story.title || "Untitled"}
                  </h3>
                  <p className="line-clamp-2 font-login-body text-on-secondary-container">
                    {excerpt}
                  </p>
                </Link>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-headline text-xs font-bold text-on-surface-variant">
                    {authorInitial(authorName)}
                  </div>
                  <span className="font-login-body text-sm font-bold text-on-surface">
                    {authorName}
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-4 font-login-body text-xs font-bold text-on-secondary-container">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 shrink-0" aria-hidden />
                      {readMin} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="size-3.5 shrink-0 text-primary" aria-hidden />
                      {story.likesCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3.5 shrink-0" aria-hidden />
                      {story.commentCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!compact ? (
        <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
      ) : null}
      {!compact && loadingMore ? (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          <EditorialFeedCardSkeleton />
          <EditorialFeedCardSkeleton />
        </div>
      ) : null}
      {compact && items.length > 0 ? (
        <div className="mt-10 flex justify-center">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-transparent px-8 py-3 font-headline text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary sm:text-base"
          >
            View all stories
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
      ) : null}
    </>
  );
}
