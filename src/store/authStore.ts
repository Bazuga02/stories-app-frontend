"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";
import { setStoredToken, getStoredToken } from "@/services/api";

type AuthState = {
  user: User | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user, token) => {
        setStoredToken(token);
        set({ user });
      },
      clearAuth: () => {
        setStoredToken(null);
        set({ user: null });
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "stories-auth-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }),
    },
  ),
);

export function isSessionValid() {
  return !!getStoredToken() && !!useAuthStore.getState().user;
}
