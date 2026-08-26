"use server";

import { revalidatePath } from "next/cache";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { SCOPUS_READY_RUBRIC } from "@/domain/scoring/score";
import { saveProjectAssessments } from "@/services/assessment.service";
import type { ActionResult } from "@/types/auth";
import { assessmentBatchSchema } from "@/validation/assessment.schema";

export async function saveProjectAssessmentsAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const assessments = SCOPUS_READY_RUBRIC.flatMap((rubric) => {
    const rawScore = formData.get(`score_${rubric.dimension}`);
    if (rawScore === null || String(rawScore).trim() === "") return [];
    return [{
      dimension: rubric.dimension,
      score: Number(rawScore),
      notes: String(formData.get(`notes_${rubric.dimension}`) ?? ""),
    }];
  });
  const parsed = assessmentBatchSchema.safeParse({
    projectId: formData.get("projectId"),
    worksheetAnswerId: formData.get("worksheetAnswerId"),
    assessments,
  });
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION", message: parsed.error.issues[0]?.message ?? "Penilaian tidak valid." };
  }

  try {
    await saveProjectAssessments(parsed.data);
    revalidatePath(`/trainer/projects/${parsed.data.projectId}/problem`);
    revalidatePath(`/score`);
    revalidatePath(`/dashboard`);
    revalidatePath(`/manuscript`);
    return { ok: true, message: `${parsed.data.assessments.length} dimensi penilaian berhasil disimpan.` };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("assessment save error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Penilaian belum dapat disimpan. Periksa akses dan coba lagi." };
  }
}
