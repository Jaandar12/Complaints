import { AdminShell } from "@/components/layout/admin-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGEMENT"], "/admin");
  return <AdminShell currentUser={currentUser}>{children}</AdminShell>;
}
