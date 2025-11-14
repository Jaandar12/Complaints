import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockCategories } from "@/lib/mock-data";
import type { ComplaintCategory } from "@/lib/types";

export async function getActiveCategories(): Promise<ComplaintCategory[]> {
  if (!isSupabaseConfigured()) {
    return mockCategories;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("complaint_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Failed to load categories", error);
    return [];
  }

  return data ?? [];
}

export async function getAllCategories() {
  if (!isSupabaseConfigured()) {
    return mockCategories.map((category) => ({ ...category, category_group: "General", is_active: true }));
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("complaint_categories")
    .select("id, name, category_group, is_active")
    .order("name");

  if (error) {
    console.error("Failed to load categories", error);
    return [];
  }

  return data ?? [];
}
