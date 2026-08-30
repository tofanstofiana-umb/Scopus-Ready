import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { EmailOtpType } from "@supabase/supabase-js";

// GET route handlers are cacheable by default in Next.js — this alone
// wasn't the fix, but it's still correct to keep.
export const dynamic = "force-dynamic";

/**
 * Landing point for Supabase auth email links (currently: password
 * recovery), then hands off to `next` — the page that does the actual
 * follow-up (e.g. set new password).
 *
 * Cookies are set directly on the `NextResponse` this handler returns,
 * mirroring src/lib/supabase/proxy.ts's middleware (the one place in this
 * app already proven to set auth cookies correctly in production) —
 * instead of relying on next/headers' `cookies().set()` implicitly
 * attaching to whatever response gets returned, which is the part that
 * silently failed to deliver the session cookie once deployed on Netlify
 * even though the token verification itself succeeded server-side.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const { url, anonKey, configured } = getSupabaseConfig();
  if (!configured || !url || !anonKey) {
    return NextResponse.redirect(new URL("/login?error=configuration", origin));
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  try {
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return response;
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return response;
    }
  } catch (error) {
    console.error("auth callback exchange failure", error instanceof Error ? error.message : "unknown");
  }

  const target = new URL("/login", origin);
  target.searchParams.set("error", "reset_link_invalid");
  return NextResponse.redirect(target);
}
