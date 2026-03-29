import type { Metadata } from "next";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminViewportShell } from "@/components/auth/admin-viewport-shell";

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
      <AdminViewportShell>{children}</AdminViewportShell>
    </AdminGuard>
  );
}
