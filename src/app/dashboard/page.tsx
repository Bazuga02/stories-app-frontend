"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  Clock,
  Heart,
  MessageSquare,
  Pencil,
  Plus,
  Settings,
  Share2,
  Star,
  Trash2,
  Users,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteStory,
  listMyStories,
} from "@/services/stories.service";
import { listBookmarkedStories } from "@/services/bookmarks.service";
import { getApiErrorMessage } from "@/services/api";
import type { Story } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/loader";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/cn";

type StudioView = "mine" | "liked" | "bookmarks" | "drafts";

const CARD_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCSGlSdlDYl__f4qA-KAVrgJ_-3FIc0NUniW-6018ioSKY0Dr2jHUlU4YQ9-3ivsS6i5BPBmm6NZVBRUZK6vIiJ4OsLCIO7YFwLhvQ_hZddvnnXoRm2moMOD8K0wtDpdI3tbd_rWQp8Yxp3n-7I6MDXggpwtvauUi7YxU6sBQNlCo-Zg3AsmTxd8b1Nyrmp2pQcpNcvB5GlSf7A6CSFJ0Kr6BcwamfIPGerL_n9pZG6S1x2PAENWxHDEg1gc9u_8a_k99SE14Zrfes",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAhVgbufBeQvQwGsXBOyJYW940YjwJsezkhFRSbvQQDRWojlcMNaLpehaOwoqRv8WHmRBniXk_hS1rkBk2VYWh0vgW3ud3MthI26qqXk6tz4f-JX6xqvs5ekduTvwsJQ4U9U9DVYYTExMOnJRizKCvLxj5dkePXoKxuOs_LCN2AgOjYs9S1iZ0TE7WZmOymoSprVvBF_pNemdDjP11wVB8vtQv3X7z4OSWd-6-6eFoReH59pPdwpbANkPqG2XEL2dtKSkKJ1yF8LSo",
] as const;

const PROFILE_FALLBACK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAqZP2ZeDx-_yvQMtbRRIpBp7tvhet4f1hzr8hgpZ1ip3soR6KwozLoNqQPmeHlAIUOvjop69INLzsetBE-FmlXjfzOKiJtWlk5yDLnZcq0dmPX78DVAG_NyzCCnBNfAKO4MegzDlqHCZzV-qXBfbo5MDuirufTO96zIPQT8H2A4jjtRJRmA_UTkSOzdcTqPXOCl4vDdHdDU7sKHGnOlbpxXKH17NccICr6s_Cn6rQGYC3z8R65jynvlhI_hpWAy19trbkiiWGGRh4";

function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatStoryDate(iso?: string) {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeShort(iso?: string) {
  if (!iso) return "Recently updated";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently updated";
  const diff = Date.now() - d.getTime();
  const day = 86400000;
  if (diff < day) return "Updated today";
  if (diff < 2 * day) return "Last saved yesterday";
  return `Updated ${formatStoryDate(iso)}`;
}

function formatStat(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

function isAuthor(story: Story, userId: string | undefined) {
  if (!userId) return false;
  return story.authorId === userId || story.author?.id === userId;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [view, setView] = useState<StudioView>("mine");
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [bookmarks, setBookmarks] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, marks] = await Promise.all([
        listMyStories(undefined, { page: 1, pageSize: 100 }),
        listBookmarkedStories().catch(() => [] as Story[]),
      ]);
      setMyStories(mine);
      setBookmarks(marks);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not load your studio"));
      setMyStories([]);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const publishedMine = useMemo(
    () => myStories.filter((s) => s.status === "PUBLISHED"),
    [myStories],
  );
  const draftsMine = useMemo(
    () => myStories.filter((s) => s.status === "DRAFT"),
    [myStories],
  );

  const stats = useMemo(() => {
    const publishedCount = publishedMine.length;
    const readsSum = publishedMine.reduce((a, s) => a + (s.viewCount ?? 0), 0);
    const likesSum = publishedMine.reduce((a, s) => a + (s.likesCount ?? 0), 0);
    const commentsSum = publishedMine.reduce(
      (a, s) => a + (s.commentCount ?? 0),
      0,
    );
    return { publishedCount, readsSum, likesSum, commentsSum };
  }, [publishedMine]);

  const listItems = useMemo(() => {
    switch (view) {
      case "mine":
        return myStories;
      case "drafts":
        return draftsMine;
      case "bookmarks":
        return bookmarks;
      case "liked":
        return [];
      default:
        return myStories;
    }
  }, [view, myStories, draftsMine, bookmarks]);

  const tabCounts = useMemo(
    () => ({
      mine: myStories.length,
      drafts: draftsMine.length,
      bookmarks: bookmarks.length,
    }),
    [myStories.length, draftsMine.length, bookmarks.length],
  );

  const activityLines = useMemo(() => {
    const lines: { key: string; text: ReactNode; sub: string }[] = [];
    const sorted = [...publishedMine].sort((a, b) => {
      const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return tb - ta;
    });
    for (const s of sorted) {
      const cc = s.commentCount ?? 0;
      const lk = s.likesCount ?? 0;
      if (cc > 0) {
        lines.push({
          key: `c-${s.id}`,
          text: (
            <>
              <span className="font-bold text-on-surface">{cc}</span> new comment
              {cc === 1 ? "" : "s"} on{" "}
              <span className="font-bold italic text-primary">
                &ldquo;{(s.title || "Untitled").slice(0, 42)}
                {(s.title?.length ?? 0) > 42 ? "…" : ""}&rdquo;
              </span>
            </>
          ),
          sub: formatRelativeShort(s.updatedAt ?? s.createdAt),
        });
      } else if (lk > 0 && lines.length < 4) {
        lines.push({
          key: `l-${s.id}`,
          text: (
            <>
              <span className="font-bold text-on-surface">{lk}</span> like
              {lk === 1 ? "" : "s"} on{" "}
              <span className="font-bold italic text-primary">
                &ldquo;{(s.title || "Untitled").slice(0, 36)}
                {(s.title?.length ?? 0) > 36 ? "…" : ""}&rdquo;
              </span>
            </>
          ),
          sub: formatRelativeShort(s.updatedAt ?? s.createdAt),
        });
      }
      if (lines.length >= 4) break;
    }
    return lines.slice(0, 4);
  }, [publishedMine]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteStory(deleteId);
      toast.success("Story deleted");
      setDeleteId(null);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Delete failed"));
    } finally {
      setDeleting(false);
    }
  };

  const shareStory = async (s: Story) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/story/${s.id}`
        : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: s.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      toast.message("Could not share");
    }
  };

  const sidebarLink = (
    key: StudioView | "settings",
    label: string,
    icon: React.ReactNode,
  ) => {
    if (key === "settings") {
      return (
        <button
          type="button"
          key="settings"
          onClick={() => toast.message("Settings coming soon")}
          className="flex w-full items-center rounded-l-full px-6 py-3 text-left text-[#161616] opacity-60 transition-all duration-200 hover:bg-editorial-surface hover:opacity-100 hover:pl-7"
        >
          <span className="mr-3 flex size-6 items-center justify-center">{icon}</span>
          <span className="font-login-body text-sm font-semibold">{label}</span>
        </button>
      );
    }
    const active = view === key;
    return (
      <button
        type="button"
        key={key}
        onClick={() => setView(key)}
        className={cn(
          "flex w-full items-center px-6 py-3 text-left transition-all duration-200 ease-in-out hover:pl-7",
          active
            ? "border-r-4 border-primary bg-primary/5 font-extrabold text-primary"
            : "rounded-l-full text-[#161616] opacity-60 hover:bg-editorial-surface hover:opacity-100",
        )}
      >
        <span className="mr-3 flex size-6 items-center justify-center">{icon}</span>
        <span className="font-login-body text-sm font-semibold">{label}</span>
      </button>
    );
  };

  const mainTabBtn = (
    key: StudioView,
    label: string,
    count?: number,
  ) => {
    const active = view === key;
    return (
      <button
        type="button"
        onClick={() => setView(key)}
        className={cn(
          "whitespace-nowrap px-2 pb-4 font-headline text-sm transition-colors sm:text-base",
          active
            ? "border-b-4 border-primary font-black text-primary"
            : "font-bold text-on-surface-variant opacity-50 hover:opacity-100",
        )}
      >
        {label}
        {count !== undefined ? ` (${count})` : ""}
      </button>
    );
  };

  const displayName = user?.name ?? "Writer";

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="z-40 flex w-full shrink-0 flex-col border-outline-variant/15 bg-surface-container-low md:sticky md:top-[4.75rem] md:h-[calc(100dvh-4.75rem)] md:w-64 md:border-r md:border-b-0 border-b py-6">
        <div className="mb-8 px-6">
          <h1 className="font-headline text-xl font-black text-primary">Editorial Studio</h1>
          <p className="mt-1 font-login-body text-xs font-medium tracking-wide text-on-surface opacity-60">
            Stories Ink Contributor
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Studio">
          {sidebarLink("mine", "My Stories", <BookOpen className="size-5" strokeWidth={2} />)}
          {sidebarLink("liked", "Liked", <Heart className="size-5" strokeWidth={2} />)}
          {sidebarLink("bookmarks", "Bookmarks", <Bookmark className="size-5" strokeWidth={2} />)}
          {sidebarLink("settings", "Settings", <Settings className="size-5" strokeWidth={2} />)}
        </nav>
        <div className="mt-auto border-t border-outline-variant/10 px-6 pt-6">
          <div className="mb-6 flex items-center gap-3">
            <img
              alt=""
              className="h-10 w-10 rounded-full border-2 border-primary object-cover"
              src={PROFILE_FALLBACK}
            />
            <div className="min-w-0">
              <p className="truncate font-login-body text-sm font-bold text-on-surface">
                {displayName}
              </p>
              <p className="font-login-body text-[10px] font-medium tracking-widest text-on-surface uppercase opacity-50">
                Senior Editor
              </p>
            </div>
          </div>
          <Link
            href="/editor"
            className="flex w-full items-center justify-center rounded-full bg-primary py-3 font-headline text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform duration-150 hover:scale-[0.98]"
          >
            Create New Story
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 p-6 lg:p-10 xl:p-12">
        <header className="relative mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Star className="size-5 fill-primary text-primary" strokeWidth={1.5} aria-hidden />
              <span className="font-headline text-sm font-bold tracking-widest uppercase">
                Editor&apos;s Dashboard
              </span>
            </div>
            <h2 className="font-headline text-5xl leading-none font-black tracking-tighter text-on-surface md:text-6xl lg:text-7xl">
              My Editorial <span className="text-primary italic">Studio.</span>
            </h2>
            <p className="mt-4 max-w-xl font-login-body text-lg font-medium text-on-surface-variant">
              Welcome back, {displayName.split(" ")[0]}. Your narrative journey continues here.
              {draftsMine.length > 0 ? (
                <>
                  {" "}
                  You have{" "}
                  <span className="font-bold text-primary">
                    {draftsMine.length} draft{draftsMine.length === 1 ? "" : "s"}
                  </span>{" "}
                  waiting for your magic touch.
                </>
              ) : (
                <> You&apos;re all caught up on drafts.</>
              )}
            </p>
          </div>
          <Link
            href="/editor"
            className="group relative z-10 flex shrink-0 items-center rounded-full bg-on-surface px-8 py-4 font-headline text-lg font-bold text-editorial-surface transition-all duration-300 hover:bg-primary hover:text-on-primary"
          >
            <Plus
              className="mr-2 size-5 transition-transform group-hover:rotate-90"
              strokeWidth={2.5}
              aria-hidden
            />
            New Story
          </Link>
          <div
            className="pointer-events-none absolute -top-10 -right-10 -z-0 size-64 bg-tertiary-fixed-dim/20 blur-3xl cloud-shape"
            aria-hidden
          />
        </header>

        {/* Stats */}
        <section className="mb-12 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-xl bg-surface-container-low p-8">
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <Eye className="size-8 text-primary" strokeWidth={2} aria-hidden />
                <span className="rounded-full bg-primary/10 px-2 py-1 font-headline text-xs font-bold text-primary">
                  Live
                </span>
              </div>
              <p className="font-headline text-sm font-bold tracking-widest text-on-surface-variant uppercase opacity-60">
                Total Reads
              </p>
              <h3 className="mt-1 font-headline text-5xl font-black text-on-surface">
                {stats.readsSum >= 1000
                  ? formatStat(stats.readsSum)
                  : stats.readsSum.toLocaleString()}
              </h3>
            </div>
            <div className="absolute -bottom-4 -right-4 text-primary/5 transition-transform duration-500 group-hover:scale-110">
              <BookOpen className="size-[120px]" strokeWidth={1} aria-hidden />
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl bg-on-surface p-8">
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <Heart className="size-8 fill-primary-fixed-dim text-primary-fixed-dim" aria-hidden />
                <span className="rounded-full bg-editorial-surface/10 px-2 py-1 font-headline text-xs font-bold text-editorial-surface">
                  All time
                </span>
              </div>
              <p className="font-headline text-sm font-bold tracking-widest text-editorial-surface uppercase opacity-60">
                Total Likes
              </p>
              <h3 className="mt-1 font-headline text-5xl font-black text-editorial-surface">
                {stats.likesSum >= 1000
                  ? formatStat(stats.likesSum)
                  : stats.likesSum.toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-surface-container-highest p-8">
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <Users className="size-8 text-tertiary" strokeWidth={2} aria-hidden />
                <span className="rounded-full bg-tertiary/10 px-2 py-1 font-headline text-xs font-bold text-tertiary">
                  Engagement
                </span>
              </div>
              <p className="font-headline text-sm font-bold tracking-widest text-on-surface-variant uppercase opacity-60">
                Comments
              </p>
              <h3 className="mt-1 font-headline text-5xl font-black text-on-surface">
                {stats.commentsSum >= 1000
                  ? formatStat(stats.commentsSum)
                  : stats.commentsSum.toLocaleString()}
              </h3>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Story list */}
          <div className="min-w-0 flex-1">
            <div className="mb-8 flex items-center gap-6 overflow-x-auto border-b border-outline-variant/15 pb-2">
              {mainTabBtn("mine", "My Stories", tabCounts.mine)}
              {mainTabBtn("liked", "Liked")}
              {mainTabBtn("bookmarks", "Bookmarks", tabCounts.bookmarks)}
              {mainTabBtn("drafts", "Drafts", tabCounts.drafts)}
            </div>

            {loading ? (
              <PageLoader />
            ) : view === "liked" ? (
              <div className="rounded-xl bg-surface-container-low p-10 text-center font-login-body text-on-surface-variant">
                <Heart className="mx-auto mb-4 size-12 text-primary/30" strokeWidth={1.5} />
                <p className="font-headline text-lg font-bold text-on-surface">
                  Liked stories
                </p>
                <p className="mt-2 max-w-md text-sm">
                  There isn&apos;t a dedicated &ldquo;liked&rdquo; list in the API yet. Open any
                  story from the feed and tap the heart to like it—those likes still count on each
                  post.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-block font-headline text-sm font-bold text-primary underline-offset-2 hover:underline"
                >
                  Explore stories
                </Link>
              </div>
            ) : listItems.length === 0 ? (
              <div className="rounded-xl bg-surface-container-low p-10 text-center font-login-body text-on-surface-variant">
                <p className="font-headline text-lg font-bold text-on-surface">
                  Nothing here yet
                </p>
                <p className="mt-2 text-sm">
                  {view === "bookmarks"
                    ? "Save stories from the feed with the bookmark icon."
                    : view === "drafts"
                      ? "Start a draft in the editor."
                      : "Create your first story to see it here."}
                </p>
                <Link
                  href="/editor"
                  className="mt-6 inline-block font-headline text-sm font-bold text-primary underline-offset-2 hover:underline"
                >
                  Open editor
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {listItems.map((s, index) => {
                  const img = CARD_IMAGES[index % CARD_IMAGES.length];
                  const mine = isAuthor(s, user?.id);
                  const published = s.status === "PUBLISHED";
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col gap-6 rounded-lg bg-surface-container-low p-6 transition-transform duration-300 hover:-translate-y-1 md:flex-row"
                    >
                      <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg md:w-48">
                        <img alt="" className="h-full w-full object-cover" src={img} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={cn(
                                "rounded px-2 py-0.5 font-headline text-[10px] font-black tracking-widest uppercase",
                                published
                                  ? "bg-primary text-on-primary"
                                  : "bg-secondary text-on-secondary",
                              )}
                            >
                              {published ? "Published" : "Draft"}
                            </span>
                            <span className="text-xs font-medium text-on-surface-variant">
                              {published
                                ? `Published ${formatStoryDate(s.updatedAt ?? s.createdAt)}`
                                : formatRelativeShort(s.updatedAt ?? s.createdAt)}
                            </span>
                          </div>
                          <Link
                            href={published ? `/story/${s.id}` : `/editor?id=${s.id}`}
                            className="font-headline text-2xl font-extrabold leading-tight text-on-surface hover:text-primary"
                          >
                            {s.title || "Untitled"}
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-4 font-login-body text-xs font-bold text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" aria-hidden />
                              {estimateReadMinutes(s.content ?? "")} min read
                            </span>
                            {published ? (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="size-3.5" aria-hidden />
                                {s.commentCount ?? 0} comment
                                {(s.commentCount ?? 0) === 1 ? "" : "s"}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          {mine ? (
                            <Link
                              href={`/editor?id=${s.id}`}
                              className="flex items-center gap-1 font-headline text-sm font-bold text-primary hover:underline"
                            >
                              <Pencil className="size-4" aria-hidden />
                              {published ? "Edit" : "Continue editing"}
                            </Link>
                          ) : (
                            <Link
                              href={`/story/${s.id}`}
                              className="flex items-center gap-1 font-headline text-sm font-bold text-primary hover:underline"
                            >
                              <BookOpen className="size-4" aria-hidden />
                              Read
                            </Link>
                          )}
                          {published ? (
                            <button
                              type="button"
                              onClick={() => void shareStory(s)}
                              className="flex items-center gap-1 font-headline text-sm font-bold text-on-surface-variant transition-colors hover:text-on-surface"
                            >
                              <Share2 className="size-4" aria-hidden />
                              Share
                            </button>
                          ) : null}
                          {mine ? (
                            <button
                              type="button"
                              onClick={() => setDeleteId(s.id)}
                              className="ml-auto text-on-surface-variant transition-colors hover:text-error"
                              aria-label="Delete story"
                            >
                              <Trash2 className="size-5" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="sticky top-24 rounded-xl bg-surface-container px-6 py-8">
              <h5 className="mb-6 flex items-center gap-2 font-headline text-xl font-black text-on-surface">
                Recent Interactions
                <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
              </h5>
              {activityLines.length === 0 ? (
                <p className="font-login-body text-sm leading-relaxed text-on-surface-variant">
                  Publish a story and gather comments or likes—they&apos;ll surface here as a quick
                  snapshot of engagement.
                </p>
              ) : (
                <div className="space-y-6">
                  {activityLines.map((line, i) => (
                    <div key={line.key} className="flex gap-4">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-full text-on-primary",
                          i % 3 === 0 && "bg-primary",
                          i % 3 === 1 && "bg-tertiary-container",
                          i % 3 === 2 && "bg-surface-container-high",
                        )}
                      >
                        {i % 3 === 0 ? (
                          <MessageSquare className="size-5" aria-hidden />
                        ) : i % 3 === 1 ? (
                          <Share2 className="size-5" aria-hidden />
                        ) : (
                          <Heart className="size-5 fill-current" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-login-body text-sm leading-snug text-on-surface">
                          {line.text}
                        </p>
                        <span className="mt-1 block font-headline text-[10px] font-bold tracking-wide text-on-surface-variant uppercase opacity-50">
                          {line.sub}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/"
                className="mt-10 flex w-full items-center justify-center rounded-full border-2 border-outline-variant/30 py-3 font-headline text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
              >
                View public feed
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete story?"
      >
        <p className="mb-[var(--spacing-lg)] text-[0.95rem] text-dark/75">
          This cannot be undone. Comments and likes will be removed with the story.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            isLoading={deleting}
            onClick={() => void confirmDelete()}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
