import {
  aesopStoryId,
  type AesopStory,
} from "@/services/aesop-stories.service";

const upstream =
  process.env.SHORT_STORIES_API_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_SHORT_STORIES_API_URL?.replace(/\/$/, "") ??
  "https://shortstories-api.onrender.com";

export async function fetchAesopStoriesServer(): Promise<AesopStory[]> {
  const res = await fetch(`${upstream}/stories`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Fables upstream failed (${res.status})`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data as AesopStory[];
}

export async function fetchAesopStoryByIdServer(
  id: string,
): Promise<AesopStory | null> {
  const items = await fetchAesopStoriesServer();
  return items.find((s) => aesopStoryId(s) === id) ?? null;
}

export function relatedAesopStories(
  stories: AesopStory[],
  currentId: string,
  limit = 2,
) {
  return stories.filter((s) => aesopStoryId(s) !== currentId).slice(0, limit);
}
