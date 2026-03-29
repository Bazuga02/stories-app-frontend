"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  Heart,
  Pause,
  Play,
  PlayCircle,
  Share2,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  getStory,
  likeStory,
  listPublishedStories,
  unlikeStory,
} from "@/services/stories.service";
import { addComment } from "@/services/comments.service";
import { getApiErrorMessage } from "@/services/api";
import type { Comment, Story } from "@/types";
import { Textarea } from "@/components/ui/textarea";
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
import {
  aesopExcerpt,
  aesopReadMinutes,
  aesopStoryId,
  fetchAesopStories,
  fetchAesopStoryById,
  isAesopMongoId,
  type AesopStory,
} from "@/services/aesop-stories.service";

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

const HERO_IMAGE_FALLBACK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHoh7_rarygnFOESnruizwOmmJILOwMEAbHOkbSFcS45PP8_WSrGTZ9QD1iBmTCv7Lz8kdgrxTEzaP2qxG8pRDMgS3XOIxiMpGwagmcNXmx4FPZ2va5-MPrQAyCHH5-77vV0OUeX_xGzIeKy8lvRdptsfbAw1COQZL1DeoIB1k8vw_lP5tEDxke9z3HwxLjRp4PAruOzW-1dcYEOTyV5Xvb3e0ypCcRslpHfXQDEKrAVyTqTSv-1oo_ZR_oVfcy1WU1xJOwHAW_4w";

const AUTHOR_AVATAR_FALLBACK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnEqM46YtVo8sg6mxh860IeWIzw9vpaDzSXdeS8dFlTFzPUnjv5lBAXGgNFghYBkE_QhiNpr5R9UBLsrglJ_DVBJ9P0PQzyg1TK1u-Tp9cQH5v2Lkv-406N80QdEAS_MbgHjNmTYsYpwk_VArp0bZLXIGI-Ag5Ik48CZBW3drWFnjfTmS8jOzbr-TIdkUAc0ZsNwETP265Xrb71ZdALZyr9K9Uz9OK2pgqEj4F34kNu1ygAcwrLC1s_4loaMZsO1MxrQS2KfcBhDM";

const RELATED_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzdDAcPWjJ8pVVt_VOrxVvW5DbZ2HCOO9LF7ajaKJl-XZz0sWckp0rJZTYCKcRkBSYvrIFEBpO0vFOGw8qsMP2aKWJD3o5nlaLFJWSSCtYYJPT3z7TltI_f53pEXK0T_1RHybsRG9M_i-Q3xMhfjzlgm2A81X4-CJvunsyNPQsfaV1-oHvVEhEkPE1rsuK8K9ifBOoGRckWOSxzuQdyrauCY023MRCpv4cvemASfkxGPbjOvvf2RegCs0sgHcFSYjhD700_tkL_9Y",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBslZhfscsWyRla7DOIvp_icE2lsehDrFoS53_ksJp9JlLwPrWgIIUWIFXJPgp_Txlk8XqgL_2YVGTeszejahxU90hqBQhD__RdPJfISKMCD0GS4AkxNDeIpkF01hSQF6oEk1CBHar7nK3PB4gxEBID3sbVQhA6ph0YtW9WBo6bTozsLehSX7M7gTiYR5LyDYfppBGhZ262EJAFeWzzx5Uyms-TFXbrZDy33pRK3XcxiMdTTXdvJgx_fo4tEp42cDlPIhCoXd34xeE",
] as const;

type CommentForm = z.infer<typeof commentSchema>;

function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatCommentTime(iso?: string) {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString();
}

function titleWithAccent(title: string) {
  const t = title.trim() || "Untitled";
  const parts = t.split(/\s+/);
  if (parts.length < 2) {
    return <span className="text-primary">{t}</span>;
  }
  const last = parts.pop()!;
  return (
    <>
      {parts.join(" ")}{" "}
      <span className="text-primary">{last}</span>
    </>
  );
}

function userInitial(name: string) {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

export default function StoryPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const user = useAuthStore((s) => s.user);
  const [story, setStory] = useState<(Story & { comments?: Comment[] }) | null>(
    null,
  );
  const [aesopStory, setAesopStory] = useState<AesopStory | null>(null);
  const [relatedAesop, setRelatedAesop] = useState<AesopStory[]>([]);
  const [related, setRelated] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const toggleBookmarkLocal = useBookmarkStore((s) => s.toggle);
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

  const openListen = () => {
    if (!story) return;
    if (!user) return;
    setAudioModalOpen(true);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!story && !aesopStory) {
    return (
      <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-6 py-24 font-login-body">
        <p className="font-headline mb-4 text-2xl font-black text-on-background">
          Story not found
        </p>
        <Link
          href="/"
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Back to feed
        </Link>
      </main>
    );
  }

  if (aesopStory) {
    const aesopRead = aesopReadMinutes(aesopStory.story);
    const aesopAuthor = aesopStory.author.trim() || "Unknown";
    return (
      <main className="mx-auto max-w-4xl flex-1 px-6 pt-12 pb-24 font-login-body text-on-background">
        <section className="relative mb-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary/15 px-4 py-1 font-headline text-xs font-bold tracking-widest text-primary uppercase">
                Aesop&apos;s Fables
              </span>
              <span className="text-sm font-medium text-on-secondary-container">
                {aesopRead} min read
              </span>
            </div>
            <h1 className="font-headline text-5xl leading-[0.9] font-black tracking-tighter text-on-background md:text-7xl">
              {titleWithAccent(aesopStory.title || "Untitled")}
            </h1>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary/15 font-headline text-xl font-bold text-primary"
                aria-hidden
              >
                {userInitial(aesopAuthor)}
              </div>
              <div>
                <p className="text-lg font-bold text-on-background">{aesopAuthor}</p>
                <p className="text-sm text-on-secondary-container">Short story</p>
              </div>
            </div>
          </div>
        </section>

        <article className="min-w-0">
          <StoryMarkdown source={aesopStory.story} variant="editorial" />
          {aesopStory.moral ? (
            <blockquote className="mt-12 rounded-2xl border-l-4 border-primary bg-surface-container-low p-6 text-on-surface-variant">
              <p className="font-headline mb-2 text-xs font-bold uppercase tracking-widest text-primary not-italic">
                Moral
              </p>
              <p className="leading-relaxed">{aesopStory.moral}</p>
            </blockquote>
          ) : null}
          <div className="mt-12 flex flex-wrap gap-3 border-t border-outline-variant/10 pt-8">
            <span className="rounded-full bg-surface-container-highest px-4 py-2 text-sm font-bold">
              #Fable
            </span>
            <span className="rounded-full bg-surface-container-highest px-4 py-2 text-sm font-bold">
              #ShortStory
            </span>
          </div>
        </article>

        <section className="mt-24 border-t border-outline-variant/10 pt-16">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h4 className="font-headline text-4xl font-black text-on-background">
                More <span className="text-primary">fables</span>
              </h4>
              <p className="mt-2 text-on-secondary-container">
                Continue reading—covers are not used for this collection.
              </p>
            </div>
            <Link
              href="/short-stories"
              className="flex shrink-0 items-center gap-2 self-start border-b-2 border-primary pb-1 font-bold text-primary sm:self-auto"
            >
              All short stories <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {relatedAesop.length === 0 ? (
              <p className="text-on-secondary-container md:col-span-2">
                <Link href="/short-stories" className="font-semibold text-primary underline-offset-2 hover:underline">
                  Browse all fables
                </Link>
                .
              </p>
            ) : (
              relatedAesop.map((s) => (
                <Link
                  key={aesopStoryId(s)}
                  href={`/story/${aesopStoryId(s)}`}
                  className="group rounded-xl border border-outline-variant/15 bg-surface-container-low p-6 editorial-shadow transition-all hover:-translate-y-1 hover:border-primary/30"
                >
                  <h5 className="mb-2 font-headline text-xl font-bold transition-colors group-hover:text-primary">
                    {s.title}
                  </h5>
                  <p className="line-clamp-3 text-sm text-on-secondary-container">
                    {aesopExcerpt(s.story, 160)}
                  </p>
                  <p className="mt-4 text-xs font-bold text-on-secondary-container opacity-70">
                    {s.author}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-6 py-24 font-login-body">
        <p className="font-headline mb-4 text-2xl font-black text-on-background">
          Story not found
        </p>
        <Link
          href="/"
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Back to feed
        </Link>
      </main>
    );
  }

  const comments = story.comments ?? [];
  const loginNext = `/login?next=${encodeURIComponent(`/story/${id}`)}`;
  const readMin = estimateReadMinutes(story.content ?? "");
  const bookmarked = bookmarkIds.includes(story.id);
  const authorName = story.author?.name ?? "Unknown author";

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 pt-12 pb-24 font-login-body text-on-background">
      <section className="relative mb-16">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-tertiary-fixed px-4 py-1 font-headline text-xs font-bold tracking-widest text-on-tertiary-fixed uppercase">
              Editor&apos;s Pick
            </span>
            <span className="text-sm font-medium text-on-secondary-container">
              {readMin} min read
            </span>
          </div>
          <h1 className="font-headline text-5xl leading-[0.9] font-black tracking-tighter text-on-background md:text-7xl">
            {titleWithAccent(story.title || "Untitled")}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
            <div className="flex items-center gap-4">
              <img
                alt=""
                className="h-14 w-14 rounded-full border-4 border-surface-container-lowest object-cover"
                src={AUTHOR_AVATAR_FALLBACK}
              />
              <div>
                <p className="text-lg font-bold text-on-background">{authorName}</p>
                <p className="text-sm text-on-secondary-container">Contributor</p>
              </div>
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => openListen()}
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
            src={HERO_IMAGE_FALLBACK}
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
            <Heart
              className="size-5"
              fill={story.likedByMe ? "currentColor" : "none"}
            />
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
                <Heart
                  className="size-5"
                  fill={story.likedByMe ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      </article>

      <Modal
        open={audioModalOpen}
        onClose={onCloseAudioModal}
        title="Listen to Story"
        variant="editorial"
        className="max-w-2xl"
      >
        <p className="-mt-1 mb-6 line-clamp-2 text-sm leading-relaxed text-on-secondary-container">
          {story.title || "Untitled"}
        </p>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-surface-container-lowest p-4 editorial-shadow sm:p-5">
            <label className="font-headline text-[0.65rem] font-bold tracking-[0.2em] text-primary uppercase">
              Voice
            </label>
            <select
              className="mt-3 w-full cursor-pointer rounded-xl border border-outline-variant/25 bg-surface-container-high px-3 py-3 text-sm font-medium text-on-background outline-none transition-shadow focus:ring-2 focus:ring-primary/35"
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
          </div>
          <div className="rounded-2xl bg-surface-container-lowest p-4 editorial-shadow sm:p-5">
            <label className="font-headline text-[0.65rem] font-bold tracking-[0.2em] text-primary uppercase">
              Pace
            </label>
            <p className="mt-1 text-xs text-on-secondary-container">Speed: {speed}</p>
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
              className="mt-4 w-full accent-primary"
              aria-label="Narration speed"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={narrating}
            onClick={() => {
              void onPlayPauseNarration();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-headline text-sm font-bold text-on-primary editorial-shadow transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-80 sm:px-10 sm:text-base"
          >
            {narrating ? (
              <span
                className="size-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent"
                aria-hidden
              />
            ) : listening ? (
              <Pause className="size-5 shrink-0 fill-current" strokeWidth={2} />
            ) : (
              <Play className="size-5 shrink-0 fill-current" strokeWidth={2} />
            )}
            {audioReady ? (listening ? "Pause" : "Resume") : "Play narration"}
          </button>
          <button
            type="button"
            onClick={onStopNarration}
            disabled={!audioReady}
            className="inline-flex items-center gap-2 rounded-full border-2 border-outline/35 bg-transparent px-5 py-3 font-headline text-sm font-bold text-on-background transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Square className="size-4" strokeWidth={2} />
            Stop
          </button>
          {audioReady ? (
            <button
              type="button"
              onClick={onListenFromScratch}
              className="inline-flex items-center gap-2 rounded-full border-2 border-outline/35 bg-transparent px-5 py-3 font-headline text-sm font-bold text-on-background transition-colors hover:border-primary hover:text-primary"
            >
              <Volume2 className="size-4" strokeWidth={2} />
              Replay
            </button>
          ) : null}
        </div>

        <div className="mt-8 rounded-2xl bg-surface-container-high/90 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2">
            <Volume2 className="size-4 text-primary" aria-hidden />
            <span className="font-headline text-xs font-bold tracking-widest text-on-secondary-container uppercase">
              Progress
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={progressPct}
            onChange={(e) => onSeek(e.target.value)}
            disabled={!audioReady}
            className="w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Narration progress"
          />
          <div className="mt-3 flex items-center justify-between font-login-body text-xs text-on-secondary-container sm:text-sm">
            <span className="font-medium tabular-nums">
              {audioReady ? formatTime(currentSec) : "0:00"}
            </span>
            <span className="max-w-[50%] text-center text-[0.7rem] sm:text-xs">
              {audioReady
                ? listening
                  ? "Playing"
                  : "Paused"
                : "Choose voice & press play"}
            </span>
            <span className="font-medium tabular-nums">
              {audioReady ? formatTime(durationSec) : "0:00"}
            </span>
          </div>
        </div>
      </Modal>

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
                    <span className="font-bold text-on-background">
                      {c.user?.name ?? "Reader"}
                    </span>
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
            <p className="mt-2 text-on-secondary-container">
              More stories hand-picked for your curiosity.
            </p>
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
            related.map((s, i) => (
              <Link
                key={s.id}
                href={`/story/${s.id}`}
                className="group overflow-hidden rounded-xl bg-surface-container-low editorial-shadow transition-all hover:-translate-y-2"
              >
                <div className="relative h-64">
                  <img
                    alt=""
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    src={RELATED_IMAGES[i % RELATED_IMAGES.length] ?? RELATED_IMAGES[0]}
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
