"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  getStory,
  likeStory,
  listPublishedStories,
  unlikeStory,
} from "@/services/stories.service";
import { getApiErrorMessage } from "@/services/api";
import type { Comment, Story } from "@/types";
import { PageLoader } from "@/components/ui/loader";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { bookmarkStory, unbookmarkStory } from "@/services/bookmarks.service";
import {
  aesopStoryId,
  isAesopMongoId,
  type AesopStory,
} from "@/services/aesop-stories.service";
import { findAesopStoryById, useAesopStories } from "@/hooks/useAesopStories";
import { AesopStoryView } from "@/features/story/AesopStoryView";
import { PublishedStoryView } from "@/features/story/PublishedStoryView";
import { StoryNotFound } from "@/features/story/StoryNotFound";
import { useStoryNarration } from "@/features/story/useStoryNarration";

export default function StoryPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const user = useAuthStore((s) => s.user);
  const { data: aesopStories = [], isLoading: aesopLoading, isFetched: aesopFetched } =
    useAesopStories();
  const [story, setStory] = useState<(Story & { comments?: Comment[] }) | null>(null);
  const [aesopStory, setAesopStory] = useState<AesopStory | null>(null);
  const [related, setRelated] = useState<Story[]>([]);
  const [publishedLoading, setPublishedLoading] = useState(true);
  const toggleBookmarkLocal = useBookmarkStore((s) => s.toggle);
  const bookmarkIds = useBookmarkStore((s) => s.ids);

  const narration = useStoryNarration(story, user);

  const relatedAesop = useMemo(() => {
    if (!aesopStory) return [];
    const oid = aesopStoryId(aesopStory);
    return aesopStories.filter((s) => aesopStoryId(s) !== oid).slice(0, 2);
  }, [aesopStory, aesopStories]);

  const loadPublished = useCallback(async () => {
    if (!id) return;
    setPublishedLoading(true);
    try {
      const data = await getStory(id);
      setStory(data);
      setAesopStory(null);
    } catch {
      const fable = findAesopStoryById(aesopStories, id);
      setAesopStory(fable);
      setStory(null);
      if (!fable) {
        toast.error("Story not found");
      }
    } finally {
      setPublishedLoading(false);
    }
  }, [id, aesopStories]);

  useEffect(() => {
    if (!id) return;

    if (isAesopMongoId(id)) {
      setStory(null);
      setPublishedLoading(false);
      setAesopStory(findAesopStoryById(aesopStories, id));
      return;
    }

    void loadPublished();
  }, [id, aesopStories, loadPublished]);

  useEffect(() => {
    if (!id || isAesopMongoId(id)) return;
    let cancelled = false;
    void (async () => {
      try {
        const { items } = await listPublishedStories({ page: 1, pageSize: 12 });
        const next = items.filter((s) => s.id !== id).slice(0, 2);
        if (!cancelled) setRelated(next);
      } catch {
        if (!cancelled) setRelated([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onLike = async () => {
    if (!user) {
      toast.message("Log in to like stories");
      return;
    }
    if (!story) return;
    try {
      const next = story.likedByMe ? await unlikeStory(story.id) : await likeStory(story.id);
      setStory((s) => (s ? { ...s, ...next } : s));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not update like"));
    }
  };

  const onBookmark = async () => {
    if (!story) return;
    const on = bookmarkIds.includes(story.id);
    try {
      if (on) {
        await unbookmarkStory(story.id);
        toggleBookmarkLocal(story.id);
        toast.success("Removed from bookmarks");
      } else {
        await bookmarkStory(story.id);
        toggleBookmarkLocal(story.id);
        toast.success("Saved");
      }
    } catch {
      toggleBookmarkLocal(story.id);
      toast.message("Bookmark updated locally");
    }
  };

  const onShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: story?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      toast.message("Could not share");
    }
  };

  const loading =
    isAesopMongoId(id)
      ? aesopLoading && !aesopFetched
      : publishedLoading || (aesopLoading && !aesopFetched && !story && !aesopStory);

  if (loading) {
    return <PageLoader />;
  }

  if (!story && !aesopStory) {
    return <StoryNotFound />;
  }

  if (aesopStory) {
    return <AesopStoryView aesopStory={aesopStory} relatedAesop={relatedAesop} />;
  }

  if (!story) {
    return <StoryNotFound />;
  }

  const bookmarked = bookmarkIds.includes(story.id);

  return (
    <PublishedStoryView
      id={id}
      story={story}
      related={related}
      user={user}
      bookmarked={bookmarked}
      onReload={loadPublished}
      onLike={onLike}
      onBookmark={onBookmark}
      onShare={onShare}
      narration={narration}
    />
  );
}
