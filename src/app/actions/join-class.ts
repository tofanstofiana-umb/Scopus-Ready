"use server";

import { revalidatePath } from "next/cache";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { InvalidClassCodeError, joinClassByCode } from "@/services/class.service";
import { joinClassSchema } from "@/validation/class.schema";
import type { ActionResult } from "@/types/auth";

export async function joinClassAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = joinClassSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await joinClassByCode(parsed.data.code);
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    if (error instanceof InvalidClassCodeError) {
      return { ok: false, code: "VALIDATION", message: error.message };
    }
    console.error("join class error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Kelas belum dapat digabungkan. Silakan coba lagi." };
  }
  revalidatePath("/dashboard");
  return { ok: true, message: "Berhasil bergabung ke kelas." };
}
