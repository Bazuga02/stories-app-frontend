"use client";

import { useQuery } from "@tanstack/react-query";
import {
  aesopStoryId,
  fetchAesopStories,
  type AesopStory,
} from "@/services/aesop-stories.service";

export const aesopStoriesQueryKey = ["aesop", "stories"] as const;

/** Fables are static — fetch once and reuse for the whole session. */
const AESOP_QUERY_OPTIONS = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
} as const;

export function useAesopStories() {
  return useQuery({
    queryKey: aesopStoriesQueryKey,
    queryFn: fetchAesopStories,
    ...AESOP_QUERY_OPTIONS,
  });
}

export function findAesopStoryById(stories: AesopStory[], id: string) {
  return stories.find((s) => aesopStoryId(s) === id) ?? null;
}
