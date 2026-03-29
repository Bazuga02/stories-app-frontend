export function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatCommentTime(iso?: string) {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString();
}

export function titleWithAccent(title: string) {
  const t = title.trim() || "Untitled";
  const parts = t.split(/\s+/);
  if (parts.length < 2) {
    return <span className="text-primary">{t}</span>;
  }
  const last = parts.pop()!;
  return (
    <>
      {parts.join(" ")}{" "}
      <span className="text-primary">{last}</span>
    </>
  );
}

export function userInitial(name: string) {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}
