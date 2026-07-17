import { cache } from "react";
import { ServerApiError } from "@/lib/server-api";
import {
  fetchAesopStoriesServer,
  relatedAesopStories,
} from "@/services/aesop-stories.server";
import {
  aesopStoryId,
  isAesopMongoId,
  type AesopStory,
} from "@/services/aesop-stories.service";
import {
  getStoryServer,
  listPublishedStoriesServer,
} from "@/services/stories.server";
import type { Comment, Story } from "@/types";

export type ResolvedStoryPage =
  | {
      kind: "spring";
      story: Story & { comments?: Comment[] };
      related: Story[];
    }
  | {
      kind: "aesop";
      aesopStory: AesopStory;
      relatedAesop: AesopStory[];
    }
  | { kind: "not-found" };

async function resolveAesopPage(id: string): Promise<ResolvedStoryPage> {
  const aesopStories = await fetchAesopStoriesServer();
  const aesopStory =
    aesopStories.find((s) => aesopStoryId(s) === id) ?? null;
  if (!aesopStory) {
    return { kind: "not-found" };
  }
  return {
    kind: "aesop",
    aesopStory,
    relatedAesop: relatedAesopStories(aesopStories, id),
  };
}

async function resolveSpringPage(id: string): Promise<ResolvedStoryPage> {
  try {
    const [story, feed] = await Promise.all([
      getStoryServer(id),
      listPublishedStoriesServer({ page: 1, pageSize: 12 }),
    ]);
    const related = feed.items.filter((s) => s.id !== id).slice(0, 2);
    return { kind: "spring", story, related };
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return resolveAesopPage(id);
    }
    throw error;
  }
}

async function resolveStoryPageImpl(id: string): Promise<ResolvedStoryPage> {
  const trimmed = id.trim();
  if (!trimmed) {
    return { kind: "not-found" };
  }

  if (isAesopMongoId(trimmed)) {
    return resolveAesopPage(trimmed);
  }

  return resolveSpringPage(trimmed);
}

/** Deduped per request — safe for `page.tsx` + `generateMetadata`. */
export const resolveStoryPage = cache(resolveStoryPageImpl);
