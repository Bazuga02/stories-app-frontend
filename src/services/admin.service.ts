import { api } from "./api";
import type {
  AdminCommentRow,
  AdminStats,
  AdminStoryRow,
  Story,
  User,
} from "@/types";

export async function listAllUsers() {
  const { data } = await api.get<User[]>("/admin/users");
  return data;
}

export async function listAdminStories() {
  const { data } = await api.get<AdminStoryRow[]>("/admin/stories");
  return data;
}

export async function listAdminComments() {
  const { data } = await api.get<AdminCommentRow[]>("/admin/comments");
  return data;
}

export async function adminDeleteStory(id: string) {
  await api.delete(`/admin/stories/${id}`);
}

export async function adminDeleteComment(id: string) {
  await api.delete(`/admin/comments/${id}`);
}

export async function getAdminStats() {
  const { data } = await api.get<AdminStats>("/admin/stats");
  return data;
}

/** Fallbacks if routes differ */
export async function adminDeleteStoryFlexible(id: string) {
  try {
    await adminDeleteStory(id);
  } catch {
    await api.delete<Story>(`/stories/${id}`);
  }
}
