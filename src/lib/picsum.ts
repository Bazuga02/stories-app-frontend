/**
 * Lorem Picsum — server-stored URLs on each story; this is only for picking covers in the editor
 * and a neutral placeholder when `bgimg` is missing.
 * @see https://picsum.photos/
 */
export const STORY_COVER_PLACEHOLDER =
  "https://picsum.photos/seed/stories-default-cover/960/540";

/** Five random candidate URLs for the cover picker (different seeds each open). */
export function randomPicsumCoverCandidates(): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  while (out.length < 5) {
    const seed = `pick-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    if (seen.has(seed)) continue;
    seen.add(seed);
    out.push(`https://picsum.photos/seed/${encodeURIComponent(seed)}/960/540`);
  }
  return out;
}

/** Small square image for story page byline (not the stored cover). */
export function picsumAuthorAvatar(authorId: string | undefined, displayName: string): string {
  const raw = (authorId?.trim() || displayName.trim() || "author").replace(/[^\w-]/g, "").slice(0, 64);
  const seed = raw ? `author-${raw}` : "author";
  return `https://picsum.photos/seed/${seed}/256/256`;
}
