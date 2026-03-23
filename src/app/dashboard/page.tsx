"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  deleteStory,
  listMyStories,
} from "@/services/stories.service";
import { getApiErrorMessage } from "@/services/api";
import type { Story } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/loader";

type Tab = "PUBLISHED" | "DRAFT";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("PUBLISHED");
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMyStories(tab);
      setItems(data);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not load your stories"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

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

  return (
    <div>
      <h1 className="text-section-heading mb-[var(--spacing-lg)] text-[1.75rem]">
        Your stories
      </h1>
      <div className="mb-[var(--spacing-lg)] flex gap-2">
        {(["PUBLISHED", "DRAFT"] as const).map((t) => (
          <Button
            key={t}
            type="button"
            variant={tab === t ? "primary" : "ghost"}
            className="!capitalize"
            onClick={() => setTab(t)}
          >
            {t === "PUBLISHED" ? "Published" : "Drafts"}
          </Button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <Card className="p-[var(--spacing-xl)] text-dark/70">
          No {tab === "DRAFT" ? "drafts" : "published stories"} yet.{" "}
          <Link href="/editor" className="font-semibold text-accent underline">
            Open editor
          </Link>
        </Card>
      ) : (
        <ul className="flex flex-col gap-[var(--spacing-md)]">
          {items.map((s) => (
            <li key={s.id}>
              <Card className="flex flex-col gap-3 p-[var(--spacing-md)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link
                    href={`/story/${s.id}`}
                    className="text-card-title no-underline hover:text-accent"
                  >
                    {s.title || "Untitled"}
                  </Link>
                  <p className="mt-1 text-[0.875rem] text-dark/55">
                    {s.status === "DRAFT" ? "Draft" : "Published"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/editor?id=${s.id}`}>
                    <Button type="button" variant="ghost" className="!py-2">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="accent"
                    className="!py-2"
                    onClick={() => setDeleteId(s.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

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
