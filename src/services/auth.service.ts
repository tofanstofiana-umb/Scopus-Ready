import "server-only";

import { cache } from "react";
import {
  AuthenticationRequiredError,
  PermissionDeniedError,
} from "@/domain/errors/access-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/auth";

export const getCurrentIdentity = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,institution,field_of_study,is_active")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) return null;
  // A deactivated account is treated as not logged in everywhere — every
  // protected page/action resolves identity through this one function, so
  // this is the single place that needs to enforce it.
  if (!profile.is_active) return null;
  return { user: data.user, profile: profile as Profile };
});

export async function requireIdentity(roles?: UserRole[]) {
  const identity = await getCurrentIdentity();
  if (!identity) throw new AuthenticationRequiredError();
  if (roles && !roles.includes(identity.profile.role)) throw new PermissionDeniedError();
  return identity;
}
