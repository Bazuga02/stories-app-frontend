"use client";

import { useEffect, useState } from "react";
import { fetchMe } from "@/services/auth.service";
import { listBookmarkedStories } from "@/services/bookmarks.service";
import { getStoredToken } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";

export function useAuthBootstrap() {
  const [ready, setReady] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!getStoredToken() && user) {
      queueMicrotask(() => setUser(null));
    }
  }, [user, setUser]);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredToken();
    if (!token) {
      queueMicrotask(() => {
        if (!cancelled) setReady(true);
      });
      return () => {
        cancelled = true;
      };
    }
    fetchMe()
      .then((u) => {
        if (!cancelled) setUser(u);
        if (!cancelled) {
          listBookmarkedStories()
            .then((stories) => {
              useBookmarkStore.getState().syncFromServer(stories.map((s) => s.id));
            })
            .catch(() => {
              /* bookmarks optional */
            });
        }
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
  }, [setUser, clearAuth]);

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
