import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSnapTransaction } from "@/lib/midtrans/client";
import { requireIdentity } from "./auth.service";
import { createNotification } from "./notification.service";
import { isEnrollmentClearToWrite } from "@/domain/payment/payment-gate";
import {
  ClassAlreadyPaidError,
  ClassNotFoundForPaymentError,
  PaymentRequiredError,
} from "@/domain/errors/payment-errors";
import type { ClassEnrollmentPayment, ClassEnrollmentStatus, PaymentStatus } from "@/types/payment";

type ServerSupabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function resolveEnrollmentStatus(
  supabase: ServerSupabase,
  classId: string,
  participantId: string,
): Promise<{ price: number; status: ClassEnrollmentStatus; className: string } | null> {
  const { data: klass, error } = await supabase.from("classes").select("id,name,price").eq("id", classId).maybeSingle();
  if (error) throw error;
  if (!klass) return null;
  if (klass.price === 0) return { price: 0, status: "free", className: klass.name };

  const { data: paidRow, error: paidError } = await supabase
    .from("class_payments")
    .select("id")
    .eq("class_id", classId)
    .eq("participant_id", participantId)
    .eq("status", "paid")
    .maybeSingle();
  if (paidError) throw paidError;
  return { price: klass.price, status: paidRow ? "paid" : "unpaid", className: klass.name };
}

/**
 * Called from every service function that creates/saves new participant
 * content. No-op when the project isn't tied to a class (nothing to gate).
 * `participantId` is the project owner — not necessarily the caller, since
 * trainer-authored writes (feedback) are gated on the participant's standing.
 */
export async function assertClassPaymentClear(classId: string | null, participantId: string): Promise<void> {
  if (!classId) return;
  const supabase = await createSupabaseServerClient();
  const enrollment = await resolveEnrollmentStatus(supabase, classId, participantId);
  if (!isEnrollmentClearToWrite(enrollment?.status ?? null)) throw new PaymentRequiredError();
}

export async function getClassForPayment(classId: string): Promise<ClassEnrollmentPayment | null> {
  const { profile } = await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { data: membership, error: membershipError } = await supabase
    .from("class_members")
    .select("class_id")
    .eq("class_id", classId)
    .eq("user_id", profile.id)
    .eq("member_role", "participant")
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return null;

  const enrollment = await resolveEnrollmentStatus(supabase, classId, profile.id);
  if (!enrollment) return null;
  return { classId, className: enrollment.className, price: enrollment.price, status: enrollment.status };
}

export async function getMyClassEnrollments(): Promise<ClassEnrollmentPayment[]> {
  const { profile } = await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();

  const { data: memberships, error: membershipError } = await supabase
    .from("class_members")
    .select("class_id")
    .eq("user_id", profile.id)
    .eq("member_role", "participant");
  if (membershipError) throw membershipError;
  const classIds = [...new Set((memberships ?? []).map((m) => m.class_id))];
  if (classIds.length === 0) return [];

  const [{ data: classes, error: classError }, { data: paidRows, error: paidError }] = await Promise.all([
    supabase.from("classes").select("id,name,price").in("id", classIds),
    supabase.from("class_payments").select("class_id").eq("participant_id", profile.id).eq("status", "paid").in("class_id", classIds),
  ]);
  if (classError) throw classError;
  if (paidError) throw paidError;
  const paidClassIds = new Set((paidRows ?? []).map((row) => row.class_id));

  return (classes ?? []).map((klass) => ({
    classId: klass.id,
    className: klass.name,
    price: klass.price,
    status: klass.price === 0 ? "free" : paidClassIds.has(klass.id) ? "paid" : "unpaid",
  }));
}

export async function createPaymentIntent(classId: string): Promise<{ snapToken: string }> {
  const { profile } = await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();

  const { data: membership, error: membershipError } = await supabase
    .from("class_members")
    .select("class_id")
    .eq("class_id", classId)
    .eq("user_id", profile.id)
    .eq("member_role", "participant")
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) throw new ClassNotFoundForPaymentError();

  const enrollment = await resolveEnrollmentStatus(supabase, classId, profile.id);
  if (!enrollment) throw new ClassNotFoundForPaymentError();
  if (enrollment.status !== "unpaid") throw new ClassAlreadyPaidError();

  const admin = createSupabaseAdminClient();
  const orderId = `SR-${classId.slice(0, 8)}-${Date.now()}`;
  const { data: paymentRow, error: insertError } = await admin
    .from("class_payments")
    .insert({ class_id: classId, participant_id: profile.id, order_id: orderId, amount: enrollment.price, status: "pending" })
    .select("id,order_id,amount")
    .single();
  if (insertError) throw insertError;

  const snap = await createSnapTransaction({
    orderId: paymentRow.order_id,
    amount: paymentRow.amount,
    customerName: profile.full_name || profile.email,
    customerEmail: profile.email,
  });

  const { error: updateError } = await admin.from("class_payments").update({ snap_token: snap.token }).eq("id", paymentRow.id);
  if (updateError) throw updateError;

  return { snapToken: snap.token };
}

function mapMidtransStatus(transactionStatus: string, fraudStatus: string | null): PaymentStatus | null {
  if (transactionStatus === "capture") return fraudStatus === "accept" ? "paid" : null;
  if (transactionStatus === "settlement") return "paid";
  if (transactionStatus === "pending") return "pending";
  if (transactionStatus === "deny") return "failed";
  if (transactionStatus === "cancel") return "cancelled";
  if (transactionStatus === "expire") return "expired";
  // No distinct "refunded" status exists in the schema (avoiding another
  // migration for this fix) — "cancelled" already reads as "not paid" to
  // isEnrollmentClearToWrite, which is what matters: revoke write access.
  if (transactionStatus === "refund" || transactionStatus === "partial_refund") return "cancelled";
  return null;
}

/** Applies a verified Midtrans notification. Idempotent — safe to call more than once for the same order. */
export async function applyPaymentNotification(input: {
  orderId: string;
  transactionStatus: string;
  fraudStatus: string | null;
  transactionId: string;
  grossAmount: string;
  rawNotification: unknown;
}): Promise<void> {
  const nextStatus = mapMidtransStatus(input.transactionStatus, input.fraudStatus);
  if (!nextStatus) return;

  const admin = createSupabaseAdminClient();
  const { data: row, error } = await admin.from("class_payments").select("id,status,class_id,participant_id,amount").eq("order_id", input.orderId).maybeSingle();
  if (error) throw error;
  if (!row) return;
  if (row.status === "paid" || row.status === nextStatus) return;

  if (nextStatus === "paid" && Math.round(Number(input.grossAmount)) !== row.amount) {
    console.error("payment amount mismatch, refusing to mark paid", { orderId: input.orderId, expected: row.amount, notified: input.grossAmount });
    return;
  }

  const { error: updateError } = await admin
    .from("class_payments")
    .update({
      status: nextStatus,
      midtrans_transaction_id: input.transactionId,
      raw_notification: input.rawNotification,
      paid_at: nextStatus === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", row.id);
  if (updateError) {
    if (updateError.code === "23505") {
      // Another order for the same (class, participant) already claimed
      // "paid" first — this row (a duplicate/retry payment) is left as-is
      // rather than silently vanishing; logged so it surfaces for manual
      // reconciliation/refund instead of disappearing untracked.
      console.warn("duplicate paid enrollment, payment left unresolved for manual reconciliation", { orderId: input.orderId, classId: row.class_id, participantId: row.participant_id });
      return;
    }
    throw updateError;
  }

  if (nextStatus === "paid") {
    await createNotification(row.participant_id, "payment_verified", "Pembayaran kelas terverifikasi", "Kelas Anda sudah lunas — worksheet dan feedback baru sudah bisa digunakan.", "/dashboard");
  }
}
