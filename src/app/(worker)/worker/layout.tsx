import { WorkerShell } from "@/components/layout/worker-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireRole(["SERVICE_WORKER"], "/worker");
  return <WorkerShell currentUser={currentUser}>{children}</WorkerShell>;
}
