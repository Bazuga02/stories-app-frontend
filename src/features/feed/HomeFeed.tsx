"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { listPublishedStories } from "@/services/stories.service";
import { getApiErrorMessage } from "@/services/api";
import type { Story } from "@/types";
import { excerptFromContent } from "@/utils/excerpt";
import { Card } from "@/components/ui/card";
import { StoryCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import {
  bookmarkStory,
  unbookmarkStory,
} from "@/services/bookmarks.service";

const PAGE_SIZE = 10;

export function HomeFeed() {
  const [items, setItems] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const toggleBookmarkLocal = useBookmarkStore((s) => s.toggle);
  /** Subscribe to `ids` so toggling bookmarks re-renders (stable `has` fn would not). */
  const bookmarkIds = useBookmarkStore((s) => s.ids);

  const load = useCallback(async (p: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await listPublishedStories({ page: p, pageSize: PAGE_SIZE });
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
        Math.max(1, Math.ceil(res.total / (res.pageSize || PAGE_SIZE)));
      setTotalPages(tp);
      setPage(res.page);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not load stories"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1, false);
  }, [load]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]?.isIntersecting;
        if (!hit || loading || loadingMore) return;
        if (page >= totalPages) return;
        load(page + 1, true);
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [load, loading, loadingMore, page, totalPages]);

  const syncBookmarkApi = async (story: Story) => {
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
      <div className="mx-auto grid max-w-3xl gap-[var(--spacing-lg)] py-[var(--spacing-xl)]">
        {Array.from({ length: 4 }).map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-[var(--spacing-lg)] py-[var(--spacing-xl)]">
      {items.length === 0 ? (
        <Card className="p-[var(--spacing-xl)] text-center text-dark/70">
          No published stories yet. Be the first to{" "}
          <Link href="/editor" className="font-semibold text-accent underline">
            write one
          </Link>
          .
        </Card>
      ) : (
        items.map((story) => (
          <Card key={story.id} className="group p-[var(--spacing-lg)]">
            <Link href={`/story/${story.id}`} className="block no-underline">
              <h2 className="text-card-title mb-2 transition-colors group-hover:text-accent">
                {story.title || "Untitled"}
              </h2>
              <p className="mb-4 text-[1rem] leading-relaxed text-dark/75">
                {story.excerpt ?? excerptFromContent(story.content ?? "")}
              </p>
            </Link>
            <div className="flex flex-wrap items-center gap-4 text-[0.875rem] text-dark/60">
              <span>{story.author?.name ?? "Unknown author"}</span>
              <span className="inline-flex items-center gap-1">
                <Heart className="size-4 text-accent" aria-hidden />
                {story.likesCount ?? 0}
              </span>
              {user ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="!min-h-0 !px-3 !py-1.5 !text-[0.8rem]"
                  onClick={() => void syncBookmarkApi(story)}
                  aria-pressed={bookmarkIds.includes(story.id)}
                >
                  <Bookmark
                    className="size-4"
                    fill={bookmarkIds.includes(story.id) ? "currentColor" : "none"}
                  />
                  {bookmarkIds.includes(story.id) ? "Saved" : "Save"}
                </Button>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(`/story/${story.id}`)}`}
                  className="text-[0.8rem] font-semibold text-accent underline-offset-2 hover:underline"
                >
                  Sign in to save
                </Link>
              )}
            </div>
          </Card>
        ))
      )}
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
      {loadingMore ? (
        <div className="flex justify-center py-6">
          <StoryCardSkeleton />
        </div>
      ) : null}
    </div>
  );
}
