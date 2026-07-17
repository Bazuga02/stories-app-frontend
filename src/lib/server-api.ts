export function getInternalApiBaseUrl(): string {
  return (
    process.env.STORIES_API_INTERNAL_URL?.trim().replace(/\/$/, "") ||
    "http://127.0.0.1:8080"
  );
}

export class ServerApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`Server API ${status}`);
    this.name = "ServerApiError";
  }
}

export async function serverFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getInternalApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${base}${normalized}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ServerApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}
