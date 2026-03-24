"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  adminDeleteComment,
  adminDeleteStory,
  getAdminStats,
  listAdminComments,
  listAdminStories,
  listAllUsers,
} from "@/services/admin.service";
import { getApiErrorMessage } from "@/services/api";
import type { AdminCommentRow, AdminStats, AdminStoryRow, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader, PageLoader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [moderation, setModeration] = useState<"stories" | "comments" | null>(
    null,
  );
  const [storyRows, setStoryRows] = useState<AdminStoryRow[]>([]);
  const [commentRows, setCommentRows] = useState<AdminCommentRow[]>([]);
  const [modLoading, setModLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([listAllUsers(), getAdminStats()]);
      setUsers(u);
      setStats(s);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Admin data failed to load"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!moderation) return;
    let cancelled = false;
    setModLoading(true);
    void (async () => {
      try {
        if (moderation === "stories") {
          const rows = await listAdminStories();
          if (!cancelled) setStoryRows(rows);
        } else {
          const rows = await listAdminComments();
          if (!cancelled) setCommentRows(rows);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(
            getApiErrorMessage(
              e,
              moderation === "stories"
                ? "Could not load stories"
                : "Could not load comments",
            ),
          );
          setModeration(null);
        }
      } finally {
        if (!cancelled) setModLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moderation]);

  const refreshStatsOnly = useCallback(async () => {
    try {
      const s = await getAdminStats();
      setStats(s);
    } catch {
      /* stats refresh is best-effort */
    }
  }, []);

  const handleDeleteStory = async (id: string) => {
    if (!window.confirm("Delete this story permanently?")) return;
    setDeletingId(id);
    try {
      await adminDeleteStory(id);
      toast.success("Story removed");
      setStoryRows((prev) => prev.filter((r) => r.id !== id));
      void refreshStatsOnly();
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
      void refreshStatsOnly();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not delete comment"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <main className="container-design flex flex-1 flex-col py-[var(--spacing-xl)]">
      <h1 className="text-section-heading mb-[var(--spacing-xl)] text-[1.75rem]">
        Admin
      </h1>

      {stats ? (
        <div className="mb-[var(--spacing-xl)] grid gap-[var(--spacing-md)] sm:grid-cols-3">
          <Card className="p-[var(--spacing-lg)]">
            <p className="text-label text-dark/50">Users</p>
            <p className="mt-1 text-3xl font-bold text-dark">
              {stats.totalUsers}
            </p>
          </Card>
          <Card className="p-[var(--spacing-lg)]">
            <p className="text-label text-dark/50">Posts</p>
            <p className="mt-1 text-3xl font-bold text-dark">
              {stats.totalPosts}
            </p>
          </Card>
          <Card className="p-[var(--spacing-lg)]">
            <p className="text-label text-dark/50">Comments</p>
            <p className="mt-1 text-3xl font-bold text-dark">
              {stats.totalComments ?? "—"}
            </p>
          </Card>
        </div>
      ) : null}

      <section>
        <h2 className="text-section-heading mb-[var(--spacing-md)] text-[1.15rem]">
          Users
        </h2>
        <Card className="overflow-hidden">
          <ul className="divide-y divide-dark/10">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex flex-col gap-1 px-[var(--spacing-lg)] py-[var(--spacing-md)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-dark">{u.name}</p>
                  <p className="text-[0.875rem] text-dark/60">{u.email}</p>
                </div>
                <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-accent">
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-[var(--spacing-2xl)] rounded-[var(--radius-lg)] border border-dashed border-dark/20 p-[var(--spacing-lg)]">
        <h2 className="text-section-heading mb-2 text-[1.15rem]">
          Moderation
        </h2>
        <p className="mb-[var(--spacing-md)] text-[0.9rem] text-dark/70">
          Open a list of stories or comments, then remove items with the trash
          control. You’ll be asked to confirm each deletion.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setModeration("stories")}
          >
            Manage stories
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setModeration("comments")}
          >
            Manage comments
          </Button>
        </div>
      </section>

      <Modal
        open={moderation === "stories"}
        onClose={() => setModeration(null)}
        title="Stories"
        className="max-w-2xl"
      >
        <p className="mb-3 text-[0.85rem] text-dark/60">
          Title, short preview, author. Delete removes the story from the
          platform.
        </p>
        <div className="max-h-[min(52vh,420px)] overflow-y-auto rounded-[var(--radius-md)] border border-dark/10">
          {modLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="size-10" />
            </div>
          ) : storyRows.length === 0 ? (
            <p className="p-6 text-center text-[0.9rem] text-dark/50">
              No stories yet.
            </p>
          ) : (
            <ul className="divide-y divide-dark/10">
              {storyRows.map((row) => (
                <li
                  key={row.id}
                  className="flex gap-3 px-3 py-3 sm:items-start sm:gap-4 sm:px-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-dark">{row.title}</p>
                    {row.preview ? (
                      <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-dark/55">
                        {row.preview}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-[0.75rem] font-medium text-dark/45">
                      {row.authorName}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!size-10 shrink-0 !min-h-10 !p-0 text-dark/50 hover:bg-accent/10 hover:text-accent"
                    disabled={deletingId === row.id}
                    aria-label={`Delete story: ${row.title}`}
                    onClick={() => void handleDeleteStory(row.id)}
                  >
                    <Trash2 className="size-4" strokeWidth={2.25} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <Modal
        open={moderation === "comments"}
        onClose={() => setModeration(null)}
        title="Comments"
        className="max-w-2xl"
      >
        <p className="mb-3 text-[0.85rem] text-dark/60">
          Full comment, author, and the story it belongs to.
        </p>
        <div className="max-h-[min(52vh,420px)] overflow-y-auto rounded-[var(--radius-md)] border border-dark/10">
          {modLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="size-10" />
            </div>
          ) : commentRows.length === 0 ? (
            <p className="p-6 text-center text-[0.9rem] text-dark/50">
              No comments yet.
            </p>
          ) : (
            <ul className="divide-y divide-dark/10">
              {commentRows.map((row) => (
                <li
                  key={row.id}
                  className="flex gap-3 px-3 py-3 sm:items-start sm:gap-4 sm:px-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap text-[0.875rem] leading-relaxed text-dark/85">
                      {row.content}
                    </p>
                    <p className="mt-2 text-[0.8125rem] font-semibold text-dark/60">
                      {row.authorName}
                    </p>
                    <p className="mt-0.5 text-[0.75rem] text-dark/45">
                      <span className="font-medium text-dark/50">Story:</span>{" "}
                      {row.storyTitle}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!size-10 shrink-0 !min-h-10 !p-0 text-dark/50 hover:bg-accent/10 hover:text-accent"
                    disabled={deletingId === row.id}
                    aria-label="Delete comment"
                    onClick={() => void handleDeleteComment(row.id)}
                  >
                    <Trash2 className="size-4" strokeWidth={2.25} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </main>
  );
}
