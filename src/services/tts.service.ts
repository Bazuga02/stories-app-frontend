import type { NarrateResponse } from "@/types";
import { api } from "./api";

export async function narrateStory(
  id: string,
  options?: { hl?: string; voice?: string; rate?: number; codec?: string },
) {
  const { data } = await api.post<NarrateResponse>(`/stories/${id}/narrate`, options ?? {});
  return data;
}

