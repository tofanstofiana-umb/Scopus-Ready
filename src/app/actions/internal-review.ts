"use server";

import { revalidatePath } from "next/cache";
import { accessErrorResult } from "@/domain/errors/access-errors";
import {
  approveInternalReview,
  InternalReviewNotReadyError,
  WorksheetAccessError,
} from "@/services/worksheet.service";
import type { ActionResult } from "@/types/auth";
import { projectIdSchema } from "@/validation/project.schema";

export async function approveInternalReviewAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = projectIdSchema.safeParse(formData.get("projectId"));
  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Proyek tidak valid." };

  try {
    await approveInternalReview(parsed.data);
    revalidatePath(`/trainer/projects/${parsed.data}/internal_review`);
    revalidatePath(`/projects/${parsed.data}/workbook/internal_review`);
    revalidatePath("/dashboard");
    revalidatePath("/score");
    return { ok: true, message: "Internal Review disetujui. Reviewer Gate sekarang PASS." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    if (error instanceof InternalReviewNotReadyError) {
      return { ok: false, code: "VALIDATION", message: "Lengkapi seluruh jawaban dan selesaikan feedback terbuka terlebih dahulu." };
    }
    if (error instanceof WorksheetAccessError) {
      return { ok: false, code: "FORBIDDEN", message: "Anda tidak dapat menyetujui Internal Review proyek ini." };
    }
    console.error("internal review approval error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Internal Review belum dapat disetujui." };
  }
}
