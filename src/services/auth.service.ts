import { api, refreshClient } from "./api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse, TokenRefreshResponse, User } from "@/types";

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  name: string;
}) {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function refreshSession() {
  const { data } = await refreshClient.post<TokenRefreshResponse>("/auth/refresh");
  useAuthStore.getState().setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    useAuthStore.getState().clearAuth();
  }
}

export async function fetchMe() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}
