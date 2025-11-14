import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", data.user.id as string)
    .eq("is_active", true)
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
