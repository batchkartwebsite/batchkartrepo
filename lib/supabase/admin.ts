import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { serverEnv } from "@/config/env.server";
import type { Database } from "./database.types";

/** Bypasses RLS. Server-only. Use ONLY for auth.users-level operations. */
export function createAdminClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
