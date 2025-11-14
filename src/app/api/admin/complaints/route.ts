import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockComplaintsFeed } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const statusFilters = url.searchParams.getAll("status");

  if (!isSupabaseConfigured()) {
    const filtered = statusFilters.length
      ? mockComplaintsFeed.filter((complaint) => statusFilters.includes(complaint.status))
      : mockComplaintsFeed;
    return NextResponse.json(
      filtered.map((complaint) => ({
        id: complaint.id,
        building_name: complaint.buildingName,
        unit_number: complaint.unitNumber,
        status: complaint.status,
        categories: complaint.categories.map((c) => c.name),
        worker_names: complaint.assignedWorkers,
        aging_seconds: complaint.agingSeconds,
      }))
    );
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase.from("complaint_overview").select("*").order("created_at", { ascending: false }).limit(100);

  if (statusFilters.length) {
    query = query.in("status", statusFilters);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load complaints", error);
    return NextResponse.json({ error: "Failed to load complaints." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
