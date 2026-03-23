"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PenLine } from "lucide-react";
import {
  createStory,
  getStory,
  publishStory,
  saveDraftFlexible,
  updateStory,
} from "@/services/stories.service";
import { getApiErrorMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { cn } from "@/lib/cn";

const schema = z.object({
  title: z.string().max(200),
  content: z.string().max(100_000),
});

type Form = z.infer<typeof schema>;

function normalizeInternalHref(href: string): string {
  if (href.startsWith("/")) {
    const hash = href.indexOf("#");
    return hash >= 0 ? href.slice(0, hash) : href;
  }
  try {
    const u = new URL(href);
    return u.pathname + u.search;
  } catch {
    return href;
  }
}

function isSameDocumentLocation(href: string): boolean {
  if (!href.startsWith("/") && !href.startsWith("http")) return false;
  const path = normalizeInternalHref(href);
  const here = window.location.pathname + window.location.search;
  return path === here;
}

function isInternalNavHref(href: string): boolean {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (href.startsWith("/")) return true;
  try {
    return new URL(href).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function EditorPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingId = searchParams.get("id");
  const [storyId, setStoryId] = useState<string | null>(existingId);
  const [initializing, setInitializing] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<{ title: string; content: string } | null>(
    null,
  );
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    watch,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "" },
  });

  const { ref: registerContentRef, ...contentRegisterRest } = register("content");

  const mergeContentRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      contentRef.current = el;
      registerContentRef(el);
    },
    [registerContentRef],
  );

  const setContentValue = useCallback(
    (v: string) => setValue("content", v, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );

  const title = watch("title");
  const content = watch("content");

  const isDirty = useMemo(() => {
    if (savedSnapshot === null) return false;
    return (title ?? "") !== savedSnapshot.title || (content ?? "") !== savedSnapshot.content;
  }, [title, content, savedSnapshot]);

  const bootstrap = useCallback(async () => {
    setInitializing(true);
    setSavedSnapshot(null);
    try {
      if (existingId) {
        const s = await getStory(existingId);
        reset({ title: s.title ?? "", content: s.content ?? "" });
        setSavedSnapshot({
          title: s.title ?? "",
          content: s.content ?? "",
        });
        setStoryId(s.id);
      } else {
        setStoryId(null);
        reset({ title: "", content: "" });
        setSavedSnapshot({ title: "", content: "" });
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not open editor"));
    } finally {
      setInitializing(false);
    }
  }, [existingId, reset]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onClickCapture = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("a[href]");
      if (!el || !(el instanceof HTMLAnchorElement)) return;
      const href = el.getAttribute("href");
      if (!href || !isInternalNavHref(href)) return;
      if (isSameDocumentLocation(href)) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(el.href);
      setLeaveModalOpen(true);
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [isDirty]);

  const persistDraft = async (data: Form): Promise<boolean> => {
    try {
      if (!storyId) {
        const created = await createStory({
          title: data.title.trim() || "Untitled story",
          content: data.content,
          status: "DRAFT",
        });
        setStoryId(created.id);
        const snap = {
          title: created.title ?? (data.title.trim() || "Untitled story"),
          content: created.content ?? data.content,
        };
        setSavedSnapshot(snap);
        router.replace(`/editor?id=${created.id}`);
      } else {
        await saveDraftFlexible(storyId, {
          title: data.title,
          content: data.content,
        });
        setSavedSnapshot({ title: data.title, content: data.content });
      }
      toast.success("Draft saved");
      return true;
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Save failed"));
      return false;
    }
  };

  const saveDraftNow = handleSubmit(async (data) => {
    setSaving(true);
    try {
      await persistDraft(data);
    } finally {
      setSaving(false);
    }
  });

  const onPublish = handleSubmit(async (data) => {
    setPublishing(true);
    try {
      let id = storyId;
      if (!id) {
        const created = await createStory({
          title: data.title.trim() || "Untitled story",
          content: data.content,
          status: "DRAFT",
        });
        id = created.id;
        setStoryId(id);
        setSavedSnapshot({
          title: created.title ?? (data.title.trim() || "Untitled story"),
          content: created.content ?? data.content,
        });
        router.replace(`/editor?id=${id}`);
      }
      try {
        await updateStory(id, {
          title: data.title,
          content: data.content,
          status: "DRAFT",
        });
        await publishStory(id);
        toast.success("Published!");
        window.location.assign(`/story/${id}`);
      } catch (e) {
        try {
          await updateStory(id, {
            title: data.title,
            content: data.content,
            status: "PUBLISHED",
          });
          toast.success("Published!");
          window.location.assign(`/story/${id}`);
        } catch (e2) {
          toast.error(getApiErrorMessage(e2 ?? e, "Publish failed"));
        }
      }
    } finally {
      setPublishing(false);
    }
  });

  const navigateAfterLeave = useCallback(
    (href: string) => {
      setLeaveModalOpen(false);
      setPendingHref(null);
      const path = normalizeInternalHref(href);
      if (path.startsWith("/")) {
        router.push(path);
      } else {
        window.location.assign(href);
      }
    },
    [router],
  );

  const handleLeaveCancel = () => {
    setLeaveModalOpen(false);
    setPendingHref(null);
  };

  const handleLeaveDiscard = () => {
    if (pendingHref) navigateAfterLeave(pendingHref);
    else handleLeaveCancel();
  };

  const handleLeaveSave = async () => {
    const target = pendingHref;
    if (!target) return;
    const data = getValues();
    setSaving(true);
    try {
      const ok = await persistDraft(data);
      if (ok) navigateAfterLeave(target);
    } finally {
      setSaving(false);
    }
  };

  const contentLen = (content ?? "").length;

  if (initializing) {
    return <PageLoader />;
  }

  return (
    <>
      <main className="container-design flex flex-1 flex-col py-[var(--spacing-xl)] pb-[var(--spacing-2xl)]">
        <header className="mb-[var(--spacing-lg)] flex flex-col gap-[var(--spacing-md)] md:mb-[var(--spacing-xl)] md:flex-row md:items-end md:justify-between">
          <div className="flex gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-accent text-white shadow-[var(--shadow-card)]"
              aria-hidden
            >
              <PenLine className="size-6" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-accent">
                Write
              </p>
              <h1 className="text-section-heading mt-0.5 text-[clamp(1.65rem,4vw,2.35rem)] leading-tight">
                Your story
              </h1>
              <p className="mt-2 max-w-md text-[0.92rem] leading-snug text-dark/65">
                Use the toolbar for <strong className="font-semibold text-dark/80">bold</strong>,{" "}
                <em className="italic text-dark/80">italic</em>, headings, lists, quotes, and emoji
                — readers see it formatted on the story page.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button
              type="button"
              variant="ghost"
              isLoading={saving}
              onClick={() => void saveDraftNow()}
            >
              Save draft
            </Button>
            <Button
              type="button"
              variant="accent"
              isLoading={publishing}
              onClick={() => void onPublish()}
            >
              Publish
            </Button>
          </div>
        </header>

        <Card className="mx-auto w-full max-w-3xl overflow-hidden border border-dark/10 bg-white shadow-[var(--shadow-card-hover)]">
          <form className="flex flex-col gap-0">
            <div className="border-b border-dark/10 bg-[color-mix(in_srgb,var(--color-surface)_75%,white)] px-[var(--spacing-lg)] pb-[var(--spacing-md)] pt-[var(--spacing-lg)]">
              <Input
                label="Title"
                placeholder="Give it a name readers will remember"
                error={errors.title?.message}
                className="border-dark/12 bg-white font-display text-[1.15rem] font-bold tracking-wide placeholder:font-body placeholder:font-normal placeholder:tracking-normal"
                {...register("title")}
              />
            </div>

            <div className="px-[var(--spacing-lg)] pb-[var(--spacing-lg)] pt-[var(--spacing-md)]">
              <div className="mb-[var(--spacing-xs)] flex flex-wrap items-end justify-between gap-2">
                <label htmlFor="content" className="text-label">
                  Story
                </label>
                <span className="text-[0.7rem] font-medium tabular-nums text-dark/45">
                  {contentLen.toLocaleString()} characters
                </span>
              </div>

              <div
                className={cn(
                  "overflow-hidden rounded-[var(--radius-md)] border-[1.5px] border-dark/12 bg-white transition-[border-color,box-shadow] duration-[var(--motion-fast)]",
                  errors.content
                    ? "border-accent shadow-[0_0_0_3px_rgba(244,54,81,0.12)]"
                    : "focus-within:border-dark focus-within:shadow-[0_0_0_3px_rgba(22,22,22,0.06)]",
                )}
              >
                <EditorToolbar textareaRef={contentRef} setContent={setContentValue} />
                <textarea
                  id="content"
                  ref={mergeContentRef}
                  rows={20}
                  placeholder="Start typing… Select text and use bold, italic, or drop in an emoji from the toolbar."
                  className="min-h-[min(58vh,560px)] w-full resize-y border-0 bg-transparent px-4 py-4 text-[1.05rem] leading-[1.75] text-dark placeholder:text-dark/38 outline-none"
                  {...contentRegisterRest}
                />
              </div>
              {errors.content?.message ? (
                <p className="mt-[var(--spacing-xs)] text-[0.75rem] font-medium text-accent" role="alert">
                  {errors.content.message}
                </p>
              ) : (
                <p className="mt-2 text-[0.75rem] text-dark/50">
                  Tip: <code className="rounded bg-dark/[0.06] px-1 py-0.5 font-mono text-[0.7rem]">**bold**</code>{" "}
                  · <code className="rounded bg-dark/[0.06] px-1 py-0.5 font-mono text-[0.7rem]">*italic*</code> ·{" "}
                  <code className="rounded bg-dark/[0.06] px-1 py-0.5 font-mono text-[0.7rem]">## Heading</code>
                </p>
              )}
            </div>
          </form>
        </Card>
      </main>

      <Modal
        open={leaveModalOpen}
        onClose={handleLeaveCancel}
        title="Save draft?"
      >
        <p className="mb-[var(--spacing-lg)] text-[0.95rem] leading-relaxed text-dark/80">
          You have unsaved changes. Save your draft before leaving, or leave without saving.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button type="button" variant="ghost" onClick={handleLeaveCancel}>
            Cancel
          </Button>
          <Button type="button" variant="ghost" onClick={handleLeaveDiscard}>
            Leave without saving
          </Button>
          <Button
            type="button"
            variant="accent"
            isLoading={saving}
            onClick={() => void handleLeaveSave()}
          >
            Save draft
          </Button>
        </div>
      </Modal>
    </>
  );
}
