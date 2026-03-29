import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-0 flex-1 flex-col bg-editorial-surface">{children}</div>
    </AuthGuard>
  );
}
