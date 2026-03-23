import { api } from "./api";
import type { Story } from "@/types";

export async function bookmarkStory(storyId: string) {
  const { data } = await api.post<{ ok: boolean }>(
    `/stories/${storyId}/bookmark`,
  );
  return data;
}

export async function unbookmarkStory(storyId: string) {
  await api.delete(`/stories/${storyId}/bookmark`);
}

export async function listBookmarkedStories() {
  const { data } = await api.get<Story[]>("/users/me/bookmarks");
  return data;
}
