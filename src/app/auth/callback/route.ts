import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Landing point for Supabase auth email links (currently: password
 * recovery), then hands off to `next` — the page that does the actual
 * follow-up (e.g. set new password).
 *
 * Handles two link shapes because Supabase's *default* email templates
 * don't send the PKCE `?code=` this route originally assumed — they send
 * `?token_hash=...&type=...` (verified here via verifyOtp), or in older/
 * hash-based configurations put the token in a URL *fragment*
 * (`#access_token=...`) that never reaches a server route at all. If a
 * reset link keeps landing here with neither param, the fix is in the
 * Supabase dashboard, not this file — see README "Pembayaran" section's
 * neighbor, the password-recovery note, for the exact email template to set.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  try {
    const supabase = await createSupabaseServerClient();
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  } catch (error) {
    console.error("auth callback exchange failure", error instanceof Error ? error.message : "unknown");
  }

  const target = new URL("/login", origin);
  target.searchParams.set("error", "reset_link_invalid");
  return NextResponse.redirect(target);
}
