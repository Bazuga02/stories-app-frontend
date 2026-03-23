"use client";

import { createContext, useContext } from "react";

const AuthReadyContext = createContext(false);

export function AuthReadyProvider({
  ready,
  children,
}: {
  ready: boolean;
  children: React.ReactNode;
}) {
  return (
    <AuthReadyContext.Provider value={ready}>
      {children}
    </AuthReadyContext.Provider>
  );
}

export function useAuthReady() {
  return useContext(AuthReadyContext);
}
