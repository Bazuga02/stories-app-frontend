"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/cn";

type StoryMarkdownProps = {
  source: string;
  className?: string;
};

export function StoryMarkdown({ source, className }: StoryMarkdownProps) {
  if (!source?.trim()) {
    return (
      <p className="text-[1.05rem] italic text-dark/50">This story has no body yet.</p>
    );
  }

  return (
    <div className={cn("story-markdown", className)}>
      <ReactMarkdown
        components={{
        h1: ({ node: _n, ...props }) => (
          <h1
            className="font-display mb-4 mt-10 text-[clamp(1.5rem,3vw,2rem)] font-black uppercase tracking-wide text-dark first:mt-0"
            {...props}
          />
        ),
        h2: ({ node: _n, ...props }) => (
          <h2
            className="font-display mb-3 mt-8 text-[1.35rem] font-black uppercase tracking-wide text-dark first:mt-0"
            {...props}
          />
        ),
        h3: ({ node: _n, ...props }) => (
          <h3 className="mb-2 mt-6 text-[1.1rem] font-bold text-dark first:mt-0" {...props} />
        ),
        p: ({ node: _n, ...props }) => (
          <p className="mb-4 text-[1.05rem] leading-[1.75] text-dark/90 last:mb-0" {...props} />
        ),
        strong: ({ node: _n, ...props }) => (
          <strong className="font-bold text-dark" {...props} />
        ),
        em: ({ node: _n, ...props }) => <em className="italic text-dark/95" {...props} />,
        ul: ({ node: _n, ...props }) => (
          <ul className="mb-4 list-disc space-y-1.5 pl-6 text-[1.05rem] text-dark/90" {...props} />
        ),
        ol: ({ node: _n, ...props }) => (
          <ol className="mb-4 list-decimal space-y-1.5 pl-6 text-[1.05rem] text-dark/90" {...props} />
        ),
        li: ({ node: _n, ...props }) => <li className="leading-relaxed" {...props} />,
        blockquote: ({ node: _n, ...props }) => (
          <blockquote
            className="mb-4 border-l-4 border-accent/80 bg-accent/[0.07] py-2 pl-4 pr-3 text-[1.02rem] text-dark/88"
            {...props}
          />
        ),
        code: ({ node: _n, className, children, ...props }) => {
          const inline = !className;
          if (inline) {
            return (
              <code
                className="rounded-[var(--radius-sm)] bg-dark/[0.08] px-1.5 py-0.5 font-mono text-[0.88em] text-dark"
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ node: _n, ...props }) => (
          <pre
            className="mb-4 overflow-x-auto rounded-[var(--radius-md)] bg-dark/[0.06] p-4 text-[0.9rem] text-dark"
            {...props}
          />
        ),
        a: ({ node: _n, ...props }) => (
          <a
            className="font-semibold text-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
      }}
    >
        {source}
      </ReactMarkdown>
    </div>
  );
}
