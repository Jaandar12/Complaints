import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { env, requireSupabaseEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  requireSupabaseEnv();
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
