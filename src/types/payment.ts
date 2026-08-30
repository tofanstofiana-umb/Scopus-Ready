export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "cancelled";

export interface ClassPayment {
  id: string;
  class_id: string;
  participant_id: string;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  snap_token: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Effective payment standing for one participant's membership in one class. */
export type ClassEnrollmentStatus = "free" | "paid" | "unpaid";

export interface ClassEnrollmentPayment {
  classId: string;
  className: string;
  price: number;
  status: ClassEnrollmentStatus;
}
