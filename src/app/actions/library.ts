"use server";

import { revalidatePath } from "next/cache";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { upsertLibraryResourceSchema, deleteLibraryResourceSchema } from "@/validation/library.schema";
import { upsertLibraryResource, deleteLibraryResource } from "@/services/library.service";
import type { ActionResult } from "@/types/auth";

export async function upsertLibraryResourceAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = upsertLibraryResourceSchema.safeParse({
    id: formData.get("id") || undefined,
    moduleId: formData.get("moduleId") || undefined,
    category: formData.get("category"),
    title: formData.get("title"),
    description: formData.get("description"),
    body: formData.get("body") || undefined,
    url: formData.get("url") || undefined,
    sequence: formData.get("sequence") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await upsertLibraryResource(parsed.data);
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("library resource upsert error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Materi belum dapat disimpan. Silakan coba lagi." };
  }
  revalidatePath("/admin");
  revalidatePath("/library");
  return { ok: true, message: "Materi tersimpan." };
}

export async function deleteLibraryResourceAction(id: string): Promise<ActionResult> {
  const parsed = deleteLibraryResourceSchema.safeParse({ id });
  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "ID materi tidak valid." };

  try {
    await deleteLibraryResource(parsed.data.id);
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("library resource delete error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Materi belum dapat dihapus." };
  }
  revalidatePath("/admin");
  revalidatePath("/library");
  return { ok: true, message: "Materi dihapus." };
}
