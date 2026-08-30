import type { ClassEnrollmentStatus } from "@/types/payment";

/** Whether an enrollment is clear to create/save new content: free classes and paid enrollments pass; unpaid or unknown does not. */
export function isEnrollmentClearToWrite(status: ClassEnrollmentStatus | null): boolean {
  return status === "free" || status === "paid";
}
