import { describe, expect, it } from "vitest";
import {
  accessErrorResult,
  AuthenticationRequiredError,
  PermissionDeniedError,
} from "@/domain/errors/access-errors";

describe("access error results", () => {
  it("returns an explicit session-expired response", () => {
    expect(accessErrorResult(new AuthenticationRequiredError())).toEqual({
      ok: false,
      code: "UNAUTHORIZED",
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
    });
  });

  it("separates forbidden access from unexpected failures", () => {
    expect(accessErrorResult(new PermissionDeniedError())?.code).toBe("FORBIDDEN");
    expect(accessErrorResult(new Error("database unavailable"))).toBeNull();
  });
});
