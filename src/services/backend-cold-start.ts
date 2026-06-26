import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

export type ColdStartRetryConfig = InternalAxiosRequestConfig & {
  _coldStartRetryCount?: number;
};

const BACKEND_WARMUP_TOAST_ID = "backend-cold-start";
const COLD_START_MAX_RETRIES = 4;
const COLD_START_RETRY_DELAY_MS = 15_000;

export function isBackendWakingUpError(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status === 502 || status === 503 || status === 504) return true;

  if (error.response) return false;

  return (
    error.code === "ECONNABORTED" ||
    error.code === "ERR_NETWORK" ||
    error.message === "Network Error"
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function notifyBackendWakingUp() {
  if (typeof window === "undefined") return;

  void import("@/components/ui/backend-warmup-toast").then((m) =>
    m.showBackendWarmupToast(),
  );
}

export function dismissBackendWakingUpToast() {
  if (typeof window === "undefined") return;
  toast.dismiss(BACKEND_WARMUP_TOAST_ID);
}

export function attachColdStartRetryInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (res) => {
      dismissBackendWakingUpToast();
      return res;
    },
    async (error: AxiosError) => {
      const original = error.config as ColdStartRetryConfig | undefined;

      if (
        typeof window !== "undefined" &&
        original &&
        isBackendWakingUpError(error)
      ) {
        const count = original._coldStartRetryCount ?? 0;
        if (count < COLD_START_MAX_RETRIES) {
          notifyBackendWakingUp();
          original._coldStartRetryCount = count + 1;
          await sleep(COLD_START_RETRY_DELAY_MS);
          return client(original);
        }
      }

      return Promise.reject(error);
    },
  );
}
