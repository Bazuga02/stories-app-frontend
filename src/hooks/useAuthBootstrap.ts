"use client";

import { useEffect, useState } from "react";
import { fetchMe, refreshSession } from "@/services/auth.service";
import { listBookmarkedStories } from "@/services/bookmarks.service";
import {
  clearLegacyTokenStorage,
  useAuthStore,
} from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";

export function useAuthBootstrap() {
  const [ready, setReady] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let cancelled = false;

    clearLegacyTokenStorage();

    refreshSession()
      .then(() => fetchMe())
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        return listBookmarkedStories()
          .then((stories) => {
            useBookmarkStore.getState().syncFromServer(stories.map((s) => s.id));
          })
          .catch(() => {
            /* bookmarks optional */
          });
      })
      .catch(() => {
        if (!cancelled) {
          clearAuth();
          useBookmarkStore.getState().syncFromServer([]);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, setAccessToken, clearAuth]);

  useEffect(() => {
    const onLogout = () => {
      clearAuth();
      useBookmarkStore.getState().syncFromServer([]);
    };
    window.addEventListener("stories:auth:logout", onLogout);
    return () => window.removeEventListener("stories:auth:logout", onLogout);
  }, [clearAuth]);

  return ready;
}
