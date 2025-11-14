import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockComplaintsFeed } from "@/lib/mock-data";
import type { ComplaintOverviewRow } from "@/lib/types";

export async function getComplaintsPreview(limit = 5): Promise<ComplaintOverviewRow[]> {
  if (!isSupabaseConfigured()) {
    return mockComplaintsFeed.slice(0, limit).map((complaint) => ({
      id: complaint.id,
      building_name: complaint.buildingName,
      unit_number: complaint.unitNumber,
      status: complaint.status,
      categories: complaint.categories.map((c) => c.name),
      worker_names: complaint.assignedWorkers,
      aging_seconds: complaint.agingSeconds,
    }));
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("complaint_overview")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch complaint preview", error);
    return [];
  }

  return data ?? [];
}
