export type UserRole = "participant" | "trainer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution: string | null;
  field_of_study: string | null;
  is_active: boolean;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  data?: T;
  message?: string;
  code?: "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT" | "DATABASE" | "CONFIGURATION" | "PAYMENT_REQUIRED";
  fieldErrors?: Record<string, string[]>;
}
