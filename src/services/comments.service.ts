import { api } from "./api";
import type { Comment } from "@/types";

export async function addComment(storyId: string, content: string) {
  const { data } = await api.post<Comment>(`/stories/${storyId}/comments`, {
    content,
  });
  return data;
}

export async function deleteComment(commentId: string) {
  await api.delete(`/comments/${commentId}`);
}
