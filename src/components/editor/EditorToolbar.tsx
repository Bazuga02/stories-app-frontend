"use client";

import { useState, type RefObject } from "react";
import {
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Smile,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { replaceSelection, wrapSelection } from "./markdownSelection";

const EMOJI_PICK = [
  "✨", "📖", "✍️", "💡", "🔥", "❤️", "⭐", "🎯", "🌟", "💬",
  "🙌", "👏", "✅", "🎉", "☕", "🌙", "🌿", "📌", "🔗", "📝",
];

type EditorToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setContent: (value: string) => void;
  className?: string;
};

export function EditorToolbar({
  textareaRef,
  setContent,
  className,
}: EditorToolbarProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);

  const apply = (fn: () => void) => {
    fn();
    setEmojiOpen(false);
  };

  const withSelection = (edit: (value: string, a: number, b: number) => ReturnType<typeof wrapSelection>) => {
    const el = textareaRef.current;
    if (!el) return;
    const { value, selectionStart, selectionEnd } = el;
    const r = edit(value, selectionStart, selectionEnd);
    setContent(r.nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(r.selectionStart, r.selectionEnd);
    });
  };

  const toolBtn =
    "flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-dark/70 outline-none transition-[background,color] duration-[var(--motion-fast)] hover:bg-dark/8 hover:text-dark focus-visible:ring-2 focus-visible:ring-dark/15";

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
        className={toolBtn}
        aria-label="Bold"
        title="Bold (**text**)"
        onClick={() =>
          apply(() =>
            withSelection((v, a, b) => wrapSelection(v, a, b, "**", "**", "bold")),
          )
        }
      >
        <Bold className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={toolBtn}
        aria-label="Italic"
        title="Italic (*text*)"
        onClick={() =>
          apply(() =>
            withSelection((v, a, b) => wrapSelection(v, a, b, "*", "*", "italic")),
          )
        }
      >
        <Italic className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={toolBtn}
        aria-label="Heading"
        title="Heading (## line)"
        onClick={() =>
          apply(() =>
            withSelection((v, a, b) => {
              const sel = v.slice(a, b);
              const line = sel.length ? sel : "Heading";
              return replaceSelection(v, a, b, `\n## ${line}\n`);
            }),
          )
        }
      >
        <Heading2 className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={toolBtn}
        aria-label="Bullet list"
        title="Bullet list (- item)"
        onClick={() =>
          apply(() =>
            withSelection((v, a, b) => replaceSelection(v, a, b, "\n- list item\n")),
          )
        }
      >
        <List className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        className={toolBtn}
        aria-label="Quote"
        title="Blockquote"
        onClick={() =>
          apply(() =>
            withSelection((v, a, b) => replaceSelection(v, a, b, "\n> Quote\n")),
          )
        }
      >
        <Quote className="size-4" strokeWidth={2.25} />
      </button>
      <span className="mx-0.5 hidden h-6 w-px bg-dark/15 sm:block" aria-hidden />
      <div className="relative">
        <button
          type="button"
          className={cn(toolBtn, emojiOpen && "bg-dark/10 text-dark")}
          aria-label="Insert emoji"
          aria-expanded={emojiOpen}
          title="Emoji & symbols"
          onClick={() => setEmojiOpen((o) => !o)}
        >
          <Smile className="size-4" strokeWidth={2.25} />
        </button>
        {emojiOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close emoji picker"
              onClick={() => setEmojiOpen(false)}
            />
            <div
              className="absolute left-0 top-full z-50 mt-1 w-[min(100vw-2rem,280px)] rounded-[var(--radius-md)] border border-dark/10 bg-white p-2 shadow-[var(--shadow-floating)]"
              role="listbox"
              aria-label="Pick emoji"
            >
              <p className="mb-2 flex items-center gap-1.5 px-1 text-[0.7rem] font-semibold uppercase tracking-wide text-dark/50">
                <Sparkles className="size-3.5 text-accent" aria-hidden />
                Icons
              </p>
              <div className="grid grid-cols-5 gap-1 sm:grid-cols-6">
                {EMOJI_PICK.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    role="option"
                    className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] text-xl transition-colors hover:bg-surface"
                    onClick={() =>
                      apply(() =>
                        withSelection((v, a, b) => replaceSelection(v, a, b, ch)),
                      )
                    }
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
