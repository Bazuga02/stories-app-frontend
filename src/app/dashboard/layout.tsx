import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="container-design flex flex-1 flex-col gap-[var(--spacing-lg)] py-[var(--spacing-xl)] md:flex-row md:items-start">
        <Sidebar className="md:sticky md:top-24" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AuthGuard>
  );
}
