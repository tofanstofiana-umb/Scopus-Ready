import { NextResponse } from "next/server";
import { verifyNotificationSignature } from "@/lib/midtrans/client";
import { applyPaymentNotification } from "@/services/payment.service";

// Node runtime required: signature verification uses node:crypto.
export const runtime = "nodejs";

interface MidtransNotification {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
}

export async function POST(request: Request) {
  let body: MidtransNotification;
  try {
    body = (await request.json()) as MidtransNotification;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status, transaction_id } = body;
  if (!order_id || !status_code || !gross_amount || !signature_key || !transaction_status || !transaction_id) {
    return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
  }

  const validSignature = verifyNotificationSignature({
    orderId: order_id,
    statusCode: status_code,
    grossAmount: gross_amount,
    signatureKey: signature_key,
  });
  if (!validSignature) {
    return NextResponse.json({ ok: false, message: "Invalid signature." }, { status: 403 });
  }

  try {
    await applyPaymentNotification({
      orderId: order_id,
      transactionStatus: transaction_status,
      fraudStatus: body.fraud_status ?? null,
      transactionId: transaction_id,
      grossAmount: gross_amount,
      rawNotification: body,
    });
  } catch (error) {
    console.error("midtrans webhook processing error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ ok: false, message: "Processing error." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
