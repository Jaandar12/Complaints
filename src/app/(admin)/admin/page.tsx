import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardHeader } from "@/components/ui/card";
import { ComplaintsTable } from "@/features/complaints/components/complaints-table";
import { Button } from "@/components/ui/button";
import { getAdminDashboardMetrics } from "@/server/queries/complaints";
import { getComplaintsPreview } from "@/server/queries/complaints-list";

export default async function AdminDashboardPage() {
  const [metrics, complaints] = await Promise.all([getAdminDashboardMetrics(), getComplaintsPreview()]);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard label="New complaints" value={metrics.newComplaints} delta="+12% vs last week" />
        <StatsCard label="Avg. resolution" value={`${metrics.averageResolutionHours.toFixed(1)}h`} hint="Rolling 30 days" />
        <StatsCard label="Units blocked" value={metrics.blockedUnits} />
        <StatsCard label="Reopen rate" value={`${(metrics.reopenRate * 100).toFixed(1)}%`} />
      </div>
      <Card>
        <CardHeader title="Live queue" subtitle="Track the most recent complaints" actions={<Button variant="secondary">View all</Button>} />
        <ComplaintsTable complaints={complaints} />
      </Card>
    </div>
  );
}
