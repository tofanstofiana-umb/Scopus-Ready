import { z } from "zod";
import { projectIdSchema } from "./project.schema";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2048).refine((value) => /^https?:\/\//i.test(value), "URL harus diawali http:// atau https://").optional(),
);

export const journalTargetSchema = z.object({
  id: projectIdSchema.optional(),
  projectId: projectIdSchema,
  journalName: z.string().trim().min(2, "Nama jurnal minimal 2 karakter.").max(300),
  publisher: optionalText(300),
  websiteUrl: optionalUrl,
  quartile: z.enum(["q1", "q2", "q3", "q4", "unranked", "unknown"]),
  scopeMatch: z.coerce.number().int().min(0).max(5),
  articleTypeMatch: z.coerce.number().int().min(0).max(5),
  audienceMatch: z.coerce.number().int().min(0).max(5),
  requirementsMatch: z.coerce.number().int().min(0).max(5),
  status: z.enum(["candidate", "primary", "backup", "rejected"]),
  notes: optionalText(5000),
});

export const deleteJournalTargetSchema = z.object({
  id: projectIdSchema,
  projectId: projectIdSchema,
});
