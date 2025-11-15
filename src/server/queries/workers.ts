import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockComplaintsFeed } from "@/lib/mock-data";
import { ComplaintStatus } from "@/lib/types";

const ACTIVE_STATUSES: ComplaintStatus[] = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "MANAGEMENT_RESOLVED",
  "PENDING_TENANT_CONFIRMATION",
  "REOPENED",
];

type WorkerSummary = {
  id: string;
  name: string;
  type?: string | null;
  pendingJobs: number;
  resolved30d: number;
};

export async function getServiceWorkers(): Promise<WorkerSummary[]> {
  if (!isSupabaseConfigured()) {
    return [
      { id: "mock-worker-1", name: "Alex Rivera", type: "Electrician", pendingJobs: 3, resolved30d: 28 },
      { id: "mock-worker-2", name: "Mina Goose", type: "Housekeeping", pendingJobs: 1, resolved30d: 41 },
    ];
  }

  const supabase = createSupabaseAdminClient();
  type WorkerRow = {
    id: string;
    full_name: string | null;
    service_worker_type: string | null;
  };

  const { data: workers, error } = await supabase
    .from("users")
    .select("id, full_name, service_worker_type")
    .eq("role", "SERVICE_WORKER")
    .order("full_name");

  if (error || !workers?.length) {
    console.error("Failed to fetch workers", error);
    return [];
  }

  const workerRecords = workers as WorkerRow[];
  const workerIds = workerRecords.map((worker) => worker.id);
  type WorkloadRow = {
    worker_id: string;
    status: ComplaintStatus;
    created_at: string;
  };

  const { data: workload } = await supabase
    .from("worker_dashboard_view")
    .select("worker_id, status, created_at")
    .in("worker_id", workerIds);

  const stats = new Map<string, { pending: number; resolved: number }>();
  (workload as WorkloadRow[] | null)?.forEach((row) => {
    const current = stats.get(row.worker_id) ?? { pending: 0, resolved: 0 };
    if (ACTIVE_STATUSES.includes(row.status as ComplaintStatus)) {
      current.pending += 1;
    } else if (row.status === "CLOSED" || row.status === "REJECTED") {
      const created = Date.parse(row.created_at);
      if (Date.now() - created <= 1000 * 60 * 60 * 24 * 30) {
        current.resolved += 1;
      }
    }
    stats.set(row.worker_id, current);
  });

  return workerRecords.map((worker) => {
    const stat = stats.get(worker.id) ?? { pending: 0, resolved: 0 };
    return {
      id: worker.id,
      name: worker.full_name ?? "Unnamed worker",
      type: worker.service_worker_type,
      pendingJobs: stat.pending,
      resolved30d: stat.resolved,
    };
  });
}

export async function getWorkerDashboardPreview() {
  if (!isSupabaseConfigured()) {
    return {
      worker: { id: "mock-worker-1", name: "Alex Rivera" },
      complaints: mockComplaintsFeed.slice(0, 3).map((complaint) => ({
        id: complaint.id,
        status: complaint.status,
        buildingName: complaint.buildingName,
        unitNumber: complaint.unitNumber,
        categories: complaint.categories.map((c) => c.name),
        createdAt: complaint.createdAt,
      })),
      stats: {
        pending: 3,
        assignedToday: 2,
      },
    };
  }

  const supabase = createSupabaseAdminClient();
  type WorkerPreview = { id: string; full_name: string | null };
  const { data: worker } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("role", "SERVICE_WORKER")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!worker) {
    return null;
  }
  const workerRecord = worker as WorkerPreview;

  type AssignmentPreview = {
    complaint_id: string;
    status: ComplaintStatus;
    building_name: string;
    unit_number: string;
    categories: string[] | null;
    created_at: string;
  };

  const { data: assignments } = await supabase
    .from("worker_dashboard_view")
    .select("complaint_id, status, building_name, unit_number, categories, created_at")
    .eq("worker_id", workerRecord.id)
    .order("created_at", { ascending: false });

  const normalized = ((assignments ?? []) as AssignmentPreview[]).map((assignment) => ({
    id: assignment.complaint_id,
    status: assignment.status as ComplaintStatus,
    buildingName: assignment.building_name,
    unitNumber: assignment.unit_number,
    categories: assignment.categories ?? [],
    createdAt: assignment.created_at,
  }));

  const now = Date.now();
  const pending = normalized.filter((complaint) => ACTIVE_STATUSES.includes(complaint.status));
  const assignedToday = normalized.filter((complaint) => now - Date.parse(complaint.createdAt) < 1000 * 60 * 60 * 24);

  return {
    worker: { id: workerRecord.id, name: workerRecord.full_name ?? "Service Worker" },
    complaints: normalized,
    stats: {
      pending: pending.length,
      assignedToday: assignedToday.length,
    },
  };
}
