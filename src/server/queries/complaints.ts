import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockComplaint, mockComplaintsFeed } from "@/lib/mock-data";
import { ComplaintStatus } from "@/lib/types";

type DashboardMetrics = {
  newComplaints: number;
  averageResolutionHours: number;
  blockedUnits: number;
  reopenRate: number;
};

export async function getAdminDashboardMetrics(): Promise<DashboardMetrics> {
  if (!isSupabaseConfigured()) {
    const pending = mockComplaintsFeed.filter((c) => c.status === "NEW").length;
    return {
      newComplaints: pending,
      averageResolutionHours: 8.4,
      blockedUnits: 0,
      reopenRate: 0.04,
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("admin_dashboard_metrics");

  if (error) {
    console.error("admin_dashboard_metrics error", error);
    return { newComplaints: 0, averageResolutionHours: 0, blockedUnits: 0, reopenRate: 0 };
  }

  return {
    newComplaints: Number(data?.newComplaints ?? 0),
    averageResolutionHours: Number(data?.averageResolutionHours ?? 0),
    blockedUnits: Number(data?.blockedUnits ?? 0),
    reopenRate: Number(data?.reopenRate ?? 0),
  };
}

export type ComplaintDetail = {
  id: string;
  status: ComplaintStatus;
  buildingName: string;
  unitNumber: string;
  tenantName?: string;
  floorNumber?: number;
  description: string | null;
  categories: string[];
  assignments: Array<{ workerName: string; assignedAt: string }>;
  timeline: Array<{ status: ComplaintStatus; changedAt: string; note?: string; actor?: string }>;
  reportedAt: string;
};

export async function getComplaintDetail(complaintId: string): Promise<ComplaintDetail | null> {
  if (!isSupabaseConfigured()) {
    return complaintId === mockComplaint.id
      ? {
          id: mockComplaint.id,
          status: mockComplaint.status,
          buildingName: mockComplaint.buildingName,
          unitNumber: mockComplaint.unitNumber,
          tenantName: mockComplaint.tenantName,
          description: mockComplaint.description,
          categories: mockComplaint.categories.map((c) => c.name),
          assignments: mockComplaint.assignedWorkers.map((worker) => ({
            workerName: worker,
            assignedAt: new Date().toISOString(),
          })),
          timeline: mockComplaint.timeline.map((t) => ({
            status: t.status,
            changedAt: t.changedAt,
            note: t.note,
            actor: t.changedBy,
          })),
          reportedAt: mockComplaint.timeline[0]?.changedAt ?? mockComplaint.createdAt,
        }
      : null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: complaint, error } = await supabase.from("complaints").select("*").eq("id", complaintId).single();
  if (error || !complaint) {
    console.error("Failed to fetch complaint detail", error);
    return null;
  }

  const [{ data: unit }, { data: categories }, { data: assignments }, { data: statusLogs }] = await Promise.all([
    supabase
      .from("units")
      .select("unit_number, tenant_name, floors(floor_number), buildings(name)")
      .eq("id", complaint.unit_id)
      .single(),
    supabase
      .from("complaint_category_links")
      .select("complaint_categories ( name )")
      .eq("complaint_id", complaintId),
    supabase
      .from("complaint_assignments")
      .select("assigned_at, users:users!complaint_assignments_worker_id_fkey(full_name)")
      .eq("complaint_id", complaintId),
    supabase
      .from("complaint_status_logs")
      .select("new_status, changed_at, note, users:users!complaint_status_logs_changed_by_fkey(full_name)")
      .eq("complaint_id", complaintId)
      .order("changed_at", { ascending: true }),
  ]);

  const timeline =
    statusLogs?.map((log) => ({
      status: (log.new_status as ComplaintStatus) ?? "NEW",
      changedAt: log.changed_at,
      note: log.note ?? undefined,
      actor: log.users?.full_name ?? undefined,
    })) ?? [];

  return {
    id: complaint.id,
    status: complaint.status as ComplaintStatus,
    buildingName: unit?.buildings?.name ?? "",
    unitNumber: unit?.unit_number ?? "",
    tenantName: complaint.tenant_name ?? undefined,
    floorNumber: unit?.floors?.floor_number ?? undefined,
    description: complaint.description,
    categories: categories?.map((c) => c.complaint_categories?.name ?? "").filter(Boolean) ?? [],
    assignments:
      assignments?.map((assignment) => ({
        workerName: assignment.users?.full_name ?? "Unassigned",
        assignedAt: assignment.assigned_at,
      })) ?? [],
    timeline,
    reportedAt: timeline[0]?.changedAt ?? complaint.created_at,
  };
}
