import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessRoleRoute, isProtectedRoute } from "@/domain/permissions/permissions";
import { getSupabaseConfig } from "./config";
import type { UserRole } from "@/types/auth";

export async function updateSession(request: NextRequest) {
  const { url, anonKey, configured } = getSupabaseConfig();
  const isProtected = isProtectedRoute(request.nextUrl.pathname);

  if (!configured || !url || !anonKey) {
    if (!isProtected) return NextResponse.next({ request });

    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.searchParams.set("next", request.nextUrl.pathname);
    target.searchParams.set("error", "configuration");
    return NextResponse.redirect(target);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId && isProtected) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(target);
  }

  if (userId && isProtected) {
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (profileError || !profile?.role) {
      const target = request.nextUrl.clone();
      target.pathname = "/unauthorized";
      target.search = "";
      return NextResponse.redirect(target);
    }
    const role = profile?.role as UserRole | undefined;
    if (role && !canAccessRoleRoute(role, request.nextUrl.pathname)) {
      const target = request.nextUrl.clone();
      target.pathname = "/unauthorized";
      target.search = "";
      return NextResponse.redirect(target);
    }
  }

  return response;
}
