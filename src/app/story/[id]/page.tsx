"use client";

import { useCallback, useEffect, useState } from "react";
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
  fetchAesopStoryById,
  fetchAesopStories,
  isAesopMongoId,
  type AesopStory,
} from "@/services/aesop-stories.service";
import { AesopStoryView } from "@/features/story/AesopStoryView";
import { PublishedStoryView } from "@/features/story/PublishedStoryView";
import { StoryNotFound } from "@/features/story/StoryNotFound";
import { useStoryNarration } from "@/features/story/useStoryNarration";

export default function StoryPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const user = useAuthStore((s) => s.user);
  const [story, setStory] = useState<(Story & { comments?: Comment[] }) | null>(null);
  const [aesopStory, setAesopStory] = useState<AesopStory | null>(null);
  const [relatedAesop, setRelatedAesop] = useState<AesopStory[]>([]);
  const [related, setRelated] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const toggleBookmarkLocal = useBookmarkStore((s) => s.toggle);
  const bookmarkIds = useBookmarkStore((s) => s.ids);

  const narration = useStoryNarration(story, user);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      if (isAesopMongoId(id)) {
        const fable = await fetchAesopStoryById(id);
        setAesopStory(fable);
        setStory(null);
        return;
      }
      try {
        const data = await getStory(id);
        setStory(data);
        setAesopStory(null);
      } catch {
        const fable = await fetchAesopStoryById(id);
        setAesopStory(fable);
        setStory(null);
        if (!fable) {
          toast.error("Story not found");
        }
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Story not found"));
      setStory(null);
      setAesopStory(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

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

  useEffect(() => {
    if (!aesopStory) {
      setRelatedAesop([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const all = await fetchAesopStories();
        const oid = aesopStoryId(aesopStory);
        const next = all.filter((s) => aesopStoryId(s) !== oid).slice(0, 2);
        if (!cancelled) setRelatedAesop(next);
      } catch {
        if (!cancelled) setRelatedAesop([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [aesopStory]);

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
      onReload={load}
      onLike={onLike}
      onBookmark={onBookmark}
      onShare={onShare}
      narration={narration}
    />
  );
}
