import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, SupabaseConfigurationError } from "./config";

/**
 * Service-role client that bypasses RLS. Only ever call this from trusted
 * server code that has already established WHO is asking and WHY (the
 * Midtrans webhook, or a server action that has already run
 * `requireIdentity`) — never from anything reachable with an arbitrary
 * caller-supplied identity.
 */
export function createSupabaseAdminClient() {
  const { url, configured } = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!configured || !url || !serviceRoleKey) throw new SupabaseConfigurationError();

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
