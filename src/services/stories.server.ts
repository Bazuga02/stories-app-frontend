import { serverFetchJson } from "@/lib/server-api";
import type { Comment, PaginatedStories, Story } from "@/types";

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

export async function getStoryServer(id: string) {
  return serverFetchJson<Story & { comments?: Comment[] }>(`/stories/${id}`, {
    cache: "no-store",
  });
}

export async function listPublishedStoriesServer(params: {
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    status: "PUBLISHED",
  });
  const data = await serverFetchJson<PaginatedStories | Story[]>(
    `/stories?${query.toString()}`,
    { next: { revalidate: 60 } },
  );
  return normalizePaginated(data, page, pageSize);
}
