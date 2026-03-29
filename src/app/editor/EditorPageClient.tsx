"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PenLine, Star, Tag, X } from "lucide-react";
import { toast } from "sonner";
import {
  createStory,
  getStory,
  publishStory,
  saveDraftFlexible,
  updateStory,
} from "@/services/stories.service";
import { getApiErrorMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import {
  RichMarkdownEditor,
  type RichMarkdownEditorHandle,
} from "@/components/editor/RichMarkdownEditor";
import { cn } from "@/lib/cn";
import { Footer } from "@/components/ui/footer";

const schema = z.object({
  title: z.string().max(200),
  content: z.string().max(100_000),
});

type Form = z.infer<typeof schema>;

const TIP_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDRwf2vuWjVGMnzgAbLEfIcRJ0vEVbWjPVTBKsCmL3y73P4EJVMwE3c_6gLREGhiFCxAscDx-1RSwMJxbQ9YNGzl58aK9aneq4FlgZDguXte1mtl3RRw4PCw7XO19g_SEMlg9SANg9qu7qqb09ZcgBDpvT7NPYOR9QG44z6-9SqHYHohSvk1bGqpvtW5tesDUbTF_r50x02vIVof4En5--Wm1m-P_KO_WAvZn7n4CUrVfS2DoJJtGKDFy5H0v_nG6QC3m2L4--H0zU";

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
  const richEditorHandle = useRef<RichMarkdownEditorHandle>(null);
  const richRootRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState<string[]>(["Minimalism", "Lifestyle"]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    control,
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

  const { ref: titleRef, ...titleRegister } = register("title");

  const addTag = () => {
    const raw = tagInput.trim().replace(/^#+/, "");
    if (!raw) return;
    if (tags.includes(raw)) {
      setTagInput("");
      return;
    }
    setTags((t) => [...t, raw]);
    setTagInput("");
  };

  if (initializing) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 shrink-0 border-b border-outline-variant/10 bg-editorial-surface">
          <nav className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4">
            <div className="flex flex-wrap items-center gap-4 md:gap-8">
              <Link
                href="/"
                className="font-headline text-2xl font-black tracking-tighter text-primary sm:text-3xl"
              >
                Stories
              </Link>
              <Link
                href="/"
                className="font-headline text-base font-bold text-primary transition-colors hover:text-primary/85 lg:text-lg"
              >
                Explore
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold tracking-wider text-on-surface-variant">
                Draft
              </span>
              <button
                type="button"
                disabled={saving}
                className="font-headline text-base font-bold text-[#161616] opacity-80 transition-transform hover:text-primary active:scale-95 disabled:opacity-50 dark:text-[#e7e7d8] lg:text-lg"
                onClick={() => void saveDraftNow()}
              >
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <button
                type="button"
                disabled={publishing}
                className="scale-95 rounded-full bg-primary px-5 py-2 font-headline text-base font-bold text-on-primary transition-all hover:bg-primary-container active:scale-90 disabled:opacity-60 lg:px-6 lg:text-lg"
                onClick={() => void onPublish()}
              >
                {publishing ? "Publishing…" : "Publish"}
              </button>
            </div>
          </nav>
        </header>

        <main className="hide-scrollbar relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="pointer-events-none fixed top-20 right-[5%] -z-10 opacity-20">
            <PenLine className="size-24 text-tertiary-fixed-dim sm:size-[120px]" strokeWidth={0.75} />
          </div>

          <div className="fixed bottom-32 left-6 z-10 hidden opacity-40 xl:block">
            <div className="editor-cloud-shape flex size-24 items-center justify-center bg-tertiary-fixed-dim">
              <Star className="size-10 fill-primary text-primary" strokeWidth={0} />
            </div>
          </div>

          <div className="fixed right-8 top-40 z-10 hidden w-64 rotate-3 rounded-editorial-xl bg-surface-container-low p-4 shadow-lg transition-transform duration-500 hover:rotate-0 lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TIP_IMG}
              alt="Fountain pen on paper"
              className="mb-4 h-40 w-full rounded-lg object-cover"
            />
            <p className="font-headline mb-1 text-xs font-bold text-primary">EDITOR&apos;S TIP</p>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Let the white space breathe. Great stories need room to grow between the lines.
            </p>
          </div>

          <div className="mx-auto max-w-4xl px-5 pt-8 pb-16 sm:px-6 sm:pt-12 sm:pb-24">
            <div className="mb-10 sm:mb-12">
              <textarea
                ref={titleRef}
                rows={2}
                placeholder="The story starts here..."
                className="w-full resize-none border-none bg-transparent p-0 font-headline text-4xl font-black leading-tight tracking-tight text-on-surface placeholder:opacity-20 focus:ring-0 focus:outline-none sm:text-5xl md:text-6xl lg:text-7xl"
                {...titleRegister}
              />
              {errors.title?.message ? (
                <p className="mt-2 text-sm text-error" role="alert">
                  {errors.title.message}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
                  <Tag className="size-4 shrink-0 text-primary" strokeWidth={2} />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="w-28 border-none bg-transparent p-0 text-sm font-medium text-on-surface placeholder:text-on-surface-variant focus:ring-0 focus:outline-none sm:w-32"
                    placeholder="Add tags..."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
                    >
                      #{t}
                      <button
                        type="button"
                        className="rounded-full p-0.5 hover:bg-primary/20"
                        aria-label={`Remove ${t}`}
                        onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                      >
                        <X className="size-3" strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <article className="serif-editor min-h-[min(512px,50vh)]">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichMarkdownEditor
                    ref={richEditorHandle}
                    editorRootRef={richRootRef}
                    id="content"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Start typing your story… Use the toolbar for bold, lists, and more. Your words show formatted as you write."
                    aria-invalid={!!errors.content}
                    className={cn(
                      errors.content &&
                        "ring-2 ring-error/40 ring-offset-2 ring-offset-editorial-surface",
                    )}
                  />
                )}
              />
              <div className="mt-3 flex justify-between gap-4 text-xs text-on-surface-variant">
                <span>
                  {errors.content?.message ? (
                    <span className="text-error" role="alert">
                      {errors.content.message}
                    </span>
                  ) : (
                    <span>
                      <strong className="font-semibold text-on-surface/80">Tip:</strong> use the
                      floating bar for bold, italic, and lists. Published stories still use markdown
                      under the hood; images:{" "}
                      <code className="rounded bg-surface-container-high px-1 py-0.5 font-mono text-[10px]">
                        ![alt](url)
                      </code>
                    </span>
                  )}
                </span>
                <span className="tabular-nums opacity-70">{contentLen.toLocaleString()} chars</span>
              </div>
            </article>
          </div>

          <Footer className="mt-16 shrink-0 pb-16 sm:pb-20" />
        </main>

        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4 sm:bottom-8">
          <div className="glass-editor-toolbar pointer-events-auto flex items-center gap-0.5 rounded-full border border-outline-variant/20 p-2 shadow-xl md:gap-1">
            <EditorToolbar
              variant="floating"
              richRootRef={richRootRef}
              onAfterRichCommand={() => richEditorHandle.current?.flush()}
              setContent={setContentValue}
            />
          </div>
        </div>
      </div>

      <Modal open={leaveModalOpen} onClose={handleLeaveCancel} title="Save draft?">
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
