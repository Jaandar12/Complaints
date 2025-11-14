import { Card } from "@/components/ui/card";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getWorkerDashboardPreview } from "@/server/queries/workers";
import { formatDistanceToNow } from "date-fns";

export default async function WorkerDashboardPage() {
  const preview = await getWorkerDashboardPreview();
  if (!preview) {
    return <p className="text-sm text-slate-500">No service workers configured yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Worker</p>
          <p className="text-2xl font-semibold text-slate-900">{preview.worker.name}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending jobs</p>
          <p className="text-3xl font-semibold text-slate-900">{preview.stats?.pending ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Assigned today</p>
          <p className="text-3xl font-semibold text-slate-900">{preview.stats?.assignedToday ?? 0}</p>
        </Card>
      </div>
      <Card>
        <Table>
          <THead>
            <tr>
              <Th>ID</Th>
              <Th>Building</Th>
              <Th>Status</Th>
              <Th>Opened</Th>
            </tr>
          </THead>
          <TBody>
            {preview.complaints.map((complaint) => (
              <tr key={complaint.id}>
                <Td>{complaint.id}</Td>
                <Td>
                  <p className="font-medium">{complaint.buildingName}</p>
                  <p className="text-sm text-slate-500">Unit {complaint.unitNumber}</p>
                  <p className="text-xs text-slate-500">{complaint.categories.join(", ")}</p>
                </Td>
                <Td>
                  <Badge label={complaint.status} variant={complaint.status} />
                </Td>
                <Td className="text-sm text-slate-600">
                  {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                </Td>
              </tr>
            ))}
            {preview.complaints.length === 0 && (
              <tr>
                <Td colSpan={4} className="text-center text-sm text-slate-500">
                  No assignments yet.
                </Td>
              </tr>
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
