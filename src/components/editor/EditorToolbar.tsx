"use client";

import dynamic from "next/dynamic";
import { useState, type RefObject } from "react";
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  List,
  Quote,
  Settings,
  Smile,
} from "lucide-react";
import { Theme, EmojiStyle, type EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { replaceSelection, wrapSelection } from "./markdownSelection";

const EmojiPickerLazy = dynamic(
  () => import("emoji-picker-react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(50vh,380px)] w-[min(100vw-2rem,320px)] items-center justify-center text-sm text-on-surface-variant"
        role="status"
      >
        Loading emoji picker…
      </div>
    ),
  },
);

type EditorToolbarProps = {
  setContent: (value: string) => void;
  /** Plain markdown editor (optional if using rich editor only). */
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  /** WYSIWYG contenteditable root — bold/italic use real formatting here. */
  richRootRef?: RefObject<HTMLElement | null>;
  /** After execCommand on the rich editor, sync HTML → markdown. */
  onAfterRichCommand?: () => void;
  /** Opens cover image picker (story banner, not inline markdown). */
  onOpenCoverPicker?: () => void;
  className?: string;
  variant?: "dock" | "floating";
};

export function EditorToolbar({
  textareaRef,
  richRootRef,
  onAfterRichCommand,
  onOpenCoverPicker,
  setContent,
  className,
  variant = "dock",
}: EditorToolbarProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);

  const apply = (fn: () => void) => {
    fn();
    setEmojiOpen(false);
  };

  const runOnRich = (fn: () => void) => {
    const el = richRootRef?.current;
    if (!el?.isContentEditable) return false;
    el.focus();
    fn();
    onAfterRichCommand?.();
    return true;
  };

  const withSelection = (
    edit: (value: string, a: number, b: number) => ReturnType<typeof wrapSelection>,
  ) => {
    const el = textareaRef?.current;
    if (!el) return;
    const { value, selectionStart, selectionEnd } = el;
    const r = edit(value, selectionStart, selectionEnd);
    setContent(r.nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(r.selectionStart, r.selectionEnd);
    });
  };

  const toolBtnDock =
    "flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-dark/70 outline-none transition-[background,color] duration-[var(--motion-fast)] hover:bg-dark/8 hover:text-dark focus-visible:ring-2 focus-visible:ring-dark/15";

  const toolBtnFloat =
    "group flex items-center justify-center rounded-full p-3 text-on-surface-variant outline-none transition-all hover:bg-surface-container-high hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30";

  const bold = () =>
    apply(() => {
      if (runOnRich(() => void document.execCommand("bold"))) return;
      withSelection((v, a, b) => wrapSelection(v, a, b, "**", "**", "bold"));
    });

  const italic = () =>
    apply(() => {
      if (runOnRich(() => void document.execCommand("italic"))) return;
      withSelection((v, a, b) => wrapSelection(v, a, b, "*", "*", "italic"));
    });

  const bullet = () =>
    apply(() => {
      if (runOnRich(() => void document.execCommand("insertUnorderedList"))) return;
      withSelection((v, a, b) => replaceSelection(v, a, b, "\n- list item\n"));
    });

  const heading = () =>
    apply(() => {
      if (
        runOnRich(() => {
          document.execCommand("formatBlock", false, "h2");
        })
      )
        return;
      withSelection((v, a, b) => {
        const sel = v.slice(a, b);
        const line = sel.length ? sel : "Heading";
        return replaceSelection(v, a, b, `\n## ${line}\n`);
      });
    });

  const blockQuote = () =>
    apply(() => {
      if (
        runOnRich(() => {
          document.execCommand("formatBlock", false, "blockquote");
        })
      )
        return;
      withSelection((v, a, b) => replaceSelection(v, a, b, "\n> Quote\n"));
    });

  const insertEmoji = (ch: string) =>
    apply(() => {
      if (runOnRich(() => void document.execCommand("insertText", false, ch))) return;
      withSelection((v, a, b) => replaceSelection(v, a, b, ch));
    });

  const onEmojiPicked = (data: EmojiClickData) => insertEmoji(data.emoji);

  const emojiBlock = (
    btnClass: string,
    pickerClass: string,
    backdropZ: string,
  ) => (
    <div className="relative">
      <button
        type="button"
        className={cn(btnClass, emojiOpen && "bg-surface-container-high text-primary")}
        aria-label="Insert emoji"
        aria-expanded={emojiOpen}
        title="Emoji"
        onClick={() => setEmojiOpen((o) => !o)}
      >
        <Smile className="size-5" strokeWidth={2} />
      </button>
      {emojiOpen ? (
        <>
          <button
            type="button"
            className={cn("fixed inset-0 cursor-default", backdropZ)}
            aria-label="Close emoji picker"
            onClick={() => setEmojiOpen(false)}
          />
          <div
            className={cn(
              "absolute z-80 overflow-hidden rounded-editorial-lg border border-outline-variant/30 shadow-xl",
              pickerClass,
            )}
            role="dialog"
            aria-label="Emoji picker"
          >
            <EmojiPickerLazy
              width={300}
              height={380}
              theme={Theme.AUTO}
              emojiStyle={EmojiStyle.NATIVE}
              lazyLoadEmojis
              searchPlaceholder="Search emojis…"
              previewConfig={{ showPreview: false }}
              onEmojiClick={onEmojiPicked}
            />
          </div>
        </>
      ) : null}
    </div>
  );

  if (variant === "floating") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-0.5 md:gap-1", className)}>
        <div className="flex items-center px-1 md:px-2">
          <button type="button" className={toolBtnFloat} title="Bold" onClick={bold}>
            <Bold className="size-5" strokeWidth={2} />
          </button>
          <button type="button" className={toolBtnFloat} title="Italic" onClick={italic}>
            <Italic className="size-5" strokeWidth={2} />
          </button>
          <button type="button" className={toolBtnFloat} title="List" onClick={bullet}>
            <List className="size-5" strokeWidth={2} />
          </button>
        </div>
        <div className="mx-1 h-8 w-px bg-outline-variant/30" aria-hidden />
        <div className="flex items-center px-0.5 md:px-1">
          <button
            type="button"
            className={cn(toolBtnFloat, "gap-2 px-3 md:px-4")}
            title={onOpenCoverPicker ? "Choose cover image" : "Add image"}
            onClick={() =>
              onOpenCoverPicker
                ? onOpenCoverPicker()
                : toast.message("Use markdown: ![description](https://image-url) in your story.")
            }
          >
            <ImagePlus className="size-5 text-primary" strokeWidth={2} />
            <span className="hidden font-bold text-on-surface md:inline text-sm">
              {onOpenCoverPicker ? "Cover" : "Add Image"}
            </span>
          </button>
          {emojiBlock(
            toolBtnFloat,
            "bottom-full left-1/2 mb-2 h-[380px] w-[300px] max-w-[min(100vw-2rem,300px)] -translate-x-1/2",
            "z-[70]",
          )}
        </div>
        <div className="mx-1 h-8 w-px bg-outline-variant/30" aria-hidden />
        <div className="flex items-center px-0.5 md:px-1">
          <button
            type="button"
            className={toolBtnFloat}
            title="Settings"
            onClick={() => toast.message("Editor settings coming soon.")}
          >
            <Settings className="size-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center gap-0.5 border-b border-dark/10 bg-[color-mix(in_srgb,var(--color-surface)_88%,var(--color-white))] px-1.5 py-1.5",
        className,
      )}
    >
      <span className="mr-1 hidden px-1 text-[0.65rem] font-semibold uppercase tracking-wider text-dark/45 sm:inline">
        Format
      </span>
      <button
        type="button"
        className={toolBtnDock}
        aria-label="Bold"
        title="Bold"
        onClick={bold}
      >
        <Bold className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={toolBtnDock}
        aria-label="Italic"
        title="Italic"
        onClick={italic}
      >
        <Italic className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={toolBtnDock}
        aria-label="Heading"
        title="Heading"
        onClick={heading}
      >
        <Heading2 className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={toolBtnDock}
        aria-label="Bullet list"
        title="Bullet list"
        onClick={bullet}
      >
        <List className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={toolBtnDock}
        aria-label="Quote"
        title="Blockquote"
        onClick={blockQuote}
      >
        <Quote className="size-4" strokeWidth={2.25} />
      </button>
      <span className="mx-0.5 hidden h-6 w-px bg-dark/15 sm:block" aria-hidden />
      <button
        type="button"
        className={toolBtnDock}
        aria-label={onOpenCoverPicker ? "Choose cover image" : "Add image"}
        title={onOpenCoverPicker ? "Cover image" : "Add image"}
        onClick={() =>
          onOpenCoverPicker
            ? onOpenCoverPicker()
            : toast.message("Use markdown: ![alt](url) for inline images.")
        }
      >
        <ImagePlus className="size-4 text-primary" strokeWidth={2.25} />
      </button>
      {emojiBlock(
        toolBtnDock,
        "left-0 top-full mt-1 h-[380px] w-[300px] max-w-[min(100vw-2rem,300px)]",
        "z-40",
      )}
    </div>
  );
}
