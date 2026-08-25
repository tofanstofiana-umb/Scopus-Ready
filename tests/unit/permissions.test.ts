import { describe, expect, it } from "vitest";
import { canAccessRoleRoute, canReadProject, roleHomeRoute } from "@/domain/permissions/permissions";

describe("role permissions", () => {
  it("prevents participants from opening trainer and admin routes", () => {
    expect(canAccessRoleRoute("participant", "/trainer")).toBe(false);
    expect(canAccessRoleRoute("participant", "/admin")).toBe(false);
    expect(canAccessRoleRoute("participant", "/projects")).toBe(true);
  });

  it("routes every role to its own dashboard", () => {
    expect(roleHomeRoute("participant")).toBe("/dashboard");
    expect(roleHomeRoute("trainer")).toBe("/trainer");
    expect(roleHomeRoute("admin")).toBe("/admin");
  });

  it("keeps trainer and admin route scopes separate", () => {
    expect(canAccessRoleRoute("trainer", "/trainer")).toBe(true);
    expect(canAccessRoleRoute("trainer", "/score")).toBe(true);
    expect(canAccessRoleRoute("trainer", "/dashboard")).toBe(false);
    expect(canAccessRoleRoute("trainer", "/admin")).toBe(false);
    expect(canAccessRoleRoute("admin", "/trainer")).toBe(true);
    expect(canAccessRoleRoute("admin", "/admin")).toBe(true);
  });

  it("prevents a participant from reading another participant project", () => {
    expect(canReadProject({ role: "participant", userId: "a", ownerId: "b" })).toBe(false);
    expect(canReadProject({ role: "participant", userId: "a", ownerId: "a" })).toBe(true);
  });

  it("only permits the assigned trainer", () => {
    expect(canReadProject({ role: "trainer", userId: "trainer-a", ownerId: "p", trainerId: "trainer-a" })).toBe(true);
    expect(canReadProject({ role: "trainer", userId: "trainer-b", ownerId: "p", trainerId: "trainer-a" })).toBe(false);
  });
});
