import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "../types/database";
import { env } from "@/lib/env";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name, options) {
        cookieStore.delete({ name, ...options });
      },
    },
    headers,
  });
}
