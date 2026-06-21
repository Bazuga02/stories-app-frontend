"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

const LEGACY_TOKEN_KEY = "stories_jwt";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string | null) => void;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "stories-auth-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }),
    },
  ),
);

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function isSessionValid() {
  return !!getAccessToken() && !!useAuthStore.getState().user;
}

/** Drop legacy JWT from localStorage after auth model change. */
export function clearLegacyTokenStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}
