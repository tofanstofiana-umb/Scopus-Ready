import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(5, "Judul minimal 5 karakter.").max(500),
  field: z.string().trim().max(200).optional(),
  researchStage: z.enum([
    "idea",
    "proposal",
    "data_available",
    "draft_manuscript",
    "journal_targeting",
    "review_revision",
  ]),
  classId: z.string().uuid().optional().or(z.literal("")),
});

export const projectIdSchema = z.string().uuid();
