import type { ActionResult } from "@/types/auth";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("AUTHENTICATION_REQUIRED");
    this.name = "AuthenticationRequiredError";
  }
}

export class PermissionDeniedError extends Error {
  constructor() {
    super("PERMISSION_DENIED");
    this.name = "PermissionDeniedError";
  }
}

export function accessErrorResult<T = undefined>(error: unknown): ActionResult<T> | null {
  if (error instanceof AuthenticationRequiredError) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
    };
  }

  if (error instanceof PermissionDeniedError) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "Akun Anda tidak memiliki hak akses untuk tindakan ini.",
    };
  }

  return null;
}
