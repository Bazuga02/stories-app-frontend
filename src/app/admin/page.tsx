"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  adminDeleteComment,
  adminDeleteStoryFlexible,
  getAdminStats,
  listAllUsers,
} from "@/services/admin.service";
import { getApiErrorMessage } from "@/services/api";
import type { AdminStats, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<
    | { type: "story"; id: string }
    | { type: "comment"; id: string }
    | null
  >(null);
  const [busy, setBusy] = useState(false);

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

  const runDelete = async () => {
    if (!modal) return;
    setBusy(true);
    try {
      if (modal.type === "story") {
        await adminDeleteStoryFlexible(modal.id);
        toast.success("Story removed");
      } else {
        await adminDeleteComment(modal.id);
        toast.success("Comment removed");
      }
      setModal(null);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Action failed"));
    } finally {
      setBusy(false);
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
          Moderation tools
        </h2>
        <p className="mb-[var(--spacing-md)] text-[0.9rem] text-dark/70">
          Delete a story or comment by ID when your API exposes admin routes.
          Adjust IDs from your database or admin API responses.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const id = window.prompt("Story ID to delete?");
              if (id) setModal({ type: "story", id: id.trim() });
            }}
          >
            Delete story by ID
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const id = window.prompt("Comment ID to delete?");
              if (id) setModal({ type: "comment", id: id.trim() });
            }}
          >
            Delete comment by ID
          </Button>
        </div>
      </section>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type === "story" ? "Delete story?" : "Delete comment?"}
      >
        <p className="mb-[var(--spacing-lg)] text-[0.95rem] text-dark/75">
          ID: <code className="rounded bg-surface px-1 py-0.5">{modal?.id}</code>
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            isLoading={busy}
            onClick={() => void runDelete()}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </main>
  );
}
