import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Unable to sign in." }, { status: 401 });
  }

  const AUTH_USER_ID_COLUMN: keyof Database["public"]["Tables"]["users"]["Row"] = "auth_user_id";
  const IS_ACTIVE_COLUMN: keyof Database["public"]["Tables"]["users"]["Row"] = "is_active";
  const authUserId = data.user.id;
  if (!authUserId) {
    return NextResponse.json({ error: "Unable to resolve user id." }, { status: 500 });
  }
  type AuthUserIdType = NonNullable<Database["public"]["Tables"]["users"]["Row"]["auth_user_id"]>;

  const { data: profile } = await (supabase.from("users") as any)
    .select("role")
    .eq(AUTH_USER_ID_COLUMN, authUserId as AuthUserIdType)
    .eq(IS_ACTIVE_COLUMN, true)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json(
      { error: "Your profile is not active. Please contact an administrator." },
      { status: 403 }
    );
  }

  const redirectTo = profile.role === "SERVICE_WORKER" ? "/worker" : "/admin";

  return NextResponse.json({ redirectTo });
}
