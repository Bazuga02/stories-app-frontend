"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Bookmark,
  Heart,
  PlayCircle,
  Share2,
  Sparkles,
} from "lucide-react";
import { addComment } from "@/services/comments.service";
import { getApiErrorMessage } from "@/services/api";
import type { Comment, Story } from "@/types";
import type { User } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { StoryMarkdown } from "@/components/editor/StoryMarkdown";
import { picsumAuthorAvatar, STORY_COVER_PLACEHOLDER } from "@/lib/picsum";
import {
  estimateReadMinutes,
  formatCommentTime,
  titleWithAccent,
  userInitial,
} from "./story-page-utils";
import { StoryListenModal } from "./StoryListenModal";
import type { UseStoryNarrationReturn } from "./useStoryNarration";

const commentSchema = z.object({
  content: z.string().min(1, "Write something").max(2000),
});

type CommentForm = z.infer<typeof commentSchema>;

export type PublishedStoryViewProps = {
  id: string;
  story: Story & { comments?: Comment[] };
  related: Story[];
  user: User | null | undefined;
  bookmarked: boolean;
  onReload: () => Promise<void>;
  onLike: () => void | Promise<void>;
  onBookmark: () => void | Promise<void>;
  onShare: () => void | Promise<void>;
  narration: UseStoryNarrationReturn;
};

export function PublishedStoryView({
  id,
  story,
  related,
  user,
  bookmarked,
  onReload,
  onLike,
  onBookmark,
  onShare,
  narration,
}: PublishedStoryViewProps) {
  const comments = story.comments ?? [];
  const loginNext = `/login?next=${encodeURIComponent(`/story/${id}`)}`;
  const readMin = estimateReadMinutes(story.content ?? "");
  const authorName = story.author?.name ?? "Unknown author";
  const heroCoverSrc = story.bgimg?.trim() || STORY_COVER_PLACEHOLDER;
  const authorAvatarSrc = picsumAuthorAvatar(story.author?.id, authorName);

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
      await onReload();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not post comment"));
    }
  };

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 pt-12 pb-24 font-login-body text-on-background">
      <section className="relative mb-16">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-tertiary-fixed px-4 py-1 font-headline text-xs font-bold tracking-widest text-on-tertiary-fixed uppercase">
              Editor&apos;s Pick
            </span>
            <span className="text-sm font-medium text-on-secondary-container">{readMin} min read</span>
          </div>
          <h1 className="font-headline text-5xl leading-[0.9] font-black tracking-tighter text-on-background md:text-7xl">
            {titleWithAccent(story.title || "Untitled")}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
            <div className="flex items-center gap-4">
              <img
                alt=""
                className="h-14 w-14 rounded-full border-4 border-surface-container-lowest object-cover"
                src={authorAvatarSrc}
              />
              <div>
                <p className="text-lg font-bold text-on-background">{authorName}</p>
                <p className="text-sm text-on-secondary-container">Contributor</p>
              </div>
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => narration.openListen()}
                className="group flex scale-95 items-center gap-3 rounded-full bg-on-background px-8 py-4 font-headline text-base font-bold text-editorial-surface editorial-shadow transition-all active:scale-90 hover:bg-primary hover:text-on-primary sm:text-lg"
              >
                <PlayCircle
                  className="size-6 shrink-0 fill-current"
                  strokeWidth={1.25}
                  aria-hidden
                />
                Listen to Story
              </button>
            ) : (
              <Link
                href={loginNext}
                className="group flex scale-95 items-center gap-3 rounded-full bg-on-background px-8 py-4 font-headline text-base font-bold text-editorial-surface editorial-shadow transition-all active:scale-90 hover:bg-primary hover:text-on-primary sm:text-lg"
              >
                <PlayCircle
                  className="size-6 shrink-0 fill-current"
                  strokeWidth={1.25}
                  aria-hidden
                />
                Sign in to listen
              </Link>
            )}
          </div>
        </div>
        <div className="relative mt-12">
          <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-tertiary-fixed-dim opacity-30 blur-2xl" />
          <img
            alt=""
            className="h-[min(500px,70vh)] w-full rounded-xl object-cover editorial-shadow"
            src={heroCoverSrc}
          />
          <div className="absolute -bottom-4 -right-4 rotate-3 rounded-lg bg-primary p-4 editorial-shadow">
            <Sparkles className="size-8 text-on-primary" aria-hidden />
          </div>
        </div>
      </section>

      <article className="relative flex gap-12">
        <aside className="sticky top-32 hidden h-fit flex-col gap-6 lg:flex">
          <button
            type="button"
            onClick={() => void onShare()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest editorial-shadow transition-colors hover:text-primary"
            aria-label="Share"
          >
            <Share2 className="size-5" />
          </button>
          <div className="h-12 w-px self-center bg-outline-variant opacity-20" />
          <button
            type="button"
            onClick={() => void onLike()}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest editorial-shadow transition-colors hover:text-primary ${
              story.likedByMe ? "text-primary" : "text-on-surface"
            }`}
            aria-label="Like"
          >
            <Heart className="size-5" fill={story.likedByMe ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => void onBookmark()}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest editorial-shadow transition-colors hover:text-primary ${
              bookmarked ? "text-primary" : "text-on-surface"
            }`}
            aria-label="Bookmark"
          >
            <Bookmark className="size-5" fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <StoryMarkdown source={story.content ?? ""} variant="editorial" />

          <div className="mt-16 flex flex-wrap gap-3 border-t border-outline-variant/10 pt-8">
            <span className="rounded-full bg-surface-container-highest px-4 py-2 text-sm font-bold">
              #Stories
            </span>
            <span className="rounded-full bg-surface-container-highest px-4 py-2 text-sm font-bold">
              #Reading
            </span>
            {story.excerpt ? (
              <span className="rounded-full bg-surface-container-highest px-4 py-2 text-sm font-bold">
                #Featured
              </span>
            ) : null}
            <div className="ml-auto flex gap-4 lg:hidden">
              <button
                type="button"
                onClick={() => void onShare()}
                className="p-2 text-on-surface"
                aria-label="Share"
              >
                <Share2 className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => void onLike()}
                className="p-2 text-on-surface"
                aria-label="Like"
              >
                <Heart className="size-5" fill={story.likedByMe ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </article>

      <StoryListenModal
        open={narration.audioModalOpen}
        storyTitle={story.title || "Untitled"}
        narration={narration}
      />

      <section className="mt-24 border-t border-outline-variant/10 pt-16">
        <h3 className="mb-10 flex flex-wrap items-center gap-4 font-headline text-4xl font-bold text-on-background">
          Voices of the Community
          <span className="rounded-full bg-primary-fixed px-3 py-1 font-login-body text-lg font-normal text-primary-container">
            {comments.length}
          </span>
        </h3>

        {user ? (
          <div className="mb-12 rounded-xl bg-surface-container-low p-8 editorial-shadow">
            <form onSubmit={handleSubmit(onComment)} className="space-y-4">
              <div className="flex gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 font-headline text-lg font-bold text-primary"
                  aria-hidden
                >
                  {userInitial(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <Textarea
                    placeholder="Add your perspective..."
                    rows={4}
                    error={errors.content?.message}
                    className="min-h-[120px] rounded-lg border-none bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                    {...register("content")}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-primary px-8 py-3 font-bold text-on-primary editorial-shadow transition-transform hover:scale-105 disabled:opacity-60"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        ) : (
          <p className="mb-12 text-on-secondary-container">
            <Link href={loginNext} className="font-bold text-primary underline-offset-2 hover:underline">
              Log in
            </Link>{" "}
            to add your perspective.
          </p>
        )}

        <div className="space-y-8">
          {comments.length === 0 ? (
            <p className="text-on-secondary-container">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-6">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-headline text-lg font-bold text-on-surface-variant"
                  aria-hidden
                >
                  {userInitial(c.user?.name ?? "R")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="font-bold text-on-background">{c.user?.name ?? "Reader"}</span>
                    <span className="text-xs text-on-secondary-container opacity-60">
                      {formatCommentTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="leading-relaxed text-on-surface-variant">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-32">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h4 className="font-headline text-4xl font-black text-on-background">
              Continue the <span className="text-primary">Journey</span>
            </h4>
            <p className="mt-2 text-on-secondary-container">More stories hand-picked for your curiosity.</p>
          </div>
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 self-start border-b-2 border-primary pb-1 font-bold text-primary sm:self-auto"
          >
            View Archive <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {related.length === 0 ? (
            <p className="text-on-secondary-container md:col-span-2">
              No other published stories right now.{" "}
              <Link href="/" className="font-semibold text-primary underline-offset-2 hover:underline">
                Browse the feed
              </Link>
              .
            </p>
          ) : (
            related.map((s) => (
              <Link
                key={s.id}
                href={`/story/${s.id}`}
                className="group overflow-hidden rounded-xl bg-surface-container-low editorial-shadow transition-all hover:-translate-y-2"
              >
                <div className="relative h-64">
                  <img
                    alt=""
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    src={s.bgimg?.trim() || STORY_COVER_PLACEHOLDER}
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 font-headline text-xs font-bold text-on-background backdrop-blur">
                    Story
                  </div>
                </div>
                <div className="p-8">
                  <h5 className="mb-3 font-headline text-2xl font-bold transition-colors group-hover:text-primary">
                    {s.title || "Untitled"}
                  </h5>
                  <p className="mb-6 line-clamp-2 text-on-secondary-container">
                    {s.excerpt?.trim() ||
                      (s.content ?? "").replace(/\s+/g, " ").trim().slice(0, 140) ||
                      "Open to read more."}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high font-headline text-xs font-bold text-on-surface-variant">
                      {userInitial(s.author?.name ?? "A")}
                    </div>
                    <span className="text-sm font-bold">{s.author?.name ?? "Author"}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
