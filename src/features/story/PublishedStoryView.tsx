"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Bookmark,
  Clock,
  Heart,
  PlayCircle,
  Share2,
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
    <main className="mx-auto max-w-4xl flex-1 px-5 pt-12 pb-24 font-login-body text-on-surface sm:px-6 md:px-0">
      {/* Story header — left-aligned with cover (unlike centered fable layout) */}
      <section className="mb-10 sm:mb-12">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-tertiary-fixed px-3 py-1 font-login-label text-xs font-bold tracking-wider text-on-tertiary-fixed uppercase">
            Community story
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-secondary">
            <Clock className="size-4" strokeWidth={2} aria-hidden />
            {readMin} min read
          </span>
        </div>

        <h1 className="font-headline mb-8 text-4xl leading-[1.05] font-black tracking-tighter text-on-surface sm:mb-10 sm:text-5xl md:text-6xl lg:text-7xl">
          {titleWithAccent(story.title || "Untitled")}
        </h1>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-surface-variant pb-8">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className="size-12 rounded-full object-cover ring-2 ring-primary/10"
              src={authorAvatarSrc}
            />
            <div>
              <p className="font-headline text-base font-bold leading-tight text-on-surface">
                {authorName}
              </p>
              <p className="text-sm text-secondary">Contributor</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => void onShare()}
              className="flex size-10 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="Share"
            >
              <Share2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => void onLike()}
              className={`flex size-10 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest transition-colors hover:border-primary/40 hover:text-primary ${
                story.likedByMe ? "text-primary" : "text-on-surface"
              }`}
              aria-label="Like"
            >
              <Heart className="size-4" fill={story.likedByMe ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => void onBookmark()}
              className={`flex size-10 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest transition-colors hover:border-primary/40 hover:text-primary ${
                bookmarked ? "text-primary" : "text-on-surface"
              }`}
              aria-label="Bookmark"
            >
              <Bookmark className="size-4" fill={bookmarked ? "currentColor" : "none"} />
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => narration.openListen()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 font-login-label text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] sm:px-5"
              >
                <PlayCircle className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                Listen
              </button>
            ) : (
              <Link
                href={loginNext}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 font-login-label text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] sm:px-5"
              >
                <PlayCircle className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                Listen
              </Link>
            )}
          </div>
        </div>

        {/* Cover — stories only */}
        <div className="overflow-hidden rounded-2xl story-card-shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="aspect-[16/9] w-full object-cover sm:aspect-[2/1]"
            src={heroCoverSrc}
          />
        </div>
      </section>

      <article className="mb-12 min-w-0 sm:mb-14">
        <StoryMarkdown source={story.content ?? ""} variant="editorial" />

        <div className="mt-10 flex flex-wrap gap-2 sm:mt-12">
          <span className="rounded-full bg-surface-variant px-4 py-1.5 font-login-label text-sm font-bold text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary">
            #Stories
          </span>
          <span className="rounded-full bg-surface-variant px-4 py-1.5 font-login-label text-sm font-bold text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary">
            #Reading
          </span>
          {story.excerpt ? (
            <span className="rounded-full bg-surface-variant px-4 py-1.5 font-login-label text-sm font-bold text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary">
              #Featured
            </span>
          ) : null}
        </div>
      </article>

      <StoryListenModal
        open={narration.audioModalOpen}
        storyTitle={story.title || "Untitled"}
        narration={narration}
      />

      <section className="mt-16 border-t border-outline-variant pt-12 sm:mt-20 sm:pt-14">
        <h3 className="mb-8 flex flex-wrap items-center gap-3 font-headline text-3xl font-black tracking-tight text-on-surface sm:mb-10 sm:text-4xl">
          Voices of the community
          <span className="rounded-full bg-primary-fixed px-3 py-1 font-login-label text-sm font-bold text-primary-container">
            {comments.length}
          </span>
        </h3>

        {user ? (
          <div className="story-card-shadow mb-10 rounded-2xl bg-surface-container-low p-6 sm:mb-12 sm:p-8">
            <form onSubmit={handleSubmit(onComment)} className="space-y-4">
              <div className="flex gap-4">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 font-headline text-base font-bold text-primary"
                  aria-hidden
                >
                  {userInitial(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <Textarea
                    placeholder="Add your perspective..."
                    rows={4}
                    error={errors.content?.message}
                    className="min-h-[120px] rounded-xl border-none bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                    {...register("content")}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-primary px-7 py-2.5 font-login-label text-sm font-bold text-on-primary shadow-md shadow-primary/15 transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  Post comment
                </button>
              </div>
            </form>
          </div>
        ) : (
          <p className="mb-10 text-secondary sm:mb-12">
            <Link
              href={loginNext}
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              Log in
            </Link>{" "}
            to add your perspective.
          </p>
        )}

        <div className="space-y-8">
          {comments.length === 0 ? (
            <p className="text-secondary">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-4 sm:gap-5">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-headline text-sm font-bold text-on-surface-variant sm:size-12"
                  aria-hidden
                >
                  {userInitial(c.user?.name ?? "R")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-bold text-on-surface">
                      {c.user?.name ?? "Reader"}
                    </span>
                    <span className="text-xs text-secondary opacity-70">
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

      <section className="mt-16 border-t border-outline-variant pt-12 sm:mt-20 sm:pt-14">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 md:flex-row md:items-end">
          <div>
            <h2 className="font-headline text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
              Continue the <span className="text-primary">journey</span>
            </h2>
            <p className="mt-2 font-login-body text-secondary">
              More stories hand-picked for your curiosity.
            </p>
          </div>
          <Link
            href="/stories"
            className="group inline-flex items-center gap-1.5 font-login-label text-sm font-bold text-primary transition-all hover:gap-3"
          >
            All stories
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {related.length === 0 ? (
            <p className="text-secondary md:col-span-2">
              No other published stories right now.{" "}
              <Link
                href="/stories"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Browse the feed
              </Link>
              .
            </p>
          ) : (
            related.map((s) => (
              <Link
                key={s.id}
                href={`/story/${s.id}`}
                className="story-card-shadow group overflow-hidden rounded-2xl border border-surface-container-high bg-editorial-surface transition-transform hover:-translate-y-1"
              >
                <div className="relative h-44 overflow-hidden sm:h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={s.bgimg?.trim() || STORY_COVER_PLACEHOLDER}
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-headline mb-2 text-xl font-bold text-on-surface transition-colors group-hover:text-primary">
                    {s.title || "Untitled"}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-secondary">
                    {s.excerpt?.trim() ||
                      (s.content ?? "").replace(/\s+/g, " ").trim().slice(0, 140) ||
                      "Open to read more."}
                  </p>
                  <p className="font-login-label text-xs font-bold tracking-widest text-primary uppercase">
                    {s.author?.name ?? "Author"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
