"use server";

import { revalidatePath } from "next/cache";
import { accessErrorResult } from "@/domain/errors/access-errors";
import {
  ActionTaskAccessError,
  createActionTask,
  deleteActionTask,
  setActionTaskStatus,
} from "@/services/action-plan.service";
import type { ActionResult } from "@/types/auth";
import {
  actionTaskStatusSchema,
  createActionTaskSchema,
  deleteActionTaskSchema,
} from "@/validation/action-plan.schema";

export async function createActionTaskAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = createActionTaskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    await createActionTask(parsed.data);
    revalidatePath("/action-plan");
    revalidatePath("/manuscript");
    revalidatePath(`/projects/${parsed.data.projectId}/roadmap`);
    revalidatePath(`/trainer/projects/${parsed.data.projectId}/roadmap`);
    return { ok: true, message: "Tugas berhasil ditambahkan." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    if (error instanceof ActionTaskAccessError) {
      return { ok: false, code: "FORBIDDEN", message: "Anda tidak dapat mengubah Action Plan proyek ini." };
    }
    console.error("action task creation error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Tugas belum dapat disimpan." };
  }
}

export async function setActionTaskStatusAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = actionTaskStatusSchema.safeParse({
    taskId: formData.get("taskId"),
    projectId: formData.get("projectId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Status tugas tidak valid." };
  try {
    await setActionTaskStatus(parsed.data.taskId, parsed.data.status);
    revalidatePath("/action-plan");
    revalidatePath("/manuscript");
    revalidatePath(`/projects/${parsed.data.projectId}/roadmap`);
    revalidatePath(`/trainer/projects/${parsed.data.projectId}/roadmap`);
    return { ok: true, message: "Status tugas diperbarui." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("action task status error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "FORBIDDEN", message: "Status tugas tidak dapat diperbarui." };
  }
}

export async function deleteActionTaskAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = deleteActionTaskSchema.safeParse({ taskId: formData.get("taskId"), projectId: formData.get("projectId") });
  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Tugas tidak valid." };
  try {
    await deleteActionTask(parsed.data.taskId);
    revalidatePath("/action-plan");
    revalidatePath("/manuscript");
    revalidatePath(`/projects/${parsed.data.projectId}/roadmap`);
    revalidatePath(`/trainer/projects/${parsed.data.projectId}/roadmap`);
    return { ok: true, message: "Tugas dihapus." };
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    console.error("action task delete error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "FORBIDDEN", message: "Tugas tidak dapat dihapus." };
  }
}
