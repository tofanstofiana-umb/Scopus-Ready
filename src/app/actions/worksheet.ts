"use server";

import { saveProblemBuilderSchema } from "@/validation/problem-builder.schema";
import {
  saveProblemWorksheet,
  WorksheetAccessError,
  WorksheetConflictError,
} from "@/services/worksheet.service";
import type { ActionResult } from "@/types/auth";
import type { ProblemBuilderContent, WorksheetStatus } from "@/types/worksheet";

export async function saveProblemBuilderAction(input: {
  projectId: string;
  content: ProblemBuilderContent;
  lastKnownUpdatedAt?: string | null;
}): Promise<ActionResult<{ updatedAt: string; completionPercent: number; status: WorksheetStatus }>> {
  const parsed = saveProblemBuilderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    const answer = await saveProblemWorksheet(parsed.data);
    return { ok: true, data: { updatedAt: answer.updated_at, completionPercent: answer.completion_percent, status: answer.status } };
  } catch (error) {
    if (error instanceof WorksheetConflictError) {
      return { ok: false, code: "CONFLICT", message: "Data berubah di perangkat atau sesi lain. Muat ulang sebelum melanjutkan." };
    }
    if (error instanceof WorksheetAccessError) {
      return { ok: false, code: "FORBIDDEN", message: "Anda tidak memiliki akses untuk mengubah worksheet proyek ini." };
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") return { ok: false, code: "UNAUTHORIZED", message: "Sesi Anda telah berakhir. Silakan login kembali." };
    console.error("worksheet save failure", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Terjadi masalah saat menyimpan data. Silakan coba lagi." };
  }
}
