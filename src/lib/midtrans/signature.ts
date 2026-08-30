import { createHash } from "node:crypto";

export interface NotificationSignatureInput {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}

/** SHA512(order_id + status_code + gross_amount + ServerKey), per Midtrans notification signature spec. */
export function verifyNotificationSignature(input: NotificationSignatureInput, serverKey: string): boolean {
  const expected = createHash("sha512")
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${serverKey}`)
    .digest("hex");
  return expected === input.signatureKey;
}
