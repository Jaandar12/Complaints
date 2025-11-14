import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

const bodySchema = z.object({
  unitPublicId: z.string().uuid(),
  tenantName: z.string().min(2),
  tenantContact: z.string().min(5),
  description: z.string().min(10),
  categories: z.array(z.string().uuid()).min(1),
});

const ACTIVE_STATUSES = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "MANAGEMENT_RESOLVED",
  "PENDING_TENANT_CONFIRMATION",
  "REOPENED",
];

export async function POST(request: Request) {
  const payload = bodySchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, message: "Complaint accepted in mock mode." });
  }

  const supabase = createSupabaseAdminClient();

  const { data: unit, error: unitError } = await supabase
    .from("units")
    .select("id, building_id, is_blocked")
    .eq("public_id", payload.data.unitPublicId)
    .single();

  if (unitError || !unit) {
    return NextResponse.json({ error: "Unit not found." }, { status: 404 });
  }

  if (unit.is_blocked) {
    return NextResponse.json({ error: "Complaints for this unit are temporarily blocked." }, { status: 403 });
  }

  const { data: activeComplaint } = await supabase
    .from("complaints")
    .select("id")
    .eq("unit_id", unit.id)
    .in("status", ACTIVE_STATUSES)
    .maybeSingle();

  if (activeComplaint) {
    return NextResponse.json({ error: "There is already an active complaint for this unit." }, { status: 409 });
  }

  const { data: complaint, error: insertError } = await supabase
    .from("complaints")
    .insert({
      unit_id: unit.id,
      building_id: unit.building_id,
      tenant_name: payload.data.tenantName,
      tenant_contact: { contact: payload.data.tenantContact },
      description: payload.data.description,
      status: "NEW",
    })
    .select("id")
    .single();

  if (insertError || !complaint) {
    console.error(insertError);
    return NextResponse.json({ error: "Failed to create complaint." }, { status: 500 });
  }

  await supabase.from("complaint_category_links").insert(
    payload.data.categories.map((categoryId) => ({
      complaint_id: complaint.id,
      category_id: categoryId,
    }))
  );

  await supabase.from("complaint_status_logs").insert({
    complaint_id: complaint.id,
    new_status: "NEW",
    note: "Tenant submitted complaint.",
  });

  return NextResponse.json({ id: complaint.id });
}
