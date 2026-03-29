import { NextResponse } from "next/server";

const upstream =
  process.env.SHORT_STORIES_API_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_SHORT_STORIES_API_URL?.replace(/\/$/, "") ??
  "https://shortstories-api.onrender.com";

export async function GET() {
  const res = await fetch(`${upstream}/stories`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Short stories upstream failed" },
      { status: res.status >= 500 ? 502 : res.status },
    );
  }
  const data: unknown = await res.json();
  return NextResponse.json(data);
}
