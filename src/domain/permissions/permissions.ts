import type { UserRole } from "@/types/auth";

export const protectedRoutePrefixes = [
  "/dashboard",
  "/projects",
  "/workbook",
  "/score",
  "/review",
  "/trainer",
  "/admin",
  "/profile",
  "/manuscript",
  "/journals",
  "/action-plan",
  "/library",
  "/onboarding",
  "/join-class",
  "/classes",
] as const;

export function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePrefixes.some((prefix) => matchesRoutePrefix(pathname, prefix));
}

export function roleHomeRoute(role: UserRole): "/dashboard" | "/trainer" | "/admin" {
  if (role === "trainer") return "/trainer";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export function canAccessRoleRoute(role: UserRole, pathname: string): boolean {
  if (matchesRoutePrefix(pathname, "/admin")) return role === "admin";
  if (matchesRoutePrefix(pathname, "/trainer")) return role === "trainer" || role === "admin";
  if (matchesRoutePrefix(pathname, "/score") || matchesRoutePrefix(pathname, "/profile")) return true;
  if (matchesRoutePrefix(pathname, "/join-class")) return role === "participant";
  if (matchesRoutePrefix(pathname, "/library")) return role === "participant" || role === "trainer" || role === "admin";
  if (["/dashboard", "/projects", "/workbook", "/review", "/manuscript", "/journals", "/action-plan", "/onboarding", "/classes"].some((prefix) => matchesRoutePrefix(pathname, prefix))) {
    return role === "participant" || role === "admin";
  }
  return true;
}

export function canReadProject(input: {
  role: UserRole;
  userId: string;
  ownerId: string;
  trainerId?: string | null;
}): boolean {
  if (input.role === "admin") return true;
  if (input.role === "participant") return input.userId === input.ownerId;
  return input.role === "trainer" && input.userId === input.trainerId;
}
