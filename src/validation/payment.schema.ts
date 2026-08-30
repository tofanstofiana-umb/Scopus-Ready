import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  classId: z.string().uuid(),
});
