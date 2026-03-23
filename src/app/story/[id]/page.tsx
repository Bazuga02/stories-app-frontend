"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, Bookmark } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  getStory,
  likeStory,
  unlikeStory,
} from "@/services/stories.service";
import { addComment } from "@/services/comments.service";
import { getApiErrorMessage } from "@/services/api";
import type { Comment, Story } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { StoryMarkdown } from "@/components/editor/StoryMarkdown";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import {
  bookmarkStory,
  unbookmarkStory,
} from "@/services/bookmarks.service";

const commentSchema = z.object({
  content: z.string().min(1, "Write something").max(2000),
});

type CommentForm = z.infer<typeof commentSchema>;

export default function StoryPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const user = useAuthStore((s) => s.user);
  const [story, setStory] = useState<(Story & { comments?: Comment[] }) | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const toggleBookmarkLocal = useBookmarkStore((s) => s.toggle);
  /** Subscribe to `ids`, not `has` — function refs are stable so Zustand would not re-render. */
  const bookmarkIds = useBookmarkStore((s) => s.ids);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getStory(id);
      setStory(data);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Story not found"));
      setStory(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentForm>({ resolver: zodResolver(commentSchema) });

  const onComment = async (data: CommentForm) => {
    if (!user) {
      toast.message("Log in to comment");
      return;
    }
    try {
      await addComment(id, data.content);
      reset();
      toast.success("Comment posted");
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not post comment"));
    }
  };

  const onLike = async () => {
    if (!user) {
      toast.message("Log in to like stories");
      return;
    }
    if (!story) return;
    try {
      const next = story.likedByMe
        ? await unlikeStory(story.id)
        : await likeStory(story.id);
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

  if (loading) {
    return <PageLoader />;
  }

  if (!story) {
    return (
      <main className="container-design flex flex-1 flex-col items-center justify-center py-[var(--spacing-section)]">
        <p className="text-section-heading mb-4 text-[1.5rem]">Story not found</p>
        <Link href="/" className="font-medium text-accent underline">
          Back to feed
        </Link>
      </main>
    );
  }

  const comments = story.comments ?? [];
  const loginNext = `/login?next=${encodeURIComponent(`/story/${id}`)}`;

  return (
    <main className="container-design flex flex-1 flex-col pb-[var(--spacing-section)] pt-[var(--spacing-xl)]">
      <article className="mx-auto w-full max-w-3xl">
        <p className="text-[0.875rem] text-dark/60">
          {story.author?.name ?? "Unknown author"}
        </p>
        <h1 className="text-section-heading mt-2 text-[clamp(1.75rem,4vw,2.75rem)] normal-case">
          {story.title || "Untitled"}
        </h1>
        <div className="mt-[var(--spacing-md)] flex flex-wrap items-center gap-[var(--spacing-sm)]">
          {user ? (
            <>
              <Button
                type="button"
                variant={story.likedByMe ? "accent" : "ghost"}
                className="!gap-2"
                onClick={() => void onLike()}
              >
                <Heart
                  className="size-4"
                  fill={story.likedByMe ? "currentColor" : "none"}
                />
                {story.likesCount ?? 0}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="!gap-2"
                onClick={() => void onBookmark()}
              >
                <Bookmark
                  className="size-4"
                  fill={bookmarkIds.includes(story.id) ? "currentColor" : "none"}
                />
                {bookmarkIds.includes(story.id) ? "Saved" : "Save"}
              </Button>
            </>
          ) : (
            <>
              <span
                className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-dark/12 bg-white/90 px-4 py-2 text-[0.875rem] font-medium text-dark/70"
                aria-label={`${story.likesCount ?? 0} likes`}
              >
                <Heart className="size-4 shrink-0 text-accent" aria-hidden />
                <span aria-hidden>{story.likesCount ?? 0}</span>
              </span>
              <Link
                href={loginNext}
                className="text-[0.875rem] font-semibold text-accent underline-offset-2 hover:underline"
              >
                Sign in to like or save
              </Link>
            </>
          )}
        </div>
        <div className="mt-[var(--spacing-xl)]">
          <StoryMarkdown source={story.content ?? ""} />
        </div>
      </article>

      <section className="mx-auto mt-[var(--spacing-2xl)] w-full max-w-3xl">
        <h2 className="text-section-heading mb-[var(--spacing-lg)] text-[1.25rem]">
          Comments
        </h2>
        <div className="flex flex-col gap-[var(--spacing-md)]">
          {comments.length === 0 ? (
            <p className="text-dark/60">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <Card key={c.id} className="p-[var(--spacing-md)]">
                <p className="text-[0.875rem] font-semibold text-dark">
                  {c.user?.name ?? "Reader"}
                </p>
                <p className="mt-1 text-[1rem] text-dark/85">{c.content}</p>
              </Card>
            ))
          )}
        </div>

        {user ? (
          <form
            onSubmit={handleSubmit(onComment)}
            className="mt-[var(--spacing-lg)] flex flex-col gap-[var(--spacing-md)]"
          >
            <Textarea
              label="Add a comment"
              placeholder="Share your thoughts…"
              rows={4}
              error={errors.content?.message}
              {...register("content")}
            />
            <Button type="submit" isLoading={isSubmitting}>
              Post comment
            </Button>
          </form>
        ) : (
          <p className="mt-[var(--spacing-lg)] text-[0.875rem] text-dark/70">
            <Link href={loginNext} className="font-semibold text-accent underline">
              Log in
            </Link>{" "}
            to join the conversation.
          </p>
        )}
      </section>
    </main>
  );
}
