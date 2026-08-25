"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig, SupabaseConfigurationError } from "./config";

export function createSupabaseBrowserClient() {
  const { url, anonKey, configured } = getSupabaseConfig();
  if (!configured || !url || !anonKey) throw new SupabaseConfigurationError();
  return createBrowserClient(url, anonKey);
}
