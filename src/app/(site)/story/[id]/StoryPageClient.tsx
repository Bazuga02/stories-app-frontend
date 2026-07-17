"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  getStory,
  likeStory,
  unlikeStory,
} from "@/services/stories.service";
import { getApiErrorMessage } from "@/services/api";
import type { Comment, Story } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { bookmarkStory, unbookmarkStory } from "@/services/bookmarks.service";
import type { AesopStory } from "@/services/aesop-stories.service";
import { AesopStoryView } from "@/features/story/AesopStoryView";
import { PublishedStoryView } from "@/features/story/PublishedStoryView";
import { useStoryNarration } from "@/features/story/useStoryNarration";

type AesopStoryPageClientProps = {
  kind: "aesop";
  aesopStory: AesopStory;
  relatedAesop: AesopStory[];
};

type SpringStoryPageClientProps = {
  kind: "spring";
  id: string;
  initialStory: Story & { comments?: Comment[] };
  initialRelated: Story[];
};

export type StoryPageClientProps =
  | AesopStoryPageClientProps
  | SpringStoryPageClientProps;

function AesopStoryPageClient({
  aesopStory,
  relatedAesop,
}: Omit<AesopStoryPageClientProps, "kind">) {
  return <AesopStoryView aesopStory={aesopStory} relatedAesop={relatedAesop} />;
}

function SpringStoryPageClient({
  id,
  initialStory,
  initialRelated,
}: Omit<SpringStoryPageClientProps, "kind">) {
  const user = useAuthStore((s) => s.user);
  const [story, setStory] = useState(initialStory);
  const toggleBookmarkLocal = useBookmarkStore((s) => s.toggle);
  const bookmarkIds = useBookmarkStore((s) => s.ids);

  const narration = useStoryNarration(story, user);

  const loadPublished = useCallback(async () => {
    try {
      const data = await getStory(id);
      setStory(data);
    } catch {
      toast.error("Story not found");
    }
  }, [id]);

  const onLike = async () => {
    if (!user) {
      toast.message("Log in to like stories");
      return;
    }
    try {
      const next = story.likedByMe
        ? await unlikeStory(story.id)
        : await likeStory(story.id);
      setStory((s) => ({ ...s, ...next }));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not update like"));
    }
  };

  const onBookmark = async () => {
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
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: story.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      toast.message("Could not share");
    }
  };

  const bookmarked = bookmarkIds.includes(story.id);

  return (
    <PublishedStoryView
      id={id}
      story={story}
      related={initialRelated}
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

export function StoryPageClient(props: StoryPageClientProps) {
  if (props.kind === "aesop") {
    return (
      <AesopStoryPageClient
        aesopStory={props.aesopStory}
        relatedAesop={props.relatedAesop}
      />
    );
  }

  return (
    <SpringStoryPageClient
      id={props.id}
      initialStory={props.initialStory}
      initialRelated={props.initialRelated}
    />
  );
}
