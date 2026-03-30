"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { HomeFeed } from "@/features/feed/HomeFeed";
import { cn } from "@/lib/cn";
import {
  listPublishedStories,
  listTrendingStories,
} from "@/services/stories.service";
import type { PaginatedStories } from "@/types";

const FEED_PAGE = 10;

function feedNextPageParam(lastPage: PaginatedStories) {
  const page = lastPage.page ?? 1;
  const pageSize = lastPage.pageSize ?? FEED_PAGE;
  const totalPages =
    lastPage.totalPages ?? Math.max(1, Math.ceil(lastPage.total / pageSize));
  return page < totalPages ? page + 1 : undefined;
}

export function StoriesBrowseView() {
  const [sort, setSort] = useState<"latest" | "likes">("latest");
  const queryClient = useQueryClient();

  useEffect(() => {
    const other = sort === "latest" ? "likes" : "latest";
    void queryClient.prefetchInfiniteQuery({
      queryKey: ["stories", "feed", other],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const page = pageParam as number;
        if (other === "likes") {
          return listTrendingStories({ page, pageSize: FEED_PAGE });
        }
        return listPublishedStories({ page, pageSize: FEED_PAGE });
      },
      getNextPageParam: feedNextPageParam,
    });
  }, [sort, queryClient]);

  return (
    <div className="flex flex-1 flex-col bg-editorial-surface">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 sm:py-12 md:py-14">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary underline-offset-2 hover:underline"
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
          Back to home
        </Link>

        <div className="mb-8 flex flex-col gap-6 sm:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-headline text-4xl font-black tracking-tighter text-on-surface sm:text-5xl">
              All <span className="text-primary">stories</span>
            </h1>
            <p className="mt-2 max-w-xl font-login-body text-on-secondary-container sm:text-lg">
              Every published story from the community. Sort by newest updates or most likes.
            </p>
          </div>

          <div
            className="inline-flex flex-wrap rounded-full border border-outline-variant/20 bg-surface-container-low p-1 shadow-sm"
            role="group"
            aria-label="Sort stories"
          >
            <button
              type="button"
              onClick={() => setSort("latest")}
              className={cn(
                "rounded-full px-4 py-2 font-headline text-sm font-bold transition-colors sm:px-5 sm:text-base",
                sort === "latest"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface hover:bg-surface-container-high",
              )}
            >
              Latest
            </button>
            <button
              type="button"
              onClick={() => setSort("likes")}
              className={cn(
                "rounded-full px-4 py-2 font-headline text-sm font-bold transition-colors sm:px-5 sm:text-base",
                sort === "likes"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface hover:bg-surface-container-high",
              )}
            >
              Most likes
            </button>
          </div>
        </div>

        <HomeFeed sort={sort} />
      </div>
    </div>
  );
}
