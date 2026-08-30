import "server-only";

import { verifyNotificationSignature as verifySignature, type NotificationSignatureInput } from "./signature";

function isProduction() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function snapBaseUrl() {
  return isProduction() ? "https://app.midtrans.com/snap/v1" : "https://app.sandbox.midtrans.com/snap/v1";
}

function serverKey() {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi.");
  return key;
}

export class MidtransRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MidtransRequestError";
  }
}

export interface CreateSnapTransactionInput {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}

export async function createSnapTransaction(input: CreateSnapTransactionInput): Promise<{ token: string; redirectUrl: string }> {
  const auth = Buffer.from(`${serverKey()}:`).toString("base64");
  const response = await fetch(`${snapBaseUrl()}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: { order_id: input.orderId, gross_amount: input.amount },
      customer_details: { first_name: input.customerName, email: input.customerEmail },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new MidtransRequestError(`Midtrans Snap request failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { token: string; redirect_url: string };
  return { token: data.token, redirectUrl: data.redirect_url };
}

export function verifyNotificationSignature(input: NotificationSignatureInput): boolean {
  return verifySignature(input, serverKey());
}

export function midtransClientKey() {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

export function snapJsUrl() {
  return isProduction() ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";
}
