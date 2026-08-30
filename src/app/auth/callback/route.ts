import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing point for Supabase auth email links (currently: password
 * recovery). Exchanges the PKCE `code` for a session, then hands off to
 * `next` — the page that does the actual follow-up (e.g. set new password).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    } catch (error) {
      console.error("auth callback exchange failure", error instanceof Error ? error.message : "unknown");
    }
  }

  const target = new URL("/login", origin);
  target.searchParams.set("error", "reset_link_invalid");
  return NextResponse.redirect(target);
}
