import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorBody } from "@/types";

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

export const TOKEN_STORAGE_KEY = "stories_jwt";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let handling401 = false;

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      const isAuthPage =
        path.startsWith("/login") || path.startsWith("/register");
      if (!isAuthPage && !handling401) {
        handling401 = true;
        setStoredToken(null);
        window.dispatchEvent(new CustomEvent("stories:auth:logout"));
        window.location.assign(`/login?next=${encodeURIComponent(path)}`);
        handling401 = false;
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const data = err.response?.data;
    const msg = data?.message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
    if (Array.isArray(data?.details)) return data.details.join(", ");
    if (typeof data?.error === "string") return data.error;
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export { baseURL as API_BASE_URL };
