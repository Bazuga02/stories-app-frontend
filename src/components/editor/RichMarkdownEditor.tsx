"use client";

import type { MutableRefObject } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import { cn } from "@/lib/cn";

marked.setOptions({ gfm: true, breaks: true });

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

export type RichMarkdownEditorHandle = {
  /** Sync DOM → markdown and notify parent (after execCommand, etc.). */
  flush: () => void;
  focus: () => void;
};

type Props = {
  id?: string;
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
  /** Optional: same ref the toolbar uses for execCommand (the contenteditable root). */
  editorRootRef?: MutableRefObject<HTMLDivElement | null>;
};

function mdToHtml(md: string): string {
  if (!md.trim()) return "";
  const out = marked.parse(md, { async: false });
  return typeof out === "string" ? out : String(out);
}

export const RichMarkdownEditor = forwardRef<RichMarkdownEditorHandle, Props>(
  function RichMarkdownEditor(
    {
      id,
      value,
      onChange,
      placeholder,
      className,
      "aria-invalid": ariaInvalid,
      editorRootRef,
    },
    ref,
  ) {
    const divRef = useRef<HTMLDivElement>(null);
    const lastEmitted = useRef<string | null>(null);

    const setEditorEl = useCallback(
      (el: HTMLDivElement | null) => {
        divRef.current = el;
        if (editorRootRef) editorRootRef.current = el;
      },
      [editorRootRef],
    );

    const flush = useCallback(() => {
      const el = divRef.current;
      if (!el) return;
      const text = el.innerText.replace(/\u200b/g, "").trim();
      const hasBlocks = el.querySelector(
        "img, a, li, h1, h2, h3, h4, blockquote, pre, ul, ol",
      );
      if (!text && !hasBlocks) {
        el.innerHTML = "";
      }
      const md = el.innerHTML.trim() ? turndown.turndown(el.innerHTML) : "";
      lastEmitted.current = md;
      onChange(md);
    }, [onChange]);

    useImperativeHandle(ref, () => ({
      flush,
      focus: () => divRef.current?.focus(),
    }));

    useEffect(() => {
      if (value === lastEmitted.current) return;
      lastEmitted.current = value;
      const el = divRef.current;
      if (!el) return;
      const html = mdToHtml(value);
      el.innerHTML = html || "";
    }, [value]);

    return (
      <div className="relative">
        <div
          id={id}
          ref={setEditorEl}
          role="textbox"
          aria-multiline="true"
          aria-invalid={ariaInvalid}
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "min-h-[min(400px,45vh)] w-full resize-y overflow-auto border-none bg-transparent text-xl leading-relaxed text-on-surface/90 outline-none focus:ring-0 empty:before:pointer-events-none empty:before:text-on-surface-variant/50 empty:before:content-[attr(data-placeholder)] md:text-2xl",
            "[&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-8 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-8 [&_h2]:font-headline [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic",
            className,
          )}
          data-placeholder={placeholder ?? ""}
          onInput={flush}
          onBlur={flush}
        />
      </div>
    );
  },
);
