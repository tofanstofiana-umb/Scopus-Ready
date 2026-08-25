import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/validation/auth.schema";

describe("authentication validation", () => {
  it("accepts valid login credentials", () => {
    expect(
      loginSchema.safeParse({
        email: "peserta@scopusready.test",
        password: "Participant123!",
      }).success,
    ).toBe(true);
  });

  it("rejects malformed email and short passwords", () => {
    expect(loginSchema.safeParse({ email: "bukan-email", password: "123" }).success).toBe(false);
  });

  it("never accepts a public role during registration", () => {
    const parsed = registerSchema.parse({
      fullName: "Peserta Baru",
      email: "baru@scopusready.test",
      password: "Password123!",
      role: "admin",
    });

    expect("role" in parsed).toBe(false);
  });
});
