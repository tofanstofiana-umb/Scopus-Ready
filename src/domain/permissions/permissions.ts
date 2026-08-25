import type { UserRole } from "@/types/auth";

export function roleHomeRoute(role: UserRole): "/dashboard" | "/trainer" | "/admin" {
  if (role === "trainer") return "/trainer";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export function canAccessRoleRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/trainer")) return role === "trainer" || role === "admin";
  if (pathname.startsWith("/score")) return true;
  if (["/dashboard", "/projects", "/workbook", "/review", "/manuscript", "/journals", "/action-plan", "/library"].some((prefix) => pathname.startsWith(prefix))) {
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
