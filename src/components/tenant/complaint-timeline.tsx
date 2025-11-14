import { Complaint } from "@/lib/types";
import { format } from "date-fns";

export function ComplaintTimeline({ complaint }: { complaint: Complaint }) {
  return (
    <ol className="space-y-4">
      {complaint.timeline.map((item) => (
        <li key={item.changedAt} className="relative pl-6">
          <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-blue-500" />
          <p className="text-sm font-semibold text-slate-900">{item.status.replaceAll("_", " ")}</p>
          <p className="text-xs text-slate-500">{format(new Date(item.changedAt), "PPpp")}</p>
          {item.note && <p className="text-sm text-slate-700">{item.note}</p>}
        </li>
      ))}
    </ol>
  );
}
