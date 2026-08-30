import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isEnrollmentClearToWrite } from "@/domain/payment/payment-gate";
import { verifyNotificationSignature } from "@/lib/midtrans/signature";

describe("isEnrollmentClearToWrite", () => {
  it("clears free classes", () => {
    expect(isEnrollmentClearToWrite("free")).toBe(true);
  });

  it("clears paid enrollments", () => {
    expect(isEnrollmentClearToWrite("paid")).toBe(true);
  });

  it("blocks unpaid enrollments", () => {
    expect(isEnrollmentClearToWrite("unpaid")).toBe(false);
  });

  it("blocks when the class/enrollment could not be resolved", () => {
    expect(isEnrollmentClearToWrite(null)).toBe(false);
  });
});

describe("verifyNotificationSignature", () => {
  const serverKey = "test-server-key";
  const orderId = "SR-abc123-1700000000000";
  const statusCode = "200";
  const grossAmount = "150000.00";

  function sign(key: string) {
    return createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${key}`).digest("hex");
  }

  it("accepts a correctly signed notification", () => {
    const signatureKey = sign(serverKey);
    expect(verifyNotificationSignature({ orderId, statusCode, grossAmount, signatureKey }, serverKey)).toBe(true);
  });

  it("rejects a notification signed with the wrong server key", () => {
    const signatureKey = sign("wrong-key");
    expect(verifyNotificationSignature({ orderId, statusCode, grossAmount, signatureKey }, serverKey)).toBe(false);
  });

  it("rejects a notification with a tampered amount", () => {
    const signatureKey = sign(serverKey);
    expect(
      verifyNotificationSignature({ orderId, statusCode, grossAmount: "1.00", signatureKey }, serverKey),
    ).toBe(false);
  });
});
