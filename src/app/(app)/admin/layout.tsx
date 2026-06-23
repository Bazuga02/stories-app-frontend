import type { Metadata } from "next";
import { AdminGuard } from "@/components/auth/AdminGuard";

export const metadata: Metadata = {
  title: "Admin Panel — Stories",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </AdminGuard>
  );
}
