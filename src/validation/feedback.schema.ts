import { z } from "zod";

export const feedbackSchema = z.object({
  projectId: z.string().uuid(),
  worksheetAnswerId: z.string().uuid(),
  comment: z.string().trim().min(10, "Komentar minimal 10 karakter.").max(5000),
  priority: z.enum(["low", "medium", "high"]),
});

export const feedbackStatusSchema = z.object({
  feedbackId: z.string().uuid(),
  projectId: z.string().uuid(),
});
