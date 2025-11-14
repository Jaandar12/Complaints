import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockUnit } from "@/lib/mock-data";
import { Complaint, ComplaintStatus, UnitSummary } from "@/lib/types";

const ACTIVE_STATUSES: ComplaintStatus[] = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "MANAGEMENT_RESOLVED",
  "PENDING_TENANT_CONFIRMATION",
  "REOPENED",
];

export async function getUnitByPublicId(unitPublicId: string): Promise<UnitSummary | null> {
  if (!isSupabaseConfigured()) {
    return unitPublicId === mockUnit.publicId ? mockUnit : null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: unitRow, error } = await supabase
    .from("units")
    .select(
      `
      id,
      unit_number,
      tenant_name,
      is_blocked,
      public_id,
      buildings:buildings(name, image_url),
      floors:floors(floor_number)
    `
    )
    .eq("public_id", unitPublicId)
    .single();

  if (error || !unitRow) {
    console.error("Failed to load unit", error);
    return null;
  }

  const { data: activeComplaint } = await supabase
    .from("complaints")
    .select(
      `
      id,
      status,
      description,
      tenant_name,
      created_at,
      updated_at,
      complaint_category_links (
        complaint_categories ( id, name )
      ),
      complaint_status_logs (
        new_status,
        old_status,
        note,
        changed_at
      )
    `
    )
    .eq("unit_id", unitRow.id)
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const complaint: Complaint | undefined = activeComplaint
    ? {
        id: activeComplaint.id,
        unitId: unitRow.id,
        buildingName: unitRow.buildings?.name ?? "",
        unitNumber: unitRow.unit_number,
        status: activeComplaint.status as ComplaintStatus,
        categories:
          activeComplaint.complaint_category_links?.map((link) => ({
            id: link.complaint_categories?.id ?? "",
            name: link.complaint_categories?.name ?? "",
          })) ?? [],
        description: activeComplaint.description ?? "",
        tenantName: activeComplaint.tenant_name ?? undefined,
        createdAt: activeComplaint.created_at,
        updatedAt: activeComplaint.updated_at,
        assignedWorkers: [],
        agingSeconds: Math.floor((Date.now() - Date.parse(activeComplaint.created_at)) / 1000),
        timeline:
          activeComplaint.complaint_status_logs
            ?.sort((a, b) => Date.parse(a.changed_at) - Date.parse(b.changed_at))
            .map((log) => ({
              status: (log.new_status as ComplaintStatus) ?? "NEW",
              changedAt: log.changed_at,
              note: log.note ?? undefined,
            })) ?? [],
      }
    : undefined;

  return {
    id: unitRow.id,
    publicId: unitRow.public_id,
    buildingName: unitRow.buildings?.name ?? "",
    floorNumber: unitRow.floors?.floor_number ?? 0,
    unitNumber: unitRow.unit_number,
    tenantName: unitRow.tenant_name ?? undefined,
    isBlocked: unitRow.is_blocked,
    imageUrl: unitRow.buildings?.image_url ?? null,
    activeComplaint: complaint ?? null,
    canSubmit: !unitRow.is_blocked && !complaint,
  };
}
