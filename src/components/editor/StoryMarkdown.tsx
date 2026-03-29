"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Quote } from "lucide-react";
import { cn } from "@/lib/cn";

type StoryMarkdownProps = {
  source: string;
  className?: string;
  variant?: "default" | "editorial";
};

function EditorialMarkdownInner({ source }: { source: string }) {
  const firstP = useRef(true);

  useEffect(() => {
    firstP.current = true;
  }, [source]);

  return (
    <ReactMarkdown
      components={{
        h1: ({ node: _n, ...props }) => (
          <h1
            className="font-headline mb-4 mt-10 text-3xl font-black tracking-tight text-on-background first:mt-0 md:text-4xl"
            {...props}
          />
        ),
        h2: ({ node: _n, ...props }) => (
          <h2
            className="font-headline mb-3 mt-8 text-2xl font-black tracking-tight text-on-background first:mt-0"
            {...props}
          />
        ),
        h3: ({ node: _n, ...props }) => (
          <h3
            className="mb-2 mt-6 text-xl font-bold text-on-background first:mt-0"
            {...props}
          />
        ),
        p: ({ node: _n, ...props }) => {
          const isFirst = firstP.current;
          if (isFirst) firstP.current = false;
          return (
            <p
              className={cn(
                "mb-6 text-xl leading-relaxed text-on-background last:mb-0",
                isFirst &&
                  "first-letter:float-left first-letter:mr-3 first-letter:font-headline first-letter:text-7xl first-letter:font-black first-letter:text-primary",
              )}
              {...props}
            />
          );
        },
        strong: ({ node: _n, ...props }) => (
          <strong className="font-bold text-on-background" {...props} />
        ),
        em: ({ node: _n, ...props }) => (
          <em className="italic text-on-background/95" {...props} />
        ),
        ul: ({ node: _n, ...props }) => (
          <ul
            className="mb-6 list-disc space-y-2 pl-6 text-xl leading-relaxed text-on-background"
            {...props}
          />
        ),
        ol: ({ node: _n, ...props }) => (
          <ol
            className="mb-6 list-decimal space-y-2 pl-6 text-xl leading-relaxed text-on-background"
            {...props}
          />
        ),
        li: ({ node: _n, ...props }) => <li className="leading-relaxed" {...props} />,
        blockquote: ({ node: _n, children, ...props }) => (
          <blockquote
            className="relative my-12 overflow-hidden bg-surface-container-low p-8 text-on-background md:p-10 asymmetric-cloud"
            {...props}
          >
            <Quote
              className="pointer-events-none absolute -left-2 -top-2 size-28 text-primary-container opacity-20 md:size-32"
              strokeWidth={1}
              aria-hidden
            />
            <div className="relative z-10 font-headline text-2xl italic leading-snug md:text-3xl">
              {children}
            </div>
          </blockquote>
        ),
        code: ({ node: _n, className, children, ...props }) => {
          const inline = !className;
          if (inline) {
            return (
              <code
                className="rounded-md bg-on-background/10 px-1.5 py-0.5 font-mono text-[0.88em] text-on-background"
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
            className="mb-6 overflow-x-auto rounded-xl bg-surface-container-high p-4 text-[0.9rem] text-on-background"
            {...props}
          />
        ),
        a: ({ node: _n, ...props }) => (
          <a
            className="font-semibold text-primary underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        img: ({ node: _n, alt, ...props }) => (
          <img
            className="my-8 w-full rounded-xl editorial-shadow"
            alt={alt ?? ""}
            {...props}
          />
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}

export function StoryMarkdown({
  source,
  className,
  variant = "default",
}: StoryMarkdownProps) {
  if (!source?.trim()) {
    return (
      <p
        className={cn(
          "text-[1.05rem] italic",
          variant === "editorial"
            ? "text-on-secondary-container"
            : "text-dark/50",
        )}
      >
        This story has no body yet.
      </p>
    );
  }

  if (variant === "editorial") {
    return (
      <div
        className={cn(
          "story-markdown story-markdown-editorial max-w-none font-login-body",
          className,
        )}
      >
        <EditorialMarkdownInner source={source} />
      </div>
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
