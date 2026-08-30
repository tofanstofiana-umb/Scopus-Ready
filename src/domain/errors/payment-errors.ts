export class PaymentRequiredError extends Error {
  constructor() {
    super("PAYMENT_REQUIRED");
    this.name = "PaymentRequiredError";
  }
}

export class ClassNotFoundForPaymentError extends Error {
  constructor() {
    super("CLASS_NOT_FOUND");
    this.name = "ClassNotFoundForPaymentError";
  }
}

export class ClassAlreadyPaidError extends Error {
  constructor() {
    super("CLASS_ALREADY_PAID");
    this.name = "ClassAlreadyPaidError";
  }
}
