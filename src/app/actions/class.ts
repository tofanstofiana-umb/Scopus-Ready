"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { createClassSchema } from "@/validation/class.schema";
import { createClass, ClassCodeConflictError } from "@/services/class.service";
import type { ActionResult } from "@/types/auth";

export async function createClassAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = createClassSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    trainerId: formData.get("trainerId") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    price: formData.get("price") || undefined,
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await createClass(parsed.data);
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    if (error instanceof ClassCodeConflictError) {
      return { ok: false, code: "CONFLICT", message: error.message };
    }
    console.error("class creation error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Kelas belum dapat dibuat. Silakan coba lagi." };
  }
  revalidatePath("/admin");
  redirect("/admin#classes");
}
