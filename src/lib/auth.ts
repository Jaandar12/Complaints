import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/lib/types/database";

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string | null;
};

const MOCK_USER: SessionUser = {
  id: "mock-user",
  email: "demo@placeholder.com",
  role: "SUPER_ADMIN",
  fullName: "Demo Admin",
};

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_USER;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const usersTable = supabase.from("users");
  const { data: profile } = await usersTable
    .select("id, full_name, role")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  type ProfileRow = Database["public"]["Tables"]["users"]["Row"];
  const profileRow = profile as ProfileRow;

  return {
    id: profileRow.id,
    email: user.email ?? "",
    role: profileRow.role as UserRole,
    fullName: profileRow.full_name,
  };
}

export async function requireRole(allowedRoles: UserRole[], redirectTo?: string): Promise<SessionUser> {
  if (!isSupabaseConfigured()) {
    return { ...MOCK_USER, role: allowedRoles[0] };
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo ?? "/")}`);
  }
  if (!allowedRoles.includes(sessionUser.role)) {
    redirect("/login");
  }
  return sessionUser;
}
