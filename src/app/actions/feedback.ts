"use server";

import { revalidatePath } from "next/cache";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { feedbackSchema, feedbackStatusSchema } from "@/validation/feedback.schema";
import {
  createFeedback,
  FeedbackAccessError,
  markFeedbackAddressed,
  resolveFeedback,
} from "@/services/feedback.service";
import type { ActionResult } from "@/types/auth";

export async function createFeedbackAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse({
    projectId: formData.get("projectId"),
    worksheetAnswerId: formData.get("worksheetAnswerId"),
    comment: formData.get("comment"),
    priority: formData.get("priority"),
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    await createFeedback(parsed.data);
    revalidatePath(`/trainer/projects/${parsed.data.projectId}/problem`);
    revalidatePath(`/projects/${parsed.data.projectId}/workbook/problem`);
    return { ok: true, message: "Feedback berhasil disimpan." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    if (error instanceof FeedbackAccessError) {
      return { ok: false, code: "FORBIDDEN", message: "Proyek atau worksheet tidak berada dalam kelas Anda." };
    }
    console.error("feedback creation error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Feedback belum dapat disimpan." };
  }
}

export async function markFeedbackAddressedAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = feedbackStatusSchema.safeParse({
    feedbackId: formData.get("feedbackId"),
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Permintaan feedback tidak valid." };
  try {
    await markFeedbackAddressed(parsed.data.feedbackId);
    revalidatePath(`/projects/${parsed.data.projectId}/workbook/problem`);
    return { ok: true, message: "Feedback ditandai sudah ditindaklanjuti." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("feedback addressed error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "FORBIDDEN", message: "Feedback tidak dapat diperbarui." };
  }
}

export async function resolveFeedbackAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = feedbackStatusSchema.safeParse({
    feedbackId: formData.get("feedbackId"),
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Permintaan feedback tidak valid." };
  try {
    await resolveFeedback(parsed.data.feedbackId);
    revalidatePath(`/trainer/projects/${parsed.data.projectId}/problem`);
    revalidatePath(`/projects/${parsed.data.projectId}/workbook/problem`);
    return { ok: true, message: "Feedback ditandai selesai." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("feedback resolve error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "FORBIDDEN", message: "Feedback tidak dapat diselesaikan." };
  }
}
