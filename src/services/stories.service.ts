import axios from "axios";
import { api } from "./api";
import type { Comment, PaginatedStories, Story } from "@/types";

export async function listPublishedStories(params: {
  page?: number;
  pageSize?: number;
}) {
  const { data } = await api.get<PaginatedStories | Story[]>("/stories", {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 12,
      status: "PUBLISHED",
    },
  });
  return normalizePaginated(data, params.page ?? 1, params.pageSize ?? 12);
}

export async function getStory(id: string) {
  const { data } = await api.get<Story & { comments?: Comment[] }>(
    `/stories/${id}`,
  );
  return data;
}

export async function createStory(body: {
  title: string;
  content: string;
  status?: "DRAFT" | "PUBLISHED";
}) {
  const { data } = await api.post<Story>("/stories", {
    ...body,
    status: body.status ?? "DRAFT",
  });
  return data;
}

export async function updateStory(
  id: string,
  body: Partial<Pick<Story, "title" | "content" | "status">>,
) {
  const { data } = await api.patch<Story>(`/stories/${id}`, body);
  return data;
}

export async function deleteStory(id: string) {
  await api.delete(`/stories/${id}`);
}

export async function publishStory(id: string) {
  const { data } = await api.post<Story>(`/stories/${id}/publish`);
  return data;
}

export async function saveDraft(id: string, body: { title: string; content: string }) {
  const { data } = await api.patch<Story>(`/stories/${id}/draft`, body);
  return data;
}

/** Fallback if backend uses PATCH /stories/:id only */
export async function saveDraftFlexible(
  id: string,
  body: { title: string; content: string },
) {
  try {
    return await saveDraft(id, body);
  } catch {
    return updateStory(id, { ...body, status: "DRAFT" });
  }
}

export async function likeStory(id: string) {
  const { data } = await api.post<Story>(`/stories/${id}/like`);
  return data;
}

export async function unlikeStory(id: string) {
  await api.delete(`/stories/${id}/like`);
  return getStory(id);
}

export async function listMyStories(
  status?: "DRAFT" | "PUBLISHED",
  pagination?: { page?: number; pageSize?: number },
) {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 50;
  const params: Record<string, string | number> = { page, pageSize };
  if (status) params.status = status;
  try {
    const { data } = await api.get<Story[] | PaginatedStories>("/stories/me", {
      params,
    });
    if (Array.isArray(data)) return data;
    return data.items ?? [];
  } catch (e) {
    if (!axios.isAxiosError(e) || e.response?.status !== 404) throw e;
    const { data } = await api.get<Story[] | PaginatedStories>(
      "/users/me/stories",
      { params },
    );
    if (Array.isArray(data)) return data;
    return data.items ?? [];
  }
}

function normalizePaginated(
  data: PaginatedStories | Story[],
  page: number,
  pageSize: number,
): PaginatedStories {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      pageSize: data.length || pageSize,
    };
  }
  return {
    items: data.items ?? [],
    total: data.total ?? (data.items?.length ?? 0),
    page: data.page ?? page,
    pageSize: data.pageSize ?? pageSize,
    totalPages: data.totalPages,
  };
}
