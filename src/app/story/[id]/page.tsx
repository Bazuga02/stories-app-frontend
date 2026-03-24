"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, Bookmark, Play, Pause, Square, Volume2 } from "lucide-react";
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
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/loader";
import { StoryMarkdown } from "@/components/editor/StoryMarkdown";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import {
  bookmarkStory,
  unbookmarkStory,
} from "@/services/bookmarks.service";
import { narrateStory } from "@/services/tts.service";

const commentSchema = z.object({
  content: z.string().min(1, "Write something").max(2000),
});

const VOICES = [
  { label: "Default (Linda)", value: "" },
  { label: "Amy (female)", value: "Amy" },
  { label: "Mary (female)", value: "Mary" },
  { label: "John (male)", value: "John" },
  { label: "Mike (male)", value: "Mike" },
] as const;

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

  const [narrating, setNarrating] = useState(false);
  const [listening, setListening] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [voice, setVoice] = useState("");
  const [speed, setSpeed] = useState(0);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

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

  const attachAudioEvents = (audio: HTMLAudioElement) => {
    audio.ontimeupdate = () => {
      setCurrentSec(audio.currentTime || 0);
    };
    audio.onloadedmetadata = () => {
      setDurationSec(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.onended = () => {
      setListening(false);
      setCurrentSec(0);
    };
  };

  const onPlayPauseNarration = async () => {
    if (!story) return;
    if (!user) {
      toast.message("You have to sign in to play voice");
      return;
    }
    if (audioRef.current && audioReady) {
      if (listening) {
        audioRef.current.pause();
        setListening(false);
      } else {
        try {
          await audioRef.current.play();
          setListening(true);
        } catch {
          toast.error("Could not play narration");
        }
      }
      return;
    }
    if (narrating) return;

    setNarrating(true);
    try {
      const res = await narrateStory(story.id, {
        hl: "en-us",
        voice: voice || undefined,
        rate: speed,
        codec: "MP3",
      });
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const src = res.audioBase64.startsWith("data:")
        ? res.audioBase64
        : `data:${res.contentType};base64,${res.audioBase64}`;
      const audio = new Audio(src);
      attachAudioEvents(audio);
      audioRef.current = audio;
      await audio.play();
      setAudioReady(true);
      setListening(true);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not narrate this story"));
      setListening(false);
      setAudioReady(false);
    } finally {
      setNarrating(false);
    }
  };

  const onStopNarration = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentSec(0);
    setListening(false);
    setAudioReady(false);
    audioRef.current = null;
  };

  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progressPct =
    durationSec > 0 ? Math.min(100, Math.max(0, (currentSec / durationSec) * 100)) : 0;

  const onSeek = (value: string) => {
    if (!audioRef.current || !durationSec) return;
    const pct = Number(value);
    if (!Number.isFinite(pct)) return;
    const nextSec = (pct / 100) * durationSec;
    audioRef.current.currentTime = nextSec;
    setCurrentSec(nextSec);
  };

  const onListenFromScratch = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setListening(false);
      setAudioReady(false);
      audioRef.current = null;
    }
    void onPlayPauseNarration();
  };

  const onCloseAudioModal = () => {
    onStopNarration();
    setAudioModalOpen(false);
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
            <Button
              type="button"
              variant="ghost"
              className="!gap-2"
              onClick={() => setAudioModalOpen(true)}
            >
              <Volume2 className="size-4" />
              Listen to story
            </Button>
          ) : (
            <Link
              href={loginNext}
              className="text-[0.875rem] font-semibold text-accent underline-offset-2 hover:underline"
            >
              Sign in to listen
            </Link>
          )}
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
      <Modal
        open={audioModalOpen}
        onClose={onCloseAudioModal}
        title="Story Narration"
        className="max-w-2xl"
      >
        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-[0.8rem] font-semibold text-dark/70">
            Voice
            <select
              className="rounded-[var(--radius-md)] border border-dark/15 bg-white px-3 py-2 text-[0.9rem] text-dark outline-none focus:border-accent"
              value={voice}
              onChange={(e) => {
                setVoice(e.target.value);
                onStopNarration();
              }}
            >
              {VOICES.map((v) => (
                <option key={v.label} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[0.8rem] font-semibold text-dark/70">
            Speed: {speed}
            <input
              type="range"
              min={-10}
              max={10}
              step={1}
              value={speed}
              onChange={(e) => {
                setSpeed(Number(e.target.value));
                onStopNarration();
              }}
              className="w-full accent-accent"
              aria-label="Narration speed"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={listening ? "accent" : "ghost"}
            className="!gap-2"
            onClick={() => {
              void onPlayPauseNarration();
            }}
            isLoading={narrating}
          >
            {listening ? <Pause className="size-4" /> : <Play className="size-4" />}
            {audioReady ? (listening ? "Pause" : "Resume") : "Listen"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!gap-2"
            onClick={onStopNarration}
            disabled={!audioReady}
          >
            <Square className="size-4" />
            Stop
          </Button>
          {audioReady ? (
            <Button
              type="button"
              variant="ghost"
              className="!gap-2"
              onClick={onListenFromScratch}
            >
              <Volume2 className="size-4" />
              Replay
            </Button>
          ) : null}
        </div>
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={progressPct}
            onChange={(e) => onSeek(e.target.value)}
            disabled={!audioReady}
            className="w-full accent-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Narration progress"
          />
          <div className="mt-1 flex items-center justify-between text-[0.78rem] text-dark/60">
            <span>{audioReady ? formatTime(currentSec) : "0:00"}</span>
            <span>
              {audioReady
                ? listening
                  ? "Narration playing"
                  : "Narration paused"
                : "Narration ready on demand"}
            </span>
            <span>{audioReady ? formatTime(durationSec) : "0:00"}</span>
          </div>
        </div>
      </Modal>

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
