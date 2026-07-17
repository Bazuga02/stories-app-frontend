import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorBody } from "@/types";
import { getAccessToken, useAuthStore } from "@/store/authStore";
import {
  attachColdStartRetryInterceptor,
  isBackendWakingUpError,
} from "./backend-cold-start";

/**
 * If `NEXT_PUBLIC_API_URL` is unset, the browser uses same-origin `/api/*`
 * (rewritten to the Spring app via `next.config.ts`) so CORS is not required.
 * Set `NEXT_PUBLIC_API_URL=http://localhost:8080` to call the API directly.
 */
function resolveApiBaseURL(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return "/api";
  return (
    process.env.STORIES_API_INTERNAL_URL?.trim().replace(/\/$/, "") ||
    "http://127.0.0.1:8080"
  );
}

const baseURL = resolveApiBaseURL();

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
  withCredentials: true,
});

/** Separate client for refresh to avoid interceptor loops. */
export const refreshClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
  withCredentials: true,
});

attachColdStartRetryInterceptor(api);
attachColdStartRetryInterceptor(refreshClient);

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await refreshClient.post<{ accessToken: string }>(
      "/auth/refresh",
    );
    useAuthStore.getState().setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

function shouldSkipRefreshRetry(url: string | undefined) {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/login") || path.startsWith("/register")) return;
  window.dispatchEvent(new CustomEvent("stories:auth:logout"));
  window.location.assign(`/login?next=${encodeURIComponent(path)}`);
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const original = error.config as RetryConfig | undefined;

    if (status !== 401 || !original || typeof window === "undefined") {
      return Promise.reject(error);
    }

    if (shouldSkipRefreshRetry(original.url)) {
      return Promise.reject(error);
    }

    if (original._retry) {
      useAuthStore.getState().clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (!newToken) {
      useAuthStore.getState().clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  },
);

function messageFromStatus(status: number | undefined, fallback: string): string {
  switch (status) {
    case 400:
      return "That request wasn’t valid. Please check and try again.";
    case 401:
      return "Please sign in to continue.";
    case 403:
      return "You don’t have permission to do that.";
    case 404:
      return "We couldn’t find what you’re looking for.";
    case 408:
      return "The request timed out. Please try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Something went wrong on our side. Please try again in a moment.";
    default:
      return fallback;
  }
}

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (isBackendWakingUpError(err)) {
      return "The server is still waking up. Please wait 1–2 minutes and try again.";
    }
    const data = err.response?.data;
    const msg = data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (Array.isArray(msg) && msg.length) return msg.join(", ");
    if (Array.isArray(data?.details) && data.details.length) {
      return data.details.join(", ");
    }
    if (typeof data?.error === "string" && data.error.trim()) return data.error;

    const status = err.response?.status;
    if (status) return messageFromStatus(status, fallback);

    if (err.message && !/^Request failed with status code \d+$/i.test(err.message)) {
      return err.message;
    }
  }
  if (err instanceof Error) {
    if (!/^Request failed with status code \d+$/i.test(err.message)) {
      return err.message;
    }
  }
  return fallback;
}

export { baseURL as API_BASE_URL };
