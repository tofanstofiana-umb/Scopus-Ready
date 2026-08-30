"use server";

import { revalidatePath } from "next/cache";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { PaymentRequiredError } from "@/domain/errors/payment-errors";
import {
  deleteJournalTarget,
  DuplicateJournalTargetError,
  JournalTargetAccessError,
  saveJournalTarget,
} from "@/services/journal.service";
import type { ActionResult } from "@/types/auth";
import { deleteJournalTargetSchema, journalTargetSchema } from "@/validation/journal.schema";

export async function saveJournalTargetAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = journalTargetSchema.safeParse({
    id: formData.get("id") || undefined,
    projectId: formData.get("projectId"),
    journalName: formData.get("journalName"),
    publisher: formData.get("publisher"),
    websiteUrl: formData.get("websiteUrl"),
    quartile: formData.get("quartile"),
    scopeMatch: formData.get("scopeMatch"),
    articleTypeMatch: formData.get("articleTypeMatch"),
    audienceMatch: formData.get("audienceMatch"),
    requirementsMatch: formData.get("requirementsMatch"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    await saveJournalTarget(parsed.data);
    revalidatePath("/journals");
    revalidatePath("/manuscript");
    return { ok: true, message: parsed.data.id ? "Target jurnal diperbarui." : "Target jurnal ditambahkan." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    if (error instanceof PaymentRequiredError) {
      return { ok: false, code: "PAYMENT_REQUIRED", message: "Kelas ini belum lunas. Selesaikan pembayaran untuk menyimpan target jurnal." };
    }
    if (error instanceof DuplicateJournalTargetError) {
      return { ok: false, code: "VALIDATION", message: "Jurnal tersebut sudah ada pada proyek ini." };
    }
    if (error instanceof JournalTargetAccessError) {
      return { ok: false, code: "FORBIDDEN", message: "Anda tidak dapat mengubah target jurnal proyek ini." };
    }
    console.error("journal target save error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Target jurnal belum dapat disimpan." };
  }
}

export async function deleteJournalTargetAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = deleteJournalTargetSchema.safeParse({ id: formData.get("id"), projectId: formData.get("projectId") });
  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Target jurnal tidak valid." };
  try {
    await deleteJournalTarget(parsed.data.id);
    revalidatePath("/journals");
    revalidatePath("/manuscript");
    return { ok: true, message: "Target jurnal dihapus." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("journal target delete error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "FORBIDDEN", message: "Target jurnal tidak dapat dihapus." };
  }
}
