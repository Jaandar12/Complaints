import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockComplaint, mockComplaintsFeed } from "@/lib/mock-data";
import { ComplaintStatus } from "@/lib/types";
import type { Database } from "@/lib/types/database";

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

  const metrics = (data ?? {}) as Record<string, number>;

  return {
    newComplaints: Number(metrics.newComplaints ?? 0),
    averageResolutionHours: Number(metrics.averageResolutionHours ?? 0),
    blockedUnits: Number(metrics.blockedUnits ?? 0),
    reopenRate: Number(metrics.reopenRate ?? 0),
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
  type ComplaintRow = Database["public"]["Tables"]["complaints"]["Row"];
  const complaintRecord = complaint as ComplaintRow;

  type UnitDetail = {
    unit_number: string;
    tenant_name: string | null;
    floors: { floor_number: number | null } | null;
    buildings: { name: string | null } | null;
  };

  const [{ data: unit }, { data: categories }, { data: assignments }, { data: statusLogs }] = await Promise.all([
    supabase
      .from("units")
      .select("unit_number, tenant_name, floors(floor_number), buildings(name)")
      .eq("id", complaintRecord.unit_id)
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

  type StatusLogRow = {
    new_status: ComplaintStatus | null;
    changed_at: string;
    note: string | null;
    users: { full_name: string | null } | null;
  };
  const timeline =
    (statusLogs as StatusLogRow[] | null)?.map((log) => ({
      status: log.new_status ?? "NEW",
      changedAt: log.changed_at,
      note: log.note ?? undefined,
      actor: log.users?.full_name ?? undefined,
    })) ?? [];

  const unitRecord = (unit ?? null) as UnitDetail | null;

  type CategoryRow = { complaint_categories: { name: string | null } | null };
  type AssignmentRow = { assigned_at: string; users: { full_name: string | null } | null };

  return {
    id: complaintRecord.id,
    status: complaintRecord.status as ComplaintStatus,
    buildingName: unitRecord?.buildings?.name ?? "",
    unitNumber: unitRecord?.unit_number ?? "",
    tenantName: complaintRecord.tenant_name ?? undefined,
    floorNumber: unitRecord?.floors?.floor_number ?? undefined,
    description: complaintRecord.description,
    categories: (categories as CategoryRow[] | null)?.map((c) => c.complaint_categories?.name ?? "").filter(Boolean) ?? [],
    assignments:
      (assignments as AssignmentRow[] | null)?.map((assignment) => ({
        workerName: assignment.users?.full_name ?? "Unassigned",
        assignedAt: assignment.assigned_at,
      })) ?? [],
    timeline,
    reportedAt: timeline[0]?.changedAt ?? complaintRecord.created_at,
  };
}
