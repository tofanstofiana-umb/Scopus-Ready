import "server-only";

import { redirect } from "next/navigation";
import { getCurrentIdentity } from "./auth.service";
import type { UserRole } from "@/types/auth";

export async function requirePageIdentity(roles?: UserRole[]) {
  const identity = await getCurrentIdentity();

  if (!identity) redirect("/login?error=session_expired");
  if (roles && !roles.includes(identity.profile.role)) redirect("/unauthorized");

  return identity;
}
