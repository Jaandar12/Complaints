import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/lib/types/database";

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

  type UnitLookup = {
    id: string;
    building_id: string;
    is_blocked: boolean;
  };

  const { data: unit, error: unitError } = await supabase
    .from("units")
    .select("id, building_id, is_blocked")
    .eq("public_id", payload.data.unitPublicId)
    .single<UnitLookup>();

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

  type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];
  const complaintPayload: ComplaintInsert = {
    unit_id: unit.id,
    building_id: unit.building_id,
    tenant_name: payload.data.tenantName,
    tenant_contact: { contact: payload.data.tenantContact },
    description: payload.data.description,
    status: "NEW",
  };

  // @ts-ignore -- Supabase type inference fails for typed insert payloads
  const { data: complaint, error: insertError } = await supabase
    .from("complaints")
    // @ts-ignore -- Supabase typing bug for typed inserts
    .insert<ComplaintInsert>(complaintPayload)
    .select("id")
    .single();

  if (insertError || !complaint) {
    console.error(insertError);
    return NextResponse.json({ error: "Failed to create complaint." }, { status: 500 });
  }

  type ComplaintRow = { id: string };
  const complaintRow = complaint as ComplaintRow;

  type ComplaintCategoryLinkInsert = Database["public"]["Tables"]["complaint_category_links"]["Insert"];
  const categoryLinkPayload: ComplaintCategoryLinkInsert[] = payload.data.categories.map((categoryId) => ({
    complaint_id: complaintRow.id,
    category_id: categoryId,
  }));

  await supabase
    .from("complaint_category_links")
    // @ts-ignore -- Supabase typing bug for typed inserts
    .insert<ComplaintCategoryLinkInsert>(categoryLinkPayload);

  type ComplaintStatusLogInsert = Database["public"]["Tables"]["complaint_status_logs"]["Insert"];
  const statusLogPayload: ComplaintStatusLogInsert = {
    complaint_id: complaintRow.id,
    new_status: "NEW",
    note: "Tenant submitted complaint.",
  };

  await supabase
    .from("complaint_status_logs")
    // @ts-ignore -- Supabase typing bug for typed inserts
    .insert<ComplaintStatusLogInsert>([statusLogPayload]);

  return NextResponse.json({ id: complaintRow.id });
}
