"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { createClassSchema, updateClassSchema } from "@/validation/class.schema";
import { createClass, updateClass, ClassCodeConflictError } from "@/services/class.service";
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

export async function updateClassAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = updateClassSchema.safeParse({
    classId: formData.get("classId"),
    name: formData.get("name"),
    trainerId: formData.get("trainerId") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    price: formData.get("price") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await updateClass(parsed.data);
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("class update error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Kelas belum dapat diperbarui. Silakan coba lagi." };
  }
  revalidatePath("/admin");
  return { ok: true, message: "Kelas berhasil diperbarui." };
}
