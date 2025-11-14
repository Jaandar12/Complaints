import { notFound } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getComplaintDetail } from "@/server/queries/complaints";
import { formatDistanceToNow } from "date-fns";

export default async function ComplaintDetailPage({ params }: { params: { complaintId: string } }) {
  const complaint = await getComplaintDetail(params.complaintId);
  if (!complaint) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={`Complaint • ${complaint.id}`}
          subtitle={`${complaint.buildingName} — Unit ${complaint.unitNumber}`}
          actions={<Badge label={complaint.status} variant={complaint.status} />}
        />
        <div className="space-y-2 text-sm">
          <p className="text-slate-700">{complaint.description}</p>
          {complaint.tenantName && <p className="text-slate-500">Tenant: {complaint.tenantName}</p>}
          <p className="text-slate-500">
            Reported {formatDistanceToNow(new Date(complaint.reportedAt), { addSuffix: true })}
          </p>
          <div className="flex flex-wrap gap-2">
            {complaint.categories.map((category) => (
              <span key={category} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {category}
              </span>
            ))}
          </div>
        </div>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Timeline" />
          <ol className="space-y-3 text-sm">
            {complaint.timeline.map((item) => (
              <li key={item.changedAt} className="rounded-lg border border-slate-100 p-3">
                <p className="font-semibold">{item.status.replaceAll("_", " ")}</p>
                <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(item.changedAt), { addSuffix: true })}</p>
                {item.note && <p className="text-slate-600">{item.note}</p>}
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <CardHeader title="Assignments" />
          <div className="space-y-3">
            {complaint.assignments.length === 0 && <p className="text-sm text-slate-500">No workers assigned yet.</p>}
            {complaint.assignments.map((assignment) => (
              <div key={assignment.workerName + assignment.assignedAt} className="rounded-lg border border-slate-100 p-3">
                <p className="font-medium text-slate-900">{assignment.workerName}</p>
                <p className="text-xs text-slate-500">
                  Assigned {formatDistanceToNow(new Date(assignment.assignedAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Button>Assign worker</Button>
            <Button variant="secondary">Mark resolved</Button>
            <Button variant="ghost" className="text-rose-600">
              Reject complaint
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
