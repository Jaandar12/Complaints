import { complaintStatusLabels, ComplaintStatus, ComplaintOverviewRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Table, THead, Th, TBody, Td } from "@/components/ui/table";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";

export function ComplaintsTable({ complaints }: { complaints: ComplaintOverviewRow[] }) {
  return (
    <Table>
      <THead>
        <tr>
          <Th>ID</Th>
          <Th>Building • Unit</Th>
          <Th>Status</Th>
          <Th>Categories</Th>
          <Th>Assigned</Th>
          <Th align="right">Aging</Th>
        </tr>
      </THead>
      <TBody>
        {complaints.map((complaint) => (
          <tr key={complaint.id}>
            <Td>
              <Link href={`/admin/complaints/${complaint.id}`} className="font-medium text-blue-600 hover:underline">
                {complaint.id}
              </Link>
            </Td>
            <Td>
              <div>
                <p className="font-medium text-slate-900">{complaint.building_name}</p>
                <p className="text-sm text-slate-500">Unit {complaint.unit_number}</p>
              </div>
            </Td>
            <Td>
              <Badge
                label={complaintStatusLabels[complaint.status as ComplaintStatus]}
                variant={complaint.status as ComplaintStatus}
              />
            </Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                {complaint.categories.map((category) => (
                  <span key={`${complaint.id}-${category}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {category}
                  </span>
                ))}
              </div>
            </Td>
            <Td>{complaint.worker_names.length ? complaint.worker_names.join(", ") : "Unassigned"}</Td>
            <Td align="right" className="font-mono text-sm text-slate-900">
              {formatDuration(Number(complaint.aging_seconds ?? 0))}
            </Td>
          </tr>
        ))}
      </TBody>
    </Table>
  );
}
