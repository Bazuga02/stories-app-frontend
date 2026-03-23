"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type BookmarkState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  syncFromServer: (ids: string[]) => void;
};

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      toggle: (id) =>
        set((s) =>
          s.ids.includes(id)
            ? { ids: s.ids.filter((x) => x !== id) }
            : { ids: [...s.ids, id] },
        ),
      syncFromServer: (ids) => set({ ids }),
    }),
    {
      name: "stories-bookmarks",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
