import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig, SupabaseConfigurationError } from "./config";

export async function createSupabaseServerClient() {
  const { url, anonKey, configured } = getSupabaseConfig();
  if (!configured || !url || !anonKey) throw new SupabaseConfigurationError();

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. proxy.ts refreshes sessions.
        }
      },
    },
  });
}
