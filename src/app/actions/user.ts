"use server";

import { revalidatePath } from "next/cache";
import { accessErrorResult } from "@/domain/errors/access-errors";
import { CannotDeactivateSelfError, setUserActive } from "@/services/class.service";
import type { ActionResult } from "@/types/auth";

export async function setUserActiveAction(userId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await setUserActive(userId, isActive);
  } catch (error) {
    const accessError = accessErrorResult(error);
    if (accessError) return accessError;
    if (error instanceof CannotDeactivateSelfError) {
      return { ok: false, code: "FORBIDDEN", message: error.message };
    }
    console.error("set user active error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Status akun belum dapat diperbarui." };
  }
  revalidatePath("/admin");
  return { ok: true, message: isActive ? "Akun diaktifkan kembali." : "Akun dinonaktifkan." };
}
