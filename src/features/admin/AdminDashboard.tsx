"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  Eraser,
  Eye,
  House,
  MessageCircle,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminDeleteComment,
  adminDeleteStory,
  getAdminStats,
  listAdminComments,
  listAdminStories,
  listAllUsers,
} from "@/services/admin.service";
import { getApiErrorMessage } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { AdminCommentRow, AdminStats, AdminStoryRow, User } from "@/types";
import { PageLoader } from "@/components/ui/loader";
import { Footer } from "@/components/ui/footer";

const EMAIL_NOTIF_KEY = "stories-admin-email-notifications";

const storyThumbPool = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBe81Td9wkYRg9kitcaV_JgUvzrpIC4Bag_l9u22tlPKd8wrTaGfZmGSTEbFi5efBeCRtFcDr05vRF1AgNipajdbEH4R9AiSeJj-4l751OAneBkQtCod3r6Aio7ltYXsNnDabo8t6I95pXG3fDFPISjFyHOes_38rW4VZU-RQAhKvhyKe7VflpJd4AKyGQTM5UCeZIrXSb1hMBA3Hh9KOn3F9UNK7GByAoIpO3rv4ouRSYyNba5pZvYiCPl8ulxL25st3CM7bLj3bQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAGdVfhigvfFh4iyUM-dIQrrz85zvp-4SFpAJcGPryP35V18ZpemCtHqoxoL3IRwkjuOaCpK3EVNl63fbhYL8XJvWpq7zoqvuQFJP5JzG0Epxb_ZbogHtPYeLaCSfZSR01VEHxYGKX_5VKbKXyRo_jvGrBny9d-UkziwRjv7ipS3SxLlsDsZ8c0uqbMw5_K1uqI_qAS_4e3cEnsoZSwWfRlluK0m4QfjZhR8wIREl_26ZwPrD17Hcl1iD9Wld63t7a1KyadFIvVd0w",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDJZlZqbYTjLIbRBYui63KAbB6nCCr2yCBA_FvmlGbPVqIleh-Ds2QeAJvS9SVDfF-0HaVJYtuVhmgkd3L0H1S9POmnZkNAybhR2xf3rhtlx86UCxUubJEXxOQi8dZFJY1WldJGo_gNY9gcn1Bu1ZAocMQVKhEDZv_B4S43qSdE45FIYGVCgmbwaxeT8VbovKmpKpbtHoQtx2TLeKZHhB6tBLj_zijdN_t9yhoRBrHID6rUwsEASr2BcOLrC5eEmSaEIdeezAcbBV8",
];

const commentAvatarPool = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBF-JAMV49v7PMGn6AlkSpv-B80VSDJLxOTPTRxRJPE40CjPfsOQUUAx4bTKOZoWth5vzlfkZMemCv9KrnkkEn248i2MRH7eC0mkztZqD7VYYECKNSgcCbKTFHO5QQJclAYK50VJnd8k73K2ILhjIuf4_K-fKAKcJgwxMi5Su5VZX6ppk6sBIND28KWC4VSdOSmu-1hqNY_vSEIXWompQ12NSdHaf-YOQwFXkx5VWGyatBSsXGAOnvuhKrztmduemzNzkSZCF8qg0E",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD5u3EHXmkFwl7BzJoEmK0e8ScNukPau1X9tGBWQ_QyRM43lirZTa7Y8QzIK9l67338_u1dlVXxJ5g-YQO-r_4drNwPoymlk9Pz0qp0W3bvDYstOR_eliPnTfJ2TC3R1e90Uzi71SeBYFyV7vc_CWnNJW_KS7kUkPVZS8vKCY8dcLaEo6UW4QCM69OCtk3_3yOcXb7qb2tDFEmcl6XSVhK8TEosHiYPnkECIcn5A_jextd55j3yefHKbIiy34nf12gH4bUTb9scQsg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB6DAVHQV5bXlw_a3awi0jNsk8EhFLkcgWbiUdux7wI-bENwPx5_mRpdI9ZQONCZ2TCDL6Lf5eQIxsrZEimSlYoQGf_jALwE08_9yoUsKT7gRlOUEzwZAvk7AJ3hOC9bteIrQRzc8-1gNz9ignLsgiNvSeWGhDb7WYj_cpkfFCrdfnowh16rUg3qu9EddYjOPtTMhzprnDO9HzKkacB6S5NvoDlGLnLhrOmpVBa6a17v3lTCCYGLwbA7n15lmC323isggE1kS-p2tU",
];

const adminAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxhMO5IQMGrf3fISB8sJo7OSYH9J-lLjgO0Q-2J2bYhtWF5VO-FKRrLwnc2UlRbXqRqUR3Ppl3BVRU5d2UE5gRI7DWkVC-HKJ38PTmepVxIfqWiWZH9nEBgiDVraawZoj9FOE6e3ysI6v3M1PkEELPId05eMdKFiHUxyHC6AcfY8bXm0TLjtjJ7Wh4FBbJ18zvT5kKQM-w7c2mowaE1g2l9K7cOtuCQRu6SfpDy1FmHYiqIPa62pKq1rBUGc-delKdKfuWmjpmGEk";

type Tab = "stories" | "comments" | "settings";

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function looksSpam(content: string) {
  const c = content.toUpperCase();
  return c.includes("SPAM") || c.includes("CLICK HERE") || c.includes("FREE FOLLOWERS");
}

export function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>("stories");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [storyRows, setStoryRows] = useState<AdminStoryRow[]>([]);
  const [commentRows, setCommentRows] = useState<AdminCommentRow[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [emailNotif, setEmailNotif] = useState(false);

  useEffect(() => {
    try {
      setEmailNotif(localStorage.getItem(EMAIL_NOTIF_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const persistEmailNotif = (on: boolean) => {
    setEmailNotif(on);
    try {
      localStorage.setItem(EMAIL_NOTIF_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s, stories, comments] = await Promise.all([
        listAllUsers(),
        getAdminStats(),
        listAdminStories(),
        listAdminComments(),
      ]);
      setUsers(u);
      setStats(s);
      setStoryRows(stories);
      setCommentRows(comments);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Admin data failed to load"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshStats = useCallback(async () => {
    try {
      const s = await getAdminStats();
      setStats(s);
    } catch {
      /* best-effort */
    }
  }, []);

  const handleDeleteStory = async (id: string) => {
    if (!window.confirm("Delete this story permanently?")) return;
    setDeletingId(id);
    try {
      await adminDeleteStory(id);
      toast.success("Story removed");
      setStoryRows((prev) => prev.filter((r) => r.id !== id));
      void refreshStats();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not delete story"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    setDeletingId(id);
    try {
      await adminDeleteComment(id);
      toast.success("Comment removed");
      setCommentRows((prev) => prev.filter((r) => r.id !== id));
      void refreshStats();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not delete comment"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !user) {
    return <PageLoader />;
  }

  const recentComments = commentRows.slice(0, 4);
  const activityTotal =
    (stats?.totalPosts ?? 0) + (stats?.totalComments ?? 0);
  const displayActivity =
    activityTotal >= 1000
      ? `${(activityTotal / 1000).toFixed(1)}k`
      : String(activityTotal);

  const navItem = (t: Tab, label: string, icon: ReactNode) => {
    const active = tab === t;
    return (
      <button
        type="button"
        onClick={() => setTab(t)}
        className={
          active
            ? "mx-2 flex items-center gap-3 rounded-full bg-primary px-4 py-2 font-medium text-on-primary transition-transform active:translate-x-0.5"
            : "mx-2 flex items-center gap-3 rounded-full px-4 py-2 font-medium text-[#161616] transition-all hover:bg-primary/10 dark:text-[#e7e7d8]"
        }
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-0 flex-1">
      {/* Sidebar */}
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-low py-6 dark:bg-on-background dark:text-inverse-on-surface">
        <div className="mb-8 px-6">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          <p className="text-on-secondary-container text-xs opacity-70">Manage your narrative</p>
        </div>
        <nav className="flex flex-1 flex-col space-y-2">
          <Link
            href="/"
            className="mx-2 flex items-center gap-3 rounded-full px-4 py-2 font-medium text-[#161616] transition-all hover:bg-primary/10 dark:text-[#e7e7d8]"
          >
            <House className="size-5 shrink-0" strokeWidth={2} />
            <span>Home</span>
          </Link>
          {navItem(
            "stories",
            "Stories",
            <BookOpen className="size-5 shrink-0" strokeWidth={2} />,
          )}
          {navItem(
            "comments",
            "Comments",
            <MessageCircle className="size-5 shrink-0" strokeWidth={2} />,
          )}
          {navItem(
            "settings",
            "Settings",
            <Settings className="size-5 shrink-0" strokeWidth={2} />,
          )}
        </nav>
        <div className="mt-auto px-4">
          <Link
            href="/editor"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-on-primary shadow-lg transition-transform hover:scale-105"
          >
            <Plus className="size-5" strokeWidth={2.5} />
            Write New Story
          </Link>
          <div className="mt-6 flex items-center gap-3 border-t border-outline-variant/15 px-2 pt-6">
            <div className="size-10 shrink-0 overflow-hidden rounded-full bg-surface-dim">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={adminAvatar} alt="" className="size-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{user.name}</span>
              <span className="text-[10px] opacity-60">Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative min-h-0 flex-1 overflow-y-auto hide-scrollbar">
        <div className="pointer-events-none absolute top-0 right-0 -z-10 p-8 opacity-20 sm:p-12">
          <Star className="size-24 fill-tertiary-fixed-dim text-tertiary-fixed-dim sm:size-[120px]" strokeWidth={0} />
        </div>

        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          {tab === "stories" && (
            <>
              <header className="mb-10 sm:mb-12">
                <h2 className="font-headline mb-2 text-4xl font-black tracking-tighter text-on-background sm:text-5xl">
                  Editorial <span className="text-primary">Dashboard</span>
                </h2>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <p className="font-login-body max-w-lg text-base text-secondary sm:text-lg">
                    Welcome back, {user.name.split(" ")[0]}. You&apos;re moderating{" "}
                    <span className="font-bold text-on-background">{stats?.totalPosts ?? 0}</span>{" "}
                    stor
                    {stats?.totalPosts === 1 ? "y" : "ies"} and{" "}
                    <span className="font-bold text-on-background">
                      {stats?.totalComments ?? 0}
                    </span>{" "}
                    comments.
                  </p>
                  <div className="flex shrink-0 items-center gap-4 rounded-full bg-surface-container-low px-5 py-3">
                    <span className="text-sm font-bold text-on-surface">Email Notifications</span>
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={emailNotif}
                        onChange={(e) => persistEmailNotif(e.target.checked)}
                      />
                      <div className="relative h-6 w-11 rounded-full bg-surface-container-highest peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-12 gap-6">
                <section className="col-span-12 space-y-4 lg:col-span-8 lg:space-y-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-headline text-xl font-bold sm:text-2xl">Published Stories</h3>
                    <button
                      type="button"
                      className="text-sm font-bold text-primary hover:underline"
                      onClick={() => toast.message("Showing all loaded stories below.")}
                    >
                      View All
                    </button>
                  </div>
                  {storyRows.length === 0 ? (
                    <p className="rounded-editorial-xl bg-surface-container-low p-8 text-on-surface-variant">
                      No stories yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {storyRows.map((row, i) => (
                        <div
                          key={row.id}
                          className="group flex flex-col gap-4 rounded-editorial-xl bg-surface-container-low p-4 transition-colors hover:bg-surface-container-highest sm:flex-row sm:items-center sm:gap-6 sm:p-6"
                        >
                          <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={storyThumbPool[i % storyThumbPool.length]}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="rounded bg-tertiary-fixed px-2 py-0.5 text-[10px] font-black tracking-widest text-on-tertiary-fixed uppercase">
                                Story
                              </span>
                            </div>
                            <h4 className="mb-2 text-base font-bold leading-tight text-on-background sm:text-lg">
                              {row.title || "Untitled"}
                            </h4>
                            {row.preview ? (
                              <p className="mb-2 line-clamp-2 text-xs text-secondary">{row.preview}</p>
                            ) : null}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
                              <span className="flex items-center gap-1">
                                <Eye className="size-3.5" />
                                —
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="size-3.5" />
                                —
                              </span>
                              <span className="text-on-surface-variant">{row.authorName}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 sm:flex-col sm:justify-center">
                            <Link
                              href={`/editor?id=${row.id}`}
                              className="rounded-full bg-surface-container-lowest p-3 text-on-surface transition-colors hover:text-primary"
                              aria-label="Edit story"
                            >
                              <Pencil className="size-5" strokeWidth={2} />
                            </Link>
                            <button
                              type="button"
                              disabled={deletingId === row.id}
                              className="rounded-full bg-surface-container-lowest p-3 text-on-surface transition-colors hover:text-error disabled:opacity-50"
                              aria-label="Delete story"
                              onClick={() => void handleDeleteStory(row.id)}
                            >
                              <Trash2 className="size-5" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <aside className="col-span-12 space-y-8 lg:col-span-4">
                  <section className="relative overflow-hidden rounded-editorial-lg bg-surface-container-high p-6">
                    <div className="relative z-10">
                      <h3 className="font-headline mb-6 flex items-center justify-between text-xl font-bold">
                        Recent Comments
                        {recentComments.length > 0 ? (
                          <span className="rounded-full bg-primary px-2 py-1 text-[10px] text-on-primary">
                            New
                          </span>
                        ) : null}
                      </h3>
                      {recentComments.length === 0 ? (
                        <p className="text-sm text-on-surface-variant">No comments yet.</p>
                      ) : (
                        <div className="space-y-6">
                          {recentComments.map((c, idx) => (
                            <div key={c.id} className="group relative">
                              <div className="mb-2 flex gap-3">
                                <div className="size-8 shrink-0 overflow-hidden rounded-full bg-surface-dim">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={commentAvatarPool[idx % commentAvatarPool.length]}
                                    alt=""
                                    className="size-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-xs font-bold">{c.authorName}</p>
                                  <p className="text-[10px] opacity-60">On: {c.storyTitle}</p>
                                </div>
                              </div>
                              <p
                                className={
                                  looksSpam(c.content)
                                    ? "line-clamp-3 rounded-xl rounded-tl-none border border-error/20 bg-surface-container-lowest p-3 text-sm italic leading-relaxed text-on-surface-variant"
                                    : "line-clamp-3 rounded-xl rounded-tl-none bg-surface-container-lowest p-3 text-sm italic leading-relaxed text-on-surface-variant"
                                }
                              >
                                &ldquo;{c.content}&rdquo;
                              </p>
                              <div className="absolute -right-2 -bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  disabled={deletingId === c.id}
                                  className="rounded-full bg-error p-2 text-on-primary shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                                  aria-label="Remove comment"
                                  onClick={() => void handleDeleteComment(c.id)}
                                >
                                  <Eraser className="size-4" strokeWidth={2} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-10 -left-10 z-0 size-40 rounded-full bg-surface-container-lowest opacity-40 blur-3xl" />
                  </section>

                  <div className="group relative overflow-hidden rounded-editorial-xl bg-tertiary p-6 text-on-tertiary sm:p-8">
                    <div className="relative z-10">
                      <p className="mb-4 text-sm font-black tracking-widest uppercase opacity-80">
                        Engagement
                      </p>
                      <h4 className="font-headline mb-2 text-3xl font-black sm:text-4xl">
                        {displayActivity}
                      </h4>
                      <p className="mb-6 text-xs opacity-70">
                        Combined posts and comments on the platform. Keep publishing great work.
                      </p>
                      <button
                        type="button"
                        className="rounded-full bg-on-tertiary px-4 py-2 text-xs font-bold text-tertiary transition-transform hover:scale-105"
                        onClick={() => toast.message("Detailed analytics coming soon.")}
                      >
                        Detailed Report
                      </button>
                    </div>
                    <Sparkles
                      className="pointer-events-none absolute top-4 right-4 size-16 rotate-12 text-white/20 transition-transform duration-700 group-hover:rotate-45 sm:size-20"
                      strokeWidth={1.25}
                    />
                  </div>
                </aside>
              </div>
            </>
          )}

          {tab === "comments" && (
            <div>
              <header className="mb-8">
                <h2 className="font-headline text-4xl font-black tracking-tighter text-on-background sm:text-5xl">
                  Comment <span className="text-primary">moderation</span>
                </h2>
                <p className="mt-2 text-on-surface-variant">
                  Review and remove comments across all stories.
                </p>
              </header>
              {commentRows.length === 0 ? (
                <p className="text-on-surface-variant">No comments yet.</p>
              ) : (
                <ul className="space-y-4">
                  {commentRows.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-col gap-3 rounded-editorial-xl bg-surface-container-low p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6"
                    >
                      <div className="min-w-0">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{row.content}</p>
                        <p className="mt-2 text-xs font-bold text-on-surface-variant">
                          {row.authorName}
                        </p>
                        <p className="mt-1 text-[10px] text-secondary">Story: {row.storyTitle}</p>
                      </div>
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        className="shrink-0 self-start rounded-full bg-error/15 px-4 py-2 text-sm font-bold text-error hover:bg-error hover:text-on-primary disabled:opacity-50"
                        onClick={() => void handleDeleteComment(row.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div>
              <header className="mb-8">
                <h2 className="font-headline text-4xl font-black tracking-tighter text-on-background sm:text-5xl">
                  Platform <span className="text-primary">settings</span>
                </h2>
                <p className="mt-2 text-on-surface-variant">Users registered on Stories.</p>
              </header>
              <div className="space-y-3 rounded-editorial-xl bg-surface-container-low p-4 sm:p-6">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col gap-1 border-b border-outline-variant/20 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold">
                        {initials(u.name)}
                      </div>
                      <div>
                        <p className="font-bold text-on-background">{u.name}</p>
                        <p className="text-sm text-secondary">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black tracking-widest text-primary uppercase">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer className="mt-12" />
      </main>
    </div>
  );
}
