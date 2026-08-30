"use server";

import { accessErrorResult } from "@/domain/errors/access-errors";
import { ClassAlreadyPaidError, ClassNotFoundForPaymentError } from "@/domain/errors/payment-errors";
import { createPaymentIntent } from "@/services/payment.service";
import { createPaymentIntentSchema } from "@/validation/payment.schema";
import type { ActionResult } from "@/types/auth";

export async function createPaymentIntentAction(classId: string): Promise<ActionResult<{ snapToken: string }>> {
  const parsed = createPaymentIntentSchema.safeParse({ classId });
  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Kelas tidak valid." };

  try {
    const { snapToken } = await createPaymentIntent(parsed.data.classId);
    return { ok: true, data: { snapToken } };
  } catch (error) {
    const accessError = accessErrorResult<{ snapToken: string }>(error);
    if (accessError) return accessError;
    if (error instanceof ClassNotFoundForPaymentError) {
      return { ok: false, code: "VALIDATION", message: "Kelas tidak ditemukan atau Anda bukan peserta kelas ini." };
    }
    if (error instanceof ClassAlreadyPaidError) {
      return { ok: false, code: "CONFLICT", message: "Kelas ini sudah lunas atau gratis." };
    }
    console.error("payment intent creation error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Pembayaran belum dapat dimulai. Silakan coba lagi." };
  }
}
