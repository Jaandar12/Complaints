import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "../types/database";
import { env } from "@/lib/env";

export function createSupabaseServerClient() {
  const getCookieStore = cookies as unknown as () => Awaited<ReturnType<typeof cookies>>;
  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name) {
        return getCookieStore().get(name)?.value;
      },
      set(name, value, options) {
        getCookieStore().set({ name, value, ...options });
      },
      remove(name, options) {
        getCookieStore().delete({ name, ...options });
      },
    },
  });
}
