"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { PaymentRequiredError } from "@/domain/errors/payment-errors";
import { createProjectSchema } from "@/validation/project.schema";
import { createProject, ProjectClassAccessError } from "@/services/project.service";
import type { ActionResult } from "@/types/auth";

export async function createProjectAction(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = createProjectSchema.safeParse({
    title: formData.get("title"),
    field: formData.get("field") || undefined,
    researchStage: formData.get("researchStage"),
    classId: formData.get("classId") || undefined,
  });
  if (!parsed.success) return { ok: false, code: "VALIDATION", fieldErrors: parsed.error.flatten().fieldErrors };
  let projectId: string;
  try {
    const project = await createProject(parsed.data);
    projectId = project.id;
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    if (error instanceof PaymentRequiredError) {
      return { ok: false, code: "PAYMENT_REQUIRED", message: "Kelas ini belum lunas. Selesaikan pembayaran untuk membuat proyek di kelas ini." };
    }
    if (error instanceof ProjectClassAccessError) {
      return { ok: false, code: "FORBIDDEN", message: error.message };
    }
    console.error("project creation error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Proyek belum dapat dibuat. Silakan coba lagi." };
  }
  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}
