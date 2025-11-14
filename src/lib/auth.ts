import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: user.email ?? "",
    role: profile.role as UserRole,
    fullName: profile.full_name,
  };
}

export async function requireRole(allowedRoles: UserRole[], redirectTo?: string): Promise<SessionUser> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo ?? "/")}`);
  }
  if (!allowedRoles.includes(sessionUser.role)) {
    redirect("/login");
  }
  return sessionUser;
}
