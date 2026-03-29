export type AesopStory = {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  story: string;
  moral?: string;
};

export function aesopStoryId(s: AesopStory): string {
  return String(s._id ?? s.id ?? "");
}

/** Mongo-style ids from shortstories-api (24 hex chars). */
export function isAesopMongoId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function fetchAesopStories(): Promise<AesopStory[]> {
  const res = await fetch("/api/aesop/stories", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Fables request failed (${res.status})`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data as AesopStory[];
}

export async function fetchAesopStoryById(id: string): Promise<AesopStory | null> {
  const items = await fetchAesopStories();
  return items.find((s) => aesopStoryId(s) === id) ?? null;
}

export function aesopExcerpt(story: string, max = 220) {
  const flat = story.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).trim()}…`;
}

export function aesopReadMinutes(story: string) {
  const words = story.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
