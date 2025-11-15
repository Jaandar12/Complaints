import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

type BuildingSummary = {
  id: string;
  name: string;
  address: string;
  imageUrl?: string | null;
  unitCount: number;
  activeComplaints: number;
};

const ACTIVE_STATUSES = ["NEW", "ASSIGNED", "IN_PROGRESS", "MANAGEMENT_RESOLVED", "PENDING_TENANT_CONFIRMATION", "REOPENED"];

export async function getBuildingSummaries(): Promise<BuildingSummary[]> {
  if (!isSupabaseConfigured()) {
    return [
      { id: "mock-1", name: "Harbor View Tower", address: "123 Harbor Way", imageUrl: null, unitCount: 120, activeComplaints: 8 },
      { id: "mock-2", name: "Laguna Offices", address: "88 Bay Street", imageUrl: null, unitCount: 90, activeComplaints: 3 },
    ];
  }

  const supabase = createSupabaseAdminClient();
  type BuildingSelect = {
    id: string;
    name: string;
    address: string;
    image_url: string | null;
    units: { id: string }[];
    complaints: { status: string }[];
  };

  const { data, error } = await supabase
    .from("buildings")
    .select(`
      id,
      name,
      address,
      image_url,
      units:units(id),
      complaints:complaints(status)
    `);

  if (error) {
    console.error("Failed to fetch buildings", error);
    return [];
  }

  const records = (data ?? []) as BuildingSelect[];
  return records.map((building) => ({
    id: building.id,
    name: building.name,
    address: building.address,
    imageUrl: building.image_url,
    unitCount: building.units?.length ?? 0,
    activeComplaints: building.complaints?.filter((c) => ACTIVE_STATUSES.includes(c.status)).length ?? 0,
  }));
}
