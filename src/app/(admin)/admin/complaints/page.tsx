"use client";

import { useState } from "react";
import { ComplaintsTable } from "@/features/complaints/components/complaints-table";
import { useComplaints } from "@/features/complaints/hooks/use-complaints";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statuses = [
  { id: "NEW", label: "New" },
  { id: "ASSIGNED", label: "Assigned" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "PENDING_TENANT_CONFIRMATION", label: "Pending confirmation" },
];

export default function ComplaintsPage() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["NEW", "ASSIGNED", "IN_PROGRESS"]);
  const { data = [], isFetching } = useComplaints({ status: selectedStatuses });

  function toggleStatus(status: string) {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  return (
    <Card className="space-y-6">
      <CardHeader
        title="Complaints"
        subtitle="Filter by status, building, or worker assignment"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-sm text-slate-600">
              Export CSV
            </Button>
            <Button>Bulk assign</Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => toggleStatus(status.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              selectedStatuses.includes(status.id)
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-500"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {isFetching ? <p className="text-sm text-slate-500">Loading complaints...</p> : <ComplaintsTable complaints={data} />}
    </Card>
  );
}
